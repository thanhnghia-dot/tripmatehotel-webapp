import React, { useState } from "react";
import axios from "axios";

export default function EmailSender({ predictions, apiBase }) { 
const [email, setEmail] = useState(""); 
const [loading, setLoading] = useState(false); 
const [msg, setMsg] = useState(null); 
const [error, setError] = useState(null); 

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email); 

const sendEmail = async () => { 
setMsg(null); 
setError(null); 

if (!email) { 
setError("Please enter email!"); 
return; 
} 
if (!isValidEmail(email)) { 
setError("Invalid email!"); 
return; 
} 

setLoading(true); 
try { 
const res = await axios.post(`${apiBase}/api/send-forecast`, { to: email, predictions }); 
setMsg(res.data.message || "Email sent successfully!"); 
} catch (err) { 
console.error(err); 
setError("Sending email failed!"); 
} finally { 
setLoading(false); 
} 
}; 

return ( 
<div style={{ maxWidth: 400, fontFamily: "Arial, sans-serif" }}> 
<input 
type="email" 
placeholder="Enter receiving email" 
value={email} 
onChange={(e) => setEmail(e.target.value)} 
style={{ 
padding: 10, 
width: "100%", 
marginBottom: 12, 
borderRadius: 6, 
border: "1px solid #ccc", 
boxSizing: "border-box", 
}} 
/> 

<button 
onClick={sendEmail} 
disabled={loading} 
style={{ 
padding: "10px 16px", 
width: "100%", 
backgroundColor: "#0ea5a4", 
color: "white", 
border: "none", 
borderRadius: 6, 
cursor: loading ? "not allowed" : "pointer", 
fontWeight: "bold", 
}} 
> 
{loading ? "Sending..." : "Share"} 
</button> 

{error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>} 
{msg && <p style={{ color: "#0ea5a4", marginTop: 10 }}>{msg}</p>} 
</div> 
);
}