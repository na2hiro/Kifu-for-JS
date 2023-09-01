import React from "react";
import KifuStore from "../../common/stores/KifuStore";
interface IProps {
    width: number;
    height: number;
    kifuStore: KifuStore;
}
declare const SettingsIcon: React.ForwardRefExoticComponent<IProps & React.RefAttributes<SVGSVGElement>>;
export default SettingsIcon;
