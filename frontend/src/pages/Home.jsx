import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-20">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Side */}
          <div>
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              AI Powered Healthcare Platform
            </span>

            <h1 className="mt-6 text-6xl font-bold text-slate-900 leading-tight">
              Rare Disease
              <br />
              Detection Platform
            </h1>

            <p className="mt-6 text-xl text-slate-600 max-w-xl">
              Analyze symptoms and medical images using artificial intelligence
              to identify rare diseases quickly and accurately.
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate("/predict")}
                className="
                bg-blue-600
                text-white
                px-8
                py-4
                rounded-xl
                font-semibold
                hover:bg-blue-700
                transition
              "
              >
                Start Diagnosis
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="
                border
                border-slate-300
                px-8
                py-4
                rounded-xl
                font-semibold
                hover:bg-slate-100
                transition
              "
              >
                View Dashboard
              </button>
            </div>
          </div>

          {/* Right Side Dashboard Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

            <div className="flex justify-between items-center mb-8">
              <h2 className="font-semibold text-2xl">
                AI Diagnosis Dashboard
              </h2>

              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-5">

              <div className="bg-blue-50 p-5 rounded-2xl">
                <p className="text-slate-500 text-sm">
                  Predictions
                </p>

                <h3 className="text-4xl font-bold text-slate-900 mt-2">
                  1,254
                </h3>
              </div>

              <div className="bg-green-50 p-5 rounded-2xl">
                <p className="text-slate-500 text-sm">
                  Accuracy
                </p>

                <h3 className="text-4xl font-bold text-slate-900 mt-2">
                  96.8%
                </h3>
              </div>

              <div className="bg-purple-50 p-5 rounded-2xl">
                <p className="text-slate-500 text-sm">
                  Diseases
                </p>

                <h3 className="text-4xl font-bold text-slate-900 mt-2">
                  500+
                </h3>
              </div>

              <div className="bg-orange-50 p-5 rounded-2xl">
                <p className="text-slate-500 text-sm">
                  Images
                </p>

                <h3 className="text-4xl font-bold text-slate-900 mt-2">
                  20K+
                </h3>
              </div>

            </div>
          </div>

        </div>

        {/* Features Section */}

        <div className="mt-28">

          <h2 className="text-4xl font-bold text-center text-slate-900">
            Core Features
          </h2>

          <p className="text-center text-slate-500 mt-3">
            Everything you need for AI-assisted rare disease detection.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg">
                Symptom Analysis
              </h3>

              <p className="text-slate-500 mt-3">
                Detect diseases from patient symptoms using AI models.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg">
                Image Detection
              </h3>

              <p className="text-slate-500 mt-3">
                Upload medical images for disease identification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg">
                AI Predictions
              </h3>

              <p className="text-slate-500 mt-3">
                Get ranked disease predictions with confidence scores.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg">
                Analytics
              </h3>

              <p className="text-slate-500 mt-3">
                Monitor prediction history and platform statistics.
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-24 border-t border-slate-200 pt-8 text-center text-slate-500">
          © 2026 AI DOC • Rare Disease Detection System
        </footer>

      </div>

    </div>
  );
}

export default Home;