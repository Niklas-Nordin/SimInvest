import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Prisma, TransactionType } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { buyTradeSchema } from "@/lib/validations/trade";
import { getPricesWithCache } from "@/lib/helpers/prices";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET saknas i .env");
}

const secret = new TextEncoder().encode(jwtSecret);

async function getUserIdFromToken(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
        return null;
    }
    try {
        const { payload } = await jwtVerify(token, secret);

        if (typeof payload.userId !== "string") {
            return null;
        }
        return payload.userId;
    } catch {
        return null;
    }
}

