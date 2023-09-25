/**
 * Compatibility layer for zumen object
 * TODO: inline them and remove this file and zumen object
 */
import { IPlaceFormat } from "json-kifu-format/src/Formats";

export function cellEqual(cell: number, place?: IPlaceFormat, reverse = false) {
    if (!place) return false;

    return reverse ? cell === place.x - 1 + (8 - (place.y - 1)) * 9 : cell === 8 - (place.x - 1) + (place.y - 1) * 9;
}
