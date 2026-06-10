"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Logout from '../auth/Logout';

interface User {
  id: string;
  email: string;
  name: string;
}

function Navbar() {

  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    }

    fetchUser();

  }, [pathname]);

  return (
    <nav className="flex items-center gap-8 justify-end bg-space-dark text-white fixed px-10 top-0 left-0 w-full h-[56px] z-20 border-b border-space-light">
      <Link href="/" className='cursor-pointer'>
        <img src="/logo.svg" alt="Logo" className="w-[140px] absolute left-10 top-1.5" />
      </Link>
      <div className="flex items-center gap-10 hidden lg:flex">
        {!user && (
          <>
            <Link href="/">Hem</Link>
          </>
        )}
        
        <Link href="/about">Om oss</Link>

        {user && (
          <div className="flex items-center gap-10">
              <div className="flex items-center gap-10">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/market">Marknad</Link>
            </div>
            <div className="inline-flex items-center gap-10">
              <span className="w-[1px] h-6 bg-white"></span>
            <Logout /> 
           </div>
          </div>
        )}
      </div>
      <button className="lg:hidden cursor-pointer">
        <img src="/hamburger-menu.svg" alt="Menu" className="w-[24px]" />
      </button>
    </nav>
  );
}

export default Navbar;