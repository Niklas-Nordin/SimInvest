import { NextResponse } from "next/server";
import { getPricesWithCache } from "@/lib/helpers/prices";

export async function GET() {
    try {
        const assetsWithPrices = await getPricesWithCache();

        return NextResponse.json({
            success: true,
            count: assetsWithPrices.length,
            data: assetsWithPrices,
        });
    } catch (error) {
        console.error("Kunde inte hämta prisdata:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta prisdata.",
            },
            { status: 500 }
        );
    }
}