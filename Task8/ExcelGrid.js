// ==========================
// Module Imports
// ==========================

/**
 * Import required classes from separate modules.
 */
import { Cells } from './Cells.js';
import { Rows } from './Rows.js';
import { Columns } from './Columns.js';
import { SelectionManager } from './Selection.js';
import { SetCellValueCommand, CommandManager } from './CommandManager.js';
import { MAX_COLS, MAX_ROWS } from './Constants.js';
import { EventHandler } from './EventHandler.js';

// ==========================
// ExcelGrid Class
// ==========================

/**
 * Main class representing the Excel-like grid component.
 */
export class ExcelGrid {
    /**
     * Initializes a new ExcelGrid instance and sets up canvas, listeners, and initial render.
     * @param {HTMLCanvasElement} canvas - The canvas element to draw the grid on.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rows = new Rows(MAX_ROWS);
        this.columns = new Columns(MAX_COLS);
        this.cells = new Cells(MAX_ROWS, MAX_COLS);
        this.selectionManager = new SelectionManager();
        this.commandManager = new CommandManager(this);

        // UI/Viewport properties
        this.rowHeaderWidth = 60;
        this.colHeaderHeight = 30;
        this.scrollX = 0;
        this.scrollY = 0;

        // Cell editor setup
        this.cellEditor = document.getElementById('cellEditor');
        this.editingCell = null;

        
        //Row Column Insertion
        this.insertRowUpBtn = document.getElementById('insertRowUpBtn');
        this.insertRowDownBtn = document.getElementById('insertRowDownBtn');
        this.insertColumnLeftBtn = document.getElementById('insertColumnLeftBtn');
        this.insertColumnRightBtn = document.getElementById('insertColumnRightBtn');
        
        this.initializeCanvas();
        // Eventhandler initialization
        this.eventHandler = new EventHandler(this);
        this.render();
    }

    /**
    * Sets canvas resolution and applies device pixel ratio scaling for sharper rendering.
    */
    initializeCanvas() {
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = container.clientWidth * dpr;
        this.canvas.height = container.clientHeight * dpr;
        this.ctx.scale(dpr, dpr);
    }

    

    /**
     * Gets a cell's value.
     * @param {number} row - Row index.
     * @param {number} col - Column index.
     * @returns {string}
     */
    getCellValue(row, col) {
        if (!this.isValidCell(row, col)) return '';
        return this.cells.getCellValue(row, col);
    }

    /**
     * Sets a cell's value.
     * @param {number} row - Row index.
     * @param {number} col - Column index.
     * @param {string} value - Value to set.
     */
    setCellValue(row, col, value) {
        if (!this.isValidCell(row, col)) return;
        this.cells.setCellValue(row, col, value);
    }

    /**
     * Validates whether given cell indices are within bounds.
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    isValidCell(row, col) {
        return row >= 0 && row < this.rows.noOfRows && col >= 0 && col < this.columns.noOfColumns;
    }

    /**
     * Sets a column's width.
     * @param {number} colIndex
     * @param {number} width
     */
    setColumnWidth(colIndex, width) {
        this.columns.setColumnWidth(colIndex, width);
        // this.render();
    }
    /**
     * Sets a row's height.
     * @param {number} rowIndex
     * @param {number} height
     */
    setRowHeight(rowIndex, height) {
        this.rows.setRowHeight(rowIndex, height);
        // this.render();
    }
    /**
     * Gets the X pixel position of a column.
     * @param {number} colIndex
     * @returns {number}
     */
    getColumnPosition(colIndex) {
        let x = this.rowHeaderWidth - this.scrollX;
        for (let i = 0; i < colIndex; i++) {
            const colWidth = this.columns.getColumnWidth(i);
            x += colWidth;
        }
        return x;
    }
    /**
     * Gets the Y pixel position of a row.
     * @param {number} rowIndex
     * @returns {number}
     */
    getRowPosition(rowIndex) {
        let y = this.colHeaderHeight - this.scrollY;
        for (let i = 0; i < rowIndex; i++) {
            const rowHeight = this.rows.getRowHeight(i);
            y += rowHeight;
        }
        return y;
    }
    /**
     * Converts screen x/y to cell {row, col} object.
     * @param {number} x
     * @param {number} y
     * @returns {{row: number, col: number} | null}
     */
    getCellAtPosition(x, y) {
        if (x < this.rowHeaderWidth || y < this.colHeaderHeight) {
            return null;
        }

        let col = -1, row = -1;
        let currentX = this.rowHeaderWidth - this.scrollX;

        for (let i = 0; i < this.columns.noOfColumns; i++) {
            const columnWidth = this.columns.getColumnWidth(i);
            if (x >= currentX && x < currentX + columnWidth) {
                col = i;
                break;
            }
            currentX += columnWidth;
        }

        let currentY = this.colHeaderHeight - this.scrollY;
        for (let i = 0; i < this.rows.noOfRows; i++) {
            const rowHeight = this.rows.getRowHeight(i);
            if (y >= currentY && y < currentY + rowHeight) {
                row = i;
                break;
            }
            currentY += rowHeight;
        }

        return (row >= 0 && col >= 0) ? { row, col } : null;
    }

