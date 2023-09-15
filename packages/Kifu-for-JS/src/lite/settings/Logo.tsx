import React from "react";

declare const __VERSION__: string;

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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 10, marginLeft: 4 }}>by na2hiro</div>
                <div style={{ fontSize: 8, marginRight: 4 }}>{__VERSION__}</div>
            </div>
        </div>
    );
}
export default Logo;
