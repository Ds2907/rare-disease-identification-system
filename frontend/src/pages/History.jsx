import { useEffect, useState } from "react";
import { getHistory } from "../services/api";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();

      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold">
          Prediction History
        </h1>

        <p className="mt-4 text-slate-500">
          Loading history...
        </p>
      </div>
    );
  }

  const filteredHistory = history.filter((item) => {
    const disease =
      item.predictions?.[0]?.disease ||
      item.disease ||
      "";

    return disease
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Prediction History
        </h1>

        <p className="text-slate-500 mt-2">
          View previous disease predictions
        </p>
      </div>

      {/* Search */}

      <input
        type="text"
        placeholder="Search disease..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="
        w-full
        mb-6
        p-4
        border
        border-slate-300
        rounded-xl
        outline-none
        focus:ring-2
        focus:ring-blue-500
        "
      />

      {/* Table */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>
              <th className="text-left p-4">
                Date
              </th>

              <th className="text-left p-4">
                Symptoms
              </th>

              <th className="text-left p-4">
                Disease
              </th>

              <th className="text-left p-4">
                Confidence
              </th>
            </tr>

          </thead>

          <tbody>

            {filteredHistory.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-8 text-center text-slate-500"
                >
                  No matching records found
                </td>
              </tr>
            ) : (
              filteredHistory.map(
                (item, index) => (
                  <tr
                    key={index}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4">
                      {item.timestamp || "-"}
                    </td>

                    <td className="p-4 max-w-xs">
                      {Array.isArray(
                        item.symptoms
                      )
                        ? item.symptoms.join(
                            ", "
                          )
                        : item.symptoms ||
                          "-"}
                    </td>

                    <td className="p-4 font-medium">
                      {item.predictions?.[0]
                        ?.disease ||
                        item.disease ||
                        "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        ${
                          (
                            item.predictions?.[0]
                              ?.confidence ||
                            item.confidence
                          ) === "High"
                            ? "bg-green-100 text-green-700"
                            : (
                                item
                                  .predictions?.[0]
                                  ?.confidence ||
                                item.confidence
                              ) ===
                              "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                        `}
                      >
                        {item
                          .predictions?.[0]
                          ?.confidence ||
                          item.confidence ||
                          "-"}
                      </span>
                    </td>
                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default History;