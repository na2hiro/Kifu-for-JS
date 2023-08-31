import KifuStore from "../common/stores/KifuStore";

export default class KifuRegistry {
    public kifuStoreMap = new WeakMap<HTMLElement, KifuStore>();
    public awaitingMap = new WeakMap<HTMLElement, Array<(kifuStore: KifuStore) => void>>();

    public register(element: HTMLElement, kifuStore: KifuStore) {
        this.kifuStoreMap.set(element, kifuStore);
        if (this.awaitingMap.has(element)) {
            this.awaitingMap.get(element).forEach((resolve) => resolve(kifuStore));
            this.awaitingMap.delete(element);
        }
    }

    public getKifuStore(element: HTMLElement) {
        if (this.kifuStoreMap.has(element)) {
            return Promise.resolve(this.kifuStoreMap.get(element));
        }
        return new Promise<KifuStore>((resolve) => {
            if (!this.awaitingMap.get(element)) {
                this.awaitingMap.set(element, []);
            }
            this.awaitingMap.get(element).push(resolve);
        });
    }
}

export const registry = new KifuRegistry();
