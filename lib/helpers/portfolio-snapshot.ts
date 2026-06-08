import { Prisma } from "@prisma/client";

// Räknar ut användarens aktuella portföljvärd.
// Den används när vi vill skapa en snapshot efter köp eller sälj.
export async function calculatePortfolioValue(
    tx: Prisma.TransactionClient,
    userId: string
) {
    const user = await tx.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            cashBalance: true,
            holdings: {
                include: {
                    asset: {
                        include: {
                            priceCache: true,
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    let totalHoldingsValueSek = new Prisma.Decimal(0);

    for (const holding of user.holdings) {
        const currentPrice = holding.asset.priceCache?.priceSek;

        if (!currentPrice || currentPrice.lte(0)) {
            continue;
        }

        const holdingValueSek = holding.quantity.mul(currentPrice);
        totalHoldingsValueSek = totalHoldingsValueSek.add(holdingValueSek);
    }

    const totalValueSek = user.cashBalance.add(totalHoldingsValueSek);

    return {
        cashBalance: user.cashBalance,
        totalHoldingsValueSek,
        totalValueSek,
    };
}
// Skapar en snapshot av användarens portföljvärde.
export async function createPortfolioSnapshot(
    tx: Prisma.TransactionClient,
    userId: string
) {
    const portfolioValue = await calculatePortfolioValue(tx, userId);
    const snapshot = await tx.portfolioSnapshot.create({
        data: {
            userId,
            totalValueSek: portfolioValue.totalValueSek,
            cashBalance: portfolioValue.cashBalance,
        },
    });
    return {
        snapshot,
        portfolioValue,
    };
}