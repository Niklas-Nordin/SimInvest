import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Namn är obligatoriskt"),
    email: z.string().trim().toLowerCase().min(1, "E-postadress är obligatoriskt").email("Ogiltig e-postadress"),
    password: z.string().min(8, "Lösenordet måste vara minst 8 tecken långt"),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().min(1, "Ange din e-postadress").email("Ogiltig e-postadress"),
    password: z.string().min(1, "Ange ditt lösenord"),
})
