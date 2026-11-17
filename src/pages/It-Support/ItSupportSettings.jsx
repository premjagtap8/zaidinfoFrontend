import React, { useEffect, useId, useState } from "react";
import axios from "axios";
import { FaUserCog, FaLock } from "react-icons/fa"; // same icon set as the sidebar
import "./ItSupportSettings.css";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const toProfile = (data = {}) => ({
  name: data.name || "",
  email: data.email || "",
  phone: data.phone || "",
});

const EMPTY_PASSWORDS = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ItSupportSettings() {
  const uid = useId(); // unique ids so every <label htmlFor> matches its input

  const [profile, setProfile] = useState(toProfile());
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication token not found. Please login again.",
        });
        return;
      }

      const res = await axios.get(
        `${API_URL}/itsupport/profile`,
        getHeaders()
      );

      if (res.data?.success && res.data?.data) {
        setProfile(toProfile(res.data.data));
      }
    } catch (error) {
      console.error("PROFILE ERROR:", error);

      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to load profile data.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setSavingProfile(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.put(
        `${API_URL}/itsupport/profile`,
        profile,
        getHeaders()
      );

      setMessage({
        type: "success",
        text: res.data?.message || "Profile updated successfully.",
      });

      if (res.data?.data) {
        setProfile(toProfile(res.data.data));
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      setMessage({
        type: "error",
        text: error.response?.data?.message || "Could not update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setMessage({ type: "", text: "" });

    if (!passwords.currentPassword) {
      setMessage({ type: "error", text: "Enter your current password." });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      setMessage({
        type: "error",
        text: "New password must be different from current password.",
      });
      return;
    }

    setLoadingPass(true);

    try {
      const res = await axios.put(
        `${API_URL}/itsupport/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        getHeaders()
      );

      setMessage({
        type: "success",
        text: res.data?.message || "Password changed successfully.",
      });

      setPasswords(EMPTY_PASSWORDS);
    } catch (error) {
      console.error("PASSWORD ERROR:", error);

      setMessage({
        type: "error",
        text: error.response?.data?.message || "Password update failed.",
      });
    } finally {
      setLoadingPass(false);
    }
  };

  const updateProfile = (field) => (e) =>
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));

  const updatePasswords = (field) => (e) =>
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="its-settings-wrapper">
      <div className="its-settings-title">
        <h2>IT Support Settings</h2>
        <p>Manage your account profile and security preferences</p>
      </div>

      {message.text && (
        <div
          className={`its-banner its-banner-${message.type}`}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.text}
        </div>
      )}

      <div className="its-grid-layout">
        {/* ---------- Personal information ---------- */}
        <section className="its-card-box" aria-labelledby={`${uid}-profile-h`}>
          <div className="its-card-head">
            <span className="its-card-icon" aria-hidden="true">
              <FaUserCog />
            </span>
            <div>
              <h3 id={`${uid}-profile-h`}>Personal Information</h3>
              <p>Update your personal details</p>
            </div>
          </div>

          {loadingProfile ? (
            <div className="its-loading" role="status">
              Loading profile...
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="its-form-group">
              <div className="its-input-row">
                <label htmlFor={`${uid}-name`}>Full Name</label>
                <input
                  id={`${uid}-name`}
                  type="text"
                  autoComplete="name"
                  value={profile.name}
                  onChange={updateProfile("name")}
                  disabled={savingProfile}
                  required
                />
              </div>

              <div className="its-input-row">
                <label htmlFor={`${uid}-email`}>Email Address</label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={profile.email}
                  onChange={updateProfile("email")}
                  disabled={savingProfile}
                  required
                />
              </div>

              <div className="its-input-row">
                <label htmlFor={`${uid}-phone`}>Phone Number</label>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={profile.phone}
                  onChange={updateProfile("phone")}
                  disabled={savingProfile}
                />
              </div>

              <button
                type="submit"
                className="its-action-btn primary"
                disabled={savingProfile}
                aria-busy={savingProfile}
              >
                {savingProfile ? "Saving Changes..." : "Save Profile"}
              </button>
            </form>
          )}
        </section>

        {/* ---------- Change password ---------- */}
        <section className="its-card-box" aria-labelledby={`${uid}-pass-h`}>
          <div className="its-card-head">
            <span className="its-card-icon" aria-hidden="true">
              <FaLock />
            </span>
            <div>
              <h3 id={`${uid}-pass-h`}>Change Password</h3>
              <p>Ensure your account stays secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="its-form-group">
            <div className="its-input-row">
              <label htmlFor={`${uid}-current`}>Current Password</label>
              <input
                id={`${uid}-current`}
                type="password"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={updatePasswords("currentPassword")}
                disabled={loadingPass}
                required
              />
            </div>

            <div className="its-input-row">
              <label htmlFor={`${uid}-new`}>New Password</label>
              <input
                id={`${uid}-new`}
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={passwords.newPassword}
                onChange={updatePasswords("newPassword")}
                disabled={loadingPass}
                required
              />
            </div>

            <div className="its-input-row">
              <label htmlFor={`${uid}-confirm`}>Confirm New Password</label>
              <input
                id={`${uid}-confirm`}
                type="password"
                autoComplete="new-password"
                value={passwords.confirmPassword}
                onChange={updatePasswords("confirmPassword")}
                disabled={loadingPass}
                required
              />
            </div>

            <button
              type="submit"
              className="its-action-btn success"
              disabled={loadingPass}
              aria-busy={loadingPass}
            >
              {loadingPass ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}