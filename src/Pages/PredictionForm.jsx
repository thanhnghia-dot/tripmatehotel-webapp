import React, { useState, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import EmailSender from "./EmailSender";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4caf50", "#ffb74d", "#ef5350", "#2196f3", "#9c27b0"];

function formatISOtoDDMMYYYY(dateISO) {
  const d = new Date(dateISO);
  return d.toLocaleDateString("vi-VN");
}


function describeWeatherByTemperature(temp) {
  if (temp === null || temp === undefined || isNaN(temp)) return "-";

  if (temp < 0) return "Very cold, may freeze";
  if (temp >= 0 && temp < 10) return "Cold, need to wear warm clothes";
  if (temp >= 10 && temp < 15) return "Cool, comfortable";
  if (temp >= 15 && temp < 20) return "Cool, comfortable";
  if (temp >= 20 && temp < 25) return "Warm, comfortable";
  if (temp >= 25 && temp < 30) return "Slightly hot, should pay attention to drinking water";
  if (temp >= 30 && temp < 35) return "Hot, stuffy";
  if (temp >= 35 && temp < 40) return "Very hot, prone to heatstroke";

  if (temp >= 40) return "Strong sun, high risk of heatstroke";

  return "-";
}

function MultiLocationInput({ locations, setLocations, disabled }) {
  const [input, setInput] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const suggestions = [
    // Thành phố / tỉnh
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Cần Thơ",
    "Hải Phòng",
    "Hải Dương",
    "Hưng Yên",
    "Thái Bình",
    "Nam Định",
    "Ninh Bình",
    "Thanh Hóa",
    "Nghệ An",
    "Hà Tĩnh",
    "Quảng Bình",
    "Quảng Trị",
    "Thừa Thiên Huế",
    "Quảng Nam",
    "Quảng Ngãi",
    "Bình Định",
    "Phú Yên",
    "Khánh Hòa",
    "Ninh Thuận",
    "Bình Thuận",
    "Kon Tum",
    "Gia Lai",
    "Đắk Lắk",
    "Đắk Nông",
    "Lâm Đồng",
    "Bình Phước",
    "Tây Ninh",
    "Bình Dương",
    "Đồng Nai",
    "Bà Rịa - Vũng Tàu",
    "Long An",
    "Tiền Giang",
    "Bến Tre",
    "Trà Vinh",
    "Vĩnh Long",
    "Hậu Giang",
    "Sóc Trăng",
    "Bạc Liêu",
    "Cà Mau",
    "Hòa Bình",
    "Sơn La",
    "Lai Châu",
    "Điện Biên",
    "Lào Cai",
    "Yên Bái",
    "Hà Giang",
    "Tuyên Quang",
    "Thái Nguyên",
    "Bắc Giang",
    "Phú Thọ",
    "Vĩnh Phúc",
    "Bắc Ninh",
    "Hà Nam",
    "Quảng Ninh",
    "Bắc Kạn",
    "Cao Bằng",
    "Lạng Sơn",

    // Địa điểm du lịch nổi tiếng
    "Hội An",
    "Sapa",
    "Vịnh Hạ Long",
    "Đà Lạt",
    "Nha Trang",
    "Phú Quốc",
    "Vũng Tàu",
    "Côn Đảo",
    "Mũi Né",
    "Hạ Long",
    "Tam Cốc - Bích Động",
    "Phong Nha - Kẻ Bàng",
    "Bái Đính - Tràng An",
    "Yên Tử",
    "Đất Mũi"

  ];


  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !locations.includes(s)
  );

  const addLocation = (loc) => {
    const normalizedLoc = loc.trim();
    if (!normalizedLoc) return;

    const vnCities = suggestions; // danh sách tỉnh/thành VN
    const foreignCities = ["Tokyo", "Osaka", "New York", "Paris"]; // có thể thêm dần

    if (vnCities.includes(normalizedLoc)) {
      if (!locations.includes(normalizedLoc)) {
        setLocations([...locations, normalizedLoc]);
        setInput("");
        setShowSuggestions(false);
      }
    } else if (foreignCities.includes(normalizedLoc)) {
      alert("Currently only locations in Vietnam are supported. Please select from the list of suggestions.");
    } else {
      alert("Invalid location, please select from the list of suggestions.");
    }
  };




  const removeLocation = (loc) => {
    setLocations(locations.filter((l) => l !== loc));
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 600 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {locations.map((loc) => (
          <div
            key={loc}
            style={{
              padding: "6px 12px",
              backgroundColor: "#0ea5a4",
              color: "white",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              cursor: "default",
            }}
          >
            {loc}
            <button
              type="button"
              onClick={() => removeLocation(loc)}
              style={{
                marginLeft: 8,
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              aria-label={`Xóa địa điểm ${loc}`}
            >
              ×
            </button>
          </div>
        ))}

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLocation(input.trim());
            }
          }}
          placeholder="Enter location and Enter"
          disabled={disabled}
          style={{
            flex: "1 1 200px",
            padding: "8px 12px",
            borderRadius: 20,
            border: "1.8px solid #cbd5e1",
            fontSize: 15,
            outline: "none",
          }}
          aria-label="Enter new location"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => addLocation(input.trim())}
          disabled={disabled || !input.trim()}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "none",
            backgroundColor: disabled || !input.trim() ? "#94a3b8" : "#0ea5a4",
            color: "white",
            cursor: disabled || !input.trim() ? "not-allowed" : "pointer",
          }}
          aria-label="Add location"
        >
         Add
        </button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: 4,
            maxHeight: 180,
            overflowY: "auto",
            marginTop: 4,
            zIndex: 9999,
            listStyle: "none",
            padding: 0,
          }}
          role="listbox"
          aria-label="List of suggested locations"
        >
          {filteredSuggestions.map((sugg) => (
            <li
              key={sugg}
              onMouseDown={(e) => {
                e.preventDefault();
                addLocation(sugg);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
              role="option"
              tabIndex={-1}
            >
              {sugg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AiTravelPredictionMulti() {
  const [locations, setLocations] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPredictions, setAllPredictions] = useState({});

  const [selectedHistoryToShare, setSelectedHistoryToShare] = useState(null);

  const [history, setHistory] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aiTravelPredictionHistory")) || [];
    } catch {
      return [];
    }
  });
  const [selectedHistoryId, setSelectedHistoryId] = React.useState(null);

  // State mới: set các lịch sử được chọn để xóa
  const [selectedToDelete, setSelectedToDelete] = useState(new Set());

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

  const validateInput = useCallback(() => {
    if (locations.length === 0) return false;
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) return false;
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) return false;
    if (startDate > endDate) return false;
    return true;
  }, [locations, startDate, endDate]);

  function addHistoryEntry(entry) {
    setHistory(prev => {
      const newHistory = [entry, ...prev].slice(0, 10);
      localStorage.setItem("aiTravelPredictionHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  }

  const fetchAllForecasts = useCallback(async () => {
    if (!validateInput()) {
      setError("Please enter at least one location and select a valid date.");
      return;
    }
    setError(null);
    setLoading(true);
    setAllPredictions({});
    setSelectedHistoryId(null);

    try {
      const promises = locations.map((loc) =>
        axios.get(`${API_BASE}/api/predictions/forecast`, {
          params: {
            location: loc,
            startDate: startDate.toISOString().slice(0, 10),
            endDate: endDate.toISOString().slice(0, 10),
          },
        })
      );

      const results = await Promise.all(promises);
      const data = {};
      results.forEach((res, idx) => {
        data[locations[idx]] = res.data.forecast || [];
      });
      setAllPredictions(data);

      addHistoryEntry({
        id: Date.now().toString(),
        locations,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
        predictions: data,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error(err);
      setError("Error while retrieving forecast data.");
    } finally {
      setLoading(false);
    }
  }, [locations, startDate, endDate, validateInput, API_BASE]);

  const dateList = (() => {
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  })();

  const bestDatesByLocation = {};
  Object.entries(allPredictions).forEach(([loc, preds]) => {
    const visitorsByDateLoc = {};
    preds.forEach((p) => {
      if (p.predictionDate && typeof p.predictedVisitors === "number") {
        visitorsByDateLoc[p.predictionDate] = p.predictedVisitors;
      }
    });

    let minVisitorsLoc = Infinity;
    let bestDatesLoc = [];

    Object.entries(visitorsByDateLoc).forEach(([date, visitors]) => {
      if (visitors < minVisitorsLoc) {
        minVisitorsLoc = visitors;
        bestDatesLoc = [date];
      } else if (visitors === minVisitorsLoc) {
        bestDatesLoc.push(date);
      }
    });

    bestDatesByLocation[loc] = { minVisitors: minVisitorsLoc, bestDates: bestDatesLoc };
  });

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "24px auto",
        padding: 24,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          marginBottom: 24,
          color: "#0f172a",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Location Forecast
      </h1>

      <MultiLocationInput locations={locations} setLocations={setLocations} disabled={loading} />

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DatePicker
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);

            // Nếu endDate < startDate thì update lại
            if (endDate < date) {
              setEndDate(date);
            }

            // Giới hạn endDate tối đa 7 ngày từ startDate
            const maxEnd = new Date(date);
            maxEnd.setDate(date.getDate() + 7);
            if (endDate > maxEnd) {
              toast.warning("⏰ Khoảng thời gian không được quá 7 ngày!");
              setEndDate(maxEnd);
            }
          }}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
          aria-label="Select start date"
          disabled={loading}
        />


        <DatePicker
          selected={endDate}
          onChange={(date) => {
            const maxEnd = new Date(startDate);
            maxEnd.setDate(startDate.getDate() + 7);

            if (date > maxEnd) {
              toast.warning("⏰ Khoảng thời gian không được quá 7 ngày!");
              setEndDate(maxEnd);
            } else {
              setEndDate(date);
            }
          }}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy-MM-dd"
          minDate={startDate}
          maxDate={new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)} // 🚀 Chặn chọn >7 ngày
          aria-label="Select end date"
          disabled={loading}
        />
        <button
          onClick={fetchAllForecasts}
          disabled={loading || !validateInput()}
          style={{
            padding: "12px 28px",
            borderRadius: 28,
            border: "none",
            background: loading || !validateInput() ? "#94a3b8" : "#0ea5a4",
            color: "white",
            cursor: loading || !validateInput() ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: 16,
          }}
          aria-label="View Forecast"
        >
          {loading ? "Loading..." : "View Forecast"}
        </button>
      </div>

      {error && (
        <div
          style={{ color: "#ef4444", marginTop: 20, fontWeight: "700", fontSize: 15, textAlign: "center" }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Hiển thị gợi ý ngày ít khách nhất riêng từng địa điểm */}
      {locations.map((loc) => {
        const info = bestDatesByLocation[loc];
        if (!info || !info.bestDates.length) return null;

        return (
          <div
            key={loc}
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: "#e0f7fa",
              borderRadius: 16,
              fontSize: 16,
              color: "#334155",
              userSelect: "text",
            }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 18 }}>{loc}</h3>
            <p>
              <strong>Least visitors (recommended) day:</strong>{" "}
              {info.bestDates.length === 1
                ? formatISOtoDDMMYYYY(info.bestDates[0])
                : `${formatISOtoDDMMYYYY(info.bestDates[0])} to ${formatISOtoDDMMYYYY(
                  info.bestDates[info.bestDates.length - 1]
                )}`}
            </p>
            <p>
              <em>Forecasted visitors: {info.minVisitors}</em>
            </p>
          </div>
        );
      })}

      {/* Bảng so sánh lượng khách, thời tiết, xu hướng tìm kiếm */}
      {Object.keys(allPredictions).length > 0 && (
        <div style={{ marginTop: 40, overflowX: "auto" }}>
          <h2
            style={{
              color: "#0f172a",
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 14,
              userSelect: "text",
            }}
          >
            Location Forecast Comparison Table
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 15,
              color: "#334155",
              minWidth: 800,
            }}
            aria-label="Location Forecast Comparison Table"
          >
            <thead>
              <tr>
                <th rowSpan={2} style={{ /*...old styles...*/ }}>
                  Date
                </th>
                {locations.map((loc) => (
                  <th key={loc} colSpan={3} style={{ /*...old styles...*/ }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {loc}
                      <button
                        onClick={() => {
                          const info = bestDatesByLocation[loc];
                          if (!info || !info.bestDates.length) {
                            alert(`No forecast for ${loc}`);
                            return;
                          }
                          const bestDateText = info.bestDates.length === 1
                            ? formatISOtoDDMMYYYY(info.bestDates[0])
                            : `${formatISOtoDDMMYYYY(info.bestDates[0])} → ${formatISOtoDDMMYYYY(info.bestDates[info.bestDates.length - 1])}`;
                          alert(`Suggestion for ${loc}: ${bestDateText} (forecasted number of visitors: ${info.minVisitors})`);
                        }}
                        style={{
                          padding: "2px 6px",
                          fontSize: 12,
                          borderRadius: 4,
                          border: "none",
                          backgroundColor: "#0ea5a4",
                          color: "white",
                          cursor: "pointer",
                        }}
                        title={`Low customer day suggestion for ${loc}`}
                      >
                        Suggestion
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
              <tr>
                {locations.map((loc) => (
                  <React.Fragment key={loc + "-subheaders"}>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600 }}>Customer count</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600 }}>Temperature (°C)</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600 }}>Suggestion</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {dateList.map((date) => {
                const dateISO = date.toISOString().slice(0, 10);
                return (
                  <tr key={dateISO}>
                    <td
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #ffeeeeff",
                        fontWeight: "600",
                        backgroundColor: "#f8fafc",
                        userSelect: "text",
                        position: "sticky",
                        left: 0,
                        zIndex: 5,
                      }}
                    >
                      {dateISO}
                    </td>

                    {locations.map((loc) => {
                      const preds = allPredictions[loc] || [];
                      const predForDate = preds.find((p) => p.predictionDate === dateISO);
                      const visitors = predForDate ? predForDate.predictedVisitors : "-";
                      const temp = predForDate ? predForDate.temperature : null;
                      const weatherDesc = describeWeatherByTemperature(temp);

                      const isBestDate =
                        bestDatesByLocation[loc]?.bestDates.includes(dateISO) ?? false;

                      return (
                        <React.Fragment key={loc + "-" + dateISO}>
                          <td
                            style={{
                              padding: "8px 12px",
                              textAlign: "center",
                              fontWeight: isBestDate ? "700" : "400",
                              backgroundColor: isBestDate ? "#bbf7d0" : "transparent",
                            }}
                            aria-label={`Forecasted number of visitors at ${loc} date ${dateISO}`}
                          >
                            {visitors}
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              textAlign: "center",
                              fontWeight: isBestDate ? "700" : "400",
                              backgroundColor: isBestDate ? "#bbf7d0" : "transparent",
                            }}
                            aria-label={`Forecast temperature at ${loc} date ${dateISO}`}
                          >
                            {temp !== null && temp !== undefined ? temp.toFixed(1) : "-"}
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              textAlign: "center",
                              fontWeight: isBestDate ? "700" : "400",
                              backgroundColor: isBestDate ? "#bbf7d0" : "transparent",
                              fontSize: 12,
                              maxWidth: 120,
                            }}
                            aria-label={`Suggestions based on temperature at ${loc} date ${dateISO}`}
                          >
                            {weatherDesc}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Biểu đồ so sánh tổng lượng khách từng địa điểm */}
      {locations.length > 0 && (
        <div
          style={{
            width: "100%",
            height: 380,
            marginTop: 40,
            userSelect: "text",
          }}
        >
          <h2
            style={{
              color: "#0f172a",
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 14,
              userSelect: "text",
            }}
          >
            Chart comparing total number of visitors by location
          </h2>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={locations.map((loc) => {
                  const totalVisitors =
                    (allPredictions[loc] || []).reduce(
                      (acc, p) => acc + (p.predictedVisitors || 0),
                      0
                    ) || 0;
                  return { name: loc, value: totalVisitors };
                })}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                fill="#0ea5a4"
                label
                isAnimationActive={false}
              >
                {locations.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => new Intl.NumberFormat("vi-VN").format(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ------------------------------ LỊCH SỬ TÌM KIẾM ------------------------------ */}
      <div style={{ marginTop: 40 }}>
        <h2>Search history</h2>
        {history.length === 0 && <p>No search history yet.</p>}

        {/* Button to delete multiple selected items */}
        {selectedToDelete.size > 0 && (
          <button
            onClick={() => {
              const newHistory = history.filter((item) => !selectedToDelete.has(item.id));
              setHistory(newHistory);
              localStorage.setItem("aiTravelPredictionHistory", JSON.stringify(newHistory));
              setSelectedToDelete(new Set());
              if (selectedHistoryId && selectedToDelete.has(selectedHistoryId)) {
                setSelectedHistoryId(null);
                setAllPredictions({});
                setLocations([]);
                setError(null);
              }
            }}
            style={{
              marginBottom: 12,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#dc2626",
              color: "white",
              cursor: "pointer",
            }}
            aria-label="Delete selected history items"
          >
            Delete selected item ({selectedToDelete.size})
          </button>
        )}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {history.map((item) => {
            const isSharing = selectedHistoryToShare?.id === item.id;
            return (
              <li
                key={item.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: 12,
                  backgroundColor: selectedHistoryId === item.id ? "#bae6fd" : "white",
                  userSelect: "text",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {/* Checkbox chọn xóa */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedToDelete.has(item.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedToDelete);
                      if (e.target.checked) {
                        newSet.add(item.id);
                      } else {
                        newSet.delete(item.id);
                      }
                      setSelectedToDelete(newSet);
                    }}
                    aria-label={`Select history ${item.locations.join(", ")} to delete`}
                  />

                  <div>
                    <b>Location:</b> {item.locations.join(", ")} <br />
                    <b>Date range:</b> {item.startDate} → {item.endDate}
                  </div>
                </div>
                {/* Các nút chức năng */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      setSelectedHistoryId(item.id);
                      setLocations(item.locations);
                      setStartDate(new Date(item.startDate));
                      setEndDate(new Date(item.endDate));
                      setAllPredictions(item.predictions);
                      setError(null);
                    }}
                    style={{
                      backgroundColor: "#0ea5a4",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 10px",
                    }}
                  >
                    Suggest
                  </button>

                  <button
                    onClick={() => setSelectedHistoryToShare(item)}
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                    }}
                  >
                    Share email                
                      </button>

                  <button
                    onClick={() => {
                      const newHistory = history.filter((h) => h.id !== item.id);
                      setHistory(newHistory);
                      localStorage.setItem("aiTravelPredictionHistory", JSON.stringify(newHistory));
                      if (selectedHistoryId === item.id) {
                        setSelectedHistoryId(null);
                        setAllPredictions({});
                        setLocations([]);
                        setError(null);
                      }
                      if (selectedHistoryToShare?.id === item.id) {
                        setSelectedHistoryToShare(null);
                      }
                      // Xóa khỏi selectedToDelete nếu có
                      const newSet = new Set(selectedToDelete);
                      newSet.delete(item.id);
                      setSelectedToDelete(newSet);
                    }}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 10px",
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Hiển thị EmailSender nếu item này được chọn */}
                {isSharing && <EmailSender predictions={item.predictions} apiBase={API_BASE} />}
              </li>
            );
          })}
        </ul>

        {/* Nút xóa toàn bộ lịch sử */}
        {history.length > 0 && (
          <button
            onClick={() => {
              setHistory([]);
              localStorage.removeItem("aiTravelPredictionHistory");
              setSelectedHistoryId(null);
              setAllPredictions({});
              setLocations([]);
              setError(null);
              setSelectedToDelete(new Set());
            }}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#ef4444",
              color: "white",
              cursor: "pointer",
            }}
          >
            Clear all history
          </button>
        )}
      </div>

    </div>
  );
}
