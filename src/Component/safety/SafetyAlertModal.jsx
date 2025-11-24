// src/Component/SafetyAlertModal.jsx
import React from "react";

export default function SafetyAlertModal({ show, onClose, alert }) {
  if (!show || !alert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-sm">
        <h2 className="text-xl font-bold text-red-600 mb-2">⚠ Safety Alert</h2>
        <p><b>User:</b> {alert.user}</p>
        <p><b>Message:</b> {alert.message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
