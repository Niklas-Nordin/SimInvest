"use client";

import { useRouter } from "next/navigation";

function Logout() {

    const router = useRouter();

    const handleLogout = async () => {

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            console.error("Utloggning misslyckades:", error);
        }
    }

  return (
    <div>
        <button className="text-white cursor-pointer" onClick={handleLogout}>
            Logga ut
        </button>
    </div>
  );
}

export default Logout;