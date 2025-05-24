import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO, isValid, differenceInCalendarDays } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PAGE_SIZES = [10, 20, 50];

function Spinner() {
  return (
    <div className="flex justify-center items-center my-10">
      <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}

function isValidLatitude(lat) {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lon) {
  return !isNaN(lon) && lon >= -180 && lon <= 180;
}

function isValidDateStr(dateStr) {
  const date = parseISO(dateStr);
  return isValid(date);
}

function formatDate(date) {
  return format(date, "yyyy-MM-dd");
}

export default function App() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [weatherData, setWeatherData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZES[0]);

  const isInputValid =
    isValidLatitude(parseFloat(latitude)) &&
    isValidLongitude(parseFloat(longitude)) &&
    isValidDateStr(startDate) &&
    isValidDateStr(endDate) &&
    parseISO(startDate) <= parseISO(endDate) &&
    differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) <= 30;

  const fetchWeatherData = async () => {
    setError("");
    setLoading(true);
    setWeatherData(null);
    setCurrentPage(1);

    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      const dailyParams = [
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "apparent_temperature_mean",
      ].join(",");

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=${dailyParams}&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      if (!data || !data.daily || !data.daily.time) {
        throw new Error("No data returned for the given parameters.");
      }

      setWeatherData(data.daily);
    } catch (err) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data with spanGaps:true to connect over nulls
  const chartData = React.useMemo(() => {
    if (!weatherData) return null;

    return {
      labels: weatherData.time.map((d) => formatDate(parseISO(d))),
      datasets: [
        {
          label: "Max Temp (°C)",
          data: weatherData.temperature_2m_max,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.3)",
          tension: 0.3,
          fill: true,
          spanGaps: true,
          pointRadius: 3,
        },
        {
          label: "Min Temp (°C)",
          data: weatherData.temperature_2m_min,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.3)",
          tension: 0.3,
          fill: true,
          spanGaps: true,
          pointRadius: 3,
        },
        {
          label: "Mean Temp (°C)",
          data: weatherData.temperature_2m_mean,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.3)",
          tension: 0.3,
          fill: true,
          spanGaps: true,
          pointRadius: 3,
        },
        {
          label: "Max Apparent Temp (°C)",
          data: weatherData.apparent_temperature_max,
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.3)",
          tension: 0.3,
          fill: true,
          spanGaps: true,
          pointRadius: 3,
        },
        {
          label: "Min Apparent Temp (°C)",
          data: weatherData.apparent_temperature_min,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.3)",
          tension: 0.3,
          fill: true,
          spanGaps: true,
          pointRadius: 3,
        },
        {
          label: "Mean Apparent Temp (°C)",
          data: weatherData.apparent_temperature_mean,
          borderColor: "#6b7280",
          backgroundColor: "rgba(107, 114, 128, 0.3)",
          tension: 0.3,
          fill: true,
          spanGaps: true,
          pointRadius: 3,
        },
      ],
    };
  }, [weatherData]);


  const paginatedData = React.useMemo(() => {
    if (!weatherData) return [];

    const totalRows = weatherData.time.length;
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);

    const rows = [];
    for (let i = startIdx; i < endIdx; i++) {
      rows.push({
        date: weatherData.time[i],
        temperature_2m_max: weatherData.temperature_2m_max[i],
        temperature_2m_min: weatherData.temperature_2m_min[i],
        temperature_2m_mean: weatherData.temperature_2m_mean[i],
        apparent_temperature_max: weatherData.apparent_temperature_max[i],
        apparent_temperature_min: weatherData.apparent_temperature_min[i],
        apparent_temperature_mean: weatherData.apparent_temperature_mean[i],
      });
    }
    return rows;
  }, [weatherData, currentPage, rowsPerPage]);

  const totalPages = weatherData
    ? Math.ceil(weatherData.time.length / rowsPerPage)
    : 0;

  return (
    <div className="min-h-screen bg-[url('/image.png')] bg-cover bg-center bg-no-repeat p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-500 mb-8 text-center">
          Historical Weather Dashboard
        </h1>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isInputValid && !loading) fetchWeatherData();
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
        >
          {/** Latitude Input */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Latitude (-90 to 90)
            </label>
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 40.7128"
              required
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${latitude && !isValidLatitude(parseFloat(latitude))
                ? "border-red-500 ring-red-500"
                : "border-gray-300"
                }`}
            />
            {latitude && !isValidLatitude(parseFloat(latitude)) && (
              <p className="text-red-600 mt-1 text-sm font-medium">
                Please enter a valid latitude (-90 to 90).
              </p>
            )}
          </div>

          {/** Longitude Input */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Longitude (-180 to 180)
            </label>
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. -74.0060"
              required
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${longitude && !isValidLongitude(parseFloat(longitude))
                ? "border-red-500 ring-red-500"
                : "border-gray-300"
                }`}
            />
            {longitude && !isValidLongitude(parseFloat(longitude)) && (
              <p className="text-red-600 mt-1 text-sm font-medium">
                Please enter a valid longitude (-180 to 180).
              </p>
            )}
          </div>

          {/** Start Date Input */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || ""}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${startDate && !isValidDateStr(startDate)
                ? "border-red-500 ring-red-500"
                : "border-gray-300"
                }`}
            />
            {startDate && !isValidDateStr(startDate) && (
              <p className="text-red-600 mt-1 text-sm font-medium">
                Invalid start date.
              </p>
            )}
          </div>

          {/** End Date Input */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || ""}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${endDate && !isValidDateStr(endDate)
                ? "border-red-500 ring-red-500"
                : "border-gray-300"
                }`}
            />
            {endDate && !isValidDateStr(endDate) && (
              <p className="text-red-600 mt-1 text-sm font-medium">
                Invalid end date.
              </p>
            )}
            {startDate &&
              endDate &&
              parseISO(startDate) > parseISO(endDate) && (
                <p className="text-red-600 mt-1 text-sm font-medium">
                  Start date cannot be after end date.
                </p>
              )}
            {startDate &&
              endDate &&
              differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) >
              30 && (
                <p className="text-red-600 mt-1 text-sm font-medium">
                  Date range cannot exceed 30 days.
                </p>
              )}
          </div>

          <div className="md:col-span-4 flex justify-center mt-6">
            <button
              type="submit"
              disabled={!isInputValid || loading}
              className={`px-8 py-4 rounded-xl font-semibold text-white shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400 ${!isInputValid || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                }`}
            >
              {loading ? "Fetching Data..." : "Fetch Weather Data"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-8 shadow-md border border-red-300">
            {error}
          </div>
        )}

        {loading && <Spinner />}

        {/* Chart */}
        {weatherData && !loading && (
          <div className="mb-12 bg-white rounded-xl shadow-lg p-6" style={{ height: "400px", width: "100%" }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false, // important for responsiveness
                interaction: {
                  mode: "nearest",
                  axis: "x",
                  intersect: false,
                },
                stacked: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 14,
                      padding: 15,
                      font: { size: 14, weight: "600" },
                    },
                  },
                  title: {
                    display: true,
                    text: "Daily Temperature and Apparent Temperature",
                    font: {
                      size: 22,
                      weight: "bold",
                    },
                    padding: {
                      bottom: 30,    // extra space below title to avoid overlap
                    },
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    padding: 10,
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: "Temperature (°C)",
                      font: { size: 12, weight: "600" },
                    },
                    grid: {
                      color: "#e5e7eb",
                    },
                    beginAtZero: false,
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Date",
                      font: { size: 16, weight: "600" },
                    },
                    grid: {
                      color: "#f9fafb",
                    },
                  },
                },
              }}
            />
          </div>
        )}

        {/* Data Table */}
        {weatherData && !loading && (
          <>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold">
                  <tr>
                    <th className="sticky left-0 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 z-10">
                      Date
                    </th>
                    <th className="px-6 py-3">Max Temp (°C)</th>
                    <th className="px-6 py-3">Min Temp (°C)</th>
                    <th className="px-6 py-3">Mean Temp (°C)</th>
                    <th className="px-6 py-3">Max Apparent Temp (°C)</th>
                    <th className="px-6 py-3">Min Apparent Temp (°C)</th>
                    <th className="px-6 py-3">Mean Apparent Temp (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`transition hover:bg-blue-100 cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                    >
                      <td className="sticky left-0 bg-white px-6 py-3 font-medium text-gray-900 whitespace-nowrap z-0">
                        {formatDate(parseISO(row.date))}
                      </td>
                      <td className="px-6 py-3">{row.temperature_2m_max ?? "N/A"}</td>
                      <td className="px-6 py-3">{row.temperature_2m_min ?? "N/A"}</td>
                      <td className="px-6 py-3">{row.temperature_2m_mean ?? "N/A"}</td>
                      <td className="px-6 py-3">{row.apparent_temperature_max ?? "N/A"}</td>
                      <td className="px-6 py-3">{row.apparent_temperature_min ?? "N/A"}</td>
                      <td className="px-6 py-3">{row.apparent_temperature_mean ?? "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-gray-50 rounded-b-xl">
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="rowsPerPage"
                  className="text-gray-700 font-medium"
                >
                  Rows per page:
                </label>
                <select
                  id="rowsPerPage"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4 text-gray-700 font-semibold">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md border transition ${currentPage === 1
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "hover:bg-blue-200 border-blue-400 text-blue-700"
                    }`}
                  aria-label="Previous page"
                >
                  &larr; Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md border transition ${currentPage === totalPages
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "hover:bg-blue-200 border-blue-400 text-blue-700"
                    }`}
                  aria-label="Next page"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </>
        )}

        {!loading && !weatherData && !error && (
          <p className="text-center text-gray-500 mt-20 text-lg">
            Enter the location and date range above, then click{" "}
            <span className="font-semibold text-blue-600">Fetch Weather Data</span>{" "}
            to get started.
          </p>
        )}
      </div>
    </div >
  );
}
