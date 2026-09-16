import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await login(
                email,
                password
            );

            const role = response.user.role;

            if (role === "ADMIN") {
                navigate("/");
            }
            else if (role === "POLICE") {
                navigate("/police");
            }
            else if (role === "CITIZEN") {
                navigate("/citizen");
            }

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "Login failed. Please check your credentials."
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
                    <div className="brand-mark">CI</div>

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
                        ◉
                    </div>

                    <h1>
                        Data-driven intelligence
                        for safer communities.
                    </h1>

                    <p>
                        Analyze crime patterns, identify
                        hotspots and support intelligent
                        patrol planning through a unified
                        intelligence platform.
                    </p>

                </div>


                <div className="auth-footer">
                    AI-Powered Crime Analysis &nbsp;•&nbsp;
                    Secure Access
                </div>

            </div>


            {/* RIGHT PANEL */}

            <div className="auth-form-panel">

                <div className="auth-form-container">

                    <div className="mobile-brand">
                        <div className="brand-mark">
                            CI
                        </div>

                        <strong>
                            Crime Intelligence
                        </strong>
                    </div>


                    <div className="auth-heading">

                        <span className="auth-eyebrow">
                            SECURE ACCESS
                        </span>

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to access your intelligence
                            dashboard.
                        </p>

                    </div>


                    {error && (
                        <div className="auth-error">
                            <span>!</span>
                            {error}
                        </div>
                    )}


                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your Username"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                autoComplete="email"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <div className="password-label">
                                <label>
                                    Password
                                </label>
                            </div>

                            <div className="password-input">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
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

                        </div>


                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <span>→</span>
                                </>
                            )}
                        </button>

                    </form>


                    <div className="auth-register">

                        <span>
                            Don't have a citizen account?
                        </span>

                        <button
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create account
                        </button>

                    </div>


                    <div className="auth-security-note">
                        <span>🔒</span>
                        Your session is protected by
                        authenticated role-based access.
                    </div>

                </div>

            </div>

        </div>
    );
}