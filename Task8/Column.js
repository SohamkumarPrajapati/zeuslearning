import { DEFAULT_COLUMN_WIDTH } from './Constants.js';

/**
 * Represents a column in the Excel grid
 * Manages column properties including width and selection state
 */
export class Column {
    /**
     * Initializes a new Column object
     * @param {number} index - The column index (0-based)
     * @param {number} width - Width of the column in pixels (default: 100)
     */
    constructor(index, width = DEFAULT_COLUMN_WIDTH) {
        /** @type {number} The zero-based index of this column */
        this.index = index;
        /** @type {number} Width of the column in pixels */
        this.width = width;
        /** @type {boolean} Whether this column is currently selected */
        this.selected = false;
        /** @type {string} The Excel-style name of the column (A, B, C, etc.) */
        this.name = this.getColumnName(index);
    }

    /**
     * Converts a numeric column index to Excel-style column name
     * @param {number} index - The zero-based column index
     * @returns {string} The Excel-style column name (A, B, C, ..., AA, AB, etc.)
     */
    getColumnName(index) {
        let name = '';
        while (index >= 0) {
            name = String.fromCharCode(65 + (index % 26)) + name;
            index = Math.floor(index / 26) - 1;
        }
        return name;
    }
}
