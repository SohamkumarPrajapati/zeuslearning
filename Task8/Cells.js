export class Cells {
    constructor(rowCount, columnCount) {
        this.noOfRows = rowCount;
        this.noOfColumns = columnCount;
        this.cells = new Map(); // stores cell values in form of (rowIndex, columnIndex) -> value, only stores the values that are not empty
    }

    setCellValue(rowIndex, columnIndex, value) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows || columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Row or column index out of bounds");
        }
        if (value === null || value === undefined || value === '') {
            this.cells.delete(`${rowIndex},${columnIndex}`); // remove the cell if the value is empty
        } else {
            this.cells.set(`${rowIndex},${columnIndex}`, value);
        }
    }

    getCellValue(rowIndex, columnIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows || columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Row or column index out of bounds");
        }
        return this.cells.get(`${rowIndex},${columnIndex}`) || ''; // return empty string if cell is not set
    }

    shiftCellsToNextRow(rowIndex) {
        this.noOfRows++;
        const newCells = new Map();
        for (const [key, value] of this.cells.entries()) {
            const [r, c] = key.split(',').map(Number);
            if (r >= rowIndex) {
                // Shift to next row
                newCells.set(`${r + 1},${c}`, value);
            } else {
                // Keep as is
                newCells.set(key, value);
            }
        }
        this.cells = newCells;
    }

    shiftCellsToNextColumn(colIndex) {
        this.noOfColumns++;
        const newCells = new Map();
        for (const [key, value] of this.cells.entries()) {
            const [r, c] = key.split(',').map(Number);
            if (c >= colIndex) {
                // Shift to next row
                newCells.set(`${r},${c + 1}`, value);
            } else {
                // Keep as is
                newCells.set(key, value);
            }
        }
        this.cells = newCells;
    }
}