export default class UserSetting {
    static get(): UserSetting;
    private static instance;
    hapticFeedback: boolean;
    private constructor();
    persist(): void;
}
