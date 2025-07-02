import { DEFAULT_ROW_HEIGHT } from './Constants.js';

export class Rows {
    /**
     * Constructs a Rows object.
     * @param {number} count - The initial number of rows.
     */
    constructor(count) {
        this.noOfRows = count;
        this.alteredRows = new Map(); // stores the altered height of the row from default height in form of row index and height
        this.selectedRows = new Set();  // stores the selected rows in form of row index
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
     * Adds a row to the set of selected rows.
     * @param {number} rowIndex - The index of the row to select.
     * @throws Will throw an error if the row index is out of bounds.
     */
    addRowSelection(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        this.selectedRows.add(rowIndex);
    }

    /**
     * Removes a row from the set of selected rows.
     * @param {number} rowIndex - The index of the row to deselect.
     * @throws Will throw an error if the row index is out of bounds.
     */
    removeRowSelection(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        this.selectedRows.delete(rowIndex);
    }

    /**
     * Removes all row selections.
     */
    removeAllRowSelections() {
        this.selectedRows.clear(); // clear all selected rows
    }

    /**
     * Checks if a row is selected.
     * @param {number} rowIndex - The index of the row.
     * @returns {boolean} True if the row is selected, false otherwise.
     * @throws Will throw an error if the row index is out of bounds.
     */
    isRowSelected(rowIndex) {
        if (rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        return this.selectedRows.has(rowIndex);
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

        // Shift selectedRows for rows >= rowIndex
        const newSelectedRows = new Set();
        for (const idx of this.selectedRows) {
            if (idx >= rowIndex) {
                newSelectedRows.add(idx + 1);
            } else {
                newSelectedRows.add(idx);
            }
        }
        this.selectedRows = newSelectedRows;
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

        // Shift selectedRows for rows > rowIndex
        const newSelectedRows = new Set();
        for (const idx of this.selectedRows) {
            if (idx > rowIndex) {
                newSelectedRows.add(idx + 1);
            } else {
                newSelectedRows.add(idx);
            }
        }
        this.selectedRows = newSelectedRows;
    }
}