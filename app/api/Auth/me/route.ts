import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {jwtVerify} from "jose";
import {prisma} from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, secret);
        const user = await prisma.user.findUnique({
            where: { id: payload.id as string},
            select: { id: true, email: true, name: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Användare hittades inte" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Internt Serverfel" }, { status: 500 });
    }
}