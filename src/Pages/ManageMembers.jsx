import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageMembers.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBell, FaSearch } from "react-icons/fa";
import SmartReply from "./SmartReply";


function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
const ManageMembers = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // states


    const [openPinnedMenuId, setOpenPinnedMenuId] = useState(null);
    const [tripExists, setTripExists] = useState(true);
    const [members, setMembers] = useState([]);
    const [email, setEmail] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveReason, setLeaveReason] = useState('');
    const [otherReasonText, setOtherReasonText] = useState('');
    const [isWaitingApproval, setIsWaitingApproval] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveRequestStatus, setLeaveRequestStatus] = useState(null); // null | 'PENDING' | 'REJECTED' | 'APPROVED'
    const [leaveError, setLeaveError] = useState("");

    const [tripStatus, setTripStatus] = useState('');
    // State cho modal phản hồi của OWNER
    const [showOwnerResponseModal, setShowOwnerResponseModal] = useState(false);
    const [actionType, setActionType] = useState(''); // 'approve' hoặc 'reject'
    const [ownerResponseText, setOwnerResponseText] = useState('');

    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem('token');
    const payload = parseJwt(token);
    const userEmail = payload?.sub || payload?.email;

    // lấy giá trị đã lưu từ localStorage (true/false)
    const [hasShownRejectedAlert, setHasShownRejectedAlert] = useState(
        localStorage.getItem('hasShownRejectedAlert') === 'true'
    );
    const [justSubmitted, setJustSubmitted] = useState(false);

    // --- Notifications (bell) ---
    const [bellOpen, setBellOpen] = useState(false);
    const [myRequests, setMyRequests] = useState([]);   // các leave request của chính user trong trip
    const [hasUnread, setHasUnread] = useState(false);  // có phản hồi mới chưa xem?

    const [ownerPending, setOwnerPending] = useState([]); // danh sách request PENDING
    // key localStorage để đánh dấu "đã xem"
    const seenKey = (tripId, email) => `lr_seen_${tripId}_${email}`;
    //State cho checkbox
    const [selectedIds, setSelectedIds] = useState([]);

    const chatBoxRef = useRef(null);
    const prevMessageCount = useRef(0);
    const addSystemMessage = (text) => {
        setMessages(prev => [
            ...prev,
            {
                id: `sys-${Date.now()}`,
                content: text,
                senderEmail: "system",
                system: true,
                createdAt: new Date().toISOString(),
            },
        ]);
    };
    const [openMenuId, setOpenMenuId] = useState(null);
    const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);
    const pinnedMsgs = messages.filter(m => m.pinned && !m.deleted);


    const fetchOwnerPending = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/trips/${id}/leave-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setOwnerPending(data.filter(r => r.status === 'PENDING'));
        } catch (err) {
            console.error("Failed to fetch owner pending requests", err);
        }
    };

    const onlyDecisions = (list) =>
        (list || []).filter(r =>
            (r.status === 'REJECTED' || r.status === 'APPROVED') && !!r.ownerResponse
        ).sort((a, b) => {
            const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return tb - ta; // mới nhất trước
        });

    // Tính unread dựa trên mốc đã xem cuối cùng
    const computeUnread = (list) => {
        const latest = onlyDecisions(list)[0];
        if (!latest) return false;
        const latestTs = new Date(latest.updatedAt || latest.createdAt || Date.now()).getTime();
        const lastSeenStr = localStorage.getItem(seenKey(id, userEmail));
        if (!lastSeenStr) return true;
        const lastSeenTs = new Date(lastSeenStr).getTime();
        return latestTs > lastSeenTs;
    };

    const fetchMyLeaveRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `http://localhost:8080/api/trips/${id}/leave-requests/my`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setMyRequests(data);
            setHasUnread(computeUnread(data));
        } catch (e) {
            toast.error('fetchMyLeaveRequests failed', e);
        }
    };

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data?.data || res.data;
            setMembers(data?.members || []);
            setTripStatus(data?.status || '');
            setTripExists(true);
        } catch (err) {
            toast.error("❌ Trip does not exist or has been deleted:", err);
            setTripExists(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('userEmail'); // lấy email người dùng hiện tại
            const res = await axios.get(`http://localhost:8080/api/trips/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { userEmail } // gửi email để backend filter hidden messages
            });
            setMessages(res.data || []);
        } catch (err) {
            toast.error("Failed to fetch messages", err);
        }
    };

    const submitOwnerResponseDirect = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:8080/api/leave-requests/${requestId}/approve`,
                { ownerResponse: "" }, // luôn rỗng
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("✅ Leave request accepted.");
            fetchLeaveRequests();
            fetchMembers();
        } catch (err) {
            toast.error("❌ Failed to accept leave request.");
        }
    };

    const fetchLeaveRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/trips/${id}/leave-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaveRequests(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (err) {
            toast.error("Failed to load leave requests", err);
        }
    };

    // LẤY trạng thái leave request của user hiện tại
    const fetchLeaveRequestStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/trips/${id}/leave-requests/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const serverStatus =
                (typeof res.data === 'string' ? res.data : null) ||
                res.data?.status ||
                res.data?.data?.status ||
                null;

            const normalized = (serverStatus && typeof serverStatus === 'object')
                ? (serverStatus.name || serverStatus.toString())
                : serverStatus;

            setLeaveRequestStatus(normalized);
            setIsWaitingApproval(normalized === 'PENDING');
        } catch (err) {
            toast.error("Failed to get leave request status", err);
        }
    };
    // 📌 Pin / Unpin
    const handlePinMessage = async (msg) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:8080/api/trips/${id}/messages/${msg.id}/pin?pinned=${!msg.pinned}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (msg.pinned) {
                toast.success("Unpinned message");
                addSystemMessage(`📌 ${msg.senderEmail} đã gỡ ghim một tin nhắn`);
            } else {
                toast.success("Pinned message");
                addSystemMessage(`📌 ${msg.senderEmail} đã ghim một tin nhắn`);
            }

            fetchMessages();
        } catch (err) {
            toast.error("❌ Error pinning message");
        }
    };

    // Thu hồi (chỉ cho tin nhắn mình gửi)
    const handleRecallMessage = async (msg) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:8080/api/trips/${id}/messages/${msg.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("✅ Message has been recalled");
            setMessages(prev =>
                prev.map(m => m.id === msg.id ? { ...m, recalled: true, content: "Message has been revoked" } : m)
            );
        } catch (e) {
            toast.error("❌ Recall failed");
        }
    };

    // Xóa ở phía tôi (ẩn tin nhắn người khác)
    const handleHideMessage = async (message) => {
        try {
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('userEmail');
            await axios.delete(
                `http://localhost:8080/api/trips/${id}/messages/${message.id}`,
                {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    data: { userEmail } // bắt buộc để backend biết ai hide
                }
            );
            toast.success("✅ Message updated.");
            fetchMessages(); // reload messages sau khi hide
        } catch (err) {
            console.error(err);
            toast.error("❌ Failed to hide/recall message.");
        }
    };


    // lifecycle
    useEffect(() => {
        fetchMembers();
        fetchMessages();
        fetchLeaveRequestStatus();
        const msgInterval = setInterval(fetchMessages, 2000);
        return () => clearInterval(msgInterval);
    }, [id]);

    useEffect(() => {
        let statusInterval = null;
        if (leaveRequestStatus === 'PENDING') {
            statusInterval = setInterval(fetchLeaveRequestStatus, 3000);
        }
        return () => {
            if (statusInterval) clearInterval(statusInterval);
        };
    }, [leaveRequestStatus, id]);

    useEffect(() => {
        if (leaveRequestStatus === 'REJECTED' && !hasShownRejectedAlert && !justSubmitted) {
            toast.info('Your leave request was rejected. You can use the trip again.');
            setHasShownRejectedAlert(true);
            localStorage.setItem('hasShownRejectedAlert', 'true');
            setIsWaitingApproval(false);
            setLeaveRequestStatus(null);
            fetchMembers();
            fetchMessages();
        } else if (leaveRequestStatus === 'APPROVED') {
            alert('Your leave request was approved. Redirecting to My Trips.');
            navigate('/TripPage');
        }
    }, [leaveRequestStatus, navigate, hasShownRejectedAlert, justSubmitted]);

    useEffect(() => {
        if (!id || !userEmail) return;
        fetchMyLeaveRequests();
        const t = setInterval(fetchMyLeaveRequests, 7000);
        return () => clearInterval(t);
    }, [id, userEmail]);

    useEffect(() => {
        if (leaveRequestStatus === 'REJECTED' && !hasShownRejectedAlert && !justSubmitted) {
            toast.info('Your leave request was rejected. You can use the trip again.');
            setHasShownRejectedAlert(true);
            localStorage.setItem('hasShownRejectedAlert', 'true');
            setIsWaitingApproval(false);
            setLeaveRequestStatus(null);
            fetchMembers();
            fetchMessages();
            fetchMyLeaveRequests();
        } else if (leaveRequestStatus === 'APPROVED') {
            fetchMyLeaveRequests();
            alert('Your leave request was approved. Redirecting to My Trips.');
            navigate('/TripPage');
        }
    }, [leaveRequestStatus, navigate, hasShownRejectedAlert, justSubmitted]);

    // If current user is owner -> fetch list of leave requests
    const currentUser = (members || []).find(m => m.email === userEmail);
    const currentUserRole = currentUser?.role;
    const [showAllPinned, setShowAllPinned] = React.useState(false);

    useEffect(() => {
        if (currentUserRole === 'OWNER') {
            fetchLeaveRequests();
            fetchOwnerPending();
        }
    }, [currentUserRole, id]);

    useEffect(() => {
        if (currentUserRole === 'OWNER') {
            fetchOwnerPending();
            const interval = setInterval(() => {
                fetchOwnerPending();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [currentUserRole, id]);
    useEffect(() => {
        if (!chatBoxRef.current) return;

        // so sánh số lượng tin nhắn trước và sau
        if (messages.length > prevMessageCount.current) {
            // 👉 có thêm tin nhắn mới → auto scroll
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }

        // cập nhật lại số lượng tin nhắn cũ
        prevMessageCount.current = messages.length;
    }, [messages]);

    // actions
    const handleLeaveSubmit = async (e) => {
        e.preventDefault();

        if (!leaveReason) {
            toast.error("⚠️ Please select a reason before submitting!");
            return;
        }
        if (leaveReason === "Other" && !otherReasonText.trim()) {
            toast.error("⚠️ Please specify your reason.");
            return;
        }

        try {
            localStorage.removeItem('hasShownRejectedAlert');
            setHasShownRejectedAlert(false);
            setJustSubmitted(true);

            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:8080/api/trips/${id}/leave-requests`,
                { reason: leaveReason === "Other" ? otherReasonText : leaveReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const returnedStatus =
                res.data?.status ||
                res.data?.data?.status ||
                (typeof res.data === 'string' ? res.data : null) ||
                'PENDING';

            setShowLeaveModal(false);
            setIsWaitingApproval(returnedStatus === 'PENDING');
            setLeaveRequestStatus(returnedStatus);

            toast.info("Your leave request has been sent. Waiting for owner's approval.");
            setTimeout(() => setJustSubmitted(false), 2000);
            setTimeout(fetchLeaveRequestStatus, 1000);
        } catch (error) {
            console.error(error);
            setJustSubmitted(false);
            toast.error("❌ Failed to send leave request.");
        }
    };

    const handleRejectRequest = async (requestId) => {
        const ownerResponse = prompt("Enter feedback to this member (can be left blank):") || "";
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:8080/api/leave-requests/${requestId}/reject`,
                { ownerResponse },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.warn("🚫 Leave request rejected.");
            fetchLeaveRequests();
        } catch (err) {
            toast.error("❌ Failed to reject leave request.");
        }
    };

    const openOwnerResponseModal = (type, requestId) => {
        setActionType(type);
        setCurrentRequestId(requestId);
        setOwnerResponseText("");

        if (type === 'approve') {
            // Gửi trực tiếp, không cần modal
            submitOwnerResponseDirect(requestId);
        } else {
            // Reject thì mở modal nhập phản hồi và đóng dropdown bell
            setShowOwnerResponseModal(true);
            setBellOpen(false); // 🔥 đóng chuông để không còn ô trắng phía sau
        }
    };

    const submitOwnerResponse = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:8080/api/leave-requests/${currentRequestId}/${actionType}`;
            await axios.post(
                url,
                { ownerResponse: ownerResponseText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast[actionType === 'approve' ? 'success' : 'warn'](
                actionType === 'approve'
                    ? "✅ Leave request accepted."
                    : "🚫 Leave request rejected."
            );

            setOwnerPending(prev => prev.filter(req => req.id !== currentRequestId));

            setShowOwnerResponseModal(false);
            setOwnerResponseText("");

            fetchLeaveRequests();
            fetchMembers();

        } catch (err) {
            toast.error("❌ Failed to process leave request.");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        if (leaveRequestStatus === 'PENDING') return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/trips/${id}/messages`, null, {
                params: { content: newMessage },
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            console.error(err);
        }
    };

    const handleInvite = async () => {
        if (tripStatus?.toLowerCase() === 'finished') {
            return toast.error("❌ Trip is already completed. Cannot invite more members.");
        }
        if (!email.trim()) return toast.warn("Please enter an email.");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return toast.error("❌ Invalid email format. Please enter a valid email address.");
        }
        const emailAlreadyExists = members.some(m => m.email.toLowerCase() === email.trim().toLowerCase());
        if (emailAlreadyExists) {
            return toast.warn("⚠ This user is already a member of the trip.");
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/trips/${id}/invite`, null, {
                params: { email },
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`\u2705 Invitation sent to ${email}`);
            setEmail('');
            fetchMembers();
        } catch (err) {
            console.error(err);
            const errorMessage = err?.response?.data?.message || '❌ Failed to invite member.';
            toast.error(errorMessage);
        }
    };

    // UI khi PENDING và không phải OWNER -> khoá trang
    if (leaveRequestStatus === 'PENDING' && currentUserRole !== 'OWNER') {
        return (
            <div className="mm-wrapper mm-locked-center">
                <div className="mm-locked-card">
                    <h4>🔔 Leave request pending</h4>
                    <p>Your leave request is pending approval by the owner.</p>
                    <p>You cannot send messages or perform actions on this trip.</p>
                    <p>Status: <strong style={{ color: "#e67e22" }}>PENDING</strong></p>

                    <button onClick={() => navigate('/TripPage')}>
                        ⬅ Back to My Trips
                    </button>

                    <small>
                        This screen will remain locked until the owner approves or rejects your request.
                    </small>
                </div>
            </div>
        );
    }

    const highlightText = (text, keyword) => {
        if (!keyword.trim()) return text;

        const regex = new RegExp(`(${keyword})`, "gi");
        return text.split(regex).map((part, index) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
                <mark key={index} style={{ backgroundColor: "yellow", padding: 0 }}>
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    // render bình thường
    return (
        <div className="mm-wrapper">
            {showLeaveModal && (
                <div className="nmodal-backdrop" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center',
                    zIndex: 1050,
                }}>
                    <div
                        className="nmodal-content p-4 bg-white rounded"
                        style={{ maxWidth: 500, width: '90%' }}
                    >
                        <h4 className="nmodal-title">Why do you want to leave the trip?</h4>
                        <form onSubmit={handleLeaveSubmit}>
                            <div className="nmodal-option">
                                <input
                                    type="radio"
                                    id="reason1"
                                    name="leaveReason"
                                    value="Schedule conflict"
                                    checked={leaveReason === "Schedule conflict"}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                />
                                <label htmlFor="reason1" className="ms-2">
                                    Schedule conflict
                                </label>
                            </div>
                            <div className="nmodal-option">
                                <input
                                    type="radio"
                                    id="reason2"
                                    name="leaveReason"
                                    value="Personal reasons"
                                    checked={leaveReason === "Personal reasons"}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                />
                                <label htmlFor="reason2" className="ms-2">
                                    Personal reasons
                                </label>
                            </div>
                            <div className="nmodal-option">
                                <input
                                    type="radio"
                                    id="reason3"
                                    name="leaveReason"
                                    value="Health issues"
                                    checked={leaveReason === "Health issues"}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                />
                                <label htmlFor="reason3" className="ms-2">
                                    Health issues
                                </label>
                            </div>
                            <div className="nmodal-option">
                                <input
                                    type="radio"
                                    id="reason4"
                                    name="leaveReason"
                                    value="Scheduling mistake"
                                    checked={leaveReason === "Scheduling mistake"}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                />
                                <label htmlFor="reason4" className="ms-2">
                                    Scheduling mistake
                                </label>
                            </div>
                            <div className="nmodal-option">
                                <input
                                    type="radio"
                                    id="reason5"
                                    name="leaveReason"
                                    value="Other"
                                    checked={leaveReason === "Other"}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                />
                                <label htmlFor="reason5" className="ms-2">
                                    Other
                                </label>
                            </div>

                            {leaveReason === "Other" && (
                                <textarea
                                    className="form-control nmodal-textarea mt-2"
                                    placeholder="Please specify"
                                    value={otherReasonText}
                                    onChange={(e) => setOtherReasonText(e.target.value)}
                                />
                            )}

                            <div className="nmodal-actions mt-3 d-flex justify-content-between gap-2">
                                <button type="submit" className="btn btn-danger equal-btn">
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary equal-btn"
                                    onClick={() => setShowLeaveModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Chat box */}
            <div className="mm-chat-box">
                <div className="mm-chat-header" style={{ position: 'relative' }}>
                    💬 Group Chat

                    {/* Search */}
                    <div
                        style={{ position: 'absolute', right: 44, top: 8, cursor: 'pointer' }}
                        title="Search messages"
                        onClick={() => setSearchOpen(prev => !prev)}
                    >
                        <FaSearch size={20} />
                    </div>
                    {/* Call */}

                    {/* Bell */}
                    <div
                        onClick={() => {
                            setBellOpen(v => {
                                const newState = !v;
                                if (!v) {
                                    fetchMyLeaveRequests();
                                    localStorage.setItem(seenKey(id, userEmail), new Date().toISOString());
                                    setHasUnread(false);
                                }
                                return newState;
                            });
                        }}
                        style={{ position: 'absolute', right: 12, top: 8, cursor: 'pointer' }}
                        title="Reserved message"
                    >
                        <FaBell size={20} />
                        {(currentUserRole === 'MEMBER' ? hasUnread : (ownerPending.length > 0)) && (
                            <span
                                style={{
                                    position: 'absolute', top: -6, right: -6,
                                    background: 'crimson', color: '#fff',
                                    borderRadius: '999px', padding: '2px 6px',
                                    fontSize: 12, fontWeight: 700
                                }}
                            >
                                {currentUserRole === 'MEMBER' ? 1 : ownerPending.length}
                            </span>
                        )}
                    </div>
                </div>
                {/* Pinned messages */}
                {pinnedMsgs.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <strong className="mm-pinned-title">📌 Pinned Messages:</strong>

                        {/* Tin nhắn ghim đầu tiên */}
                        <div className="pinned-item" style={{ position: "relative" }}>
                            <div
                                className="mm-bubble"
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <span>
                                    <strong>
                                        {members.find((m) => m.email === pinnedMsgs[0].senderEmail)?.name ||
                                            pinnedMsgs[0].senderEmail ||
                                            "Unknown"}
                                        :
                                    </strong>{" "}
                                    {pinnedMsgs[0].content}
                                </span>

                                {/* Nút Unpin thay cho 3 chấm */}
                                <button
                                    style={{
                                        marginLeft: 8,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "red",
                                        fontWeight: "bold",
                                    }}
                                    onClick={() => handlePinMessage(pinnedMsgs[0])}
                                >
                                    Unpin
                                </button>
                            </div>

                            {/* Nút mở thêm các tin nhắn ghim còn lại */}
                            {pinnedMsgs.length > 1 && !showAllPinned && (
                                <button
                                    onClick={() => setShowAllPinned(true)}
                                    className="pinned-toggle-btn"
                                    style={{ position: "absolute", top: 8, right: 8 }}
                                >
                                    +{pinnedMsgs.length - 1}
                                </button>
                            )}
                        </div>

                        {/* Hiển thị các tin nhắn ghim còn lại */}
                        {showAllPinned &&
                            pinnedMsgs.slice(1).map((m) => (
                                <div key={m.id} className="pinned-item" style={{ position: "relative" }}>
                                    <div
                                        className="mm-bubble"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span>
                                            <strong>
                                                {members.find((mem) => mem.email === m.senderEmail)?.name ||
                                                    m.senderEmail ||
                                                    "Unknown"}
                                                :
                                            </strong>{" "}
                                            {m.content}
                                        </span>

                                        {/* Nút Unpin */}
                                        <button
                                            style={{
                                                marginLeft: 8,
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "red",
                                                fontWeight: "bold",
                                            }}
                                            onClick={() => handlePinMessage(m)}
                                        >
                                            Unpin
                                        </button>
                                    </div>
                                </div>
                            ))}

                        {/* Nút Collapse khi đang hiển thị tất cả */}
                        {showAllPinned && pinnedMsgs.length > 1 && (
                            <button
                                onClick={() => setShowAllPinned(false)}
                                className="pinned-toggle-btn"
                                style={{ marginTop: 4 }}
                            >
                                Collapse pinned messages
                            </button>
                        )}
                    </div>
                )}

                {searchOpen && (
                    <div
                        style={{
                            position: "absolute",
                            right: 12,
                            top: 44,
                            width: 280,
                            background: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            zIndex: 1200,
                            padding: "6px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <FaSearch style={{ color: "#888" }} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: "none",
                                outline: "none",
                                flex: 1,
                                fontSize: "14px",
                            }}
                        />
                    </div>
                )}
                {bellOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            right: 12, top: 44,
                            width: 360, maxHeight: 360, overflowY: 'auto',
                            background: '#fff', border: '1px solid #ddd',
                            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            zIndex: 1200, padding: 12
                        }}
                    >
                        {currentUserRole === 'MEMBER' ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>Your Leave Requests Response</strong>
                                    <button
                                        className="btn btn-link btn-sm"
                                        onClick={() => fetchMyLeaveRequests()}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        ↻
                                    </button>
                                </div>

                                {onlyDecisions(myRequests).length === 0 ? (
                                    <div style={{ fontSize: 14, marginTop: 8, color: '#888' }}>
                                        No response yet.
                                    </div>
                                ) : (
                                    onlyDecisions(myRequests).map(item => (
                                        <div
                                            key={item.id}
                                            style={{
                                                borderBottom: '1px dashed #eee',
                                                padding: '8px 0',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 8
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setSelectedIds(prev => [...prev, item.id]);
                                                    } else {
                                                        setSelectedIds(prev => prev.filter(i => i !== item.id));
                                                    }
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {item.status === 'REJECTED' ? '❌ Rejected' : '✅ Approved'}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#888' }}>
                                                        {(item.updatedAt || item.createdAt)
                                                            ? new Date(item.updatedAt || item.createdAt).toLocaleString('en-GB')
                                                            : ''}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 14, marginTop: 4 }}>
                                                    {item.ownerResponse}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {onlyDecisions(myRequests).length > 0 && (
                                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            disabled={selectedIds.length === 0}
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem("token");
                                                    const res = await axios.delete(
                                                        `http://localhost:8080/api/trips/${id}/leave-requests/my`,
                                                        {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                            data: selectedIds
                                                        }
                                                    );
                                                    setMyRequests(prev => prev.filter(item => !selectedIds.includes(item.id)));
                                                    setSelectedIds([]);
                                                    toast.success(res.data.message || "Deleted successfully!");
                                                } catch (e) {
                                                    console.error("Delete failed", e);
                                                    toast.error("Delete failed. Please try again!");
                                                }
                                            }}
                                        >
                                            Delete notification{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {!showOwnerResponseModal && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong>Pending Leave Requests</strong>
                                            <button
                                                className="btn btn-link btn-sm"
                                                onClick={() => fetchOwnerPending()}
                                                style={{ textDecoration: 'none' }}
                                            >
                                                ↻
                                            </button>
                                        </div>

                                        {ownerPending.length === 0 ? (
                                            <div style={{ fontSize: 14, marginTop: 8, color: '#888' }}>
                                                No pending requests.
                                            </div>
                                        ) : (
                                            ownerPending.map(req => (
                                                <div key={req.id} style={{ borderBottom: '1px dashed #eee', padding: '8px 0' }}>
                                                    <div><strong>{req.user?.name || req.userEmail}</strong> requested to leave</div>
                                                    <div>Reason: {req.reason}</div>
                                                    <div>Date: {new Date(req.createdAt).toLocaleString()}</div>
                                                    <div className="mt-2 d-flex gap-2">
                                                        <button
                                                            onClick={() => openOwnerResponseModal('approve', req.id)}
                                                            className="btn btn-success btn-sm"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => openOwnerResponseModal('reject', req.id)}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                                {/* Khi showOwnerResponseModal = true thì list bị ẩn, modal popup sẽ hiển thị ở cuối file */}
                            </>
                        )}
                    </div>
                )}

                <div className="mm-chat-messages" ref={chatBoxRef}>
                    {(messages || [])
                        .filter(msg =>
                            searchQuery.trim() === "" ||
                            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((msg, index) => {
                            if (msg.system) {
                                return (
                                    <div key={msg.id} className="mm-system-message">
                                        <em>{msg.content}</em>
                                    </div>
                                );
                            }
                            const isCurrentUserMsg = msg.senderEmail === userEmail;
                            const avatarList = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
                            const charCode = msg.senderEmail?.charCodeAt?.(0) || 0;
                            const avatar = avatarList[charCode % avatarList.length];
                            const senderMember = (members || []).find(m => m.email === msg.senderEmail);
                            const displayName = senderMember?.name || msg.senderEmail || 'Unknown';

                            const ts = msg.createdAt ? new Date(msg.createdAt).toLocaleString('en-GB') : '';

                            return (
                                <div key={msg.id || index} className={`mm-message ${isCurrentUserMsg ? 'mm-message-right' : 'mm-message-left'}`}>
                                    {!isCurrentUserMsg && <div className="mm-avatar">{avatar}</div>}
                                    <div className="mm-message-content">
                                        <div className="mm-sender-name"><strong>{displayName}</strong></div>

                                        <div className="mm-msg-row">
                                            {/* Nếu là tin nhắn của mình → ⋮ nằm bên trái */}
                                            {isCurrentUserMsg && !msg.recalled && (
                                                <div className="msg-actions">
                                                    <button onClick={() => toggleMenu(msg.id)}>⋮</button>
                                                    {openMenuId === msg.id && (
                                                        <div className="msg-dropdown">
                                                            <div onClick={() => handlePinMessage(msg)}>
                                                                {msg.pinned ? "Unpin" : "Pin"}
                                                            </div>
                                                            <div onClick={() => handleRecallMessage(msg)}>Delete</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Bubble */}
                                            <div className="mm-bubble">
                                                {msg.recalled ? (
                                                    <span style={{ fontStyle: "italic", color: "#ffffffff" }}>
                                                        Message has been revoked
                                                    </span>
                                                ) : (
                                                    highlightText(msg.content, searchQuery)
                                                )}
                                            </div>

                                            {/* Nếu là tin nhắn người khác → ⋮ nằm bên phải */}
                                            {!isCurrentUserMsg && !msg.recalled && (
                                                <div className="msg-actions">
                                                    <button onClick={() => toggleMenu(msg.id)}>⋮</button>
                                                    {openMenuId === msg.id && (
                                                        <div className="msg-dropdown">
                                                            <div onClick={() => handlePinMessage(msg)}>
                                                                {msg.pinned ? "Unpin" : "Pin"}
                                                            </div>
                                                            <div onClick={() => handleHideMessage(msg)}>Delete on my side</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <small className="mm-timestamp">{ts}</small>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Gợi ý AI */}
                <SmartReply
                    lastMessage={messages[messages.length - 1]}
                    userEmail={userEmail}
                    onSelect={(reply) => setNewMessage(reply)}
                />
                <div className="mm-chat-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={leaveRequestStatus === "PENDING" || isWaitingApproval}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={leaveRequestStatus === "PENDING" || isWaitingApproval}
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* Manage card (right) */}
            <div className="mm-manage-card">
                <h2>👥 Manage Trip Members</h2>

                {currentUserRole === 'OWNER' ? (
                    <div className="mb-3">
                        <input
                            type="email"
                            placeholder="Enter email to invite"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                            disabled={leaveRequestStatus === 'PENDING' || isWaitingApproval}
                        />
                        <button
                            onClick={handleInvite}
                            className="btn btn-danger mt-2"
                            disabled={leaveRequestStatus === 'PENDING' || isWaitingApproval}
                        >
                            ✉️ Invite
                        </button>
                    </div>
                ) : (
                    <p className="text-muted mb-3">🔒 Only trip owner can invite new members.</p>
                )}

                {/* Leave button for MEMBER */}
                {currentUserRole === 'MEMBER' && !isWaitingApproval && !(leaveRequestStatus === 'PENDING') && (
                    <button className="btn btn-warning mb-3" onClick={() => setShowLeaveModal(true)}>🚪 Leave Trip</button>
                )}

                {(members || []).length === 0 ? (
                    <p className="text-muted mt-4">No members in this trip.</p>
                ) : (
                    <ul className="mm-list-group mt-4">
                        {(members || []).map(member => {
                            const isCurrentUser = member.email === userEmail;
                            return (
                                <li
                                    key={member.id || member.email}
                                    className={`mm-list-item ${isCurrentUser ? 'mm-current-user' : ''}`}
                                >
                                    <strong>
                                        {member.name || 'Unknown'} {isCurrentUser && <span className="text-primary">(You)</span>}
                                    </strong> ({member.email})<br />
                                    <small>Role: <strong>{member.role}</strong> | Status: {member.status}</small>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            {showOwnerResponseModal && (
                <div
                    className="modal-backdrop"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1050,
                    }}
                >
                    <div
                        className="modal-content1 p-4 bg-white rounded"
                        style={{ maxWidth: 500, width: '90%' }}
                    >
                        <h4>{actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request</h4>
                        <textarea
                            className="form-control mt-2"
                            placeholder="Enter your response (optional)"
                            value={ownerResponseText}
                            onChange={(e) => setOwnerResponseText(e.target.value)}
                            rows={4}
                        />
                        <div className="modal-btn-group">
                            <button
                                className="modal-btn modal-btn-cancel"
                                onClick={() => setShowOwnerResponseModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`modal-btn modal-btn-confirm ${actionType === 'reject' ? 'modal-btn-reject' : 'modal-btn-approve'
                                    }`}
                                onClick={submitOwnerResponse}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManageMembers;
