import React from "react";
import { observer } from "mobx-react";
import UserSetting from "../common/stores/UserSetting";
import KifuStore from "../common/stores/KifuStore";

type Props = {
    onClose: () => void;
    kifuStore: KifuStore;
};
export const SettingsModal: React.FC<Props> = ({ onClose, kifuStore }) => {
    const userSetting = UserSetting.get();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxSizing: "border-box",
                background: "rgba(127, 127, 127, 0.5)",
                backdropFilter: "blur(5px)",
                borderRadius: 2,
                position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ display: "inline-block", margin: "20px 0" }}>
                    <div
                        style={{
                            marginTop: "8px",
                            fontSize: "40px",
                            lineHeight: "22px",
                            display: "inline-block",
                            fontFamily: 'Lato, "Baskerville"',
                        }}
                    >
                        Kifu<span style={{ fontSize: "smaller" }}> for </span>JS
                    </div>
                    <div style={{ fontSize: 10, marginLeft: 4 }}>
                        by{" "}
                        <a
                            href="https://twitter.com/na2hiro"
                            target="_blank"
                            style={{ color: "currentcolor", textDecoration: "underline" }}
                        >
                            na2hiro
                        </a>
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    alignContent: "center",
                    gap: "4px",
                    fontSize: "9px",
                    textAlign: "center",
                    flexGrow: 1,
                    margin: "20px",
                }}
            >
                {!kifuStore.staticOptions && (
                    <div
                        onClick={() => {
                            const newValue = (userSetting.hapticFeedback = !userSetting.hapticFeedback);
                            if (newValue) {
                                navigator.vibrate(1);
                            }
                        }}
                    >
                        {userSetting.hapticFeedback ? (
                            <svg
                                fill="currentColor"
                                style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0, 0.2))", opacity: 0.5 }}
                                xmlns="http://www.w3.org/2000/svg"
                                height={48}
                                viewBox="0 -960 960 960"
                                width={48}
                            >
                                <path d="M0-365v-230h60v230H0Zm120 88v-406h60v406h-60Zm780-88v-230h60v230h-60Zm-120 88v-406h60v406h-60ZM300-120q-24.75 0-42.375-17.625T240-180v-600q0-24.75 17.625-42.375T300-840h360q24.75 0 42.375 17.625T720-780v600q0 24.75-17.625 42.375T660-120H300Zm0-60h360v-600H300v600Zm0 0v-600 600Z" />
                            </svg>
                        ) : (
                            <svg
                                fill="currentColor"
                                style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0, 0.2))", opacity: 0.5 }}
                                xmlns="http://www.w3.org/2000/svg"
                                height={48}
                                viewBox="0 -960 960 960"
                                width={48}
                            >
                                <path d="M280-453h400v-60H280v60ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z" />
                            </svg>
                        )}
                        <div>Haptic feedback?</div>
                    </div>
                )}
                <div>
                    <svg
                        fill="currentColor"
                        style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0, 0.2))", opacity: 0.5 }}
                        xmlns="http://www.w3.org/2000/svg"
                        height={48}
                        viewBox="0 -960 960 960"
                        width={48}
                    >
                        <path d="M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM220-160q-24 0-42-18t-18-42v-143h60v143h520v-143h60v143q0 24-18 42t-42 18H220Z" />
                    </svg>
                    Download Kifu
                </div>
            </div>
            <div style={{ alignSelf: "end", margin: "15px" }}>
                <a
                    href={"https://kifu-for-js.81.la"}
                    target={"_blank"}
                    style={{ color: "currentcolor", textDecoration: "underline" }}
                >
                    公式サイトを開く
                    <svg
                        fill="currentColor"
                        style={{ verticalAlign: "bottom" }}
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 -960 960 960"
                        width="24"
                    >
                        <path d="M212.309-140.001q-30.308 0-51.308-21t-21-51.308v-535.382q0-30.308 21-51.308t51.308-21h252.305V-760H212.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v535.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846h535.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463v-252.305h59.999v252.305q0 30.308-21 51.308t-51.308 21H212.309Zm176.46-206.615-42.153-42.153L717.847-760H560v-59.999h259.999V-560H760v-157.847L388.769-346.616Z" />
                    </svg>
                </a>
            </div>

            <svg
                fill="currentColor"
                style={{ position: "absolute", top: 10, right: 10 }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                height="30"
                width="30"
                onClick={onClose}
            >
                <path d="m252.615-217.232-35.383-35.383L444.616-480 217.232-707.385l35.383-35.383L480-515.384l227.385-227.384 35.383 35.383L515.384-480l227.384 227.385-35.383 35.383L480-444.616 252.615-217.232Z" />
            </svg>
        </div>
    );
};

export default observer(SettingsModal);