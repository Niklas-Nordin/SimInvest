"use client";

import { useEffect, useState } from "react";
import AssetModal from "@/components/market/AssetModal";
import PriceGraph from "@/components/market/PriceGraph";

interface CryptoAsset {
  id: string;
  coingeckoId: string;
  symbol: string;
  name: string;
  imageUrl: string;
  priceSek: string | null;
  change24h: string | null;
  priceUpdatedAt: Date | null;
  source: string;
}

interface Holding {
  id: string;
  asset: {
    id: string;
    coingeckoId: string;
    symbol: string;
    name: string;
    imageUrl: string | null;
    change24h: string | null;
  };
  quantity: string;
  averageBuyPrice: string;
  currentPriceSek: string | null;
  currentValueSek: string;
  investedValueSek: string;
  profitLossSek: string;
  profitLossPercent: string;
  updatedAt: string;
}

interface PortfolioData {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  summary: {
    cashBalance: string;
    totalHoldingsValueSek: string;
    totalPortfolioValueSek: string;
    totalInvestedSek: string;
    totalProfitLossSek: string;
    totalProfitLossPercent: string;
  };
  holdings: Holding[];
}

interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  asset: {
    id: string;
    coingeckoId: string;
    symbol: string;
    name: string;
    imageUrl: string | null;
  };
  quantity: string;
  priceSek: string;
  totalSek: string;
  createdAt: string;
}

interface TransactionsData {
  success: boolean;
  count: number;
  data: Transaction[];
}

function formatSek(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return `${parseFloat(value).toFixed(2)}`;
}

function formatQuantity(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return parseFloat(value).toFixed(8);
}

