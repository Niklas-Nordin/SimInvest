import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCoinPriceHistory } from "@/lib/services/coingecko-history";

// Tillåtna perioder för historisk prisdata
const allowedDays = [1, 7, 30, 365];

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        // Hämtar assetId från URL, Läser query-parametern days från URL
        const { id } = await context.params;
        const searchParams = req.nextUrl.searchParams;
        const daysParam = searchParams.get("days") ?? "7";
        const days = Number(daysParam);

        // Stoppar requesten om perioden inte är tillåten
        if (!allowedDays.includes(days)) {
            return NextResponse.json(
                {
                    error: "Ogiltig period. Använd 1, 7, 30 eller 365 dagar.",
                },
                { status: 400 }
            );
        }

        // Hämtar kryptovalutan från databasen för att få dess coingeckoId
        const asset = await prisma.asset.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                symbol: true,
                coingeckoId: true,
                isActive: true,
            },
        });

        // Om kryptovalutan inte finns eller är inaktiv returneras 404
        if (!asset || !asset.isActive) {
            return NextResponse.json(
                { error: "Kryptovalutan hittades inte." },
                { status: 404 }
            );
        }

        // Hämtar historisk prisdata från CoinGecko med assetens coingeckoId
        const history = await fetchCoinPriceHistory(asset.coingeckoId, days);

        // Returnerar historiken i ett format som frontend kan använda till graf
        return NextResponse.json({
            success: true,
            asset: {
                id: asset.id,
                name: asset.name,
                symbol: asset.symbol,
                coingeckoId: asset.coingeckoId,
            },
            days,
            data: history,
        });
    } catch (error) {
        console.error("Kunde inte hämta historisk prisdata:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta historisk prisdata.",
            },
            { status: 500 }
        );
    }
}