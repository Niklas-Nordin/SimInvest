import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";


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

function PriceGraph({ Asset }: { Asset: CryptoAsset }) {

    const [days, setDays] = useState(7);
    const [chartData, setChartData] = useState<{ date: number; price: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const ticketCount = days === 1 ? 6 : days === 7 ? 7 : days === 30 ? 10 : 12;

    useEffect(() => {

        setLoading(true);
        
        try {
            const fetchPriceHistory = async () => {
                setLoading(true);

                const response = await fetch(`/api/assets/${Asset.id}/history?days=${days}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                console.log("Pris historik:", data);

                const formattedData = data.data.map((item: { timestamp: number; price: number; time: number }) => ({
                    date: item.timestamp,
                    pris: item.price,
                    time: item.time,
                }));

                setChartData(formattedData);
                setLoading(false);
            };
            fetchPriceHistory();

        } catch (error) {
            console.error("Fel uppstod vid hämtning av prishistorik:", error);
        } finally {
            setLoading(false);
        }

    }, [days, Asset.id]);

  return (
    <div className="bg-gray-500/10 p-4 min-w-[65%] rounded-md">
        <div className="flex gap-4 mb-4 mr-6 justify-end">
            <button className={`${days === 1 ? 'bg-space-teal text-white' : ''} px-2 py-1 rounded cursor-pointer`} onClick={() => setDays(1)}>24 h</button>
            <button className={`${days === 7 ? 'bg-space-teal text-white' : ''} px-2 py-1 rounded cursor-pointer`} onClick={() => setDays(7)}>7 dagar</button>
            <button className={`${days === 30 ? 'bg-space-teal text-white' : '0'} px-2 py-1 rounded cursor-pointer`} onClick={() => setDays(30)}>30 dagar</button>
            <button className={`${days === 365 ? 'bg-space-teal text-white' : ''} px-2 py-1 rounded cursor-pointer`} onClick={() => setDays(365)}>365 dagar</button>
        </div>
        {loading ? <p>Laddar prisgraf...</p>
        : (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 7, bottom: 0 }}>

                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(35, 77, 96)" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="rgb(35, 77, 96)" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>

                    <XAxis dataKey="date" tickCount={ticketCount} type="number" domain={["dataMin", "dataMax"]} 
                    tickFormatter={(value) => {
                        const date = new Date(value);

                        if (days === 1) {
                            return date.toLocaleTimeString("sv-SE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            });
                        }

                        if (days <= 7) {
                            return date.toLocaleDateString("sv-SE", {
                            day: "numeric",
                            month: "short",
                            });
                        }

                        if (days <= 30) {
                            return date.toLocaleDateString("sv-SE", {
                            day: "numeric",
                            month: "short",
                            });
                        }

                        return date.toLocaleDateString("sv-SE", {
                            month: "short",
                        });
                        }} />

                    <YAxis domain={["auto", "auto"]} />

                    <Tooltip
                    animationDuration={100}
                    cursor={{
                        stroke: "rgb(35, 77, 96)",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                    }}
                    labelFormatter={(value) =>
                        new Date(Number(value)).toLocaleString("sv-SE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        })
                    }
                    />

                    <CartesianGrid strokeDasharray="3 3" />

                    <Area type="monotone" dataKey="pris" stroke="rgb(35, 77, 96)" fillOpacity={1} fill="url(#colorPrice)" style={{ pointerEvents: "none"  }} />

                </AreaChart>
            </ResponsiveContainer>
        )}
    </div>
  );
}

export default PriceGraph;