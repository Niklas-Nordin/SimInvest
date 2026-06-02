import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Prisma, TransactionType } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { sellTradeSchema } from "@/lib/validations/trade";
import { getPricesWithCache } from "@/lib/helpers/prices";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET saknas i .env");
}

const secret = new TextEncoder().encode(jwtSecret);

async function getUserIdFromToken(req: NextRequest) {
    // Läser JWT-token från HttpOnly-cookien.
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return null;
    }
    try {
        // Verifierar token och hämtar userId från payload.
        const { payload } = await jwtVerify(token, secret);

        if (typeof payload.userId !== "string") {
            return null;
        }

        return payload.userId;
    } catch {
        // Om token är ogiltig eller har gått ut returnerar vi null.
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        // Kontrollerar att användaren är inloggad.
        const userId = await getUserIdFromToken(req);

        if (!userId) {
            return NextResponse.json(
                { error: "Du måste vara inloggad för att sälja." },
                { status: 401 }
            );
        }

        // Läser och validerar request body från frontend.
        const body = await req.json();
        const { assetId, quantity } = sellTradeSchema.parse(body);

        // Uppdaterar pris-cache om priset är gammalt eller saknas.
        await getPricesWithCache();

        // Prisma använder Decimal för pengar och kryptomängder.
        const quantityDecimal = new Prisma.Decimal(quantity);

        // Alla databasändringar i en säljorder ska lyckas tillsammans.
        const result = await prisma.$transaction(async (tx) => {
            // Hämtar användarens innehav för vald kryptovaluta.
            const holding = await tx.holding.findUnique({
                where: {
                    userId_assetId: {
                        userId,
                        assetId,
                    },
                },
                include: {
                    asset: {
                        include: {
                            priceCache: true,
                        },
                    },
                },
            });

            if (!holding) {
                throw new Error("HOLDING_NOT_FOUND");
            }

            if (!holding.asset.isActive) {
                throw new Error("ASSET_NOT_FOUND");
            }

            const currentPrice = holding.asset.priceCache?.priceSek;

            if (!currentPrice || currentPrice.lte(0)) {
                throw new Error("PRICE_NOT_FOUND");
            }

            // Stoppar sälj om användaren försöker sälja mer än hen äger.
            if (holding.quantity.lt(quantityDecimal)) {
                throw new Error("INSUFFICIENT_QUANTITY");
            }

            // Räknar ut hur mycket användaren får i SEK.
            const totalSek = quantityDecimal.mul(currentPrice);

            // Räknar ut hur mycket som finns kvar efter sälj.
            const newQuantity = holding.quantity.sub(quantityDecimal);

            let holdingStatus: "updated" | "deleted" = "updated";

            if (newQuantity.lte(0)) {
                // Om användaren säljer hela innehavet tas holding bort.
                await tx.holding.delete({
                    where: {
                        id: holding.id,
                    },
                });

                holdingStatus = "deleted";
            } else {
                // Om användaren säljer en del av innehavet uppdateras quantity.
                await tx.holding.update({
                    where: {
                        id: holding.id,
                    },
                    data: {
                        quantity: newQuantity,
                    },
                });
            }

            // Ökar användarens saldo med beloppet från försäljningen.
            const updatedUser = await tx.user.update({
                where: {
                    id: userId,
                },
                data: {
                    cashBalance: {
                        increment: totalSek,
                    },
                },
                select: {
                    id: true,
                    cashBalance: true,
                },
            });

            // Sparar försäljningen i transaktionshistoriken.
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    assetId,
                    type: TransactionType.SELL,
                    quantity: quantityDecimal,
                    priceSek: currentPrice,
                    totalSek,
                },
            });

            return {
                asset: holding.asset,
                holdingId: holding.id,
                holdingStatus,
                remainingQuantity: newQuantity.lte(0)
                    ? new Prisma.Decimal(0)
                    : newQuantity,
                updatedUser,
                transaction,
                soldQuantity: quantityDecimal,
                currentPrice,
                totalSek,
            };
        });

        // Returnerar ett tydligt svar till frontend efter lyckad försäljning.
        return NextResponse.json(
            {
                message: "Försäljning genomförd.",
                data: {
                    asset: {
                        id: result.asset.id,
                        name: result.asset.name,
                        symbol: result.asset.symbol,
                    },
                    sell: {
                        quantity: result.soldQuantity.toString(),
                        priceSek: result.currentPrice.toString(),
                        totalSek: result.totalSek.toString(),
                    },
                    holding: {
                        id: result.holdingId,
                        status: result.holdingStatus,
                        remainingQuantity: result.remainingQuantity.toString(),
                    },
                    user: {
                        id: result.updatedUser.id,
                        cashBalance: result.updatedUser.cashBalance.toString(),
                    },
                    transaction: {
                        id: result.transaction.id,
                        type: result.transaction.type,
                        totalSek: result.transaction.totalSek.toString(),
                        createdAt: result.transaction.createdAt,
                    },
                },
            },
            { status: 201 }
        );
    } catch (error) {
        // Hanterar valideringsfel från Zod.
        if (error instanceof ZodError) {
            const validationErrors: Record<string, string> = {};

            error.issues.forEach((issue) => {
                const fieldName = issue.path[0]?.toString();

                if (fieldName) {
                    validationErrors[fieldName] = issue.message;
                }
            });

            return NextResponse.json({ errors: validationErrors }, { status: 400 });
        }

        // Hanterar förväntade fel i säljflödet.
        if (error instanceof Error) {
            if (error.message === "HOLDING_NOT_FOUND") {
                return NextResponse.json(
                    { error: "Du äger inte den här kryptovalutan." },
                    { status: 404 }
                );
            }

            if (error.message === "ASSET_NOT_FOUND") {
                return NextResponse.json(
                    { error: "Kryptovalutan hittades inte." },
                    { status: 404 }
                );
            }

            if (error.message === "PRICE_NOT_FOUND") {
                return NextResponse.json(
                    { error: "Pris saknas för vald kryptovaluta." },
                    { status: 400 }
                );
            }

            if (error.message === "INSUFFICIENT_QUANTITY") {
                return NextResponse.json(
                    { error: "Du äger inte tillräckligt mycket för att sälja." },
                    { status: 400 }
                );
            }
        }

        console.error("Försäljning misslyckades:", error);

        return NextResponse.json(
            { error: "Något gick fel vid försäljning. Försök igen senare." },
            { status: 500 }
        );
    }
}