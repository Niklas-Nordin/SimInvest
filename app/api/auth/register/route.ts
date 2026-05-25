import { registerSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "E-postadressen finns redan" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            }
        });

        const token = await new SignJWT({ userId: newUser.id })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("1h")
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

        const response = NextResponse.json(
            { message: "Registrering och inloggning lyckades", user: { id: newUser.id, name: newUser.name, email: newUser.email } },
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
        if (error instanceof ZodError) {

            const validationErrors: Record<string, string> = {};

            error.issues.forEach((issue) => {
                const fieldName = issue.path[0]?.toString();
                if (fieldName) {
                    validationErrors[fieldName] = issue.message;
                }
            });
            
            return NextResponse.json({ errors: validationErrors }, { status: 400 });
        }

        return NextResponse.json(
            { error: "Något gick fel. Försök igen senare." },
            { status: 500 }
        );
    }
}
