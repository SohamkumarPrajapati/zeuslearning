import { DEFAULT_ROW_HEIGHT } from './Constants.js';

export class Rows {
    /**
     * Constructs a Rows object.
     * @param {number} count - The initial number of rows.
     */
    constructor(count) {
        this.noOfRows = count;
        this.alteredRows = new Map(); // stores the altered height of the row from default height in form of row index and height
    }

    /**
     * Sets the height of a specific row.
     * @param {number} rowIndex - The index of the row.
     * @param {number} newHeight - The new height to set.
     * @throws Will throw an error if the row index is out of bounds or newHeight is not positive.
     */
    setRowHeight(rowIndex, newHeight) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        else if (newHeight <= 0) {
            throw new Error("Row height must be greater than zero");
        }
        if (newHeight === DEFAULT_ROW_HEIGHT) {
            this.alteredRows.delete(rowIndex); // remove the row height if it is reset to default
            return;
        }
        // Set the new height for the row
        this.alteredRows.set(rowIndex, newHeight);
    }

    /**
     * Gets the height of a specific row.
     * @param {number} rowIndex - The index of the row.
     * @returns {number} The height of the row.
     * @throws Will throw an error if the row index is out of bounds.
     */
    getRowHeight(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        return this.alteredRows.get(rowIndex) || DEFAULT_ROW_HEIGHT;
    }

    /**
     * Inserts a new row above the specified row index.
     * Shifts altered row heights and selected rows accordingly.
     * @param {number} rowIndex - The index above which to insert the new row.
     * @throws Will throw an error if the row index is out of bounds.
     */
    insertRowUp(rowIndex) {
        if (rowIndex < 0 || rowIndex > this.noOfRows) {
            throw new Error("Row index out of bounds");
        }

        // Increase the row count
        this.noOfRows++;

        // Shift alteredRows for rows >= rowIndex
        const newAlteredRows = new Map();
        for (const [idx, height] of this.alteredRows.entries()) {
            if (idx >= rowIndex) {
                newAlteredRows.set(idx + 1, height);
            } else {
                newAlteredRows.set(idx, height);
            }
        }
        this.alteredRows = newAlteredRows;
    }

    /**
     * Inserts a new row below the specified row index.
     * Shifts altered row heights and selected rows accordingly.
     * @param {number} rowIndex - The index below which to insert the new row.
     * @throws Will throw an error if the row index is out of bounds.
     */
    insertRowDown(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }

        // Increase the row count
        this.noOfRows++;

        // Shift alteredRows for rows > rowIndex
        const newAlteredRows = new Map();
        for (const [idx, height] of this.alteredRows.entries()) {
            if (idx > rowIndex) {
                newAlteredRows.set(idx + 1, height);
            } else {
                newAlteredRows.set(idx, height);
            }
        }
        this.alteredRows = newAlteredRows;
    }

    /**
     * delete the row with the index rowIndex from canvas
     * @param {number} rowIndex 
     */
    deleteRow(rowIndex) {
    if (rowIndex < 0 || rowIndex >= this.noOfRows) {
        throw new Error("Row index out of bounds");
    }

    // Decrease the row count
    this.noOfRows--;

    this.alteredHeights?.delete(rowIndex);

    if (this.alteredHeights) {
        const newAlteredHeights = new Map();
        for (const [idx, height] of this.alteredHeights.entries()) {
            if (idx > rowIndex) {
                newAlteredHeights.set(idx - 1, height);
            } else if (idx < rowIndex) {
                newAlteredHeights.set(idx, height);
            }
        }
        this.alteredHeights = newAlteredHeights;
    }
}
}