function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshDashboardData() {
    try {
      const portfolioResponse = await fetch("/api/portfolio", {
        credentials: "include",
      });

      if (!portfolioResponse.ok) {
        throw new Error("Kunde inte hämta portfölj.");
      }

      const portfolioData: PortfolioData = await portfolioResponse.json();
      setPortfolio(portfolioData);

      const transactionsResponse = await fetch("/api/transactions", {
        credentials: "include",
      });

      if (!transactionsResponse.ok) {
        throw new Error("Kunde inte hämta transaktioner.");
      }

      const transactionsData: TransactionsData =
        await transactionsResponse.json();

      setTransactions(transactionsData.data);
    } catch (error) {
      console.error("Dashboard refresh failed:", error);
    }
  }

  function openAssetModal(holding: Holding) {
    const assetForModal: CryptoAsset = {
      id: holding.asset.id,
      coingeckoId: holding.asset.coingeckoId,
      symbol: holding.asset.symbol,
      name: holding.asset.name,
      imageUrl: holding.asset.imageUrl || "/globe.svg",
      priceSek: holding.currentPriceSek,
      change24h: holding.asset.change24h,
      priceUpdatedAt: null,
      source: "portfolio",
    };

    setSelectedAsset(assetForModal);
    setIsOpen(true);
  }

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        const portfolioResponse = await fetch("/api/portfolio", {
          credentials: "include",
        });

        if (!portfolioResponse.ok) {
          throw new Error("Kunde inte hämta portfölj.");
        }

        const portfolioData: PortfolioData = await portfolioResponse.json();

        const transactionsResponse = await fetch("/api/transactions", {
          credentials: "include",
        });

        if (!transactionsResponse.ok) {
          throw new Error("Kunde inte hämta transaktioner.");
        }

        const transactionsData: TransactionsData =
          await transactionsResponse.json();

        if (!ignore) {
          setPortfolio(portfolioData);
          setTransactions(transactionsData.data);
        }
      } catch (error) {
        console.error("Dashboard fetch failed:", error);

        if (!ignore) {
          setError("Något gick fel när dashboard skulle hämtas.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Laddar dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-500 font-bold">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {portfolio && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 lg:max-w-5xl">
            <div className="p-6 rounded-lg shadow-md border border-space-dark bg-space-dark">
              <p className="text-md text-white">Saldo</p>
              <p className="text-2xl font-bold text-white">
                {formatSek(portfolio.summary.cashBalance)} <span className="text-white">SEK</span>
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md border border-space-dark">
              <p className="text-md text-space-dark">Innehavsvärde</p>
              <p className="text-2xl font-bold text-space-dark">
                {formatSek(portfolio.summary.totalHoldingsValueSek)} <span className="text-space-dark">SEK</span>
              </p>
            </div>

            <div className="p-6 rounded-lg shadow-md border border-space-dark">
              <p className="text-md text-space-dark">Totalt portföljvärde</p>
              <p className="font-bold text-2xl text-space-dark">
                {formatSek(portfolio.summary.totalPortfolioValueSek)} <span className="text-space-dark">SEK</span>
              </p>
            </div>
          </div>

          <PriceGraph />

          <h2 className="text-2xl font-bold mb-4 mt-12">Mina Innehav</h2>

          {portfolio.holdings.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <p>Du har inga innehav ännu.</p>
            </div>
          ) : (
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mt-4">
              <thead className="bg-space-light uppercase text-sm text-space-dark">
                <tr className="text-left">
                  <th className="p-4">Namn</th>
                  <th className="p-4">Antal</th>
                  <th className="p-4">Värde</th>
                  <th className="p-4">Sedan köp</th>
                  <th className="p-4">Köp / Sälj</th>
                </tr>
              </thead>

              <tbody>
                {portfolio.holdings.map((holding) => {
                  const profitLoss = parseFloat(holding.profitLossSek);
                  const profitLossPercent = parseFloat(
                    holding.profitLossPercent
                  );

                  return (
                    <tr
                      className="hover:bg-gray-100 text-left border-b border-gray-300"
                      key={holding.id}
                    >
                      <td className="flex items-center gap-4 p-4">
                        <img
                          src={holding.asset.imageUrl || "/globe.svg"}
                          alt={holding.asset.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold capitalize">
                            {holding.asset.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {holding.asset.symbol.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        {formatQuantity(holding.quantity)}
                      </td>

                      <td className="p-4">
                        {formatSek(holding.currentValueSek)} <span className="text-sm">SEK</span>
                      </td>

                      <td
                        className={`p-4 font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-500"
                          }`}
                      >
                        {profitLoss >= 0 ? "+" : ""}
                        {formatSek(holding.profitLossSek)} <span className="text-sm">SEK </span>
                        <span className="text-sm font-normal">
                          ({profitLossPercent >= 0 ? "+" : ""}
                          {profitLossPercent.toFixed(2)}%)
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => openAssetModal(holding)}
                          className="bg-space-dark text-white px-4 py-2 rounded-md hover:bg-gray-800 cursor-pointer"
                        >
                          Hantera
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <h2 className="text-2xl font-bold mt-12 mb-4">Transaktioner</h2>

          {transactions.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <p>Du har inga transaktioner ännu.</p>
            </div>
          ) : (
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mt-4">
              <thead className="bg-space-light uppercase text-sm text-space-dark">
                <tr className="text-left">
                  <th className="p-4">Namn</th>
                  <th className="p-4">Antal</th>
                  <th className="p-4">Pris</th>
                  <th className="p-4">Totalt</th>
                  <th className="p-4">Datum</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    className="hover:bg-gray-100 text-left border-b border-gray-300"
                    key={transaction.id}
                  >
                    <td className="flex items-center gap-4 p-4">
                      <img
                        src={transaction.asset.imageUrl || "/globe.svg"}
                        alt={transaction.asset.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold capitalize">
                          {transaction.asset.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {transaction.asset.symbol.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {formatQuantity(transaction.quantity)}
                    </td>

                    <td className="p-4">{formatSek(transaction.priceSek)} <span className="text-sm">SEK</span></td>

                    <td className={`p-4 ${transaction.type === "BUY" ? "text-red-600" : "text-green-600"}`}> 
                      {transaction.type === "BUY" ? "-" : "+"}
                      {formatSek(transaction.totalSek)} <span className="text-sm">SEK</span>
                    </td>

                    <td className="p-4">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "sv-SE"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {isOpen && selectedAsset && (
        <AssetModal
          Asset={selectedAsset}
          onClose={() => {
            setIsOpen(false);
            setSelectedAsset(null);
            void refreshDashboardData();
          }}
        />
      )}
    </main>
  );
}

export default DashboardPage;