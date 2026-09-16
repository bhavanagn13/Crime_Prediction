export default function MapLegend() {

    return (

        <div
            style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                zIndex: 1000,
                background: "white",
                padding: "12px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                fontSize: "13px",
                width: "220px"
            }}
        >

            <strong>Historical Crime Density (KDE)</strong>

            <div
                style={{
                    marginTop: "8px",
                    height: "15px",
                    borderRadius: "5px",
                    background:
                        "linear-gradient(to right, purple, blue, cyan, lime, yellow, orange, red)"
                }}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "5px"
                }}
            >
                <span>Low</span>
                <span>High</span>
            </div>

            <hr
    style={{
        margin: "12px 0",
        border: "none",
        borderTop: "1px solid #ddd"
    }}
/>

<strong>AI Predicted Hotspots</strong>

<div style={{ marginTop: "10px" }}>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px"
        }}
    >
        <div
            style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#ef4444",
                marginRight: "10px"
            }}
        />
        High Risk
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px"
        }}
    >
        <div
            style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#f59e0b",
                marginRight: "10px"
            }}
        />
        Medium Risk
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center"
        }}
    >
        <div
            style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#22c55e",
                marginRight: "10px"
            }}
        />
        Low Risk
    </div>

</div>

        </div>

    );

}