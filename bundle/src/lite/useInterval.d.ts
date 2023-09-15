import { MutableRefObject } from "react";
export type Kickout = () => void;
export declare const useIntervalKickout: () => MutableRefObject<Kickout>;
declare const useInterval: (callback: () => void, interval: number, shouldStop?: () => boolean, kickout?: MutableRefObject<Kickout>) => {
    start: () => void;
    stop: () => void;
    isEnabled: boolean;
};
export default useInterval;
