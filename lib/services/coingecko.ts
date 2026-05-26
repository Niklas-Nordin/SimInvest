type CoinGeckoSimplePriceResponse = Record<
    string,
    {
        sek?: number;
        sek_24h_change?: number;
        last_updated_at?: number;
    }
>;

export type CoinPrice = {
    coingeckoId: string;
    priceSek: number;
    change24h: number | null;
    lastUpdatedAt: number | null;
};

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoinPrices(
    coinIds: string[]
): Promise<CoinPrice[]> {
    const apiKey = process.env.COINGECKO_API_KEY;

    if (!apiKey) {
        throw new Error("COINGECKO_API_KEY saknas i .env");
    }

    if (coinIds.length === 0) {
        return [];
    }

    const params = new URLSearchParams({
        ids: coinIds.join(","),
        vs_currencies: "sek",
        include_24hr_change: "true",
        include_last_updated_at: "true",
    });

    const response = await fetch(
        `${COINGECKO_BASE_URL}/simple/price?${params.toString()}`,
        {
            headers: {
                "x-cg-demo-api-key": apiKey,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error(`CoinGecko svarade med status ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoSimplePriceResponse;

    return coinIds.map((coingeckoId) => ({
        coingeckoId,
        priceSek: data[coingeckoId]?.sek ?? 0,
        change24h: data[coingeckoId]?.sek_24h_change ?? null,
        lastUpdatedAt: data[coingeckoId]?.last_updated_at ?? null,
    }));
}