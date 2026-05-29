type CoinGeckoMarketChartResponse = {
    prices: [number, number][];
};

export type PriceHistoryPoint = {
    timestamp: number;
    date: string;
    price: number;
};

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoinPriceHistory(
    coingeckoId: string,
    days: number
): Promise<PriceHistoryPoint[]> {
    const apiKey = process.env.COINGECKO_API_KEY;

    if (!apiKey) {
        throw new Error("COINGECKO_API_KEY saknas i .env");
    }

    const searchParams = new URLSearchParams({
        vs_currency: "sek",
        days: days.toString(),
    });

    const response = await fetch(`${COINGECKO_BASE_URL}/coins/${coingeckoId}/market_chart?${searchParams}`,
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

    const data = (await response.json()) as CoinGeckoMarketChartResponse;

    // CoinGecko returnerar prices som [timestamp, price].
    // Här gör vi om datan till objekt som passar bättre för Recharts.
    return data.prices.map(([timestamp, price]) => {
        const date = new Date(timestamp);

        return {
            timestamp,
            date: date.toLocaleDateString("sv-SE"),
            price: Number(price.toFixed(2)),
        };
    });
}