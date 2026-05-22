import { registerSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        return NextResponse.json(
            { message: "Användare skapad", user: { id: newUser.id, name: newUser.name, email: newUser.email } },
            { status: 201 }
        );
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
