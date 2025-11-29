// src/api.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// --------- Telemetry ---------

// Lấy dữ liệu cảm biến mới nhất
export const fetchLatestTelemetry = async () => {
  try {
    const response = await api.get("/api/devices/master/telemetry/latest");
    return response.data;
  } catch (error) {
    console.error("Error fetching latest telemetry:", error);
    throw error;
  }
};

// Lấy lịch sử telemetry
export const fetchTelemetryHistory = async ({ from, to, agg, interval_ms }) => {
  try {
    const response = await api.get("/api/devices/master/telemetry/history", {
      params: {
        keys: "temperature,humidity,soilMoisture,lightLevel",
        start_time: from.toISOString(),
        end_time: to.toISOString(),
        agg: agg,
        interval_ms: interval_ms,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching telemetry history:", error);
    throw error;
  }
};

// --------- Device Control ---------

const postState = async (url, state) => {
  const res = await api.post(url, { state });
  return res.data;
};

export const setMasterRelay = (state) =>
  postState("/api/devices/master/relay", state);

export const setMasterPump = (state) =>
  postState("/api/devices/master/pump", state);

export const setSlave1Pump = (state) =>
  postState("/api/devices/slave1/pump", state);

export const setSlave2Led = (state) =>
  postState("/api/devices/slave2/led", state);


export const setMasterLed = (state) =>
  postState("/api/devices/master/led", state);

// --------- Schedule ---------

export const createWaterSchedule = async (payload) => {
  const res = await api.post("/api/schedules", payload);
  return res.data;
};

// --------- Settings & Alerts ---------

export const getThresholdSettings = async () => {
  const res = await api.get("/api/settings/thresholds");
  return res.data;
};

export const updateThresholdSettings = async (settings) => {
  const res = await api.post("/api/settings/thresholds", settings);
  return res.data;
};

export const getAlerts = async () => {
  const res = await api.get("/api/alerts");
  return res.data;
};

export const clearAlerts = async () => {
  const res = await api.delete("/api/alerts");
  return res.data;
};

export default api;