import { Cell } from './Cell.js';
import { DEFAULT_ROW_HEIGHT } from './Constants.js';

/**
 * Represents a row in the Excel grid
 * Contains cells and manages row-specific properties
 */
export class Row {
    /**
     * Initializes a new Row object
     * @param {number} index - The row index (0-based)
     * @param {number} height - Height of the row in pixels (default: 25)
     */
    constructor(index, height = DEFAULT_ROW_HEIGHT) {
        /** @type {number} The zero-based index of this row */
        this.index = index;
        /** @type {number} Height of the row in pixels */
        this.height = height;
        /** @type {Map<number, Cell>} Map of column indices to Cell objects */
        this.cells = new Map();
        /** @type {boolean} Whether this row is currently selected */
        this.selected = false;
    }

    /**
     * Gets or creates a cell at the specified column index
     * @param {number} colIndex - The column index for the cell
     * @returns {Cell} The cell object at the specified column
     */
    getCell(colIndex) {
        if (!this.cells.has(colIndex)) {
            this.cells.set(colIndex, new Cell());
        }
        return this.cells.get(colIndex);
    }

    /**
     * Sets the value of a cell at the specified column index
     * @param {number} colIndex - The column index for the cell
     * @param {string} value - The value to set in the cell
     */
    setCell(colIndex, value) {
        const cell = this.getCell(colIndex);
        cell.setValue(value);
    }
}