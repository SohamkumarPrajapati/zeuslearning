import { DEFAULT_COLUMN_WIDTH } from './Constants.js';

export class Columns {
    constructor(count) {
        this.noOfColumns = count;
        this.alteredWidths = new Map(); // stores the altered width of the column from default width in form of column index and width
        this.selectedColumns = new Set();  // stores the selected columns in form of column index
    }

    setColumnWidth(columnIndex, newWidth) {
        if(columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        else if (newWidth <= 0) {
            throw new Error("Column width must be greater than zero");
        }
        if(newWidth === DEFAULT_COLUMN_WIDTH) {
            this.alteredWidths.delete(columnIndex); // remove the column width if it is reset to default
            return;
        }
        // Set the new width for the column
        this.alteredWidths.set(columnIndex, newWidth);
    }

    getColumnWidth(columnIndex) {
        if(columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        return this.alteredWidths.get(columnIndex) || DEFAULT_COLUMN_WIDTH;
    }

    addColumnSelection(columnIndex) {
        if(columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        this.selectedColumns.add(columnIndex);
    }

    removeColumnSelection(columnIndex) {
        if(columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        this.selectedColumns.delete(columnIndex);
    }

    removeAllColumnSelections() {
        this.selectedColumns.clear(); // clear all selected columns
    }

    isColumnSelected(columnIndex) {
        if(columnIndex < 0 || columnIndex >= this.noOfColumns) {
            throw new Error("Column index out of bounds");
        }
        return this.selectedColumns.has(columnIndex);
    }

    getColumnName(columnIndex) {
        if(columnIndex < 0 || columnIndex >= this.noOfColumns) {
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
}