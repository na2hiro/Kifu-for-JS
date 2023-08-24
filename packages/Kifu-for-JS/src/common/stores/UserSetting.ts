import { autorun, observable, toJS } from "mobx";

const LOCALSTORAGE_KEY = "kifuforjs";

export default class UserSetting {
    @observable public hapticFeedback: boolean = true;

    private static instance: UserSetting | undefined;

    public static get() {
        if (!this.instance) {
            this.instance = new UserSetting();
        }
        return this.instance;
    }

    private constructor() {
        if (typeof localStorage !== "undefined") {
            try {
                const settings = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
                if (settings) {
                    this.hapticFeedback = settings.hapticFeedback;
                }
                return;
            } catch (e) {}
        }
    }

    persist() {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(toJS(this)));
    }
}

const userSetting = UserSetting.get();
autorun(() => {
    userSetting.persist();
});
