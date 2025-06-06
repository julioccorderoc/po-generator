import React from "react";

const TestPage: React.FC = () => {
    const handleClick = async () => {
        try {
            const response = await fetch("/api/test_post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ test: true })
            });
            const data = await response.json();
            alert("Response: " + JSON.stringify(data));
        } catch (error) {
            alert("Error: " + error);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
            <button onClick={handleClick} style={{ padding: "1em 2em", fontSize: "1.2em" }}>
                Call /api/test_post
            </button>
        </div>
    );
};

export default TestPage;
