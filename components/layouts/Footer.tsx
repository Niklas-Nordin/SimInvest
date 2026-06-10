"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
}


function Footer() {

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
    <footer className="w-full bg-space-dark text-space-light px-10">
      <div className="max-w-6xl mx-auto py-8 md:py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <div className="flex flex-col gap-2">
            <img src="/logo.svg" alt="SimInvest logo" className="w-[100px]" />
            <p className="text-sm leading-relaxed max-w-sm">
              En utbildningsplattform för att lära sig kryptohandel helt riskfritt med virtuella pengar. Skapad som ett examensarbete av Niklas och Fares.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-white font-semibold text-base">Navigering</h3>
            <ul className="space-y-2 text-sm">
              {!user && (
                <li>
                  <Link href="/" className="hover:text-white transition-colors">Hem</Link>
                </li>
              )}
              
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Om oss</Link>
              </li>

              {/* Visas bara om användaren ÄR inloggad */}
              {user && (
                <>
                  <li>
                    <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                  </li>
                  <li>
                    <Link href="/market" className="hover:text-white transition-colors">Marknad</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-white font-semibold text-base">Utvecklare</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com/Niklas-Nordin" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Niklas <span>→</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/Fares-elloumi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Fares <span>→</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-space-light pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} SimInvest. Alla rättigheter förbehållna.</p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;