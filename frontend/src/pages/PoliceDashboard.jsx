import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PoliceDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div style={styles.page}>

            {/* TOP BAR */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Police Intelligence Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Crime Analysis & Patrol Management System
                    </p>
                </div>

                <div style={styles.userSection}>
                    <div>
                        <strong>{user?.name || "Police Officer"}</strong>
                        <span style={styles.role}>
                            {user?.role || "POLICE"}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={styles.logoutButton}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* STATION INFORMATION */}
            <section style={styles.stationCard}>

                <div>
                    <span style={styles.label}>
                        POLICE STATION
                    </span>

                    <h2 style={styles.stationName}>
                        {user?.police_station || "Assigned Police Station"}
                    </h2>

                    <p style={styles.stationDescription}>
                        Monitor crime activity, analyze risk patterns
                        and manage patrol operations for your station.
                    </p>
                </div>

                <div style={styles.status}>
                    <span style={styles.statusDot}></span>
                    SYSTEM ACTIVE
                </div>

            </section>

            {/* MODULES */}
            <h2 style={styles.sectionTitle}>
                Operational Modules
            </h2>

            <div style={styles.grid}>

                {/* CRIME ANALYSIS */}
                <div
                    style={styles.card}
                    onClick={() => navigate("/prediction")}
                >
                    <div style={styles.icon}>📊</div>

                    <h3>Crime Analysis</h3>

                    <p>
                        Analyze predicted crime patterns, risk levels
                        and spatial crime distribution.
                    </p>

                    <button style={styles.actionButton}>
                        Open Analysis →
                    </button>
                </div>


                {/* PATROL */}
                <div
                    style={styles.card}
                    onClick={() => navigate("/patrol")}
                >
                    <div style={styles.icon}>🚔</div>

                    <h3>Patrol Optimization</h3>

                    <p>
                        Generate optimized patrol routes based on
                        high-risk crime hotspots and road distance.
                    </p>

                    <button style={styles.actionButton}>
                        Plan Patrol →
                    </button>
                </div>


                {/* REPORTS */}
                <div
                    style={styles.card}
                    onClick={() => navigate("/reports")}
                >
                    <div style={styles.icon}>📋</div>

                    <h3>Citizen Reports</h3>

                    <p>
                        Review and validate citizen-submitted crime
                        and suspicious activity reports.
                    </p>

                    <button style={styles.actionButton}>
                        View Reports →
                    </button>
                </div>


            </div>


            {/* SECURITY / ACCESS INFORMATION */}
            <section style={styles.infoSection}>

                <div>
                    <span style={styles.infoLabel}>
                        ACCESS LEVEL
                    </span>

                    <strong>POLICE OFFICER</strong>
                </div>

                <div>
                    <span style={styles.infoLabel}>
                        STATION ACCESS
                    </span>

                    <strong>
                        {user?.police_station || "Assigned Station"}
                    </strong>
                </div>

                <div>
                    <span style={styles.infoLabel}>
                        AUTHENTICATION
                    </span>

                    <strong style={{ color: "#22c55e" }}>
                        ● ACTIVE SESSION
                    </strong>
                </div>

            </section>

        </div>
    );
}


/* ============================================================
   STYLES
   ============================================================ */

const styles = {

    page: {
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "0 40px 40px",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#172033"
    },

    header: {
        minHeight: "90px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e2e8f0",
        background: "#ffffff",
        margin: "0 -40px",
        padding: "0 40px"
    },

    title: {
        margin: 0,
        fontSize: "25px",
        fontWeight: "700"
    },

    subtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "13px"
    },

    userSection: {
        display: "flex",
        alignItems: "center",
        gap: "20px"
    },

    role: {
        display: "block",
        fontSize: "11px",
        color: "#2563eb",
        fontWeight: "700",
        marginTop: "3px"
    },

    logoutButton: {
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        padding: "9px 16px",
        borderRadius: "7px",
        cursor: "pointer",
        fontWeight: "600"
    },

    stationCard: {
        marginTop: "30px",
        background: "#172554",
        color: "#ffffff",
        borderRadius: "14px",
        padding: "28px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 25px rgba(15, 23, 42, 0.12)"
    },

    label: {
        fontSize: "11px",
        letterSpacing: "1.2px",
        color: "#93c5fd",
        fontWeight: "700"
    },

    stationName: {
        margin: "7px 0",
        fontSize: "25px"
    },

    stationDescription: {
        margin: 0,
        color: "#cbd5e1",
        maxWidth: "650px",
        fontSize: "14px"
    },

    status: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(34, 197, 94, 0.12)",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        padding: "9px 14px",
        borderRadius: "20px",
        color: "#86efac",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap"
    },

    statusDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#22c55e"
    },

    sectionTitle: {
        marginTop: "35px",
        marginBottom: "18px",
        fontSize: "19px"
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px"
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "24px",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        minHeight: "205px",
        boxSizing: "border-box"
    },

    icon: {
        fontSize: "27px",
        marginBottom: "12px"
    },

    cardTitle: {
        margin: 0
    },

    cardText: {
        color: "#64748b",
        fontSize: "13px",
        lineHeight: "1.6"
    },

    actionButton: {
        marginTop: "10px",
        background: "transparent",
        border: "none",
        color: "#2563eb",
        fontWeight: "700",
        cursor: "pointer",
        padding: 0
    },

    infoSection: {
        marginTop: "30px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px 25px",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "25px"
    },

    infoLabel: {
        display: "block",
        color: "#94a3b8",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "1px",
        marginBottom: "5px"
    }
};