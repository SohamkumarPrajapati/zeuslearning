import { MAX_ROWS, MAX_COLS } from './Constants.js';

/**
 * Manages cell, row, column, and range selections in the grid
 * Handles different types of selections and provides selection utilities
 */
export class Selection {
    constructor() {
        /** @type {number} Starting row index of the selection */
        this.startRow = 0;
        /** @type {number} Starting column index of the selection */
        this.startCol = 0;
        /** @type {number} Ending row index of the selection */
        this.endRow = 0;
        /** @type {number} Ending column index of the selection */
        this.endCol = 0;
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


export class SelectionManager {
    constructor() {
        this.selections = new Map();
        this.selectionCount = 0;
    }

    resetSelections() {
        this.selections.clear();
        this.selectionCount = 0;
    }

    /**
     * 
     * @param {row} row-rowIndex of selected cell 
     * @param {col} col- colIndex of selected cell
     */
    addSingleCellSelection(row, col) {
        let cellSelection = new Selection();
        cellSelection.setCell(row, col);
        this.selections.set(`${row},${col}`, cellSelection);
        this.selectionCount++;
    }

    addRowSelection(row) {
        let rowSelection = new Selection();
        rowSelection.setRow(row);
        this.selections.set(`${row},${-1}`, rowSelection);
        this.selectionCount++;
    }

    addColumnSelection(col) {
        let colSelection = new Selection();
        colSelection.setColumn(col);
        this.selections.set(`${-1},${col}`, colSelection);
        this.selectionCount++;
    }

    addRangeSelection(r1, c1, r2, c2) {
        let startRow = Math.min(r1, r2);
        let startCol = Math.min(c1, c2);
        let endRow = Math.max(r1, r2);
        let endCol = Math.max(c1, c2);

        // Find and merge overlapping/adjacent ranges
        let merged = false;
        let toDelete = [];
        for (let [key, selection] of this.selections.entries()) {
            let parsed = this.parseSelectionKey(key);
            if (parsed.type === 'range') {
                // Check for overlap or adjacency
                if (
                    !(endRow < parsed.startRow - 1 || startRow > parsed.endRow + 1 ||
                        endCol < parsed.startCol - 1 || startCol > parsed.endCol + 1)
                ) {
                    // Merge ranges
                    startRow = Math.min(startRow, parsed.startRow);
                    startCol = Math.min(startCol, parsed.startCol);
                    endRow = Math.max(endRow, parsed.endRow);
                    endCol = Math.max(endCol, parsed.endCol);
                    toDelete.push(key);
                    merged = true;
                }
            }
        }
        // Remove old overlapping/adjacent ranges
        for (let key of toDelete) {
            this.selections.delete(key);
            this.selectionCount--;
        }

        // Add the merged (or new) range
        let rangeSelection = new Selection();
        rangeSelection.setRange(startRow, startCol, endRow, endCol);
        let key = `${startRow},${startCol}:${endRow},${endCol}`;
        this.selections.set(key, rangeSelection);
        this.selectionCount++;
    }

    /**
     * remove the particular selection from map (row = -1 means row selection removal && col = -1 means col selection removal)
     * @param {rowIndex} row 
     * @param {colIndex} col 
     */
    removeSelection(row, col) {
        if (row == -1 && col == -1) {
            return;
        }

        for (let key of this.selections.keys()) {
            let [r, c] = key.split(',').map(Number);
            if (row == r && col == c) {
                this.selections.delete(key);
                this.selectionCount--;
                return;
            }
        }
    }

    getSelectedCells(grid) {
        let cells = [];

        for (let selection of this.selections.values()) {
            for (let r = selection.startRow; r <= selection.endRow; r++) {
                for (let c = selection.startCol; c <= selection.endCol; c++) {
                    if (grid.isValidCell(r, c)) {
                        cells.push({ row: r, col: c, value: grid.getCellValue(r, c) });  // HERE CELLS WITH ROW OR COLUMN SELECTION WILL NOT BE INCLUDED
                    }
                    else if (r == -1) {
                        for (let ro = 0; ro < grid.rows.noOfRows; ro++) {
                            cells.push({ row: ro, col: c, value: grid.getCellValue(ro, c) });
                        }
                    }
                    else if (c == -1) {
                        for (let co = 0; co < grid.columns.noOfColunns; co++) {
                            cells.push({ row: r, col: co, value: grid.getCellValue(r, co) });
                        }
                    }
                }
            }
        }

        return cells;
    }

    parseSelectionKey(key) {
        if (key.includes(':')) {
            // Range selection: "startRow,startCol:endRow,endCol"
            const [start, end] = key.split(':');
            const [startRow, startCol] = start.split(',').map(Number);
            const [endRow, endCol] = end.split(',').map(Number);
            return { type: 'range', startRow, startCol, endRow, endCol };
        } else {
            // Single cell, row, or column: "row,col"
            const [row, col] = key.split(',').map(Number);
            if (row === -1) return { type: 'column', col };
            if (col === -1) return { type: 'row', row };
            return { type: 'cell', row, col };
        }
    }

    /**
     * shift only those selections which have rowindex > argument rowIndex in function
     * @param {rowIndex} rowIndex 
     */
    shiftSelectionsTonextRow(rowIndex) {
        let newSelections = new Map();

        for (let [key, selection] of this.selections.entries()) {
            let parsedKey = this.parseSelectionKey(key);
            let [row, col] = key.split(',').map(Number);
            if (row > rowIndex) {
                selection.startRow++;
                selection.endRow++;
                newSelections.set(`${row + 1},${col}`, selection);
            }
            else {
                newSelections.set(key, selection);
            }
        }

        this.selections = newSelections;

    }

    /**
     * this will shift all selections right side from the colIndex to one step next selection will colIndex won't be included
     * @param {colIndex} colIndex 
     */
    shiftSelectionsToNextColumn(colIndex) {
        let newSelections = new Map();

        for (let [key, selection] of this.selections.entries()) {
            let [row, col] = key.split(',').map(Number);
            if (col > colIndex) {
                selection.startCol++;
                selection.endCol++;
                newSelections.set(`${row},${col + 1}`, selection);
            }
            else {
                newSelections.set(key, selection);
            }
        }

        this.selections = newSelections;
    }



}