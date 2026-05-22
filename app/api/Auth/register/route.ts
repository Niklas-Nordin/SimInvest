import { registerSchema } from "@/lib/validations/auth";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// interface ProtectedRequest extends Request {
//   user?: { id: string };
// }

// dotenv.config();

// const SALT_ROUNDS = 10;

// export const signUp = async (req: Request, res: Response) => {
//   try {
//     const { username, firstName, lastName, email, password } = req.body;
//     const errors: Record<string, string> = {};

//     const existingEmail = await User.findOne({ email });

//     if (!email) errors.email = "Email is required";
//     if(!firstName) errors.firstName = "First name is required";
//     if(!lastName) errors.lastName = "Last name is required";
//     if (!username) errors.username = "Username is required";
//     if (!password) errors.password = "Password is required";

//     if (existingEmail) {
//       errors.email = "Email already in use";
//     }

//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       errors.username = "Username already in use";
//     }

//     if (password.length < 8) {
//       errors.password = "Password must be at least 8 characters long";
//     }

//     if (Object.keys(errors).length > 0) {
//       return res.status(400).json({ errors });
//     }

//     const newUser = await User.create({
//       username,
//       email,
//       firstName,
//       lastName,
//       password,
//     });

//     res.status(201).json({ message: "User created", user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: "Something went wrong. Please try again later.", error });
//   }
// };

//---------------------------

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
