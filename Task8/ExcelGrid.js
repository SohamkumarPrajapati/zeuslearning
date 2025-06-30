// ==========================
// Module Imports
// ==========================

/**
 * Import required classes from separate modules.
 */
import { Cells } from './Cells.js';
import { Rows } from './Rows.js';
import { Columns } from './Columns.js';
import { Selection } from './Selection.js';
import { SetCellValueCommand, CommandManager } from './CommandManager.js';
import { ResizeColumnCommand } from './CommandManager.js';
import { ResizeRowCommand } from './CommandManager.js';
import { MAX_COLS, MAX_ROWS } from './Constants.js';

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
        this.selection = new Selection();
        this.commandManager = new CommandManager(this);

        // UI/Viewport properties
        this.rowHeaderWidth = 60;
        this.colHeaderHeight = 30;
        this.scrollX = 0;
        this.scrollY = 0;

        // Mouse interaction states
        this.mouseDown = false;
        this.resizing = false;
        this.resizeType = null; // 'row' or 'col'
        this.resizeIndex = -1;
        this.startX = 0;
        this.startY = 0;
        this.dragStart = null;

        // Cell editor setup
        this.cellEditor = document.getElementById('cellEditor');
        this.editingCell = null;

        //Row Column Insertion
        this.insertRowUpBtn = document.getElementById('insertRowUpBtn');
        this.insertRowDownBtn = document.getElementById('insertRowDownBtn');
        this.insertColumnLeftBtn = document.getElementById('insertColumnLeftBtn');
        this.insertColumnRightBtn = document.getElementById('insertColumnRightBtn');

        this.setupEventListeners();
        this.initializeCanvas();
        this.setupKeyboardListeners();
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
     * Listens for keyboard events like undo/redo and arrow key scrolling.
     */
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.editingCell) return;

            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // === Undo/Redo ===
            if (isCtrl && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (isShift) {
                    this.commandManager.redo();
                } else {
                    this.commandManager.undo();
                }
                return;
            }

            const scrollSpeed = 50;
            let shouldRender = false;
            // Scroll using arrow keys

            switch (e.key) {
                case 'ArrowRight':
                    this.scrollX += scrollSpeed;
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.scrollX = Math.max(0, this.scrollX - scrollSpeed);
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.scrollY += scrollSpeed;
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.scrollY = Math.max(0, this.scrollY - scrollSpeed);
                    shouldRender = true;
                    e.preventDefault();
                    break;
            }

            if (shouldRender) {
                this.render();
            }
        });
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
        this.render();
    }
    /**
     * Sets a row's height.
     * @param {number} rowIndex
     * @param {number} height
     */
    setRowHeight(rowIndex, height) {
        this.rows.setRowHeight(rowIndex, height);
        this.render();
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

        let x = 0;
        let y = 0;

        //drawing cells
        x = this.rowHeaderWidth;
        let colIndex = this.getColumnAtPosition(x);
        x = this.getColumnPosition(colIndex);
        let columnIteartor = colIndex;
        while (x < this.canvas.width) {

            y = this.colHeaderHeight;
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


        //drawing column header
        x = this.rowHeaderWidth;
        y = 0;
        colIndex = this.getColumnAtPosition(x);
        x = this.getColumnPosition(colIndex);
        let iterationIndex = colIndex;
        while (x < this.canvas.width) {
            let colWidth = this.columns.getColumnWidth(iterationIndex);
            this.ctx.fillStyle = this.columns.isColumnSelected(iterationIndex) ? '#107c41' : '#ecf0f1';
            this.ctx.fillRect(x, y, colWidth, this.colHeaderHeight);

            this.ctx.beginPath();
            this.ctx.moveTo(x, y + this.colHeaderHeight);                   // Top
            this.ctx.lineTo(x + colWidth, y + this.colHeaderHeight);
            this.ctx.moveTo(x + colWidth, y);           // Right
            this.ctx.lineTo(x + colWidth, y + this.colHeaderHeight);
            this.ctx.stroke();

            this.ctx.fillStyle = (this.columns.isColumnSelected(iterationIndex)) ? 'white' : '#616161';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.columns.getColumnName(iterationIndex) || '', x + colWidth / 2, y + this.colHeaderHeight / 2);
            x += colWidth;
            iterationIndex++;
        }


        //drawing row header
        x = 0;
        y = this.colHeaderHeight;
        let rowIndex = this.getRowAtPosition(y);
        y = this.getRowPosition(rowIndex);
        iterationIndex = rowIndex;
        while (y < this.canvas.height) {
            let rowHeight = this.rows.getRowHeight(iterationIndex);
            this.ctx.fillStyle = this.rows.isRowSelected(iterationIndex) ? '#107c41' : '#f5f5f5';
            this.ctx.fillRect(x, y, this.rowHeaderWidth, rowHeight);

            this.ctx.beginPath();
            this.ctx.moveTo(x, y);                  // Left
            this.ctx.lineTo(x, y + rowHeight);
            this.ctx.moveTo(x, y + rowHeight);         // Bottom
            this.ctx.lineTo(x + this.rowHeaderWidth, y + rowHeight);
            this.ctx.stroke();

            this.ctx.fillStyle = this.rows.isRowSelected(iterationIndex) ? 'white' : '#616161';
            this.ctx.font = '15px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((iterationIndex+1).toString(), x + this.rowHeaderWidth / 2, y + rowHeight / 2);
            y += rowHeight;
            iterationIndex++;
        }


        //drawing top-right corner cell
        x = 0;
        y = 0;
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.fillRect(x, y, this.rowHeaderWidth, this.colHeaderHeight);



        this.drawSelection();
        if (this.editingCell) {
            this.stopEditing();
        }
        this.updateStats();
    }

    /**
     * Draws the current selection rectangle on the canvas.
     */
    drawSelection() {
        if (this.selection.type === 'none') return;

        this.ctx.strokeStyle = '#107c41';
        this.ctx.lineWidth = 1.5;
        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';

        const startX = this.getColumnPosition(this.selection.startCol);
        const startY = this.getRowPosition(this.selection.startRow);
        const endX = this.getColumnPosition(this.selection.endCol + 1);
        const endY = this.getRowPosition(this.selection.endRow + 1);

        const x = Math.max(this.rowHeaderWidth, startX);
        const y = Math.max(this.colHeaderHeight, startY);
        const width = Math.min(this.canvas.width, endX) - x;
        const height = Math.min(this.canvas.height, endY) - y;

        if (width > 0 && height > 0) {
            this.ctx.fillRect(x, y, width, height);
            this.ctx.strokeRect(x, y, width, height);
        }

        if (this.selection.type !== 'row' && this.selection.type !== 'column') {
            for (let i = this.selection.startCol; i <= this.selection.endCol; i++) {
                this.highlightCellHeaders(this.selection.startRow, i);
            }
            for (let i = this.selection.startRow; i <= this.selection.endRow; i++) {
                this.highlightCellHeaders(i, this.selection.startCol);
            }
        }

        if (this.selection.type === 'row') {
            this.insertRowUpBtn.disabled = false;
            this.insertRowDownBtn.disabled = false;
        }

        if (this.selection.type === 'column') {
            this.insertColumnLeftBtn.disabled = false;
            this.insertColumnRightBtn.disabled = false;
        }
    }

    /**
     * Updates the statistics display based on the current selection.
     */
    updateStats() {
        const stats = document.getElementById('stats');
        if (this.selection.type === 'none') {
            stats.textContent = '';
            return;
        }

        const cells = this.selection.getSelectedCells(this);
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

    /**
     * Sets up event listeners for user interactions.
     */
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadJSONFile(file);
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.canvas.style.cursor = 'cell';
            if (this.resizing) {
                this.resizing = false;
                this.resizeType = null;
                this.resizeIndex = -1;
            }
        });

        this.cellEditor.addEventListener('blur', () => this.stopEditing());
        this.cellEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.stopEditing();
            } else if (e.key === 'Escape') {
                this.cancelEditing();
            }
            else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                this.stopEditing();
            }
        });
        this.cellEditor.addEventListener('dblclick', (e) => {
            this.cellEditor.style.caretColor = 'black'; // Show caret when clicking
        })

        this.insertRowUpBtn.addEventListener('click', () => {
            this.cells.shiftCellsToNextRow(this.selection.startRow);
            this.rows.insertRowUp(this.selection.startRow);
            this.selection.startRow++;
            this.selection.endRow++;
            this.render();
        });
        this.insertRowDownBtn.addEventListener('click', () => {
            this.cells.shiftCellsToNextRow(this.selection.startRow + 1);
            this.rows.insertRowDown(this.selection.startRow);
            this.render();
        });
        this.insertColumnLeftBtn.addEventListener('click', () => {
            this.columns.insertColumnLeft(this.selection.startCol);
            this.cells.shiftCellsToNextColumn(this.selection.startCol);
            this.selection.startCol++;
            this.selection.endCol++;
            this.render();
        });
        this.insertColumnRightBtn.addEventListener('click', () => {
            this.columns.insertColumnRight(this.selection.startCol);
            this.cells.shiftCellsToNextColumn(this.selection.startCol+1);
            this.render();
        });
    }

    /**
     * Handles mouse down events for selection, resizing, and editing.
     * @param {MouseEvent} e
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.mouseDown = true;
        this.startX = x;
        this.startY = y;

        // Check for resize handles
        if (this.checkResizeHandle(x, y)) {
            return;
        }


        // Check for header clicks
        if (y < this.colHeaderHeight && x > this.rowHeaderWidth) {
            // Column selection
            const col = this.getColumnAtPosition(x);
            if (col >= 0) {
                this.selection.setColumn(col);
                this.clearColumnSelection();
                this.columns.addColumnSelection(col);
                this.render();
            }
            return;
        }

        if (x < this.rowHeaderWidth && y > this.colHeaderHeight) {
            // Row selection
            const row = this.getRowAtPosition(y);
            if (row >= 0) {
                this.selection.setRow(row);
                this.clearRowSelection();
                this.rows.addRowSelection(row);
                this.render();
            }
            return;
        }

        // Cell selection
        const cell = this.getCellAtPosition(x, y);
        if (cell) {
            this.selection.setCell(cell.row, cell.col);
            this.dragStart = cell;
            this.clearAllSelection();
            this.render();
        }
    }

    /**
     * Handles mouse move events for selection and resizing.
     * @param {MouseEvent} e
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.mouseDown && this.resizing) {
            this.handleResize(x, y);
            return;
        }

        if (this.mouseDown && this.dragStart) {
            const cell = this.getCellAtPosition(x, y);
            if (cell) {
                this.selection.setRange(this.dragStart.row, this.dragStart.col, cell.row, cell.col);
                this.render();
            }
        }

        // Update cursor
        this.updateCursor(x, y);
    }

    /**
     * Handles mouse up events to finalize selection or resizing.
     * @param {MouseEvent} e
     */
    handleMouseUp(e) {
        this.mouseDown = false;
        this.dragStart = null;

        if (this.resizing) {
            this.resizing = false;
            this.resizeType = null;
            this.resizeIndex = -1;
            this.canvas.style.cursor = 'cell';
        }

        // Update cursor based on current position
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.updateCursor(x, y);
    }

    /**
     * Handles click events for cell selection and editing.
     * @param {MouseEvent} e
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cell = this.getCellAtPosition(x, y);
        if (cell) {
            this.startEditing(cell.row, cell.col);
            this.highlightCellHeaders(cell.row, cell.col);
            this.insertRowUpBtn.disabled = true;
            this.insertRowDownBtn.disabled = true;
            this.insertColumnLeftBtn.disabled = true;
            this.insertColumnRightBtn.disabled = true;
        }
    }

    /**
     * Handles wheel events for scrolling and zooming.
     * @param {WheelEvent} e
     */
    handleWheel(e) {
        e.preventDefault();

        const scrollSpeed = 50;
        let zoomLevel = 1;

        if (e.shiftKey) {
            // Horizontal scroll when shift is held
            this.scrollX = Math.max(0, this.scrollX + e.deltaY);
        }
        else {
            // Normal vertical scroll
            if (e.deltaX !== 0) {
                // Native horizontal scroll (trackpad)
                this.scrollX = Math.max(0, this.scrollX + e.deltaX);
            }
            if (e.deltaY !== 0) {
                this.scrollY = Math.max(0, this.scrollY + e.deltaY);
            }
        }

        this.render();
    }

    insertRowUp() {
        let startRow = this.selection.startRow;
        this.rows.insertRowUp(startRow);
    }

    /**
     * Checks if mouse is near a row/column edge for resizing.
     * Sets internal flags and cursor if matched.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    checkResizeHandle(x, y) {
        // Only allow resizing in headers

        // Check column resize - only in column header area
        if (y >= 0 && y <= this.colHeaderHeight && x > this.rowHeaderWidth) {
            let currentX = this.rowHeaderWidth - this.scrollX;
            for (let i = 0; i < this.columns.noOfColumns; i++) {
                const columnWidth = this.columns.getColumnWidth(i);
                currentX += columnWidth;

                if (Math.abs(x - currentX) < 5 && currentX > this.rowHeaderWidth) {
                    this.resizing = true;
                    this.resizeType = 'col';
                    this.resizeIndex = i;
                    this.canvas.style.cursor = 'e-resize';
                    return true;
                }

                if (currentX > this.canvas.width) break;
            }
        }

        // Check row resize - only in row header area
        if (x >= 0 && x <= this.rowHeaderWidth && y > this.colHeaderHeight) {
            let currentY = this.colHeaderHeight - this.scrollY;
            for (let i = 0; i < this.rows.noOfRows; i++) {
                const rowHeight = this.rows.getRowHeight(i);
                currentY += rowHeight;

                if (Math.abs(y - currentY) < 5 && currentY > this.colHeaderHeight) {
                    this.resizing = true;
                    this.resizeType = 'row';
                    this.resizeIndex = i;
                    this.canvas.style.cursor = 'n-resize';
                    return true;
                }

                if (currentY > this.canvas.height) break;
            }
        }

        return false;
    }

    /**
    * Handles the actual resize of row or column and triggers undoable command.
    * @param {number} x - Current mouse x position.
    * @param {number} y - Current mouse y position.
    */
    handleResize(x, y) {
        if (this.resizeType === 'col') {
            const columnWidth = this.columns.getColumnWidth(this.resizeIndex);
            if (columnWidth) {
                const oldWidth = columnWidth;
                const startX = this.getColumnPosition(this.resizeIndex);
                const newWidth = Math.max(20, x - startX);

                const command = new ResizeColumnCommand(this, this.resizeIndex, newWidth, oldWidth);
                this.commandManager.executeCommand(command);
            }
        } else if (this.resizeType === 'row') {
            const rowHeight = this.rows.getRowHeight(this.resizeIndex);
            if (rowHeight) {
                const oldHeight = rowHeight;
                const startY = this.getRowPosition(this.resizeIndex);
                const newHeight = Math.max(15, y - startY);

                const command = new ResizeRowCommand(this, this.resizeIndex, newHeight, oldHeight);
                this.commandManager.executeCommand(command);
            }
        }
    }

    /**
     * Updates the mouse cursor to show resize handles where applicable.
     * @param {number} x
     * @param {number} y
     */
    updateCursor(x, y) {
        // Reset cursor first
        this.canvas.style.cursor = 'cell';

        // Only show resize cursor in header areas
        if ((y > 0 && y <= this.colHeaderHeight && x > this.rowHeaderWidth) ||
            (x > 0 && x <= this.rowHeaderWidth && y > this.colHeaderHeight)) {
            this.checkResizeHandle(x, y);
        }
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
     * Clears all row and column selections.
     */
    clearAllSelection() {
        this.clearRowSelection();
        this.clearColumnSelection();
    }

    /**
     * Deselects all rows.
     */
    clearRowSelection() {
        this.rows.removeAllRowSelections();
    }

    /**
     * Deselects all columns.
     */
    clearColumnSelection() {
        this.columns.removeAllColumnSelections();
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

        this.cellEditor.style.left = x + 'px';
        this.cellEditor.style.top = y + 'px';
        this.cellEditor.style.width = columnWidth + 'px';
        this.cellEditor.style.height = rowHeight + 'px';
        this.cellEditor.style.display = 'block';
        this.cellEditor.value = value;
        this.cellEditor.readOnly = false;
        this.cellEditor.style.caretColor = 'transparent';

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
        this.ctx.fillText(rowIndex+1, xRow + this.rowHeaderWidth / 2, yRow + rowHeight / 2);

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