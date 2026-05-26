import { prisma } from "@/lib/prisma";
import { fetchCoinPrices } from "@/lib/services/coingecko";

const CACHE_TTL_SECONDS = 60;

function isCacheFresh(updatedAt: Date) {
    const cacheAgeSeconds = (Date.now() - updatedAt.getTime()) / 1000;

    return cacheAgeSeconds < CACHE_TTL_SECONDS;
}

function formatAssetWithPrice(
    asset: {
        id: string;
        coingeckoId: string;
        symbol: string;
        name: string;
        imageUrl: string | null;
        priceCache: {
            priceSek: { toString: () => string };
            change24h: { toString: () => string } | null;
            updatedAt: Date;
        } | null;
    },
    source: "cache" | "coingecko" | "fallback-cache"
) {
    return {
        id: asset.id,
        coingeckoId: asset.coingeckoId,
        symbol: asset.symbol,
        name: asset.name,
        imageUrl: asset.imageUrl,
        priceSek: asset.priceCache?.priceSek.toString() ?? null,
        change24h: asset.priceCache?.change24h?.toString() ?? null,
        priceUpdatedAt: asset.priceCache?.updatedAt ?? null,
        source,
    };
}

export async function getPricesWithCache() {
    const assets = await prisma.asset.findMany({
        where: {
            isActive: true,
        },
        include: {
            priceCache: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    if (assets.length === 0) {
        return [];
    }

    const hasFreshCacheForAllAssets = assets.every((asset) => {
        return asset.priceCache && isCacheFresh(asset.priceCache.updatedAt);
    });

    if (hasFreshCacheForAllAssets) {
        return assets.map((asset) => formatAssetWithPrice(asset, "cache"));
    }

    try {
        const coinIds = assets.map((asset) => asset.coingeckoId);
        const freshPrices = await fetchCoinPrices(coinIds);

        for (const price of freshPrices) {
            const asset = assets.find((item) => {
                return item.coingeckoId === price.coingeckoId;
            });

            if (!asset || price.priceSek === null || price.priceSek <= 0) {
                continue;
            }

            await prisma.assetPriceCache.upsert({
                where: {
                    assetId: asset.id,
                },
                update: {
                    priceSek: price.priceSek,
                    change24h: price.change24h,
                },
                create: {
                    assetId: asset.id,
                    priceSek: price.priceSek,
                    change24h: price.change24h,
                },
            });
        }

        const updatedAssets = await prisma.asset.findMany({
            where: {
                isActive: true,
            },
            include: {
                priceCache: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return updatedAssets.map((asset) =>
            formatAssetWithPrice(asset, "coingecko")
        );
    } catch (error) {
        console.error("Kunde inte hämta nya priser från CoinGecko:", error);

        return assets.map((asset) => formatAssetWithPrice(asset, "fallback-cache"));
    }
}