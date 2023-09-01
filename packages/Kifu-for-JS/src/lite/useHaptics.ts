import { useEffect, useRef } from "react";

export default function useHaptics(tesuu: number, on = true) {
    const mounted = useRef(false);

    useEffect(() => {
        if (mounted.current) {
            if (on) {
                navigator.vibrate(1);
            }
        } else {
            mounted.current = true;
        }
    }, [tesuu]);
}
