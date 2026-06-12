import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

function App() {
  const [dark, setDark] = useState(false);

  return (
    <div
      className={
        dark
          ? "min-h-screen bg-slate-900 text-white"
          : "min-h-screen bg-slate-50 text-slate-900"
      }
    >
      <BrowserRouter>
        <Navbar dark={dark} setDark={setDark} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;