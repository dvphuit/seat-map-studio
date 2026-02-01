export const getRowLabel = (index: number) => {
    let label = '';
    let i = index;
    while (i >= 0) {
        label = String.fromCharCode((i % 26) + 65) + label;
        i = Math.floor(i / 26) - 1;
    }
    return label;
};

export const getSeatLabel = (x: number, y: number, gridSize: number = 50) => {
    const rowIndex = Math.round(y / gridSize) - 1;
    const colIndex = Math.round(x / gridSize);
    return `${getRowLabel(rowIndex)}-${colIndex}`;
};
