"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/current-user");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  const handleLogout = async (e) => {
    e.preventDefault();
    setLoggingOut(true);
    
    try {
      console.log("Logging out...");
      const response = await fetch("/api/auth/logout");
      
      if (response.redirected) {
        // Clear local state
        setUser(null);
        // Redirect to home page
        router.push("/");
        router.refresh(); // Refresh to update server components
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  };
  
  const isActive = (path) => pathname === path;
  
  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold">
              OAuth 2.0 System
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard") ? "bg-blue-700" : "hover:bg-blue-700"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/profile") ? "bg-blue-700" : "hover:bg-blue-700"
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-white px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <Link
                href="/api/auth/google"
                className="text-white px-3 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 transition-colors"
              >
                Login with Google
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}