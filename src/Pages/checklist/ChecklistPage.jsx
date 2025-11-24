import React, { useEffect, useState } from "react";
import AddItemForm from "../../Component/checklist/AddItemForm";
import MemberTable from "../../Component/checklist/MemberTable";
import ChecklistItemTable from "../../Component/checklist/ChecklistItemTable";
import SummaryTable from "../../Component/checklist/SummaryTable";
import "./checklist.css";

export default function ChecklistPage({ tripId }) {
  const [assigneeFilter, setAssigneeFilter] = useState(null);
  const [scrollToItems, setScrollToItems] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  // Auto scroll xuống bảng item khi chọn member
  useEffect(() => {
    if (scrollToItems) {
      const el = document.getElementById("checklist-items-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollToItems(false); // reset flag
    }
  }, [scrollToItems]);

  // Hàm gọi khi có thay đổi item (update giá, purchased, transfer)
  const triggerReload = () => setReloadFlag((f) => f + 1);

  return (
    <div className="checklist-page">
      {/* Row 1: Add Item + Summary */}
      <div className="grid-2">
        <div className="card">
          <AddItemForm tripId={tripId} onChanged={triggerReload} />
        </div>
        <div className="card">
          <SummaryTable tripId={tripId} reloadFlag={reloadFlag} />
        </div>
      </div>

      {/* Row 2: Member Table */}
      <div className="card">
        <MemberTable
          tripId={tripId}
          onPickAssignee={(uid) => {
            setAssigneeFilter(uid);
            setScrollToItems(true);
          }}
          onSelectAssignee={(uid) => {
            setAssigneeFilter(uid);
            setScrollToItems(true);
          }}
        />
      </div>

      <div id="checklist-items-anchor" className="checklist-anchor" />

      {/* Checklist Item Table: chỉ render khi chọn member */}
      {assigneeFilter != null && (
        <div className="card">
          <ChecklistItemTable
            tripId={tripId}
            assigneeId={assigneeFilter}
            onChanged={triggerReload}
          />
        </div>
      )}
    </div>
  );
}
