import React from "react";
import KifuStore from "../../common/stores/KifuStore";
import UserSetting from "../../common/stores/UserSetting";

type Props = {
    kifuStore: KifuStore;
    userSetting: UserSetting;
};
const HapticFeedback: React.FC<Props> = ({ kifuStore, userSetting }) => {
    return (
        !kifuStore.staticOptions && (
            <button
                style={{ background: "none", border: "none", padding: 0, fontSize: "inherit" }}
                onClick={() => {
                    const newValue = (userSetting.hapticFeedback = !userSetting.hapticFeedback);
                    if (newValue) {
                        navigator.vibrate?.(1);
                    }
                }}
            >
                {userSetting.hapticFeedback ? (
                    /* vibration_FILL0_wght400_GRAD0_opsz48.svg */
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
                    /* do_not_disturb_on_FILL0_wght400_GRAD0_opsz48.svg */
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
            </button>
        )
    );
};

export default HapticFeedback;
