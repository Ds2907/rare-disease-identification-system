import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar({ dark, setDark }) {
  const [time, setTime] = useState("");
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("en-IN")
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const navLink = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-slate-600 hover:text-blue-600";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <h1 className="font-bold text-xl">
              AI DOC
            </h1>

            <p className="text-xs text-slate-500">
              Rare Disease Assistant
            </p>
          </div>
        </div>

        <div className="font-medium">
          {time}
        </div>

        <div className="flex items-center gap-8">

          <nav className="flex gap-6">
            <Link to="/" className={navLink("/")}>
              Home
            </Link>

            <Link
              to="/predict"
              className={navLink("/predict")}
            >
              Predict
            </Link>

            <Link
              to="/dashboard"
              className={navLink("/dashboard")}
            >
              Dashboard
            </Link>

            <Link
              to="/history"
              className={navLink("/history")}
            >
              History
            </Link>
          </nav>

          <button
            onClick={() => setDark(!dark)}
            className="
            px-3
            py-2
            rounded-lg
            border
            hover:bg-slate-100
            "
          >
            {dark ? "☀️" : "🌙"}
          </button>

        </div>
      </div>
    </header>
  );
}

export default Navbar;