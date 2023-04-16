// export function Logger(...items: any) {
//     const unknown = "Unnamed entity";
//     console.log(`[${this.name || unknown}]:`, ...items);
// }

import { Point } from "../types";

export const angleBetween = (a: Point, b: Point) => {
    return Math.atan2(a.y - b.y, a.x - b.x);
};

export const distanceBetween = (a: Point, b: Point) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const toDegrees = (rad: number) => {
    return rad * (180 / Math.PI);
};

export const HALF_SCREEN_WIDTH = innerWidth / 2;
export const HALF_SCREEN_HEIGHT = innerHeight / 2;
