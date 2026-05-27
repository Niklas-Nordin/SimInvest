import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Prisma, TransactionType } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { buyTradeSchema } from "@/lib/validations/trade";
import { getPricesWithCache } from "@/lib/helpers/prices";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET saknas i .env");
}

const secret = new TextEncoder().encode(jwtSecret);

async function getUserIdFromToken(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return null;
    }
    try {
        const { payload } = await jwtVerify(token, secret);

        if (typeof payload.userId !== "string") {
            return null;
        }
        return payload.userId;
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);

        if (!userId) {
            return NextResponse.json(
                { error: "Du måste vara inloggad för att köpa." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { assetId, amountSek } = buyTradeSchema.parse(body);

        // Uppdaterar pris-cache om priset är gammalt eller saknas.
        await getPricesWithCache();

        const amountDecimal = new Prisma.Decimal(amountSek);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    cashBalance: true,
                },
            });

            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }

            const asset = await tx.asset.findUnique({
                where: {
                    id: assetId,
                },
                include: {
                    priceCache: true,
                },
            });

            if (!asset || !asset.isActive) {
                throw new Error("ASSET_NOT_FOUND");
            }

            const currentPrice = asset.priceCache?.priceSek;

            if (!currentPrice || currentPrice.lte(0)) {
                throw new Error("PRICE_NOT_FOUND");
            }

            if (user.cashBalance.lt(amountDecimal)) {
                throw new Error("INSUFFICIENT_BALANCE");
            }

            const quantity = amountDecimal.div(currentPrice);

            const existingHolding = await tx.holding.findUnique({
                where: {
                    userId_assetId: {
                        userId,
                        assetId,
                    },
                },
            });

            let holding;

            if (existingHolding) {
                const oldTotalCost = existingHolding.quantity.mul(
                    existingHolding.averageBuyPrice
                );

                const newTotalCost = quantity.mul(currentPrice);
                const newQuantity = existingHolding.quantity.add(quantity);

                const newAverageBuyPrice = oldTotalCost
                    .add(newTotalCost)
                    .div(newQuantity);

                holding = await tx.holding.update({
                    where: {
                        id: existingHolding.id,
                    },
                    data: {
                        quantity: newQuantity,
                        averageBuyPrice: newAverageBuyPrice,
                    },
                });
            } else {
                holding = await tx.holding.create({
                    data: {
                        userId,
                        assetId,
                        quantity,
                        averageBuyPrice: currentPrice,
                    },
                });
            }

            const updatedUser = await tx.user.update({
                where: {
                    id: userId,
                },
                data: {
                    cashBalance: {
                        decrement: amountDecimal,
                    },
                },
                select: {
                    id: true,
                    cashBalance: true,
                },
            });

            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    assetId,
                    type: TransactionType.BUY,
                    quantity,
                    priceSek: currentPrice,
                    totalSek: amountDecimal,
                },
            });
            return {
                asset,
                holding,
                updatedUser,
                transaction,
                quantity,
                currentPrice,
                totalSek: amountDecimal,
            };
        });
        return NextResponse.json(
            {
                message: "Köp genomfört.",
                data: {
                    asset: {
                        id: result.asset.id,
                        name: result.asset.name,
                        symbol: result.asset.symbol,
                    },
                    buy: {
                        amountSek: result.totalSek.toString(),
                        priceSek: result.currentPrice.toString(),
                        quantity: result.quantity.toString(),
                    },
                    holding: {
                        id: result.holding.id,
                        quantity: result.holding.quantity.toString(),
                        averageBuyPrice: result.holding.averageBuyPrice.toString(),
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
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                return NextResponse.json(
                    { error: "Användaren hittades inte." },
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

            if (error.message === "INSUFFICIENT_BALANCE") {
                return NextResponse.json(
                    { error: "Du har inte tillräckligt saldo." },
                    { status: 400 }
                );
            }
        }
        console.error("Köp misslyckades:", error);
        return NextResponse.json(
            { error: "Något gick fel vid köp. Försök igen senare." },
            { status: 500 }
        );
    }
}