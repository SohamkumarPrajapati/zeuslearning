import { MAX_ROWS, MAX_COLS } from './Constants.js';



/**
 * Manages cell, row, column, and range selections in the grid
 * Handles different types of selections and provides selection utilities
 */
export class Selection {
    constructor() {
        /** @type {number} Starting row index of the selection */
        this.startRow = -1;
        /** @type {number} Starting column index of the selection */
        this.startCol = -1;
        /** @type {number} Ending row index of the selection */
        this.endRow = -1;
        /** @type {number} Ending column index of the selection */
        this.endCol = -1;
        /** @type {string} Type of selection: 'none', 'cell', 'row', 'column', 'range' */
        this.type = 'cell';
    }

    /**
     * Clears the current selection and resets all selection properties
     */
    clear() {
        this.startRow = -1;
        this.startCol = -1;
        this.endRow = -1;
        this.endCol = -1;
        this.type = 'none';
    }

    /**
     * Sets selection to a single cell
     * @param {number} row - Row index of the cell
     * @param {number} col - Column index of the cell
     */
    setCell(row, col) {
        this.startRow = this.endRow = row;
        this.startCol = this.endCol = col;
        this.type = 'cell';
    }

    /**
     * Sets selection to a range of cells
     * @param {number} startRow - Starting row index
     * @param {number} startCol - Starting column index
     * @param {number} endRow - Ending row index
     * @param {number} endCol - Ending column index
     */
    setRange(startRow, startCol, endRow, endCol) {
        this.startRow = Math.min(startRow, endRow);
        this.startCol = Math.min(startCol, endCol);
        this.endRow = Math.max(startRow, endRow);
        this.endCol = Math.max(startCol, endCol);
        this.type = 'range';
    }

    /**
     * Sets selection to an entire row
     * @param {number} row - Row index to select
     */
    setRow(row) {
        this.startRow = this.endRow = row;
        this.startCol = 0;
        this.endCol = MAX_COLS - 1;
        this.type = 'row';
    }

    /**
     * Sets selection to an entire column
     * @param {number} col - Column index to select
     */
    setColumn(col) {
        this.startRow = 0;
        this.endRow = MAX_ROWS - 1;
        this.startCol = this.endCol = col;
        this.type = 'column';
    }

    /**
     * Checks if a specific cell is within the current selection
     * @param {number} row - Row index to check
     * @param {number} col - Column index to check
     * @returns {boolean} True if the cell is within the selection
     */
    contains(row, col) {
        return row >= this.startRow && row <= this.endRow &&
            col >= this.startCol && col <= this.endCol;
    }

    /**
     * Gets all selected cells with their values
     * @param {ExcelGrid} grid - Reference to the grid object
     * @returns {Array<Object>} Array of objects with row, col, and value properties
     */
    getSelectedCells(grid) {
        const cells = [];
        for (let r = this.startRow; r <= this.endRow; r++) {
            for (let c = this.startCol; c <= this.endCol; c++) {
                if (grid.isValidCell(r, c)) {
                    cells.push({ row: r, col: c, value: grid.getCellValue(r, c) });
                }
            }
        }
        return cells;
    }
}