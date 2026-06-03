"use client";

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

interface AssetModalProps {
  Asset: CryptoAsset;
  onClose: () => void;
}

function AssetModal({ Asset, onClose }: AssetModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex items-start justify-between">
          <div>
            <img src={Asset.imageUrl} alt={Asset.name} className="w-12 h-12 rounded-full mb-4" />
            <h2 className="text-2xl font-bold capitalize">{Asset.name} ({Asset.symbol.toUpperCase()})</h2>
          </div>
          
          <button onClick={onClose} className="cursor-pointer">
              <img src="close.svg" alt={"Stäng"} className="w-8 h-8" />
          </button>
        </div>

        <PriceGraph Asset={Asset} />
      </div>
    </div>
  );
}

export default AssetModal;