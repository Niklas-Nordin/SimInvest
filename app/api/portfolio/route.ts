import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPricesWithCache } from "@/lib/helpers/prices";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET saknas i .env");
}

const secret = new TextEncoder().encode(jwtSecret);

async function getUserIdFromToken(req: NextRequest) {
    // Läser JWT-token från HttpOnly-cookien.
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return null;
    }

    try {
        // Verifierar token och hämtar userId från payload.
        const { payload } = await jwtVerify(token, secret);

        if (typeof payload.userId !== "string") {
            return null;
        }

        return payload.userId;
    } catch {
        // Om token är ogiltig eller har gått ut returnerar vi null.
        return null;
    }
}

