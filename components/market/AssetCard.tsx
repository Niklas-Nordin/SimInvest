interface AssetCardProps {
  text: string;
  Asset: CryptoAsset | null;
  AssetChange: number;
}

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

function AssetCard({ text, Asset, AssetChange }: AssetCardProps) {
  return (
    <div>
        {Asset ? (
            <div className="p-6 rounded-lg shadow-md border border-space-dark">
                <h2 className="text-sm font-bold mb-4">{text}</h2>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <img src={Asset.imageUrl} alt={Asset.name} className="w-10 h-10 rounded-full" />
                    <h3 className="text-2xl font-bold capitalize">{Asset.name} ({Asset.symbol})</h3>
                  </div>
                    <p className={`text-xl font-bold ${AssetChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {AssetChange >= 0 ? "+" : ""}{AssetChange.toFixed(2)}%
                    </p>
                </div>
                <p className="text-lg font-semibold">{Asset.priceSek} SEK</p>
            </div>
        ) : (
            <p>Asset not found</p>
        )}
    </div>
  );
}

export default AssetCard;