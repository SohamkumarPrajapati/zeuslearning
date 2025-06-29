import { DEFAULT_ROW_HEIGHT } from './Constants.js';

export class Rows {
    constructor(count) {
        this.noOfRows = count;
        this.alteredRows = new Map(); // stores the altered height of the row from default height in form of row index and height
        this.selectedRows = new Set();  // stores the selected rows in form of row index
    }

    setRowHeight(rowIndex, newHeight) {
        if(rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        else if (newHeight <= 0) {
            throw new Error("Row height must be greater than zero");
        }
        if(newHeight === DEFAULT_ROW_HEIGHT) {
            this.alteredRows.delete(rowIndex); // remove the row height if it is reset to default
            return;
        }
        // Set the new height for the row
        this.alteredRows.set(rowIndex, newHeight);
    }

    getRowHeight(rowIndex) {
        if(rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        return this.alteredRows.get(rowIndex) || DEFAULT_ROW_HEIGHT;
    }

    addRowSelection(rowIndex) {
        if(rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        this.selectedRows.add(rowIndex);
    }

    removeRowSelection(rowIndex) {
        if(rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        this.selectedRows.delete(rowIndex);
    }

    removeAllRowSelections() {
        this.selectedRows.clear(); // clear all selected rows
    }

    isRowSelected(rowIndex) {
        if(rowIndex < 0 || rowIndex >= this.noOfRows) {
            throw new Error("Row index out of bounds");
        }
        return this.selectedRows.has(rowIndex);
    }
}