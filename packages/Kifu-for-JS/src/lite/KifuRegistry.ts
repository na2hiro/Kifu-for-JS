import KifuStore from "../common/stores/KifuStore";

export default class KifuRegistry {
    kifuStoreMap = new WeakMap<HTMLElement, KifuStore>();
    awaitingMap = new WeakMap<HTMLElement, ((kifuStore: KifuStore) => void)[]>();

    register(element: HTMLElement, kifuStore: KifuStore) {
        this.kifuStoreMap.set(element, kifuStore);
        if (this.awaitingMap.has(element)) {
            this.awaitingMap.get(element).forEach((resolve) => resolve(kifuStore));
            this.awaitingMap.delete(element);
        }
    }

    getKifuStore(element: HTMLElement) {
        if (this.kifuStoreMap.has(element)) return Promise.resolve(this.kifuStoreMap.get(element));
        return new Promise<KifuStore>((resolve) => {
            if (!this.awaitingMap.get(element)) {
                this.awaitingMap.set(element, []);
            }
            this.awaitingMap.get(element).push(resolve);
        });
    }
}
