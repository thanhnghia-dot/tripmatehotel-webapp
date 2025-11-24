import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import "./checklist.css";

export default function ChecklistItemTable({ tripId: tripIdProp, assigneeId, onChanged }) {
  const { tripId: tripIdFromRoute } = useParams();
  const tripId = useMemo(
    () => Number(tripIdProp ?? tripIdFromRoute),
    [tripIdProp, tripIdFromRoute]
  );

  const [currentUserId, setCurrentUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(null);
  const [transferTarget, setTransferTarget] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [selectedNewAssignee, setSelectedNewAssignee] = useState("");

  // Helpers
  const normalizeMeId = (data) =>
    data?.userId ?? data?.id ?? data?.user?.userId ?? data?.user?.id ?? null;

  const normalizeItems = (arr) =>
    (Array.isArray(arr) ? arr : []).map((x) => ({
      ...x,
      itemId: x.itemId ?? x.item_id,
      assigneeUserId: x.assigneeUserId ?? x.assignee_user_id ?? null,
      assigneeName: x.assigneeName ?? x.assignee_name ?? null,
      itemName: x.itemName ?? x.item_name ?? x.name,
      price: x.price ?? null,
      transferredFromName: x.transferredFromName ?? x.transferred_from_name ?? null,
      // deadline removed
    }));

  const canEdit = useCallback(
    (it) =>
      currentUserId &&
      String(it?.assigneeUserId) === String(currentUserId) &&
      it.status !== "PURCHASED",
    [currentUserId]
  );

  // ✅ Load current user (fix endpoint)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/user/me");
        setCurrentUserId(normalizeMeId(res?.data));
      } catch {
        setCurrentUserId(null);
      }
    })();
  }, []);

  // Load items
  const load = useCallback(async () => {
    if (!tripId) return;
    try {
      let url = `/api/checklist-items/trip/${tripId}`;
      if (assigneeId) {
        url = `/api/checklist-items/trip/${tripId}/assignee/${assigneeId}`;
      }
      const { data } = await api.get(url);
      setItems(normalizeItems(data));
    } catch {
      setItems([]);
    }
  }, [tripId, assigneeId]);

  useEffect(() => {
    load();
  }, [load]);

  // Load assignees (for transfer modal)
  useEffect(() => {
    if (!tripId) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/checklist-items/trip/${tripId}/assignees`);
        setAssignees(data || []);
      } catch {
        setAssignees([]);
      }
    })();
  }, [tripId]);

  const rows = useMemo(() => {
    let r = [...items];
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      r = r.filter((x) => (x.itemName || "").toLowerCase().includes(k));
    }
    return r;
  }, [items, q]);

  // Update field
  const updateField = async (it, partial) => {
    try {
      setSaving(it.itemId);
      await api.put(`/api/checklist-items/${it.itemId}`, partial);
      await load();
      onChanged?.(); // ✅ báo cha reload summary
    } catch {
      alert("Update failed");
    } finally {
      setSaving(null);
    }
  };

  const onPriceCommit = (it, raw) => {
    const clean = raw?.trim?.() ?? String(raw ?? "").trim();
    const val = clean === "" ? null : Number(clean);
    if (val === it.price || saving === it.itemId) return;

    // Update FE ngay để mượt
    setItems((prev) =>
      prev.map((x) => (x.itemId === it.itemId ? { ...x, price: val } : x))
    );

    updateField(it, { price: val });
  };

  // Transfer
  const openTransferModal = (it) => {
    setTransferTarget(it);
    setSelectedNewAssignee("");
  };

  const confirmTransfer = async () => {
    if (!transferTarget || !selectedNewAssignee) return;
    try {
      await api.put(`/api/checklist-items/${transferTarget.itemId}/transfer`, {
        newAssigneeUserId: Number(selectedNewAssignee),
      });
      setTransferTarget(null);
      await load();
      onChanged?.();
    } catch {
      alert("Transfer failed");
    }
  };

  return (
    <div className="checklist-section">
      <div className="checklist-header">
        <div className="section-title">Checklist Items</div>
        <div className="search-box">
          <span>Search:</span>
          <input
            className="checklist-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keyword..."
          />
        </div>
      </div>

      <table className="checklist-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Assignee</th>
            <th>Price</th>
            {/* Deadline column removed */}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="checklist-empty">
                No items found.
              </td>
            </tr>
          )}
          {rows.map((it) => {
            const mine = canEdit(it);
            const canAct =
              mine && (it.status === "PENDING" || it.status === "TRANSFERRED");

            return (
              <tr key={it.itemId}>
                <td>{it.itemName}</td>
                <td>{it.quantity}</td>
                <td>{it.assigneeName || "—"}</td>

                {/* ✅ Price input */}
                <td>
                  {mine ? (
                    <input
                      type="number"
                      className="checklist-input checklist-input--small"
                      defaultValue={it.price ?? ""}
                      onBlur={(e) => onPriceCommit(it, e.target.value)}
                      disabled={saving === it.itemId}
                      placeholder="Enter price"
                    />
                  ) : it.price != null ? `$${Number(it.price)}` : "—"}
                </td>

                {/* Status */}
                <td>
                  <span className={`checklist-status status-${it.status?.toLowerCase()}`}>
                    {it.status === "TRANSFERRED" && it.transferredFromName
                      ? `Transferred from ${it.transferredFromName}`
                      : it.status}
                  </span>
                </td>

                <td>
                  {canAct && (
                    <>
                      <button
                        className="checklist-btn"
                        onClick={() =>
                          updateField(it, {
                            status: "PURCHASED",
                            price: it.price ?? null,
                          })
                        }
                        disabled={saving === it.itemId}
                      >
                        ✓ Purchased
                      </button>
                      <button
                        className="checklist-btn transfer-btn"
                        onClick={() => openTransferModal(it)}
                        disabled={saving === it.itemId}
                      >
                        ⇄ Transfer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Transfer Modal */}
      {transferTarget && (
        <div className="modal-backdrop">
          <div className="modal modal-small">
            <h3>Transfer Item</h3>
            <p>
              Select a new assignee for <b>{transferTarget.itemName}</b>
            </p>
            <select
              className="checklist-input"
              value={selectedNewAssignee}
              onChange={(e) => setSelectedNewAssignee(e.target.value)}
            >
              <option value="">-- Select member --</option>
              {assignees
                .filter((a) => String(a.userId) !== String(currentUserId))
                .map((a) => (
                  <option key={a.userId} value={a.userId}>
                    {a.fullName}
                  </option>
                ))}
            </select>
            <div className="modal-actions">
              <button className="checklist-btn" onClick={confirmTransfer}>
                Confirm
              </button>
              <button
                className="checklist-btn cancel-btn"
                onClick={() => setTransferTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