    /**
     * Renders the grid on the canvas.
     */
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#bdbdbd';
        this.ctx.lineWidth = 0.3;
        this.ctx.textBaseline = 'middle';

        this.drawGridCells();
        this.drawColumnHeader();
        this.drawRowHeader();
        this.drawTopLeftCorner();
        this.drawSelection();

        if (this.editingCell) {
            this.stopEditing();
        }
        this.updateStats();
    }

    /**
     * drawing the grid cells on the canvas
     */
    drawGridCells() {
        let x = this.rowHeaderWidth;
        let colIndex = this.getColumnAtPosition(x);
        x = this.getColumnPosition(colIndex);
        let columnIteartor = colIndex;
        while (x < this.canvas.width) {

            let y = this.colHeaderHeight;
            let colWidth = this.columns.getColumnWidth(columnIteartor);
            let rowIndex = this.getRowAtPosition(y);
            y = this.getRowPosition(rowIndex);
            let rowIterator = rowIndex;
            while (y < this.canvas.height) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x, y, colWidth, this.rows.getRowHeight(rowIterator));

                this.ctx.beginPath();
                this.ctx.strokeStyle = 'grey';
                this.ctx.moveTo(x, y);                   // Top
                this.ctx.lineTo(x + colWidth, y);
                this.ctx.moveTo(x + colWidth, y);           // Right
                this.ctx.lineTo(x + colWidth, y + this.rows.getRowHeight(rowIterator));
                this.ctx.stroke();

                const value = this.getCellValue(rowIterator, columnIteartor);
                if (value) {
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.font = '14px Arial';
                    this.ctx.textAlign = 'left';
                    this.ctx.fillText(value.toString().substring(0, 15), x + 5, y + this.rows.getRowHeight(rowIterator) / 2);
                }
                y += this.rows.getRowHeight(rowIterator);
                rowIterator++;
            }
            columnIteartor++;
            x += colWidth;

        }
    }

    /**
     * drawing the header section of the columns
     */
    drawColumnHeader() {
        let x = this.rowHeaderWidth;
        let y = 0;
        let colIndex = this.getColumnAtPosition(x);
        x = this.getColumnPosition(colIndex);
        let iterationIndex = colIndex;
        while (x < this.canvas.width) {
            let colWidth = this.columns.getColumnWidth(iterationIndex);
            this.ctx.fillStyle = this.selectionManager.isColumnSelected(iterationIndex) ? '#107c41' : '#ecf0f1';
            this.ctx.fillRect(x, y, colWidth, this.colHeaderHeight);

            this.ctx.beginPath();
            this.ctx.moveTo(x, y + this.colHeaderHeight);                   // Top
            this.ctx.lineTo(x + colWidth, y + this.colHeaderHeight);
            this.ctx.moveTo(x + colWidth, y);           // Right
            this.ctx.lineTo(x + colWidth, y + this.colHeaderHeight);
            this.ctx.stroke();

            this.ctx.fillStyle = (this.selectionManager.isColumnSelected(iterationIndex)) ? 'white' : '#616161';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.columns.getColumnName(iterationIndex) || '', x + colWidth / 2, y + this.colHeaderHeight / 2);
            x += colWidth;
            iterationIndex++;
        }
    }

    /**
     * drawing the header section for rows
     */
    drawRowHeader() {
        let x = 0;
        let y = this.colHeaderHeight;
        let rowIndex = this.getRowAtPosition(y);
        y = this.getRowPosition(rowIndex);
        let iterationIndex = rowIndex;
        while (y < this.canvas.height) {
            let rowHeight = this.rows.getRowHeight(iterationIndex);
            this.ctx.fillStyle = this.selectionManager.isRowSelected(iterationIndex) ? '#107c41' : '#f5f5f5';
            this.ctx.fillRect(x, y, this.rowHeaderWidth, rowHeight);

            this.ctx.beginPath();
            this.ctx.moveTo(x, y);                  // Left
            this.ctx.lineTo(x, y + rowHeight);
            this.ctx.moveTo(x, y + rowHeight);         // Bottom
            this.ctx.lineTo(x + this.rowHeaderWidth, y + rowHeight);
            this.ctx.stroke();

            this.ctx.fillStyle = this.selectionManager.isRowSelected(iterationIndex) ? 'white' : '#616161';
            this.ctx.font = '15px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((iterationIndex + 1).toString(), x + this.rowHeaderWidth / 2, y + rowHeight / 2);
            y += rowHeight;
            iterationIndex++;
        }
    }

    /**
     * drawing top-right corner cell
     */
    drawTopLeftCorner() {
        let x = 0;
        let y = 0;
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.fillRect(x, y, this.rowHeaderWidth, this.colHeaderHeight);
    }

    /**
     * Draws the current selection rectangle on the canvas.
     */
    drawSelection() {
        if (this.selectionManager.selectionCount === 0) return;


        let selections = this.selectionManager.selections;
        for (let selection of selections.values()) {
            selection.drawSelection(this);
        }
    }

    /**
     * Updates the statistics display based on the current selection.
     */
    updateStats() {
        const stats = document.getElementById('stats');
        if (this.selectionManager.selectionCount === 0) {
            stats.textContent = '';
            return;
        }

        const cells = this.selectionManager.getSelectedCells(this);
        const numericCells = cells.filter(cell => !isNaN(parseFloat(cell.value)) && isFinite(cell.value));

        if (numericCells.length === 0) {
            stats.textContent = `Count: ${cells.length}`;
            return;
        }

        const values = numericCells.map(cell => parseFloat(cell.value));
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        stats.textContent = `Count: ${cells.length} | Sum: ${sum.toFixed(2)} | Avg: ${avg.toFixed(2)} | Min: ${min} | Max: ${max}`;
    }

    getCellAtPositionClamped(x, y) {
        // Clamp x/y to the grid area
        let col = -1, row = -1;

        // Clamp column
        if (x < this.rowHeaderWidth) {
            col = 0;
        } else {
            let currentX = this.rowHeaderWidth - this.scrollX;
            for (let i = 0; i < this.columns.noOfColumns; i++) {
                const columnWidth = this.columns.getColumnWidth(i);
                if (x >= currentX && x < currentX + columnWidth) {
                    col = i;
                    break;
                }
                currentX += columnWidth;
            }
            if (col === -1) col = this.columns.noOfColumns - 1; // Clamp to last column
        }

        // Clamp row
        if (y < this.colHeaderHeight) {
            row = 0;
        } else {
            let currentY = this.colHeaderHeight - this.scrollY;
            for (let i = 0; i < this.rows.noOfRows; i++) {
                const rowHeight = this.rows.getRowHeight(i);
                if (y >= currentY && y < currentY + rowHeight) {
                    row = i;
                    break;
                }
                currentY += rowHeight;
            }
            if (row === -1) row = this.rows.noOfRows - 1; // Clamp to last row
        }

        return (row >= 0 && col >= 0) ? { row, col } : null;
    }

    /**
     * Returns the column index at a given x coordinate.
     * @param {number} x
     * @returns {number} - Column index or -1 if not found.
     */
    getColumnAtPosition(x) {
        let currentX = this.rowHeaderWidth - this.scrollX;
        for (let i = 0; i < this.columns.noOfColumns; i++) {
            const columnWidth = this.columns.getColumnWidth(i);
            if (x >= currentX && x < currentX + columnWidth) {
                return i;
            }
            currentX += columnWidth;
        }
        return -1;
    }

    /**
     * Returns the row index at a given y-coordinate.
     * @param {number} y - The y-position in pixels.
     * @returns {number} - The row index or -1 if not found.
     */
    getRowAtPosition(y) {
        let currentY = this.colHeaderHeight - this.scrollY;
        for (let i = 0; i < this.rows.noOfRows; i++) {
            const rowHeight = this.rows.getRowHeight(i);
            if (y >= currentY && y < currentY + rowHeight) {
                return i;
            }
            currentY += rowHeight;
        }
        return -1;
    }

    /**
     * Begins editing the specified cell by showing the input editor.
     * @param {number} row - Row index of the cell.
     * @param {number} col - Column index of the cell.
     */
    startEditing(row, col) {
        this.editingCell = { row, col };
        const value = this.getCellValue(row, col);

        const x = this.getColumnPosition(col);
        const y = this.getRowPosition(row);
        const columnWidth = this.columns.getColumnWidth(col);
        const rowHeight = this.rows.getRowHeight(row);

        this.cellEditor.style.left = x - 1 + 'px';
        this.cellEditor.style.top = y - 1 + 'px';
        this.cellEditor.style.width = columnWidth + 'px';
        this.cellEditor.style.height = rowHeight + 'px';
        this.cellEditor.style.display = 'block';
        this.cellEditor.value = value;
        this.cellEditor.readOnly = false;

        this.cellEditor.focus();
        // this.cellEditor.select();
    }

    /**
     * highlight the selected cells row header cell and column header cell
     * @param {number} rowIndex - RowIndex of the cell 
     * @param {number} colIndex - ColIndex of the cell
     */
    highlightCellHeaders(rowIndex, colIndex) {
        //highlight row and column header of selected cell
        let xRow = 0;
        let yRow = this.getRowPosition(rowIndex);
        let rowHeight = this.rows.getRowHeight(rowIndex);
        let xCol = this.getColumnPosition(colIndex);
        let yCol = 0;
        let colWidth = this.columns.getColumnWidth(colIndex);

        this.ctx.fillStyle = '#caead8';
        this.ctx.fillRect(xRow, yRow, this.rowHeaderWidth, rowHeight);
        this.ctx.fillRect(xCol, yCol, colWidth, this.colHeaderHeight);
        this.ctx.beginPath();
        this.ctx.moveTo(xRow + this.rowHeaderWidth, yRow);
        this.ctx.lineTo(xRow + this.rowHeaderWidth, yRow + rowHeight);
        this.ctx.moveTo(xCol, yCol + this.colHeaderHeight);
        this.ctx.lineTo(xCol + colWidth, yCol + this.colHeaderHeight);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#107c41';
        this.ctx.stroke();

        this.ctx.fillStyle = '#1b703b';
        this.ctx.font = '15px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.columns.getColumnName(colIndex) || '', xCol + colWidth / 2, yCol + this.colHeaderHeight / 2);
        this.ctx.fillText(rowIndex + 1, xRow + this.rowHeaderWidth / 2, yRow + rowHeight / 2);

    }

    /**
     * Stops editing and applies changes using a command (for undo/redo support).
     */
    stopEditing() {
        if (!this.editingCell) return;

        const oldValue = this.getCellValue(this.editingCell.row, this.editingCell.col);
        const newValue = this.cellEditor.value;
        if (oldValue !== newValue) {
            const command = new SetCellValueCommand(
                this, this.editingCell.row, this.editingCell.col, newValue, oldValue
            );
            this.commandManager.executeCommand(command);
        }

        this.cellEditor.style.display = 'none';
        this.editingCell = null;
        this.render();
    }

    /**
     * Cancels editing without saving any changes.
     */
    cancelEditing() {
        this.cellEditor.style.display = 'none';
        this.editingCell = null;
    }

    /**
     * Loads data from a JSON file and populates the grid.
     * The file should contain an array of objects.
     * @param {File} file - The uploaded JSON file.
     */
    async loadJSONFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!Array.isArray(data)) {
                alert('JSON file must contain an array of objects');
                return;
            }

            if (data.length === 0) {
                alert('JSON file is empty');
                return;
            }

            // Get column headers from first object
            const headers = Object.keys(data[0]);

            // Set column headers
            for (let i = 0; i < headers.length; i++) {
                const value = headers[i];
                this.setCellValue(0, i, value !== undefined ? value.toUpperCase() : '');
            }

            // Load data
            let recordCount = 0;
            for (let rowIndex = 1; recordCount < data.length && rowIndex < this.rows.noOfRows; rowIndex++) {
                const record = data[recordCount++];
                for (let colIndex = 0; colIndex < headers.length && colIndex < this.columns.noOfColumns; colIndex++) {
                    const value = record[headers[colIndex]];
                    this.setCellValue(rowIndex, colIndex, value !== undefined ? value : '');
                }
            }

            this.render();
            console.log(`Loaded ${data.length} records with ${headers.length} columns`);

        } catch (error) {
            console.error('Error loading JSON file:', error);
            alert('Error loading JSON file: ' + error.message);
        }
    }
}