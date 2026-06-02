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

interface AssetTableProps {
  assets: CryptoAsset[];
}

function AssetTable({ assets }: AssetTableProps) {

  return (
    <div>
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mt-10">
            <thead className="bg-gray-200 uppercase text-sm">
                <tr className="text-left">
                    <th className="p-4">Namn</th>
                    <th className="p-4">Pris</th>
                    <th className="p-4">Förändring (24h)</th>
                </tr>
            </thead>

            <tbody>
                {Array.isArray(assets) && assets.map((asset) => (
                    <tr className="hover:bg-gray-100 cursor-pointer text-left border-b border-gray-300" key={asset.id}>
                       <td className="flex items-center gap-4 p-4">
                            <img src={asset.imageUrl} alt={asset.name} className="w-10 h-10 rounded-full" />
                            <div className="flex flex-col">
                                <span className="font-bold capitalize">{asset.name}</span>
                                <span className="text-sm text-gray-500">{asset.symbol.toUpperCase()}</span>
                            </div>
                        </td>
                        <td className="p-4">{asset.priceSek ? `${parseFloat(asset.priceSek).toFixed(2)} SEK` : "N/A"}</td>
                        <td className={`p-4 ${asset.change24h && parseFloat(asset.change24h) >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {asset.change24h ? `${parseFloat(asset.change24h).toFixed(2)}%` : "N/A"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

export default AssetTable;