// src/App.js
import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Statistics from "./components/Statistics";
import { getAlerts } from "./api";
import "./App.css";

function NotificationBell({ alertCount, onClick }) {
  return (
    <div className="notification-bell" onClick={onClick}>
      <span className="bell-icon">🔔</span>
      {alertCount > 0 && (
        <span className="notification-badge">{alertCount}</span>
      )}
    </div>
  );
}

function NotificationPanel({ alerts, isOpen, onClose }) {
  if (!isOpen) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "danger":
        return "#f44336";
      case "warning":
        return "#ff9800";
      case "info":
        return "#2196f3";
      default:
        return "#757575";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "danger":
        return "🚨";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-panel">
        <div className="notification-header">
          <h3>Cảnh báo ({alerts.length})</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="notification-body">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              <span className="no-alerts-icon">✅</span>
              <p>Không có cảnh báo nào</p>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="alert-item"
                  style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                >
                  <div className="alert-icon">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NavBar({ activePage, onChangePage, theme, onToggleTheme, alerts, onAlertsClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">🌱 Smart Farm</div>

        <button
          className={
            "navbar-link" + (activePage === "dashboard" ? " active" : "")
          }
          onClick={() => onChangePage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={"navbar-link" + (activePage === "stats" ? " active" : "")}
          onClick={() => onChangePage("stats")}
        >
          Statistics
        </button>

        <button
          className={
            "navbar-link" + (activePage === "settings" ? " active" : "")
          }
          onClick={() => onChangePage("settings")}
        >
          Settings
        </button>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <NotificationBell 
          alertCount={alerts.length} 
          onClick={onAlertsClick}
        />

        {/* Theme Toggle */}
        <div className="theme-switch-wrapper">
          <span className="theme-switch-label">
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={onToggleTheme}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [activePage, setActivePage] = useState("dashboard");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch alerts every 30 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await getAlerts();
        setAlerts(response.alerts || []);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };

    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <div className="app">
      <NavBar
        activePage={activePage}
        onChangePage={setActivePage}
        theme={theme}
        onToggleTheme={toggleTheme}
        alerts={alerts}
        onAlertsClick={toggleNotifications}
      />

      <NotificationPanel
        alerts={alerts}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {activePage === "dashboard" && <Dashboard />}

      {activePage === "stats" && <Statistics />}

      {activePage === "settings" && (
        <Settings theme={theme} onToggleTheme={toggleTheme} />
      )}
    </div>
  );
}

export default App;