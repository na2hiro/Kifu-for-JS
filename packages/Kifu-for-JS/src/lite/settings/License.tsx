import React, { useRef } from "react";
import Logo from "./Logo";

type Props = {
    openSubPage: React.Dispatch<React.SetStateAction<React.ReactNode>>;
};
const License: React.FC<Props> = ({ openSubPage }) => {
    return (
        <button
            style={{ background: "none", border: "none", padding: 0, fontSize: "inherit" }}
            onClick={() => {
                openSubPage(<LicenseSubPage />);
            }}
        >
            <svg
                fill="currentColor"
                style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0, 0.2))", opacity: 0.5 }}
                xmlns="http://www.w3.org/2000/svg"
                height={48}
                viewBox="0 -960 960 960"
                width={48}
            >
                <path d="M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-200-60q25 0 42.5-17.5T420-420q0-25-17.5-42.5T360-480q-25 0-42.5 17.5T300-420q0 25 17.5 42.5T360-360Zm200-60h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z" />
            </svg>
            <div>License</div>
        </button>
    );
};

function LicenseSubPage() {
    return (
        <>
            <div style={{ lineHeight: "50px", fontSize: "20px" }}>License</div>
            <div
                style={{
                    clear: "left",
                    overflowY: "auto",
                    fontFamily: "monospace",
                    lineBreak: "anywhere",
                    margin: "0 16px",
                    height: "calc(100% - 50px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                }}
            >
                <div style={{ fontSize: "large" }}>
                    <div>This software,</div>
                    <a href="https://kifu-for-js.81.la" target="_blank">
                        <Logo style={{ margin: "5px 0" }} />
                        <svg
                            fill="currentColor"
                            style={{ verticalAlign: "baseline" }}
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            viewBox="0 -960 960 960"
                            width="24"
                        >
                            <path d="M212.309-140.001q-30.308 0-51.308-21t-21-51.308v-535.382q0-30.308 21-51.308t51.308-21h252.305V-760H212.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v535.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846h535.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463v-252.305h59.999v252.305q0 30.308-21 51.308t-51.308 21H212.309Zm176.46-206.615-42.153-42.153L717.847-760H560v-59.999h259.999V-560H760v-157.847L388.769-346.616Z" />
                        </svg>
                    </a>
                    <div>is distributed under the MIT License.</div>
                </div>
                <div>
                    <div>Special thanks to:</div>
                    <div>
                        <a href="http://maasa.g2.xrea.com/shogizumen/" target="_blank">
                            shogizumen.js
                        </a>{" "}
                        by maasa under MIT License
                    </div>
                    <div>
                        <a href="https://fonts.google.com/icons" target="_blank">
                            Material Symbols
                        </a>{" "}
                        by Google under Apache License 2.0
                    </div>
                </div>
            </div>
        </>
    );
}

export default License;
