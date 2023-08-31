import FocusTrap from "focus-trap-react";
import { observer } from "mobx-react";
import React, { forwardRef, useState } from "react";
import KifuStore from "../../common/stores/KifuStore";
import UserSetting from "../../common/stores/UserSetting";
import Download from "./Download";
import HapticFeedback from "./HapticFeedback";
import License from "./License";
import Logo from "./Logo";

interface Props {
    onClose: () => void;
    kifuStore: KifuStore;
}
export const SettingsModal = forwardRef<HTMLElement, Props>(({ onClose, kifuStore }, ref) => {
    const userSetting = UserSetting.get();
    const [subPage, setSubPage] = useState<React.ReactNode | null>(null);

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
            ref={ref as any}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={onClose}
                aria-label={"Close"}
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: subPage ? "none" : "initial",
                }}
            >
                <svg
                    fill="currentColor"
                    style={{ opacity: 0.5 }}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    height="30"
                    width="30"
                >
                    <path d="m252.615-217.232-35.383-35.383L444.616-480 217.232-707.385l35.383-35.383L480-515.384l227.385-227.384 35.383 35.383L515.384-480l227.384 227.385-35.383 35.383L480-444.616 252.615-217.232Z" />
                </svg>
            </button>

            <Logo style={{ margin: "20px auto", ...(subPage ? { display: "none" } : {}) }} />
            <div
                style={{
                    display: subPage ? "none" : "grid", // Keep having DOM in order to be able to focus back
                    gridTemplateColumns: "repeat(3, 1fr)",
                    alignContent: "center",
                    gap: "4px",
                    fontSize: "9px",
                    textAlign: "center",
                    flexGrow: 1,
                    margin: "20px",
                }}
            >
                <HapticFeedback kifuStore={kifuStore} userSetting={userSetting} />
                <Download filePath={kifuStore.filePath} />
                <License openSubPage={setSubPage} />
            </div>
            <div style={{ alignSelf: "end", margin: "15px", display: subPage ? "none" : "initial" }}>
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

            {subPage && (
                <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
                    <div
                        style={{
                            flexGrow: 1,
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={() => {
                                setSubPage(null);
                            }}
                            aria-label={"Go back"}
                            style={{
                                float: "left",
                                margin: "10px",
                                background: "none",
                                border: "none",
                                padding: 0,
                            }}
                        >
                            <svg
                                fill="currentColor"
                                style={{ opacity: 0.5 }}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 -960 960 960"
                                height="30"
                                width="30"
                            >
                                <path d="m275.845-454.873 239.744 239.488L480-180.001 180.001-480 480-779.999l35.589 35.384-239.744 239.488h504.154v50.254H275.845Z" />
                            </svg>
                        </button>
                        {subPage}
                    </div>
                </FocusTrap>
            )}
        </div>
    );
});

export default observer(SettingsModal);
