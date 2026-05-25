import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const assets = [
    {
        coingeckoId: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        imageUrl: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        isActive: true,
    },
    {
        coingeckoId: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        imageUrl: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        isActive: true,
    },
    {
        coingeckoId: "solana",
        symbol: "SOL",
        name: "Solana",
        imageUrl: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        isActive: true,
    },
    {
        coingeckoId: "cardano",
        symbol: "ADA",
        name: "Cardano",
        imageUrl: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
        isActive: true,
    },
    {
        coingeckoId: "dogecoin",
        symbol: "DOGE",
        name: "Dogecoin",
        imageUrl: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
        isActive: true,
    },
    {
        coingeckoId: "ripple",
        symbol: "XRP",
        name: "XRP",
        imageUrl: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
        isActive: true,
    },
    {
        coingeckoId: "polkadot",
        symbol: "DOT",
        name: "Polkadot",
        imageUrl: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
        isActive: true,
    },
    {
        coingeckoId: "chainlink",
        symbol: "LINK",
        name: "Chainlink",
        imageUrl: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
        isActive: true,
    },
    {
        coingeckoId: "litecoin",
        symbol: "LTC",
        name: "Litecoin",
        imageUrl: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
        isActive: true,
    },
    {
        coingeckoId: "avalanche-2",
        symbol: "AVAX",
        name: "Avalanche",
        imageUrl: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
        isActive: true,
    },
];

async function main() {
    console.log("Startar seed...");

    for (const asset of assets) {
        await prisma.asset.upsert({
            where: {
                coingeckoId: asset.coingeckoId,
            },
            update: {
                symbol: asset.symbol,
                name: asset.name,
                imageUrl: asset.imageUrl,
                isActive: asset.isActive,
            },
            create: asset,
        });
        console.log(`Seeded: ${asset.name}`);
    }
    console.log("Seed klar. Assets har lagts till eller uppdaterats.");
}

main()
    .catch((error) => {
        console.error("Seed misslyckades:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });