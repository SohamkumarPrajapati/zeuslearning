export class Cells {
    /**
     * Constructs a Cells object.
     * @param {number} rowCount - The initial number of rows.
     * @param {number} columnCount - The initial number of columns.
     */
    constructor(rowCount, columnCount) {
        this.noOfRows = rowCount;
        this.noOfColumns = columnCount;
        this.cells = new Map(); // stores cell values in form of (rowIndex, columnIndex) -> value, only stores the values that are not empty
    }

    /**
     * Validates whether given cell indices are within bounds.
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    isValidCell(row, col) {
        return row >= 0 && row < this.noOfRows && col >= 0 && col < this.noOfColumns;
    }

    /**
     * Sets the value of a specific cell.
     * @param {number} rowIndex - The row index of the cell.
     * @param {number} columnIndex - The column index of the cell.
     * @param {string} value - The value to set in the cell.
     * @throws Will throw an error if the row or column index is out of bounds.
     */
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

    /**
     * Gets the value of a specific cell.
     * @param {number} rowIndex - The row index of the cell.
     * @param {number} columnIndex - The column index of the cell.
     * @returns {string} The value of the cell, or an empty string if not set.
     * @throws Will throw an error if the row or column index is out of bounds.
     */
    getCellValue(rowIndex, columnIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows || columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Row or column index out of bounds");
        }
        return this.cells.get(`${rowIndex},${columnIndex}`) || ''; // return empty string if cell is not set
    }

    /**
     * Shifts all cells at or below the given row index down by one row.
     * Increases the row count.
     * @param {number} rowIndex - The row index from which to start shifting.
     */
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

    /**
     * Shifts all cells at or after the given column index right by one column.
     * Increases the column count.
     * @param {number} colIndex - The column index from which to start shifting.
     */
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

    /**
     * deletes all the cells along the rowIndex row
     * @param {number} rowIndex 
     */
    deleteCellsOnRow(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        this.noOfRows--;
        const newCells = new Map();
        for (const [key, value] of this.cells.entries()) {
            const [r, c] = key.split(',').map(Number);
            if (r < rowIndex) {
                // Rows above: keep as is
                newCells.set(key, value);
            } else if (r > rowIndex) {
                // Rows below: shift up by one
                newCells.set(`${r - 1},${c}`, value);
            }
            // Row to delete (r === rowIndex): skip (delete)
        }
        this.cells = newCells;
    }

    /**
     * delets all the cells along the particular column
     * @param {number} colIndex 
     */
    deleteCellsOnColumn(colIndex) {
        if (colIndex < 0 || colIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        this.noOfColumns--;
        const newCells = new Map();
        for (const [key, value] of this.cells.entries()) {
            const [r, c] = key.split(',').map(Number);
            if (c < colIndex) {
                // Columns to the left: keep as is
                newCells.set(key, value);
            } else if (c > colIndex) {
                // Columns to the right: shift left by one
                newCells.set(`${r},${c - 1}`, value);
            }
            // Column to delete (c === colIndex): skip (delete)
        }
        this.cells = newCells;
    }
}