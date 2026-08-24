import { useNavigate } from "react-router-dom";

export default function Unauthorized() {

    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}>

            <h1>Access Denied</h1>

            <p>
                You do not have permission to access this page.
            </p>

            <button onClick={() => navigate("/")}>
                Go to Dashboard
            </button>

        </div>
    );
}