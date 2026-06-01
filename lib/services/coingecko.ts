type CoinGeckoPriceResponse = Record<
    string,
    {
        // CoinGecko returnerar priset i SEK när vi skickar vs_currencies=sek
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

// Base URL för CoinGeckos Demo API
const BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoinPrices(coinIds: string[]): Promise<CoinPrice[]> {
    const apiKey = process.env.COINGECKO_API_KEY;

    // Stoppar funktionen om API-nyckeln saknas i .env
    if (!apiKey) {
        throw new Error("CoinGecko API-nyckel saknas.");
    }

    // Om det inte finns några coins att hämta pris för returnerar vi en tom lista
    if (coinIds.length === 0) {
        return [];
    }

    // Bygger query-parametrar till CoinGecko. Och ids skickas som lista
    const searchParams = new URLSearchParams({
        ids: coinIds.join(","),
        vs_currencies: "sek",
        include_24hr_change: "true",
        include_last_updated_at: "true",
    });

    // Hämtar aktuella priser från CoinGecko för flera coins i samma request
    const response = await fetch(`${BASE_URL}/simple/price?${searchParams}`, {
        headers: {
            "x-cg-demo-api-key": apiKey,
        },
        cache: "no-store",
    });

    // Om CoinGecko svarar med fel kastar vi ett tydligt fel
    if (!response.ok) {
        throw new Error(`CoinGecko svarade med status ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoPriceResponse;

    // Gör om CoinGeckos svar till vårt eget format som resten av backend kan använda
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