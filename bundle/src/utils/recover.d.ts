export type RecoveryTarget = {
    kifuPath: string;
    targetId: string;
    method: string;
};
export declare function searchForRecovery(): Promise<RecoveryTarget[]>;
export declare function getDivWithId(id: string): HTMLDivElement;
