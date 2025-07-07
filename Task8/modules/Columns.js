import { DEFAULT_COLUMN_WIDTH } from './Constants.js';
/**
 * Class representing the columns of the grid, including their widths and selection state.
 */
export class Columns {
    /**
     * Constructs a Columns object.
     * @param {number} count - The initial number of columns.
     */
    constructor(count) {
        this.noOfColumns = count;
        this.alteredWidths = new Map(); // stores the altered width of the column from default width in form of column index and width
    }

    /**
     * Sets the width of a specific column.
     * @param {number} columnIndex - The index of the column.
     * @param {number} newWidth - The new width to set.
     * @throws Will throw an error if the column index is out of bounds or newWidth is not positive.
     */
    setColumnWidth(columnIndex, newWidth) {
        if (columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        else if (newWidth <= 0) {
            throw new Error("Column width must be greater than zero");
        }
        if (newWidth === DEFAULT_COLUMN_WIDTH) {
            this.alteredWidths.delete(columnIndex); // remove the column width if it is reset to default
            return;
        }
        // Set the new width for the column
        this.alteredWidths.set(columnIndex, newWidth);
    }

    /**
     * Gets the width of a specific column.
     * @param {number} columnIndex - The index of the column.
     * @returns {number} The width of the column.
     * @throws Will throw an error if the column index is out of bounds.
     */
    getColumnWidth(columnIndex) {
        // if (columnIndex < 0 || columnIndex >= this.noOfColumns) {
        //     throw new Error("Column index out of bounds");
        // }
        return this.alteredWidths.get(columnIndex) || DEFAULT_COLUMN_WIDTH;
    }

    /**
     * Gets the column name (A, B, C, ...).
     * @param {number} columnIndex - The index of the column.
     * @returns {string} The column name.
     * @throws Will throw an error if the column index is out of bounds.
     */
    getColumnName(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        // Convert column index to column name (A, B, C, ...)
        let name = '';
        let index = columnIndex;
        while (index >= 0) {
            name = String.fromCharCode((index % 26) + 65) + name; // 65 is ASCII code for 'A'
            index = Math.floor(index / 26) - 1; // Adjust for zero-based index
        }
        return name;
    }

    /**
     * Inserts a new column to the left of the specified column index.
     * Shifts altered column widths and selected columns accordingly.
     * @param {number} colIndex - The index to the right of which to insert the new column.
     * @throws Will throw an error if the column index is out of bounds.
     */
    insertColumnLeft(colIndex) {
        if (colIndex < 0 || colIndex > this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }

        // Increase the column count
        this.noOfColumns++;

        // Shift alteredWidths for columns >= colIndex
        const newAlteredWidths = new Map();
        for (const [idx, width] of this.alteredWidths.entries()) {
            if (idx >= colIndex) {
                newAlteredWidths.set(idx + 1, width);
            } else {
                newAlteredWidths.set(idx, width);
            }
        }
        this.alteredWidths = newAlteredWidths;
    }

    /**
     * Inserts a new column to the right of the specified column index.
     * Shifts altered column widths and selected columns accordingly.
     * @param {number} colIndex - The index to the left of which to insert the new column.
     * @throws Will throw an error if the column index is out of bounds.
     */
    insertColumnRight(colIndex) {
        if (colIndex < 0 || colIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }

        // Increase the column count
        this.noOfColumns++;

        // Shift alteredWidths for columns > colIndex
        const newAlteredWidths = new Map();
        for (const [idx, width] of this.alteredWidths.entries()) {
            if (idx > colIndex) {
                newAlteredWidths.set(idx + 1, width);
            } else {
                newAlteredWidths.set(idx, width);
            }
        }
        this.alteredWidths = newAlteredWidths;
    }


    /**
     * deletes the column with column index from the canvas
     * @param {number} colIndex 
     */
    deleteColumn(colIndex) {
        if (colIndex < 0 || colIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }

        // Decrease the column count
        this.noOfColumns--;

        // Remove altered width for the deleted column
        this.alteredWidths.delete(colIndex);

        // Shift alteredWidths for columns > colIndex
        const newAlteredWidths = new Map();
        for (const [idx, width] of this.alteredWidths.entries()) {
            if (idx > colIndex) {
                newAlteredWidths.set(idx - 1, width);
            } else if (idx < colIndex) {
                newAlteredWidths.set(idx, width);
            }
        }
        this.alteredWidths = newAlteredWidths;
    }


}