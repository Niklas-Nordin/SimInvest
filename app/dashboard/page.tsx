"use client";

import Logout from "@/components/auth/Logout";

function page() {
  return (
    <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Logout />
    </div>
  );
}

export default page;