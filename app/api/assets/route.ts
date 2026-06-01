import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Hämtar alla aktiva kryptovalutor från databasen.
export async function GET() {
    try {
        const assets = await prisma.asset.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                coingeckoId: true,
                symbol: true,
                name: true,
                imageUrl: true,
                isActive: true,
                createdAt: true,
            },
        });

        // Returnerar listan med kryptovalutor till frontend.
        return NextResponse.json({
            success: true,
            count: assets.length,
            data: assets,
        });
    } catch (error) {
        console.error("Failed to fetch assets:", error);

        // Returnerar ett felmeddelande om något går fel vid databashämtning.
        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta kryptovalutor.",
            },
            { status: 500 }
        );
    }
}