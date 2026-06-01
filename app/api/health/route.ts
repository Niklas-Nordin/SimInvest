import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Testar att backend kan ansluta till databasen.
        const userCount = await prisma.user.count();

        // Om databasanropet fungerar returnerar vi status ok.
        return NextResponse.json({
            status: "ok",
            database: "connected",
            userCount,
        });
    } catch (error) {
        console.error("Database health check failed:", error);

        // Om databasen inte svarar returnerar vi ett felmeddelande.
        return NextResponse.json(
            {
                status: "error",
                database: "not connected",
            },
            { status: 500 }
        );
    }
}