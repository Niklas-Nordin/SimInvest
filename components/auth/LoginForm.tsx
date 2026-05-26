"use client"

import { useState } from "react";

interface AuthFormData {
    email: string;
    password: string;
}

interface AuthFormErrors {
    email?: string;
    password?: string;
    server?: string;
}

function LoginForm() {
    const [formData, setFormData] = useState<AuthFormData>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<AuthFormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
    }

    const validateForm = () => {
        const newErrors: AuthFormErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Ange e-postadress";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Ange lösenord";
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
            const response = await fetch("/api/auth/login", {
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

            {errors.server && <p className="text-red-500">{errors.server}</p>}

            <p className="text-blue-500 underline cursor-pointer">
                Har du glömt lösenord?
            </p>

            <button type="submit" className="bg-space-dark text-white p-2 rounded cursor-pointer">
                Logga in
            </button>
        </form>
    );
}

export default LoginForm;