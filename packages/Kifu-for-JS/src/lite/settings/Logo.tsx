import React from "react";

function Logo({ style = {} }) {
    return (
        <div style={{ display: "inline-flex", flexDirection: "column", ...style }}>
            <div
                style={{
                    marginTop: "8px",
                    fontSize: "40px",
                    lineHeight: "22px",
                    display: "inline-block",
                    fontFamily: "Baskerville, serif",
                }}
            >
                Kifu<span style={{ fontSize: "smaller" }}> for </span>JS
            </div>
            <div style={{ fontSize: 10, marginLeft: 4 }}>by na2hiro</div>
        </div>
    );
}
export default Logo;
