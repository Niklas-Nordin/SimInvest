type CoinGeckoPriceResponse = Record<
    string,
    {
        sek?: number;
        sek_24h_change?: number;
        last_updated_at?: number;
    }
>;

export type CoinPrice = {
    coingeckoId: string;
    priceSek: number | null;
    change24h: number | null;
    lastUpdatedAt: number | null;
};

const BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoinPrices(coinIds: string[]): Promise<CoinPrice[]> {
    const apiKey = process.env.COINGECKO_API_KEY;

    if (!apiKey) {
        throw new Error("CoinGecko API-nyckel saknas.");
    }

    if (coinIds.length === 0) {
        return [];
    }

    const searchParams = new URLSearchParams({
        ids: coinIds.join(","),
        vs_currencies: "sek",
        include_24hr_change: "true",
        include_last_updated_at: "true",
    });

    const response = await fetch(`${BASE_URL}/simple/price?${searchParams}`, {
        headers: {
            "x-cg-demo-api-key": apiKey,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`CoinGecko svarade med status ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoPriceResponse;

    return coinIds.map((coinId) => {
        const coin = data[coinId];

        return {
            coingeckoId: coinId,
            priceSek: coin?.sek ?? null,
            change24h: coin?.sek_24h_change ?? null,
            lastUpdatedAt: coin?.last_updated_at ?? null,
        };
    });
}