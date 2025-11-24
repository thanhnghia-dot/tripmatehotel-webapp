import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom"; 
function EditProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    avatar: ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [stats, setStats] = useState({ trips: 0, feels: 0, comments: 0 });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  // Helper hiển thị avatar
// Helper hiển thị avatar
// Helper hiển thị avatar
const getAvatarUrl = () => {
  if (avatarFile) {
    return URL.createObjectURL(avatarFile); // preview local
  }
  if (profile.avatar) {
    // Nếu BE trả về full URL
    if (profile.avatar.startsWith("http")) {
      return profile.avatar;
    }
    // Nếu chỉ lưu path tương đối
    return `http://localhost:8080${profile.avatar}`;
  }
  // Nếu chưa có avatar trong DB
  return null;
};


  // load profile + stats
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile((prev) => ({ ...prev, ...res.data })))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:8080/api/user/me/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  // save profile
  const handleSave = async () => {
    try {
      let avatarUrl = profile.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await axios.post(
          "http://localhost:8080/api/user/me/upload-avatar",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

     avatarUrl = uploadRes.data.url; // full URL
// full URL
        setAvatarFile(null);
      }

      // update profile
      await axios.patch(
        "http://localhost:8080/api/user/me/update",
        { ...profile, avatar: avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // reload profile
      const refreshed = await axios.get("http://localhost:8080/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(refreshed.data);

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  return (
 
    <div className="edit-profile-page">
        
      <div className="edit-profile-card">
  
        {/* Avatar */}
        <div className="edit-profile-avatar">
          {getAvatarUrl() ? (
            <img src={getAvatarUrl()} alt="Avatar" className="avatar-img" />
          ) : (
            <FaUserCircle className="default-avatar" />
          )}
          <label className="upload-btn">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            📷
          </label>
        </div>

        {/* Info */}
        <h2>{profile.name || "Your Name"}</h2>
        <p>{profile.address || "Your Address"}</p>
        <p>{profile.email}</p>

        {/* Stats */}
        <div className="edit-profile-stats">
          <div>
            <p>{stats.trips}</p>
            <p>Trips</p>
          </div>
          <div>
            <p>{stats.feels}</p>
            <p>Feel Videos</p>
          </div>
          <div>
            <p>{stats.comments}</p>
            <p>Comments</p>
          </div>
        </div>

        {/* Form */}
        <div className="edit-profile-form">
          <input
            type="text"
            placeholder="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
          <select
            value={profile.gender}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="edit-profile-buttons">
                   <button onClick={() => navigate(-1)}>⬅</button>
          <button onClick={handleSave}>💾 Save Changes</button>
   
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
