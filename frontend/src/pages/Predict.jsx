import { useState } from "react";
import { Upload, Brain, Activity } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { predictDisease } from "../services/api";

function Predict() {
  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!symptoms.trim()) {
      alert("Please enter symptoms");
      return;
    }

    try {
      setLoading(true);

      const data = await predictDisease(
        symptoms,
        image
      );

      setResults(data.predictions || []);
    } catch (error) {
      console.log(error);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSymptoms("");
    setImage(null);
    setPreview(null);
    setResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">

      {/* Header */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">
          Disease Prediction
        </h1>

        <p className="text-slate-500 mt-2">
          Upload symptoms and medical images
          for AI-powered disease prediction
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* LEFT PANEL */}

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">

          <h2 className="font-semibold text-xl mb-6">
            Patient Information
          </h2>

          {/* Upload Box */}

          <div
            className="
            border-2
            border-dashed
            border-slate-300
            rounded-2xl
            p-10
            text-center
            "
          >
            <Upload
              size={55}
              className="mx-auto text-blue-600"
            />

            <p className="font-medium mt-4">
              Upload Medical Image
            </p>

            <p className="text-slate-500 text-sm mt-2">
              JPG, PNG supported
            </p>

            <input
              id="image-upload"
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];

                setImage(file);

                if (file) {
                  setPreview(
                    URL.createObjectURL(file)
                  );
                }
              }}
            />

            <label
              htmlFor="image-upload"
              className="
              inline-block
              mt-5
              bg-blue-600
              text-white
              px-5
              py-3
              rounded-xl
              cursor-pointer
              hover:bg-blue-700
              transition
              "
            >
              Browse Image
            </label>

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="
                mt-6
                w-full
                h-56
                object-cover
                rounded-xl
                border
                "
              />
            )}
          </div>

          {/* Symptoms */}

          <div className="mt-6">
            <label className="font-medium block mb-3">
              Symptoms
            </label>

            <textarea
              placeholder="Example: fever headache fatigue"
              value={symptoms}
              onChange={(e) =>
                setSymptoms(e.target.value)
              }
              className="
              w-full
              h-40
              border
              border-slate-300
              rounded-xl
              p-4
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            />
          </div>

          {/* Buttons */}

          <div className="flex gap-4 mt-6">

            <button
              onClick={handlePredict}
              className="
              flex-1
              bg-blue-600
              text-white
              py-4
              rounded-xl
              font-semibold
              hover:bg-blue-700
              transition
              "
            >
              {loading ? (
                <div className="flex justify-center items-center gap-3">
                  <FaSpinner className="animate-spin" />
                  Analyzing...
                </div>
              ) : (
                "Predict Disease"
              )}
            </button>

            <button
              onClick={resetForm}
              className="
              px-6
              border
              border-slate-300
              rounded-xl
              hover:bg-slate-100
              transition
              "
            >
              Reset
            </button>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">

          <h2 className="font-semibold text-xl mb-6">
            Prediction Results
          </h2>

          {/* Top Disease */}

          {results.length > 0 && (
            <div
              className="
              bg-blue-50
              border
              border-blue-100
              rounded-2xl
              p-5
              mb-6
              "
            >
              <h3 className="font-semibold">
                Most Likely Disease
              </h3>

              <p className="text-2xl font-bold mt-2">
                {results[0].disease}
              </p>

              <p className="text-slate-500 mt-1">
                Probability:
                {" "}
                {results[0].probability}%
              </p>
            </div>
          )}

          {/* Empty State */}

          {results.length === 0 && !loading && (
            <div className="text-center py-20">
              <Brain
                size={60}
                className="mx-auto text-slate-300"
              />

              <p className="mt-5 text-slate-500">
                No predictions yet
              </p>
            </div>
          )}

          {/* Results */}

          <div className="space-y-5">

            {results.map((item, index) => (
              <div
                key={index}
                className="
                border
                border-slate-200
                rounded-2xl
                p-5
                "
              >
                <div className="flex justify-between">

                  <div>
                    <h3 className="font-semibold text-lg">
                      #{item.rank}
                    </h3>

                    <p className="font-medium">
                      {item.disease}
                    </p>
                  </div>

                  <Activity
                    className="text-blue-600"
                  />

                </div>

                <div className="mt-4">

                  <div className="flex justify-between text-sm">
                    <span>Probability</span>

                    <span>
                      {item.probability}%
                    </span>
                  </div>

                  <div className="h-2 bg-slate-200 rounded-full mt-2">

                    <div
                      className="
                      h-2
                      bg-blue-600
                      rounded-full
                      "
                      style={{
                        width: `${item.probability}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="mt-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.confidence === "High"
                        ? "bg-green-100 text-green-700"
                        : item.confidence === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.confidence}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Predict;