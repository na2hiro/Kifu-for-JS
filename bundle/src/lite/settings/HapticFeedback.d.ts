import React from "react";
import KifuStore from "../../common/stores/KifuStore";
import UserSetting from "../../common/stores/UserSetting";
type Props = {
    kifuStore: KifuStore;
    userSetting: UserSetting;
};
declare const HapticFeedback: React.FC<Props>;
export default HapticFeedback;
