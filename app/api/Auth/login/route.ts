import {z} from "zod";
import {loginSchema} from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {SignJWT} from "jose";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = loginSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Fel epostadress eller lösenord" },
                { status: 401 }
            );
        }

        const correctPassword = await bcrypt.compare(password, user.passwordHash);

        if (!correctPassword) {
            return NextResponse.json(
                { error: "Fel epostadress eller lösenord" },
                { status: 401 }
            );
        }

        const token = await new SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("1h")
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

        const response = NextResponse.json(
            { message: "Inloggning lyckades", user: { id: user.id, name: user.name, email: user.email } },
            { status: 200 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60,
            path: "/",
        });

        return response;
        
    } catch (error) {

        if (error instanceof z.ZodError) {

            const validationErrors: Record<string, string> = {};

            error.issues.forEach((issue) => {
                const fieldName = issue.path[0]?.toString();
                if (fieldName) {
                    validationErrors[fieldName] = issue.message;
                }
            });

            return NextResponse.json(
                { error: validationErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Något gick fel, försök igen senare" },
            { status: 500 }
        );
    }
}
