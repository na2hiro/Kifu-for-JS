import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";

export type Kickout = () => void;
export const useIntervalKickout = () => {
    return useRef<Kickout>(null);
};

const useInterval = (
    callback: () => void,
    interval: number,
    shouldStop = () => false,
    /**
     * If provided, this function will be called when the interval is started.
     * This is useful for keeping a single interval at a time.
     */
    kickout?: MutableRefObject<Kickout>,
) => {
    // Have it in ref so that it can be used in the callback
    const timer = useRef<number>(null);
    // Replicate to the state to trigger re-render on start/stop
    const [isEnabled, setEnabled] = useState(false);

    const stop = useCallback(() => {
        if (timer.current) {
            window.clearInterval(timer.current);
        }
        timer.current = null;
        setEnabled(false);
    }, [setEnabled]);

    const process = useCallback(() => {
        callback();
        if (shouldStop()) {
            stop();
        }
    }, [stop, callback, shouldStop]);

    const start = useCallback(() => {
        if (kickout) {
            kickout.current?.();
            kickout.current = stop;
        }

        stop();
        process();
        if (!shouldStop()) {
            timer.current = window.setInterval(process, interval);
            setEnabled(true);
        }
    }, [stop, process, interval, setEnabled]);

    useEffect(() => {
        return () => {
            if (timer.current) {
                window.clearInterval(timer.current);
            }
        };
    }, []);

    return {
        start,
        stop,
        isEnabled,
    };
};

export default useInterval;
