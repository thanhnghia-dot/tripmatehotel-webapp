// src/Component/safety/WeatherAlert.jsx
import React, { useEffect, useState } from "react";
let apiUrl = "http://localhost:8080";

export default function WeatherAlert({ location }) {
  const [weather, setWeather] = useState(null);

  // ✅ dữ liệu mặc định khi API fail
  const fallbackWeather = {
    temp: 30,
    humidity: 70,
    condition: "Clear",
    description: "Sunny",
  };

  useEffect(() => {
    if (!location) return;

    fetch(`${apiUrl}/api/weather/safety?lat=${location.lat}&lon=${location.lon}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
      })
      .then((data) => {
        if (!data || !data.temp) {
          setWeather(fallbackWeather);
        } else {
          setWeather(data);
        }
      })
      .catch(() => {
        setWeather(fallbackWeather);
      });
  }, [location]);

  if (!weather) return <div className="weather-loading">Loading weather...</div>;

  const renderConditionIcon = (condition) => {
    switch (condition) {
      case "Clear":
        return <span className="cond-icon sunny">☀️</span>;
      case "Rain":
        return <span className="cond-icon rain">🌧</span>;
      case "Clouds":
        return <span className="cond-icon clouds">☁️</span>;
      case "Thunderstorm":
        return <span className="cond-icon storm">🌩</span>;
      default:
        return <span className="cond-icon">ℹ️</span>;
    }
  };

  const renderConditionAlert = () => {
    switch (weather.condition) {
      case "Rain":
        return "It's raining now!";
      case "Clear":
        return "Sunny weather";
      case "Clouds":
        return "Cloudy skies";
      case "Thunderstorm":
        return "Thunderstorm warning!";
      default:
        return `Current condition: ${weather.condition}`;
    }
  };

  return (
    <div className="weather-card">
      <h3 className="weather-title">🌤 Weather Alert</h3>

      <div className="weather-row">
        <div className="weather-col">
          <span className="label">🌡 Temp</span>
          <span className="value">{weather.temp}°C</span>
        </div>
        <div className="weather-col">
          <span className="label">💧 Humidity</span>
          <span className="value">{weather.humidity}%</span>
        </div>
        <div className="weather-col">
          <span className="label">🌥 Condition</span>
          <span className="value">
            {renderConditionIcon(weather.condition)} {weather.condition} —{" "}
            {weather.description}
          </span>
        </div>
      </div>

      <div className="weather-alert">⚠ {renderConditionAlert()}</div>
    </div>
  );
}