import * as React from "react";
import useInterval, { Kickout } from "./useInterval";
import { useLongPress } from "use-long-press";
import { observer } from "mobx-react";
import { MutableRefObject, PropsWithChildren } from "react";

type Props = {
    step: () => void;
    shouldStop: () => boolean;
    style?: React.CSSProperties;
    kickout?: MutableRefObject<Kickout>;
};

const PlayButton: React.FC<PropsWithChildren<Props>> = ({ step, shouldStop, style = {}, kickout, children }) => {
    const { isEnabled, start, stop } = useInterval(step, 800, shouldStop, kickout);
    const longPress = useLongPress(start, { threshold: 800 });
    return (
        <button
            // Avoid click event when releasing long press by renewing the DOM
            key={isEnabled ? "stopped" : "playing"}
            onClick={isEnabled ? stop : step}
            style={{
                fontSize: "15px",
                fontFamily: 'Osaka,"ＭＳ Ｐゴシック"',
                ...style,
            }}
            disabled={shouldStop()}
            {...(isEnabled ? {} : longPress())}
        >
            {isEnabled ? "■" : children}
        </button>
    );
};

export default observer(PlayButton);
