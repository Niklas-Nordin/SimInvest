import { NextResponse } from "next/server";
import { fetchCoinPrices } from "@/lib/services/coingecko";

export async function GET() {
    try {
        const prices = await fetchCoinPrices(["bitcoin", "ethereum", "solana"]);

        return NextResponse.json({
            success: true,
            data: prices,
        });
    } catch (error) {
        console.error("CoinGecko test failed:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta priser från CoinGecko.",
            },
            { status: 500 }
        );
    }
}