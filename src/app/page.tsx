"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("ecoWaveRole");
    if (savedRole === "admin") router.push("/dashboard");
    if (savedRole === "driver") router.push("/driver");
  }, [router]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("ecoWaveRole", "admin");
      router.push("/dashboard");
    } else {
      setError(true);
      setPassword("");
    }
  };

  const handleDriverLogin = () => {
    localStorage.setItem("ecoWaveRole", "driver");
    router.push("/driver");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4" dir="ltr">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 text-center max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
          EcoWave
        </h1>
        <p className="text-gray-400 mb-8">System Login Portal</p>

        {!showAdminLogin ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowAdminLogin(true)}
              className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Login as Traffic Manager
            </button>
            <button
              onClick={handleDriverLogin}
              className="w-full py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Login as Driver
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">Incorrect password, please try again.</p>}
            <div className="flex gap-2">
              <button type="submit" className="w-full py-3 rounded-lg font-bold text-white bg-blue-600">Login</button>
              <button type="button" onClick={() => setShowAdminLogin(false)} className="w-full py-3 rounded-lg font-bold text-white bg-gray-700">Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}