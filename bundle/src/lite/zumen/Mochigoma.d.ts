import { IHandFormat } from "json-kifu-format/src/Formats";
import { FC } from "react";
export declare const handToString: (hand: IHandFormat) => string;
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
