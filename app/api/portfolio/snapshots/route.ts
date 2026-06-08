import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

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

export async function GET(req: NextRequest) {
    try {
        // Kontrollerar att användaren är inloggad.
        const userId = await getUserIdFromToken(req);

        if (!userId) {
            return NextResponse.json(
                { error: "Du måste vara inloggad för att se snapshots." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const daysParam = searchParams.get("days");
        const days = daysParam ? parseInt(daysParam, 10) : 7; // Defaultar till 7 dagar om inget anges

        // 2. Räkna ut hur långt bak i tiden vi ska gå
        const cutoffDate = new Date();
        if (days === 1) {
            // 24 timmar bakåt för "24 h"-knappen
            cutoffDate.setHours(cutoffDate.getHours() - 24);
        } else {
            // X dagar bakåt för 7, 30, 365-knapparna
            cutoffDate.setDate(cutoffDate.getDate() - days);
        }
        // Hämtar snapshots för den inloggade användaren.
        let snapshots = await prisma.portfolioSnapshot.findMany({
            where: {
                userId,
                createdAt: {
                    gte: cutoffDate,
                },
            },
            orderBy: {
                createdAt: "asc",
            },
            select: {
                id: true,
                totalValueSek: true,
                cashBalance: true,
                createdAt: true,
            },
        });

        if (snapshots.length === 0) {
            const latestSnapshot = await prisma.portfolioSnapshot.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    totalValueSek: true,
                    cashBalance: true,
                    createdAt: true,
                },
            });
            if (latestSnapshot) {
                snapshots = [latestSnapshot];
            }
        }

        const formattedSnapshots = snapshots.map((snapshot) => {
            return {
                id: snapshot.id,
                totalValueSek: snapshot.totalValueSek.toString(),
                cashBalance: snapshot.cashBalance.toString(),
                createdAt: snapshot.createdAt,
            };
        });

        return NextResponse.json({
            success: true,
            count: formattedSnapshots.length,
            data: formattedSnapshots,
        });
    } catch (error) {
        console.error("Kunde inte hämta portfolio snapshots:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta portfolio snapshots.",
            },
            { status: 500 }
        );
    }
}