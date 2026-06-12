"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface AuthFormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    server?: string;
}

function RegisterForm() {

    const router = useRouter();

    const [formData, setFormData] = useState<AuthFormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<AuthFormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
    }

    const validateForm = () => {
        const newErrors: AuthFormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Namn är obligatoriskt";
        }
        if (!formData.email.trim()) {
            newErrors.email = "E-postadress är obligatoriskt";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Lösenord är obligatoriskt";
        } else if (formData.password.trim().length < 8) {
            newErrors.password = "Lösenordet måste vara minst 8 tecken";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Lösenorden matchar inte";
        }
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {

        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if(!response.ok) {
                console.log(data)
                throw new Error(data.error ||"Något gick fel");
            } else {
                router.push("/dashboard");
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Något gick fel";
            
            if (errorMessage.toLowerCase().includes("e-postadress")) {
                setErrors((prev) => ({
                    ...prev,
                    email: errorMessage
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    server: errorMessage
                }));
            }
        }
    }

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
                <label htmlFor="name">Namn</label>
                {errors.name && <p className="text-red-500">{errors.name}</p>}
                <input
                    className="bg-white border border-gray-300 rounded p-2"
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="email">E-postadress</label>
                {errors.email && <p className="text-red-500">{errors.email}</p>}
                <input
                    className="bg-white border border-gray-300 rounded p-2"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="password">Lösenord</label>
                {errors.password && <p className="text-red-500">{errors.password}</p>}
                <input
                    className="bg-white border border-gray-300 rounded p-2"
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword">Bekräfta lösenord</label>
                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}
                <input
                    className="bg-white border border-gray-300 rounded p-2"
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
            </div>

            {errors.server && <p className="text-red-500">{errors.server}</p>}
            
            <button type="submit" className="bg-space-dark text-white p-2 rounded cursor-pointer">
                Registrera
            </button>
        </form>
    );
}

export default RegisterForm;