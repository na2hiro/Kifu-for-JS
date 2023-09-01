import KifuStore from "../common/stores/KifuStore";
export default class KifuRegistry {
    kifuStoreMap: WeakMap<HTMLElement, KifuStore>;
    awaitingMap: WeakMap<HTMLElement, ((kifuStore: KifuStore) => void)[]>;
    register(element: HTMLElement, kifuStore: KifuStore): void;
    getKifuStore(element: HTMLElement): Promise<KifuStore>;
}
export declare const registry: KifuRegistry;
