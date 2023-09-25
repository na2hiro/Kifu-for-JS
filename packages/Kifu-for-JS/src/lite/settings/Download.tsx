import React from "react";

type Props = {
    filePath: string;
};
const Download: React.FC<Props> = ({ filePath }) => {
    const isAvailable = !!filePath;
    return (
        <button
            style={{ background: "none", border: "none", padding: 0, fontSize: "inherit" }}
            aria-disabled={!isAvailable}
            onClick={() =>
                isAvailable
                    ? open(filePath)
                    : alert(
                          "棋譜ファイル読み込み以外の方式のためダウンロードできません。（要望次第では今後対応予定です）",
                      )
            }
        >
            <svg
                fill="currentColor"
                style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0, 0.2))", opacity: 0.5 }}
                xmlns="http://www.w3.org/2000/svg"
                height={48}
                viewBox="0 -960 960 960"
                width={48}
            >
                {isAvailable ? (
                    /* download_FILL1_wght400_GRAD0_opsz48.svg */
                    <path d="M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM220-160q-24 0-42-18t-18-42v-143h60v143h520v-143h60v143q0 24-18 42t-42 18H220Z" />
                ) : (
                    <path d="m813-61-99-99H220q-24 0-42-18t-18-42v-143h60v143h434L520-354l-40 41-193-193 41-40L61-813l43-43 752 752-43 43ZM606-439l-43-44 67-66 43 43-67 67Zm-96-97-60-60v-204h60v264Zm290 294-60-60v-61h60v121Z" />
                )}
            </svg>
            <div>Download Kifu</div>
        </button>
    );
};
export default Download;
