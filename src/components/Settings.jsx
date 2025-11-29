// src/components/Settings.jsx
import React, { useState, useEffect } from "react";
import { getThresholdSettings, updateThresholdSettings } from "../api";
import "../Settings.css";

const Settings = ({ theme, onToggleTheme }) => {
  const [settings, setSettings] = useState({
    temperature_min: "",
    temperature_max: "",
    humidity_min: "",
    humidity_max: "",
    soil_moisture_min: "",
    soil_moisture_max: "",
    light_level_min: "",
    light_level_max: "",
    alerts_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getThresholdSettings();
      setSettings({
        temperature_min: data.temperature_min ?? "",
        temperature_max: data.temperature_max ?? "",
        humidity_min: data.humidity_min ?? "",
        humidity_max: data.humidity_max ?? "",
        soil_moisture_min: data.soil_moisture_min ?? "",
        soil_moisture_max: data.soil_moisture_max ?? "",
        light_level_min: data.light_level_min ?? "",
        light_level_max: data.light_level_max ?? "",
        alerts_enabled: data.alerts_enabled ?? true,
      });
    } catch (err) {
      console.error("Lỗi khi tải cài đặt:", err);
      setError("Không thể tải cài đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSaving(true);
      
      // Chuyển đổi giá trị rỗng thành null
      const payload = {
        temperature_min: settings.temperature_min === "" ? null : Number(settings.temperature_min),
        temperature_max: settings.temperature_max === "" ? null : Number(settings.temperature_max),
        humidity_min: settings.humidity_min === "" ? null : Number(settings.humidity_min),
        humidity_max: settings.humidity_max === "" ? null : Number(settings.humidity_max),
        soil_moisture_min: settings.soil_moisture_min === "" ? null : Number(settings.soil_moisture_min),
        soil_moisture_max: settings.soil_moisture_max === "" ? null : Number(settings.soil_moisture_max),
        light_level_min: settings.light_level_min === "" ? null : Number(settings.light_level_min),
        light_level_max: settings.light_level_max === "" ? null : Number(settings.light_level_max),
        alerts_enabled: settings.alerts_enabled,
      };

      await updateThresholdSettings(payload);
      setMessage("✅ Lưu cài đặt thành công!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi lưu cài đặt:", err);
      setError("❌ Không thể lưu cài đặt");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      temperature_min: "",
      temperature_max: "",
      humidity_min: "",
      humidity_max: "",
      soil_moisture_min: "",
      soil_moisture_max: "",
      light_level_min: "",
      light_level_max: "",
      alerts_enabled: true,
    });
    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-message">Đang tải cài đặt...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>Cài đặt</h1>

      <div className="settings-sections">
        {/* Theme Settings */}
        <section className="settings-section">
          <h2>🎨 Giao diện</h2>
          <div className="setting-item">
            <label className="setting-label">
              <span>Chế độ tối</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === "dark"}
                  onChange={onToggleTheme}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>
        </section>

        {/* Alert Settings */}
        <section className="settings-section">
          <h2>🔔 Cảnh báo</h2>
          <div className="setting-item">
            <label className="setting-label">
              <span>Bật cảnh báo tự động</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.alerts_enabled}
                  onChange={(e) => handleChange("alerts_enabled", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>
        </section>

        {/* Threshold Settings */}
        <section className="settings-section">
          <h2>⚙️ Ngưỡng cảnh báo</h2>
          <p className="section-description">
            Để trống nếu không muốn đặt ngưỡng cho cảm biến đó
          </p>

          <form onSubmit={handleSubmit}>
            {/* Nhiệt độ */}
            <div className="threshold-group">
              <h3>🌡️ Nhiệt độ (°C)</h3>
              <div className="input-row">
                <div className="input-group">
                  <label>Tối thiểu</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 15"
                    value={settings.temperature_min}
                    onChange={(e) => handleChange("temperature_min", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Tối đa</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 35"
                    value={settings.temperature_max}
                    onChange={(e) => handleChange("temperature_max", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Độ ẩm không khí */}
            <div className="threshold-group">
              <h3>💧 Độ ẩm không khí (%)</h3>
              <div className="input-row">
                <div className="input-group">
                  <label>Tối thiểu</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 40"
                    value={settings.humidity_min}
                    onChange={(e) => handleChange("humidity_min", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Tối đa</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 80"
                    value={settings.humidity_max}
                    onChange={(e) => handleChange("humidity_max", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Độ ẩm đất */}
            <div className="threshold-group">
              <h3>🌱 Độ ẩm đất (%)</h3>
              <div className="input-row">
                <div className="input-group">
                  <label>Tối thiểu</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 30"
                    value={settings.soil_moisture_min}
                    onChange={(e) => handleChange("soil_moisture_min", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Tối đa</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 70"
                    value={settings.soil_moisture_max}
                    onChange={(e) => handleChange("soil_moisture_max", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Ánh sáng */}
            <div className="threshold-group">
              <h3>☀️ Ánh sáng (lux)</h3>
              <div className="input-row">
                <div className="input-group">
                  <label>Tối thiểu</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="VD: 1000"
                    value={settings.light_level_min}
                    onChange={(e) => handleChange("light_level_min", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Tối đa</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="VD: 50000"
                    value={settings.light_level_max}
                    onChange={(e) => handleChange("light_level_max", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={saving}
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu cài đặt"}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Status Messages */}
      {(message || error) && (
        <div className="status-messages">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default Settings;