import { useState } from "react";
//import { Link } from "react-router-dom";
import tmobileLogo from "./assets/tmobile-logo-white.png";

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <header className="relative h-20 md:h-24 bg-gradient-to-r from-[#E20074] via-[#ff0080] to-[#E20074] shadow-xl flex items-center justify-center">
        <img src={tmobileLogo} alt="T-Mobile" className="h-[700%] w-auto select-none pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        
        <button
          onClick={() => setDark(v => !v)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-md px-4 py-2 text-sm font-medium transition 
          ${dark ? "bg-[#B1005C] text-white" : "bg-white text-[#E20074] hover:opacity-90"}`}>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="pointer-events-none absolute inset-x-0 -bottom-3 h-6">
          <span className="block mx-auto h-full w-2/3 rounded-full bg-[#ff1aa6] blur-2xl opacity-40 animate-pulse" />
        </div>
      </header>
      {/* Content area */}
      <main className="flex flex-col items-center justify-start pt-10">
        {/* Keep your existing example content */}
        <h1 className="text-2xl font-semibold mt-10">
          {dark ? "Dark mode" : "Light mode"}
        </h1>
      </main>
    </div>
  );
}
