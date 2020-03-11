const HEX_SIZE = 4;
const HEX_W = Math.sqrt(3) * HEX_SIZE;
const HEX_H = 2 * HEX_SIZE;


const HEX_POINTS = [
    [0, 0.75 * HEX_H],
    [0.5 * HEX_W, HEX_H],
    [HEX_W, 0.75 * HEX_H],
    [HEX_W, 0.25 *HEX_H],
    [0.5 * HEX_W, 0],
    [0, 0.25 * HEX_H],
    [0, 0.75 * HEX_H],
]
const colors = ['darkred', 'darkblue', 'lightgreen', 'hotpink', 'brown', 'teal', 'grey'];
const addPillarRadius = 2;
export { HEX_SIZE, HEX_W, HEX_H, HEX_POINTS, addPillarRadius, colors};
