import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import "./checklist.css";

export default function MemberTable({
  tripId: propTripId,
  onPickAssignee, // (userId|null) => void
}) {
  const { tripId: routeTripId } = useParams();
  const tripId = useMemo(
    () => Number(propTripId ?? routeTripId),
    [propTripId, routeTripId]
  );

  const [members, setMembers] = useState([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);

  const load = useCallback(async () => {
    if (!tripId) return;
    try {
      const { data } = await api.get(`/api/checklist-items/trip/${tripId}/members`);
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      setMembers([]);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!q.trim()) return members;
    const k = q.trim().toLowerCase();
    return members.filter((m) => m.fullName?.toLowerCase().includes(k));
  }, [members, q]);

  const togglePick = (id) => {
    const newId = active === id ? null : id;
    setActive(newId);
    onPickAssignee?.(newId);
    const anchor = document.getElementById("checklist-items-anchor");
    if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="member-section">
      {/* Header */}
      <div className="member-header">
        <span className="section-title">Members</span>

        <div className="search-box">
          <span>Search:</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Member name..."
            className="checklist-input"
          />
        </div>
      </div>

      {/* Members grid */}
      <div className="member-list">
        {filtered.map((m) => {
          const isActive = active === m.userId;
          return (
            <button
              key={m.userId}
              onClick={() => togglePick(m.userId)}
              className={`member-card ${isActive ? "active" : ""}`}
            >
              <div className="member-avatar">
                {m.fullName?.charAt(0) || "?"}
              </div>
              <div>
                <div className="member-name">{m.fullName}</div>
                <div className="member-items"># Items: {m.itemCount ?? 0}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
