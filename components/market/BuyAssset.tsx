"use client";

import { useState } from "react";

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

interface BuyAssetProps {
  Asset: CryptoAsset;
}

function BuyAsset({ Asset }: BuyAssetProps) {

  const [buy, setBuy] = useState(true);
  const [amount, setAmount] = useState("");
  const [calcUnits, setCalcUnits] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "confirm" | "success">("input");

  const calculateUnits = amount === "" ? "" : (parseFloat(amount) / (Asset.priceSek ? parseFloat(Asset.priceSek) : 1));

  const calculatePrice = amount === "" ? "" : (parseFloat(amount) * (Asset.priceSek ? parseFloat(Asset.priceSek) : 1));

  const amountSekToSend = calcUnits ? amount : (parseFloat(amount) * (Asset.priceSek ? parseFloat(Asset.priceSek) : 1));

  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setErrorMessage("Ange ett giltigt belopp.");
      return;
    }

    setStep("confirm");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!amount || parseFloat(amount) <= 0) {
        setErrorMessage("Ange ett giltigt belopp.");
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch("/api/trades/buy", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              assetId: Asset.id,
              amountSek: amountSekToSend
          })
      });

      const result = await response.json();

      if (!response.ok) {
              throw new Error(result.error || result.errors?.amountSek || "Köp misslyckades.");
            }

      setSuccessMessage("Köporder skickad!");
      setAmount("");
      setStep("success");

    } catch (error) {
      setErrorMessage("Det gick inte att skicka köporder.");

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-500/10 p-4 w-full rounded-md">
      {step === "input" && (
      <form onSubmit={handleGoToReview}>
        <div className="text-xl font-bold mb-4 w-full flex justify-end">
          <button type="button" className={`w-[50%] p-2 cursor-pointer ${buy ? 'border-b-2 border-space-dark text-space-dark' : 'border-b-2 border-gray-400 text-gray-400'}`} onClick={() => setBuy(true)}>
            Köp
          </button>
          <button type="button" className={`w-[50%] p-2 cursor-pointer ${!buy ? 'border-b-2 border-space-dark text-space-dark' : 'border-b-2 border-gray-400 text-gray-400'}`} onClick={() => setBuy(false)}>
            Sälj
          </button>
        </div>
        <div className="flex flex-col gap-6 border-b border-gray-400 pb-4">
            <div>
              {calcUnits ? (
                <>
                  <label htmlFor="amount" className="block text-sm font-medium">Belopp</label>
                  <input type="text" id="amount" name="amount" onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-space-teal" placeholder="Ange belopp i SEK" />
                </>
              ) : (
                <>
                  <label htmlFor="amount" className="block text-sm font-medium">Antal enheter</label>
                  <input type="text" id="amount" name="amount" onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-space-teal" placeholder="Ange antal enheter" />
                </>
              )}
            </div>

            <button className="bg-space-teal p-2 rounded-md hover:bg-space-teal/80 cursor-pointer self-center" type="button" onClick={() => setCalcUnits(!calcUnits)}>
              <img src="/Arrows.svg" alt="Change" className="w-5 h-5" />
            </button>

            <div>
              {calcUnits ? (
                <>
                  <label htmlFor="price" className="block text-sm font-medium">Pris per enhet</label>
                  <input type="text" id="price" name="price" readOnly cursor-not-allowed value={calculateUnits} className="w-full border border-gray-500 rounded-md p-2 focus:outline-none" />
                </>
              ) : (
                <>
                  <label htmlFor="price" className="block text-sm font-medium">Totalt pris</label>
                  <input type="text" id="price" name="price" readOnly cursor-not-allowed value={typeof calculatePrice === "number" ? calculatePrice.toFixed(2) : calculatePrice} className="w-full border border-gray-500 rounded-md p-2 focus:outline-none" />
                </>
              )}
            </div>
          </div>
          <button type="submit" className="w-full mt-6 bg-space-teal text-white p-2 rounded-md hover:bg-space-teal/80 cursor-pointer">
              {buy ? "Köp" : "Sälj"}
          </button>
      </form>
      )}

      {step === "confirm" && (
        <div className="py-4">
          <h3 className="text-xl font-bold text-center mb-4">Bekräfta din order</h3>
          
          <div className="bg-gray-500/5 p-4 rounded-md space-y-3 mb-6 text-sm flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Tillgång:</span>
              <span className="font-bold">{Asset.name} ({Asset.symbol})</span>
            </div>
            <div className="flex justify-between">
              <span>Antal enheter:</span>
              <span className="font-bold">{calcUnits ? calculateUnits : amount} {Asset.symbol}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-600 pt-2 text-base">
              <span className="font-medium text-lg">Total kostnad:</span>
              {/* Alltid .toFixed(2) på svenska kronor */}
              <span className="font-bold text-space-teal text-lg">{typeof amountSekToSend === "number" ? amountSekToSend.toFixed(2) : amountSekToSend}</span>
            </div>
          </div>

          {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

          <div className="flex gap-4">
            <button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-[65%] bg-space-teal text-white p-3 rounded-md hover:bg-space-teal/80 cursor-pointer font-bold disabled:bg-gray-600 transition-colors"
            >
              {isSubmitting ? "Behandlar..." : "Bekräfta köp"}
            </button>
            <button 
              disabled={isSubmitting}
              onClick={() => setStep("input")}
              className="w-[35%] bg-gray-600 text-white p-3 rounded-md hover:bg-gray-500 cursor-pointer text-center"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {step === "success" && successMessage && (
        <div className="text-center py-4">
          <h3 className="text-xl font-bold mb-2">Köp genomfört!</h3>
          <p className="text-green-500">{successMessage}</p>
          <button 
            onClick={() => setStep("input")}
            className="mt-4 bg-space-teal text-white p-2 rounded-md hover:bg-space-teal/80 cursor-pointer"
          >
            Tillbaka till köp
          </button>
        </div>
      )}
    </div>
  );
}

export default BuyAsset;