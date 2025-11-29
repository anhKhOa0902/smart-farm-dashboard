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
import { fetchTelemetryHistory } from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const from = new Date(now.getTime() - 60 * 60 * 1000); // 1 giờ trước

        const response = await fetchTelemetryHistory({
          from,
          to: now,
          agg: "AVG",
          interval_ms: 300000, // 5 phút
        });

        if (response.success && response.data) {
          setData(response.data);
          setError("");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading telemetry data:", err);
        setError("Không thể tải dữ liệu.");
        setLoading(false);
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 300000); // Cập nhật mỗi 5 phút

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="loading-screen">Đang tải dữ liệu...</div>;
  if (error) return <div className="error-screen">{error}</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
        },
      },
    },
  };

  const createChartData = (dataKey, label, color) => {
    const points = data[dataKey] || [];
    
    return {
      labels: points.map((item) => {
        const date = new Date(item.ts);
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }),
      datasets: [
        {
          label: label,
          data: points.map((item) => item.value),
          borderColor: color,
          backgroundColor: color + "33", // Thêm alpha cho transparency
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  return (
    <div className="statistics-container">
      <h2>Thống kê cảm biến (1 giờ gần nhất)</h2>

      <div className="chart-grid">
        <div className="chart-wrapper">
          <h3>Nhiệt độ (°C)</h3>
          <div className="chart">
            <Line
              data={createChartData(
                "temperature",
                "Nhiệt độ",
                "rgb(255, 99, 132)"
              )}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Độ ẩm không khí (%)</h3>
          <div className="chart">
            <Line
              data={createChartData("humidity", "Độ ẩm", "rgb(54, 162, 235)")}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Độ ẩm đất (%)</h3>
          <div className="chart">
            <Line
              data={createChartData(
                "soilMoisture",
                "Độ ẩm đất",
                "rgb(75, 192, 192)"
              )}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="chart-wrapper">
          <h3>Ánh sáng (lux)</h3>
          <div className="chart">
            <Line
              data={createChartData(
                "lightLevel",
                "Ánh sáng",
                "rgb(255, 206, 86)"
              )}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;