import { z } from "zod";

export const buyTradeSchema = z.object({
    assetId: z.string().min(1, "Kryptovaluta saknas"),
    amountSek: z.coerce.number().positive("Belopp måste vara större än 0"),
});

export const sellTradeSchema = z.object({
    assetId: z.string().min(1, "Kryptovaluta saknas"),
    quantity: z.coerce.number().positive("Quantity måste vara större än 0"),
});