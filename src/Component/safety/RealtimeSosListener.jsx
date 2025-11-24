// src/Component/safety/RealtimeSosListener.jsx
import React, { useEffect } from "react";

export default function RealtimeSosListener({ onAlert }) {
  useEffect(() => {
    // Kết nối tới SSE endpoint ở backend
    const eventSource = new EventSource("/api/safety/sos/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 SOS Event:", data);

        // Truyền dữ liệu SOS lên SafetyPage để hiển thị modal
        onAlert({
          user: data.senderName,
          message: `${data.message} (📍 ${data.locationUrl})`,
          time: data.sentAt,
          trip: data.tripName,
        });
      } catch (err) {
        console.error("❌ Failed to parse SOS event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ SSE error:", err);
      eventSource.close();
    };

    // cleanup khi component unmount
    return () => {
      eventSource.close();
    };
  }, [onAlert]);

  return null; // Component chỉ lắng nghe, không render gì
}
