import { NextResponse } from "next/server";
import { getPricesWithCache } from "@/lib/helpers/prices";

export async function GET() {
    try {
        // Funktionen använder cache om priset fortfarande är färskt.
        const assetsWithPrices = await getPricesWithCache();

        // Returnerar listan till frontend
        return NextResponse.json({
            success: true,
            count: assetsWithPrices.length,
            data: assetsWithPrices,
        });
    } catch (error) {
        console.error("Kunde inte hämta prisdata:", error);

        // Felmeddelande om något går fel i backend.
        return NextResponse.json(
            {
                success: false,
                error: "Kunde inte hämta prisdata.",
            },
            { status: 500 }
        );
    }
}