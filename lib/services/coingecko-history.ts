type CoinGeckoMarketChartResponse = {
    // CoinGecko returnerar historiska priser som en lista av [timestamp, price]
    prices: [number, number][];
};

export type PriceHistoryPoint = {
    timestamp: number;
    date: string;
    time: string;
    price: number;
};

// Base URL för CoinGeckos Demo API
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoinPriceHistory(
    coingeckoId: string,
    days: number
): Promise<PriceHistoryPoint[]> {
    const apiKey = process.env.COINGECKO_API_KEY;

    // Stoppar funktionen om API-nyckeln saknas i .env
    if (!apiKey) {
        throw new Error("COINGECKO_API_KEY saknas i .env");
    }

    // Query-parametrar som skickas till CoinGecko
    // vs_currency=sek betyder att vi vill ha priset i svenska kronor
    const searchParams = new URLSearchParams({
        vs_currency: "sek",
        days: days.toString(),
    });

    // Hämtar historisk prisdata från CoinGecko för vald kryptovaluta
    const response = await fetch(
        `${COINGECKO_BASE_URL}/coins/${coingeckoId}/market_chart?${searchParams}`,
        {
            headers: {
                "x-cg-demo-api-key": apiKey,
            },
            cache: "no-store",
        }
    );

    // Om CoinGecko svarar med fel kastar vi ett tydligt felmeddelande
    if (!response.ok) {
        throw new Error(`CoinGecko svarade med status ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoMarketChartResponse;

    // CoinGecko returnerar prices som [timestamp, price].
    // Här gör vi om varje punkt till ett objekt som passar bättre för Recharts.
    return data.prices.map(([timestamp, price]) => {
        const date = new Date(timestamp);

        return {
            timestamp,
            date: date.toLocaleDateString("sv-SE"),
            time: date.toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            price: Number(price.toFixed(2)),
        };
    });
}