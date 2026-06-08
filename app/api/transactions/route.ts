import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";

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
                { error: "Du måste vara inloggad för att se transaktioner." },
                { status: 401 }
            );
        }

        // Hämtar bara transaktioner som tillhör den inloggade användaren.
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
            },
            include: {
                asset: {
                    select: {
                        id: true,
                        coingeckoId: true,
                        symbol: true,
                        name: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Formaterar datan så att frontend får tydliga värden.
        const formattedTransactions = transactions.map((transaction) => {
            return {
                id: transaction.id,
                type: transaction.type,
                asset: transaction.asset,
                quantity: transaction.quantity.toString(),
                priceSek: transaction.priceSek.toString(),
                totalSek: transaction.totalSek.toString(),
                createdAt: transaction.createdAt,
            };
        });

        return NextResponse.json({
            success: true,
            count: formattedTransactions.length,
            data: formattedTransactions,
        });
    } catch (error) {
        console.error("Kunde inte hämta transaktioner:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta transaktioner.",
            },
            { status: 500 }
        );
    }
}