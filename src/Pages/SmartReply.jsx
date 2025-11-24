import React, { useEffect, useState } from "react";
import axios from "axios";

const SmartReply = ({ lastMessage, userEmail, onSelect }) => {
    const [replies, setReplies] = useState([]);

    useEffect(() => {
        if (!lastMessage) return;
        // Nếu đã có gợi ý trong localStorage cho tin nhắn này thì load lại luôn
        const saved = localStorage.getItem(`smart_replies_${lastMessage.id || lastMessage.content}`);
        if (saved) {
            setReplies(JSON.parse(saved));
            return; // không cần gọi API lại
        }
        if (lastMessage.senderEmail === userEmail) {
            setReplies([]);
            return;
        }
        const timer = setTimeout(() => {
            const fetchReplies = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.post(
                        "http://localhost:8080/api/chat/suggest",
                        { message: lastMessage.content },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const data = res.data || [];
                    setReplies(data);

                    // Lưu vào localStorage
                    localStorage.setItem(
                        `smart_replies_${lastMessage.id || lastMessage.content}`,
                        JSON.stringify(data)
                    );
                } catch (err) {
                    console.error("Failed to fetch smart replies", err);
                }
            };
            fetchReplies();
        }, 1500);

        return () => clearTimeout(timer);
    }, [lastMessage?.content, lastMessage?.senderEmail, userEmail]);

    if (!replies.length) return null;

    const cleanText = (text) =>
        text
            .replace(/^\d+\.?\s*/, "")
            .trim()
            .replace(/^"+/, "")
            .replace(/"+$/, "");
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",   // 👈 để text nằm trên các nút
                alignItems: "flex-start",
                gap: "4px",
                marginBottom: "4px",
                padding: "5px",
                marginLeft: "10px"
            }}
        >
            <span style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>
                Here is the AI's response advice:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {replies.map((reply, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(cleanText(reply))}
                        style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            border: "1px solid #ddd",
                            background: "#f7f7f7",
cursor: "pointer",
                            fontSize: "14px",
                            color: "#195bbeff",
                        }}
                    >
                        {cleanText(reply)}
                    </button>
                ))}
            </div>
        </div>
    );
};
export default SmartReply;