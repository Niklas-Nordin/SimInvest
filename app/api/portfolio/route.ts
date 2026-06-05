import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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

export async function GET(req: NextRequest) {
    try {
        // Kontrollerar att användaren är inloggad.
        const userId = await getUserIdFromToken(req);

        if (!userId) {
            return NextResponse.json(
                { error: "Du måste vara inloggad för att se portföljen." },
                { status: 401 }
            );
        }

        // Uppdaterar pris-cache om priset är gammalt eller saknas.
        await getPricesWithCache();

        // Hämtar användaren med saldo och alla innehav.
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                cashBalance: true,
                holdings: {
                    include: {
                        asset: {
                            include: {
                                priceCache: true,
                            },
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Användaren hittades inte." },
                { status: 404 }
            );
        }

        let totalHoldingsValueSek = new Prisma.Decimal(0);
        let totalInvestedSek = new Prisma.Decimal(0);
        const holdings = user.holdings.map((holding) => {
            const currentPrice = holding.asset.priceCache?.priceSek ?? null;
            // Om pris saknas använder vi 0 som aktuellt värde.
            const change24h = holding.asset.priceCache?.change24h ?? null;
            const currentValueSek = currentPrice
                ? holding.quantity.mul(currentPrice)
                : new Prisma.Decimal(0);
            const investedValueSek = holding.quantity.mul(holding.averageBuyPrice);
            const profitLossSek = currentValueSek.sub(investedValueSek);
            const profitLossPercent = investedValueSek.gt(0)
                ? profitLossSek.div(investedValueSek).mul(100)
                : new Prisma.Decimal(0);

            totalHoldingsValueSek = totalHoldingsValueSek.add(currentValueSek);
            totalInvestedSek = totalInvestedSek.add(investedValueSek);

            return {
                id: holding.id,
                asset: {
                    id: holding.asset.id,
                    coingeckoId: holding.asset.coingeckoId,
                    symbol: holding.asset.symbol,
                    name: holding.asset.name,
                    imageUrl: holding.asset.imageUrl,
                    change24h: change24h,
                },
                quantity: holding.quantity.toString(),
                averageBuyPrice: holding.averageBuyPrice.toString(),
                currentPriceSek: currentPrice?.toString() ?? null,
                currentValueSek: currentValueSek.toString(),
                investedValueSek: investedValueSek.toString(),
                profitLossSek: profitLossSek.toString(),
                profitLossPercent: profitLossPercent.toFixed(2),
                updatedAt: holding.updatedAt,
            };
        });

        const totalPortfolioValueSek = user.cashBalance.add(totalHoldingsValueSek);
        const totalProfitLossSek = totalHoldingsValueSek.sub(totalInvestedSek);
        const totalProfitLossPercent = totalInvestedSek.gt(0)
            ? totalProfitLossSek.div(totalInvestedSek).mul(100)
            : new Prisma.Decimal(0);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            summary: {
                cashBalance: user.cashBalance.toString(),
                totalHoldingsValueSek: totalHoldingsValueSek.toString(),
                totalPortfolioValueSek: totalPortfolioValueSek.toString(),
                totalInvestedSek: totalInvestedSek.toString(),
                totalProfitLossSek: totalProfitLossSek.toString(),
                totalProfitLossPercent: totalProfitLossPercent.toFixed(2),
            },
            holdings,
        });
    } catch (error) {
        console.error("Kunde inte hämta portfölj:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta portfölj.",
            },
            { status: 500 }
        );
    }
}