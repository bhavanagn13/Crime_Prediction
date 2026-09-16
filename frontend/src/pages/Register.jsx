import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {

            await api.post("/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password
            });

            setSuccess(
                "Account created successfully. Redirecting to sign in..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* LEFT PANEL */}

            <div className="auth-visual">

                <div className="auth-brand">

                    <div className="brand-mark">
                        CI
                    </div>

                    <div>
                        <div className="brand-name">
                            Crime Intelligence
                        </div>

                        <div className="brand-subtitle">
                            Smart City Safety Platform
                        </div>
                    </div>

                </div>


                <div className="auth-visual-content">

                    <div className="security-icon">
                        +
                    </div>

                    <h1>
                        Join the community.
                    </h1>

                    <p>
                        Create a citizen account to report
                        incidents, stay informed about local
                        safety concerns and contribute to a
                        safer community.
                    </p>

                </div>


                <div className="auth-footer">
                    Citizen Access &nbsp;•&nbsp;
                    Secure Registration
                </div>

            </div>


            {/* RIGHT PANEL */}

            <div className="auth-form-panel">

                <div className="auth-form-container">

                    {/* MOBILE BRAND */}

                    <div className="mobile-brand">

                        <div className="brand-mark">
                            CI
                        </div>

                        <strong>
                            Crime Intelligence
                        </strong>

                    </div>


                    {/* HEADING */}

                    <div className="auth-heading">

                        <span className="auth-eyebrow">
                            CITIZEN REGISTRATION
                        </span>

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Register to access the citizen
                            safety platform.
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="auth-error">
                            <span>!</span>
                            {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="auth-success">
                            <span>✓</span>
                            {success}
                        </div>
                    )}


                    {/* FORM */}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        {/* NAME */}

                        <div className="form-group">

                            <label>
                                Full name
                            </label>

                            <input
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email address
                            </label>

                            <input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <div className="password-input">

                                <input
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                            <small className="password-hint">
                                Minimum 8 characters
                            </small>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label>
                                Confirm password
                            </label>

                            <div className="password-input">

                                <input
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <span>→</span>
                                </>
                            )}

                        </button>

                    </form>


                    {/* LOGIN */}

                    <div className="auth-register">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Sign in
                        </button>

                    </div>


                    <div className="auth-security-note">
                        <span>🔒</span>
                        Your information is protected
                        through secure account authentication.
                    </div>

                </div>

            </div>

        </div>
    );
}