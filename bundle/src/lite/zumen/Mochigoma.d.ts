import { IHandFormat } from "json-kifu-format/src/Formats";
import { FC } from "react";
interface IProps {
    v: number;
    kx: number;
    name?: string;
    hand: IHandFormat;
    leftCrowded?: boolean;
    reverse: boolean;
}
export declare const Mochigoma: FC<IProps>;
export {};
