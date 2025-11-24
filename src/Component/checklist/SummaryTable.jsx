import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import "./checklist.css";

export default function SummaryTable({ tripId: propTripId, reloadFlag }) {
  const { tripId: routeTripId } = useParams();
  const tripId = useMemo(
    () => Number(propTripId ?? routeTripId),
    [propTripId, routeTripId]
  );

  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);

  const load = useCallback(async () => {
    if (!tripId) return;
    try {
      const sumRes = await api.get(`/api/checklist-items/trip/${tripId}/summary`);
      const memRes = await api.get(`/api/checklist-items/trip/${tripId}/members/summary`);
      setSummary(sumRes.data);
      setMembers(Array.isArray(memRes.data) ? memRes.data : []);
    } catch (err) {
      console.error("Load summary error", err);
      setSummary(null);
      setMembers([]);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load, reloadFlag]);

  const fmtCurrency = (v) =>
    v != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(v)
      : "$0";

  if (!tripId) return <div>No trip selected</div>;
  if (!summary) return <div>Loading...</div>;

  const remaining =
    summary.budget != null
      ? summary.budget - (summary.totalSpent ?? 0)
      : null;

  const remainingClass =
    remaining > 0
      ? "text-green-600"
      : remaining < 0
      ? "text-red-600"
      : "text-gray-800";

  return (
    <div className="summary-section">
      {/* Trip Budget */}
        <div className="trip-budget">
          💰 Trip Budget: {summary.budget ? fmtCurrency(summary.budget) : "—"}
        </div>

      {/* Members table */}
      <table className="checklist-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Total Items</th>
            <th>Purchased</th>
            <th>Spent ($)</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.userId}>
              <td>{m.fullName}</td>
              <td>{m.itemCount ?? 0}</td>
              <td>{m.purchasedCount ?? 0}</td>
              <td>{fmtCurrency(m.spent ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="summary-grid" style={{ marginTop: "16px" }}>
        <div className="summary-card">
          <div className="summary-label">Total Purchases</div>
          <div className="summary-value">
            {fmtCurrency(summary.totalSpent ?? 0)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Remaining Budget</div>
          <div className={`summary-value ${remainingClass}`}>
            {remaining != null ? fmtCurrency(remaining) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
