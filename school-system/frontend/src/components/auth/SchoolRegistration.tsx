import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Quote,
  Loader2,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import "./SchoolRegistration.css"; // import vanilla css
import { request } from "../../lib/api";

interface SchoolFormData {
  schoolName: string;
  schoolEmail: string;
  phoneNumber: string;
  schoolAddress: string;
  motto: string;
}

const SchoolRegistration: React.FC = () => {
  const [formData, setFormData] = useState<SchoolFormData>({
    schoolName: "",
    schoolEmail: "",
    phoneNumber: "",
    schoolAddress: "",
    motto: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [returnedCode, setReturnedCode] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: Response = await request("/schools/create-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setReturnedCode(data?.schoolCode);
        setSuccess(true);
        setTimeout(() => (window.location.href = `/login`), 2500);
      } else {
        alert(data?.message || "Registration failed");
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reg-success">
        <div className="reg-success-card">
          <CheckCircle />
          <h2>School Registered Successfully!</h2>
          <p>Your School Code:</p>
          <p className="reg-school-code">{returnedCode}</p>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            Save this code. Redirecting to create Admin account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page">
      {/* Left Branding Panel */}
      <div className="reg-branding">
        <div>
          <div className="reg-brand-header">
            <img src="/EdunexImage.png" alt="Edunex-logo" />
            <h1>Edunex</h1>
          </div>
          <h2>Lead with a clearer view of school performance.</h2>
          <p className="accent">
            Student, Teacher, and Parent Management - all in one place.
          </p>
        </div>
        <p className="reg-footer">
          {new Date().getFullYear()} Edunex. All rights reserved.
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="reg-form-container">
        <div className="reg-card">
          <div className="reg-card-header">
            <Building2 />
            <h1>Register Your School</h1>
          </div>

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-form-group">
              <label className="reg-label">
                <Building2 /> School Name *
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g. Greenhill Academy"
                required
                className="reg-input"
              />
            </div>

            <div className="reg-form-row">
              <div className="reg-form-group">
                <label className="reg-label">
                  <Mail /> School Email *
                </label>
                <input
                  type="email"
                  name="schoolEmail"
                  value={formData.schoolEmail}
                  onChange={handleChange}
                  placeholder="admin@school.ac.ke"
                  required
                  className="reg-input"
                />
              </div>
              <div className="reg-form-group">
                <label className="reg-label">
                  <Phone /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0712345678"
                  required
                  className="reg-input"
                />
              </div>
            </div>

            <div className="reg-form-group">
              <label className="reg-label">
                <MapPin /> School Address *
              </label>
              <input
                type="text"
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleChange}
                placeholder="Karen, Nairobi, Kenya"
                required
                className="reg-input"
              />
            </div>

            <div className="reg-form-group">
              <label className="reg-label">
                <Quote /> School Motto
              </label>
              <textarea
                name="motto"
                value={formData.motto}
                onChange={handleChange}
                placeholder="Excellence in Education"
                rows={2}
                className="reg-textarea"
              />
            </div>

            <button type="submit" disabled={loading} className="reg-btn">
              {loading ? (
                <>
                  <Loader2 className="reg-spinner" /> Registering...
                </>
              ) : (
                "Register School"
              )}
            </button>
          </form>

          <p className="reg-login-link">
            Already registered? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistration;
