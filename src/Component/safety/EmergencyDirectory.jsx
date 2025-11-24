// src/Component/safety/EmergencyDirectory.jsx
import React, { useEffect, useState } from "react";

export default function EmergencyDirectory({ country }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    fetch(`/api/safety/emergency?country=${encodeURIComponent(country)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load emergency contacts");
        return res.json();
      })
      .then((data) => mounted && setContacts(Array.isArray(data) ? data : []))
      .catch(() => mounted && setErr("Could not load emergency contacts."))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [country]);

  return (
    <div className="p-4 rounded-3 border bg-white shadow-sm">
      <h3 className="h5 mb-3">📞 Emergency Contacts ({country})</h3>

      {loading && <div className="text-muted">Loading contacts…</div>}
      {err && <div className="text-danger">{err}</div>}
      {!loading && !err && contacts.length === 0 && (
        <div className="text-muted">No contacts available.</div>
      )}

      <ul className="list-unstyled mb-0">
        {contacts.map((c, idx) => (
          <li key={idx} className="py-2 border-top">
            <span className="fw-medium me-2">{c.type}:</span>
            <a
              href={`tel:${c.number}`}
              style={{ color: "#2563eb", fontWeight: 600 }}
            >
              {c.number}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
