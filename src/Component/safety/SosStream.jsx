import React, { useEffect, useState } from "react";

export default function SosStream() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Kết nối tới backend (Spring Boot SSE endpoint)
    const eventSource = new EventSource("http://localhost:8080/api/safety/sos/stream");

    // Lắng nghe mỗi khi server phát SOS
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 SOS event:", data);

      setEvents((prev) => [data, ...prev]); // thêm event mới vào đầu list
    };

    // Xử lý lỗi
    eventSource.onerror = (err) => {
      console.error("❌ SSE error:", err);
      eventSource.close();
    };

    // cleanup khi component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>🚨 SOS Realtime Events</h3>
      {events.length === 0 && <p>Chưa có SOS nào.</p>}
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            <b>{e.senderName}</b> ({e.tripName})<br />
            📍 <a href={e.locationUrl} target="_blank" rel="noreferrer">
              {e.locationUrl}
            </a>
            <br />
            📝 {e.message}<br />
            ⏰ {e.sentAt}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
