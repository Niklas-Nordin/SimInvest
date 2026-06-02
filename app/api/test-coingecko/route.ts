import { NextResponse } from "next/server";
import { fetchCoinPrices } from "@/lib/services/coingecko";

export async function GET() {
    try {
        // Testar att backend kan hämta aktuella priser från CoinGecko.
        const prices = await fetchCoinPrices(["bitcoin", "ethereum", "solana"]);

        // Returnerar prisdatan som JSON.
        return NextResponse.json({
            success: true,
            data: prices,
        });
    } catch (error) {
        console.error("CoinGecko test failed:", error);

        // Returnerar ett fel om CoinGecko-anropet misslyckas.
        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta priser från CoinGecko.",
            },
            { status: 500 }
        );
    }
}