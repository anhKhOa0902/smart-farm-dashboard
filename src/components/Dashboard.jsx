// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  fetchLatestTelemetry,
  setMasterRelay,
  setMasterPump,
  setSlave1Pump,
  setSlave2Led,
  setMasterLed,
  createWaterSchedule,
} from "../api";


const SensorCard = ({ label, value, unit, isLoading }) => (
  <div className="card">
    <div className="card-label">{label}</div>
    <div className="card-value">
      {isLoading ? (
        <span className="loading">Đang tải...</span>
      ) : value !== null && value !== undefined ? (
        `${value} ${unit}`
      ) : (
        "--"
      )}
    </div>
  </div>
);

const ToggleButton = ({ label, state, onToggle }) => (
  <button
    className={`toggle-btn ${state ? "on" : "off"}`}
    onClick={() => onToggle(!state)}
  >
    {label}: {state ? "ON" : "OFF"}
  </button>
);

const Dashboard = () => {
  // ====== sensor values ======
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(null);
  const [lightLevel, setLightLevel] = useState(null);
  const [loadingSensors, setLoadingSensors] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ====== device states ======
  const [ledState, setLedState] = useState(false);
  const [masterRelayState, setMasterRelayState] = useState(false);
  const [masterPumpState, setMasterPumpState] = useState(false);
  const [slave1PumpState, setSlave1PumpState] = useState(false);
  const [slave2LedState, setSlave2LedState] = useState(false); // 🔥 mới
  

  // ====== schedule form ======
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [duration, setDuration] = useState(5);
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ====== Fetch sensor data ======
  const fetchSensorData = async () => {
    try {
      setLoadingSensors(true);
      const response = await fetchLatestTelemetry();
      
      if (response.success && response.data) {
        const { temperature, humidity, soilMoisture, lightLevel } = response.data;
        
        setTemperature(temperature !== null ? Number(temperature).toFixed(1) : null);
        setHumidity(humidity !== null ? Number(humidity).toFixed(1) : null);
        setSoilMoisture(soilMoisture !== null ? Number(soilMoisture).toFixed(1) : null);
        setLightLevel(lightLevel !== null ? Number(lightLevel).toFixed(0) : null);
        
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu cảm biến:", err);
      setError("Không thể lấy dữ liệu cảm biến");
    } finally {
      setLoadingSensors(false);
    }
  };

  // ====== Auto-refresh every 5 minutes ======
  useEffect(() => {
    // Lấy dữ liệu ngay khi component mount
    fetchSensorData();

    // Tự động cập nhật mỗi 5 phút (300000ms)
    const interval = setInterval(() => {
      fetchSensorData();
    }, 300000); // 5 phút

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, []);

  // ====== helper toggle ======
  const handleToggle = async (setter, apiFn, newState) => {
    try {
      setter(newState);
      setMessage("");
      setError("");
      await apiFn(newState);
      setMessage("Gửi lệnh thành công");
    } catch (err) {
      console.error(err);
      setter(!newState);
      setError("Gửi lệnh thất bại");
    }
  };

  // ====== submit schedule ======
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!year || !month || !day || !hour || !minute) {
      setError("Vui lòng nhập đầy đủ năm, tháng, ngày, giờ, phút");
      return;
    }

    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const h = Number(hour);
    const min = Number(minute);

    if (
      Number.isNaN(y) ||
      Number.isNaN(m) ||
      Number.isNaN(d) ||
      Number.isNaN(h) ||
      Number.isNaN(min)
    ) {
      setError("Giá trị thời gian không hợp lệ");
      return;
    }

    if (h < 0 || h > 23 || min < 0 || min > 59 || m < 1 || m > 12 || d < 1 || d > 31) {
      setError("Giờ/phút/ngày/tháng nằm ngoài phạm vi cho phép");
      return;
    }

    const pad2 = (n) => String(n).padStart(2, "0");
    const startTimeStr = `${y}-${pad2(m)}-${pad2(d)}T${pad2(h)}:${pad2(min)}:00.000+07:00`;

    try {
      setLoadingSchedule(true);
      const payload = {
        start_time: startTimeStr,
        duration_minutes: Number(duration),
        repeat_daily: repeatDaily,
      };
      await createWaterSchedule(payload);
      setMessage("Tạo lịch tưới thành công");
    } catch (err) {
      console.error(err);
      setError("Tạo lịch tưới thất bại");
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Smart Farm Dashboard</h1>

      {/* Hiển thị thời gian cập nhật cuối */}
      {lastUpdate && (
        <div className="last-update">
          Cập nhật lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
          <button 
            onClick={fetchSensorData} 
            disabled={loadingSensors}
            style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}
          >
            {loadingSensors ? "Đang tải..." : "🔄 Làm mới"}
          </button>
        </div>
      )}

      <div className="grid">
        {/* ==== CẢM BIẾN ==== */}
        <div className="column">
          <h2>Cảm biến</h2>
          <div className="cards">
            <SensorCard 
              label="Nhiệt độ" 
              value={temperature} 
              unit="°C" 
              isLoading={loadingSensors}
            />
            <SensorCard 
              label="Độ ẩm không khí" 
              value={humidity} 
              unit="%" 
              isLoading={loadingSensors}
            />
            <SensorCard 
              label="Độ ẩm đất" 
              value={soilMoisture} 
              unit="%" 
              isLoading={loadingSensors}
            />
            <SensorCard 
              label="Ánh sáng" 
              value={lightLevel} 
              unit="lux" 
              isLoading={loadingSensors}
            />
          </div>
        </div>

        {/* ==== ĐIỀU KHIỂN ==== */}
        <div className="column">
          <h2>Điều khiển</h2>
          <div className="controls">
            <ToggleButton
              label="LED master"
              state={ledState}
              onToggle={(s) => handleToggle(setLedState, setMasterLed, s)}
            />
            <ToggleButton
              label="Relay master"
              state={masterRelayState}
              onToggle={(s) => handleToggle(setMasterRelayState, setMasterRelay, s)}
            />
            <ToggleButton
              label="Pump master"
              state={masterPumpState}
              onToggle={(s) => handleToggle(setMasterPumpState, setMasterPump, s)}
            />
            <ToggleButton
              label="Pump slave 1"
              state={slave1PumpState}
              onToggle={(s) => handleToggle(setSlave1PumpState, setSlave1Pump, s)}
            />
            <ToggleButton
              label="LED slave 2"
              state={slave2LedState}
              onToggle={(s) => handleToggle(setSlave2LedState, setSlave2Led, s)}
            />

          </div>
        </div>

        {/* ==== ĐẶT LỊCH TƯỚI ==== */}
        <div className="column">
          <h2>Đặt lịch tưới</h2>
          <form className="schedule-form" onSubmit={handleCreateSchedule}>
            <div className="row">
              <label>
                Giờ (0–23)
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                />
              </label>

              <label>
                Phút (0–59)
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                />
              </label>
            </div>

            <div className="row">
              <label>
                Ngày
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </label>

              <label>
                Tháng
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </label>

              <label>
                Năm
                <input
                  type="number"
                  min="2024"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </label>
            </div>

            <label>
              Thời lượng (phút)
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={repeatDaily}
                onChange={(e) => setRepeatDaily(e.target.checked)}
              />
              Lặp lại mỗi ngày
            </label>

            <button type="submit" disabled={loadingSchedule}>
              {loadingSchedule ? "Đang tạo..." : "Tạo lịch"}
            </button>
          </form>
        </div>
      </div>

      {(error || message) && (
        <div className="status-bar">
          {error && <span className="error">{error}</span>}
          {message && <span className="success">{message}</span>}
        </div>
      )}
    </div>
  );
};

export default Dashboard;