import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Namnet måste vara minst två tecken långt"),
    email: z.string().trim().min(1, "E-postadress är obligatoriskt").email("Ogiltig e-postadress"),
    password: z.string().min(8, "Lösenordet måste vara minst 8 tecken långt"),
});
