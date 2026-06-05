"use client";

import AssetTable from "@/components/market/AssetTable";
import { useState, useEffect } from "react";
import AssetCard from "@/components/market/AssetCard";

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

function Page() {

  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchAssets = async () => {
      try {
        const response = await fetch("/api/assets/prices");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAssets(data.data);

      } catch (error) {
        console.error("Error fetching assets:", error);
        setError("Kunde inte hämta prisdata.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();

    const interval = setInterval(() => {
      fetchAssets();
    }, 3600000);         // Uppdatera var 60:e minut, ändras till 60000 för varje minut när klart

    return () => clearInterval(interval);

  }, []);

  if (loading) {
    return <p className="text-center mt-10">Laddar marknadsdata...</p>;
  }

  const sortedAssets = assets && assets.length > 0 ? [...assets].sort((a, b) => {

    const changeA = a.change24h ? parseFloat(a.change24h) : 0;
    const changeB = b.change24h ? parseFloat(b.change24h) : 0;
    return changeB - changeA;

  }) : [];

  const topAsset = sortedAssets.length > 0 ? sortedAssets[0] : null;
  const topLoser = sortedAssets.length > 0 ? sortedAssets[sortedAssets.length - 1] : null;

  const topAssetChange = topAsset && topAsset.change24h ? parseFloat(topAsset.change24h) : 0;
  const topLoserChange = topLoser && topLoser.change24h ? parseFloat(topLoser.change24h) : 0;

  const topAssetText = topAssetChange >= 0 ? "Högst uppgång" : "Minst nedgång";
  const topLoserText = topLoserChange < 0 ? "Högst nedgång" : "Minst uppgång";

  return (
    <div className="p-10 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-left lg:text-5xl">Marknad</h1>
      <p className="lg:text-xl">Här finner du realtidspriser för olika kryptovalutor.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg: max-w-5xl">
        <AssetCard text={topAssetText} Asset={topAsset} AssetChange={topAssetChange} />
        <AssetCard text={topLoserText} Asset={topLoser} AssetChange={topLoserChange} />
      </div>
      <AssetTable assets={assets} />
      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
}

export default Page;