import { Constants } from './Constants.js';
import { ExcelGrid } from './ExcelGrid.js';

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
        this.endCol = Constants.MAX_COLS - 1;
        this.type = 'row';
    }

    /**
     * Sets selection to an entire column
     * @param {number} col - Column index to select
     */
    setColumn(col) {
        this.startRow = 0;
        this.endRow = Constants.MAX_ROWS - 1;
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
                if (grid.cells.isValidCell(r, c)) {
                    cells.push({ row: r, col: c, value: grid.cells.getCellValue(r, c) });
                }
            }
        }
        return cells;
    }

    /**
     * draws selection on screen (canvas)
     * @param {ExcelGrid} grid 
     */
    drawSelection(grid) {

        grid.ctx.strokeStyle = '#107c41';
        grid.ctx.lineWidth = 1.5;
        grid.ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        let drawBorders = true;
        
        const startX = grid.getColumnPosition(this.startCol);
        const startY = grid.getRowPosition(this.startRow);
        const endX = grid.getColumnPosition(this.endCol + 1);
        const endY = grid.getRowPosition(this.endRow + 1);

        const x = Math.max(grid.rowHeaderWidth, startX);
        const y = Math.max(grid.colHeaderHeight, startY);
        const width = Math.min(grid.canvas.width, endX) - x;
        const height = Math.min(grid.canvas.height, endY) - y;

        if (width > 0 && height > 0) {
            grid.ctx.fillRect(x, y, width, height);
            if (drawBorders) { grid.ctx.strokeRect(x, y, width, height); }
        }

        if (this.type !== 'row' && this.type !== 'column') {
            for (let i = this.startCol; i <= this.endCol; i++) {
                grid.highlightCellHeaders(this.startRow, i);
            }
            for (let i = this.startRow; i <= this.endRow; i++) {
                grid.highlightCellHeaders(i, this.startCol);
            }
        }

        if (this.type === 'row') {
            grid.insertRowUpBtn.disabled = false;
            grid.insertRowDownBtn.disabled = false;
        }

        if (this.type === 'column') {
            grid.insertColumnLeftBtn.disabled = false;
            grid.insertColumnRightBtn.disabled = false;
        }

        // ...existing code for drawing selection...

        // Enable/disable delete buttons based on selection
        const rowIsSelected = this.type === 'row';
        const columnIsSelected = this.type === 'column';
        grid.deleteRowBtn.disabled = !rowIsSelected;
        grid.deleteColumnBtn.disabled = !columnIsSelected;

    }
}


export class SelectionManager {
    constructor() {
        this.selection = null; // Only one selection at a time
    }

    resetSelections() {
        this.selection = null;
    }

    addSingleCellSelection(row, col) {
        this.selection = new Selection();
        this.selection.setCell(row, col);
        return this.selection;
    }

    addRowSelection(row, endRow = row) {
        this.selection = new Selection();
        this.selection.setRow(row);
        return this.selection;
    }

    addColumnSelection(col) {
        this.selection = new Selection();
        this.selection.setColumn(col);
        return this.selection;
    }

    addRangeSelection(r1, c1, r2, c2) {
        let startRow = Math.min(r1, r2);
        let startCol = Math.min(c1, c2);
        let endRow = Math.max(r1, r2);
        let endCol = Math.max(c1, c2);

        this.selection = new Selection();
        this.selection.setRange(startRow, startCol, endRow, endCol);
        return this.selection;
    }

    getColumnSelection(col) {
        if (this.selection && this.selection.type === 'column' && this.selection.startCol === col) {
            return this.selection;
        }
        return null;
    }

    getRowSelection(row) {
        if (this.selection && this.selection.type === 'row' && this.selection.startRow === row) {
            return this.selection;
        }
        return null;
    }

    getSelectedCells(grid) {
        if (!this.selection) return [];
        return this.selection.getSelectedCells(grid);
    }

    isColumnSelected(colIndex) {
        return this.selection && this.selection.type === 'column' && this.selection.startCol === colIndex;
    }

    isRowSelected(rowIndex) {
        return this.selection && this.selection.type === 'row' && this.selection.startRow === rowIndex;
    }
}