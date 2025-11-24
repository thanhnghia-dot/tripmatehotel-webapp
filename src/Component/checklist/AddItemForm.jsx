// src/components/checklist/AddItemForm.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import "./checklist.css";

export default function AddItemForm({ tripId: propTripId, onAdded }) {
  const { tripId: routeTripId } = useParams();
  const tripId = useMemo(
    () => Number(propTripId ?? routeTripId),
    [propTripId, routeTripId]
  );

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [tripEnded, setTripEnded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ Load current user
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/user/me");
        setCurrentUserId(data?.userId ?? null);
      } catch {
        setCurrentUserId(null);
      }
    })();
  }, []);

  // Load danh sách assignees + check trip end
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tripId) return;
      try {
        const [{ data: assigneeData }, { data: tripData }] = await Promise.all([
          api.get(`/api/checklist-items/trip/${tripId}/assignees`),
          api.get(`/api/trips/${tripId}`),
        ]);
        if (mounted) {
          setAssignees(assigneeData || []);
          if (tripData?.endDate) {
            const now = new Date();
            const end = new Date(tripData.endDate);
            if (end < now) {
              setTripEnded(true);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load assignees or trip info", e);
        if (mounted) {
          setAssignees([]);
          setTripEnded(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tripId]);

  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!tripId || !itemName.trim() || tripEnded) return;
      try {
        await api.post("/api/checklist-items", {
          tripId,
          itemName: itemName.trim(),
          quantity: Number(quantity),
          assigneeUserId: assigneeUserId
            ? Number(assigneeUserId)
            : currentUserId,
        });
        if (onAdded) onAdded();
        else window.location.reload();
      } catch (err) {
        console.error("Failed to add item", err);
        alert(err?.response?.data?.message || "Failed to add item.");
      }
    },
    [tripId, itemName, quantity, assigneeUserId, currentUserId, tripEnded, onAdded]
  );

  return (
    <div className="additem-section">
      <form onSubmit={submit} className="checklist-form">
        <input
          className="checklist-input"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name"
          disabled={tripEnded}
        />

        <input
          type="number"
          min={1}
          className="checklist-input checklist-input--small"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={tripEnded}
        />

        <select
          className="checklist-input"
          value={assigneeUserId}
          onChange={(e) => setAssigneeUserId(e.target.value)}
          disabled={tripEnded}
        >
          <option value="">Assign to...</option>
          {assignees.map((a) => (
            <option key={a.userId} value={a.userId}>
              {a.fullName}
              {a.owner ? " (Creator)" : ""}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!tripId || !itemName.trim() || tripEnded}
          className="checklist-btn"
        >
          Add
        </button>
      </form>

      {tripEnded && (
        <p style={{ color: "red", marginTop: "8px" }}>
          ⚠️ Trip has already ended. You cannot add new items.
        </p>
      )}
    </div>
  );
}
