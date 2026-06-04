"use client";

import PriceGraph from "@/components/market/PriceGraph";
import TradeAsset from "@/components/market/TradeAsset";

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

interface AssetModalProps {
  Asset: CryptoAsset;
  onClose: () => void;
}

function AssetModal({ Asset, onClose }: AssetModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 mb-4">
            <img src={Asset.imageUrl} alt={Asset.name} className="w-12 h-12 rounded-full" />
            <h2 className="text-3xl font-bold capitalize">{Asset.name} ({Asset.symbol.toUpperCase()})</h2>
          </div>
          
          <button onClick={onClose} className="cursor-pointer">
              <img src="close.svg" alt={"Stäng"} className="w-8 h-8" />
          </button>
        </div>

        <div className="flex items-start gap-6 mb-6">
          <span className="text-3xl font-bold">{Asset.priceSek ? `${parseFloat(Asset.priceSek).toFixed(2)} SEK` : "N/A"}</span>
          <span className={`text-lg font-bold ${Asset.change24h && parseFloat(Asset.change24h) >= 0 ? "text-green-600" : "text-red-500"}`}>
            {Asset.change24h ? `${parseFloat(Asset.change24h).toFixed(2)}%` : "N/A"} (24h)
          </span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <PriceGraph Asset={Asset} />
          <TradeAsset Asset={Asset} />
        </div>
      </div>
    </div>
  );
}

export default AssetModal;