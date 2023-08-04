/**
 * Compatibility layer for zumen object
 * TODO: inline them and remove this file and zumen object
 */
import { IMoveMoveFormat, IPlaceFormat } from "json-kifu-format/src/Formats";

export function cellEqual(cell: number, place?: IPlaceFormat) {
    return place ? cell === 8 - (place.x - 1) + (place.y - 1) * 9 : false;
}
