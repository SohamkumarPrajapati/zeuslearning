// Constants for grid dimensions and sizes
/** @constant {number} DEFAULT_ROW_HEIGHT - Default height for grid rows */
const DEFAULT_ROW_HEIGHT = 25;

/** @constant {number} DEFAULT_COLUMN_WIDTH - Default width for grid columns */
const DEFAULT_COLUMN_WIDTH = 100;

/** @constant {number} MAX_ROWS - Maximum number of rows in the grid */
const MAX_ROWS = 100000;


/**
 * Represents a single cell in the Excel grid
 * Manages cell data, formulas, and styling
 */
class Cell {
    /**
     * Initializes a new cell with optional value
     * @param {string} value - Initial value for the cell
     */
    constructor(value = '') {
        /** @type {string} Stores the actual value of the cell */
        this.value = value;
        /** @type {string|null} Stores formula if cell contains a formula */
        this.formula = null;
        /** @type {Object} Stores styling information for the cell */
        this.style = {};
    }

    /**
     * Gets the display value of the cell
     * Returns calculated formula result if cell has formula, otherwise returns raw value
     * @returns {string} The value to display in the cell
     */
    getValue() {
        return this.formula ? this.calculateFormula() : this.value;
    }

    /**
     * Sets the value of the cell and clears any existing formula
     * @param {string} value - New value to set in the cell
     */
    setValue(value) {
        this.value = value;
        this.formula = null;
    }

    /**
     * Calculates the result of a formula (basic implementation)
     * Can be extended to support complex formulas
     * @returns {string} The calculated result of the formula
     */
    calculateFormula() {
        // Basic formula calculation (can be extended)
        return this.value;
    }
}
/**
 * Represents a row in the Excel grid
 * Contains cells and manages row-specific properties
 */
class Row {
    /**
     * Initializes a new Row object
     * @param {number} index - The row index (0-based)
     * @param {number} height - Height of the row in pixels (default: 25)
     */
    constructor(index, height = DEFAULT_ROW_HEIGHT) {
        /** @type {number} The zero-based index of this row */
        this.index = index;
        /** @type {number} Height of the row in pixels */
        this.height = height;
        /** @type {Map<number, Cell>} Map of column indices to Cell objects */
        this.cells = new Map();
        /** @type {boolean} Whether this row is currently selected */
        this.selected = false;
    }

    /**
     * Gets or creates a cell at the specified column index
     * @param {number} colIndex - The column index for the cell
     * @returns {Cell} The cell object at the specified column
     */
    getCell(colIndex) {
        if (!this.cells.has(colIndex)) {
            this.cells.set(colIndex, new Cell());
        }
        return this.cells.get(colIndex);
    }

    /**
     * Sets the value of a cell at the specified column index
     * @param {number} colIndex - The column index for the cell
     * @param {string} value - The value to set in the cell
     */
    setCell(colIndex, value) {
        const cell = this.getCell(colIndex);
        cell.setValue(value);
    }
}

/**
 * Represents a column in the Excel grid
 * Manages column properties including width and selection state
 */
class Column {
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

/**
 * Manages cell, row, column, and range selections in the grid
 * Handles different types of selections and provides selection utilities
 */
class Selection {
    /**
     * Initializes a new Selection object with no active selection
     */
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
        this.type = 'none';
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
                    cells.push({row: r, col: c, value: grid.getCellValue(r, c)});
                }
            }
        }
        return cells;
    }
}

// Command Pattern for Undo/Redo
class Command {
    execute() { }
    undo() { }
}

class SetCellValueCommand extends Command {
    constructor(grid, row, col, newValue, oldValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }

    execute() {
        this.grid.setCellValue(this.row, this.col, this.newValue);
    }

    undo() {
        this.grid.setCellValue(this.row, this.col, this.oldValue);
    }
}

class ResizeColumnCommand extends Command {
    constructor(grid, colIndex, newWidth, oldWidth) {
        super();
        this.grid = grid;
        this.colIndex = colIndex;
        this.newWidth = newWidth;
        this.oldWidth = oldWidth;
    }

    execute() {
        this.grid.setColumnWidth(this.colIndex, this.newWidth);
    }

    undo() {
        this.grid.setColumnWidth(this.colIndex, this.oldWidth);
    }
}

class ResizeRowCommand extends Command {
    constructor(grid, rowIndex, newHeight, oldHeight) {
        super();
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.newHeight = newHeight;
        this.oldHeight = oldHeight;
    }

    execute() {
        this.grid.setRowHeight(this.rowIndex, this.newHeight);
    }

    undo() {
        this.grid.setRowHeight(this.rowIndex, this.oldHeight);
    }
}

class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 100;
    }

    executeCommand(command) {
        command.execute();
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.redoStack = [];
        this.updateButtons();
    }

    undo() {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            this.updateButtons();
            grid.render();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            this.updateButtons();
            grid.render();
        }
    }

    updateButtons() {
        document.getElementById('undoBtn').disabled = this.undoStack.length === 0;
        document.getElementById('redoBtn').disabled = this.redoStack.length === 0;
    }
}

// Main Grid Class
class ExcelGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rows = new Map();
        this.columns = new Map();
        this.selection = new Selection();

        // Grid properties
        this.rowHeaderWidth = 60;
        this.colHeaderHeight = 30;
        this.scrollX = 0;
        this.scrollY = 0;
        this.maxRows = 100000;
        this.maxCols = 500;

        // Initialize columns
        for (let i = 0; i < this.maxCols; i++) {
            this.columns.set(i, new Column(i));
        }

        // Mouse state
        this.mouseDown = false;
        this.resizing = false;
        this.resizeType = null; // 'row' or 'col'
        this.resizeIndex = -1;
        this.startX = 0;
        this.startY = 0;
        this.dragStart = null;

        // Cell editor
        this.cellEditor = document.getElementById('cellEditor');
        this.editingCell = null;

        this.setupEventListeners();
        // Add this line after this.setupEventListeners();
        this.initializeCanvas();
        this.setupKeyboardListeners();
        this.render();
    }


    initializeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.editingCell) return; // Don't scroll while editing

            const scrollSpeed = 25;
            let shouldRender = false;

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

    getRow(index) {
        if (!this.rows.has(index)) {
            this.rows.set(index, new Row(index));
        }
        return this.rows.get(index);
    }

    getColumn(index) {
        return this.columns.get(index);
    }

    getCellValue(row, col) {
        if (!this.isValidCell(row, col)) return '';
        const rowObj = this.rows.get(row);
        if (!rowObj) return '';
        return rowObj.getCell(col).getValue();
    }

    setCellValue(row, col, value) {
        if (!this.isValidCell(row, col)) return;
        const rowObj = this.getRow(row);
        rowObj.setCell(col, value);
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.maxRows && col >= 0 && col < this.maxCols;
    }

    setColumnWidth(colIndex, width) {
        const column = this.getColumn(colIndex);
        if (column) {
            column.width = Math.max(20, width);
            this.render();
        }
    }

    setRowHeight(rowIndex, height) {
        const row = this.getRow(rowIndex);
        if (row) {
            row.height = Math.max(15, height);
            this.render();
        }
    }

    getColumnPosition(colIndex) {
        let x = this.rowHeaderWidth - this.scrollX;
        for (let i = 0; i < colIndex; i++) {
            const col = this.getColumn(i);
            x += col ? col.width : 100;
        }
        return x;
    }

    getRowPosition(rowIndex) {
        let y = this.colHeaderHeight - this.scrollY;
        for (let i = 0; i < rowIndex; i++) {
            const row = this.rows.get(i);
            y += row ? row.height : 25;
        }
        return y;
    }

    getCellAtPosition(x, y) {
        if (x < this.rowHeaderWidth || y < this.colHeaderHeight) {
            return null;
        }

        let col = -1, row = -1;
        let currentX = this.rowHeaderWidth - this.scrollX;

        for (let i = 0; i < this.maxCols; i++) {
            const column = this.getColumn(i);
            const width = column ? column.width : 100;
            if (x >= currentX && x < currentX + width) {
                col = i;
                break;
            }
            currentX += width;
        }

        let currentY = this.colHeaderHeight - this.scrollY;
        for (let i = 0; i < this.maxRows; i++) {
            const rowObj = this.rows.get(i);
            const height = rowObj ? rowObj.height : 25;
            if (y >= currentY && y < currentY + height) {
                row = i;
                break;
            }
            currentY += height;
        }

        return (row >= 0 && col >= 0) ? { row, col } : null;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawHeaders();
        this.drawCells();
        this.drawSelection();
        this.updateStats();
    }

    drawHeaders() {
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(0, 0, this.canvas.width, this.colHeaderHeight);
        this.ctx.fillRect(0, 0, this.rowHeaderWidth, this.canvas.height);

        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 1;

        // Column headers
        let x = this.rowHeaderWidth - this.scrollX;
        for (let i = 0; i < this.maxCols && x < this.canvas.width; i++) {
            const column = this.getColumn(i);
            const width = column ? column.width : 100;

            if (x + width > this.rowHeaderWidth) {
                this.ctx.fillStyle = column && column.selected ? '#3498db' : '#ecf0f1';
                this.ctx.fillRect(x, 0, width, this.colHeaderHeight);

                this.ctx.strokeRect(x, 0, width, this.colHeaderHeight);

                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(column ? column.name : '', x + width / 2, 20);
            }

            x += width;
        }

        // Row headers
        let y = this.colHeaderHeight - this.scrollY;
        for (let i = 0; i < this.maxRows && y < this.canvas.height; i++) {
            const row = this.rows.get(i);
            const height = row ? row.height : 25;

            if (y + height > this.colHeaderHeight) {
                this.ctx.fillStyle = row && row.selected ? '#3498db' : '#ecf0f1';
                this.ctx.fillRect(0, y, this.rowHeaderWidth, height);

                this.ctx.strokeRect(0, y, this.rowHeaderWidth, height);

                this.ctx.fillStyle = '#2c3e50';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText((i + 1).toString(), this.rowHeaderWidth / 2, y + height / 2 + 4);
            }

            y += height;
        }
    }

    drawCells() {
        this.ctx.strokeStyle = '#e8e8e8';
        this.ctx.lineWidth = 1;

        const startCol = Math.max(0, Math.floor(this.scrollX / 100));
        const startRow = Math.max(0, Math.floor(this.scrollY / 25));

        let y = this.colHeaderHeight - this.scrollY;
        for (let i = startRow; i < this.maxRows && y < this.canvas.height; i++) {
            const row = this.rows.get(i);
            const height = row ? row.height : 25;

            if (y + height > this.colHeaderHeight) {
                let x = this.rowHeaderWidth - this.scrollX;

                for (let j = startCol; j < this.maxCols && x < this.canvas.width; j++) {
                    const column = this.getColumn(j);
                    const width = column ? column.width : 100;

                    if (x + width > this.rowHeaderWidth) {
                        // Draw cell background
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillRect(x, y, width, height);

                        // Draw cell border
                        this.ctx.strokeRect(x, y, width, height);

                        // Draw cell content
                        const value = this.getCellValue(i, j);
                        if (value) {
                            this.ctx.fillStyle = '#2c3e50';
                            this.ctx.font = '14px Arial';
                            this.ctx.textAlign = 'left';
                            this.ctx.fillText(value.toString().substring(0, 15), x + 5, y + height / 2 + 4);
                        }
                    }

                    x += width;
                }
            }

            y += height;
        }
    }

    drawSelection() {
        if (this.selection.type === 'none') return;

        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 2;
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
    }

    updateStats() {
        const stats = document.getElementById('stats');
        if (this.selection.type === 'none') {
            stats.textContent = 'Ready';
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

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Add this inside setupEventListeners method
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadJSONFile(file);
            }
        });

        // Add this line in setupEventListeners method
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
        });
    }

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
                this.getColumn(col).selected = true;
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
                this.getRow(row).selected = true;
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

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.resizing) {
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

    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cell = this.getCellAtPosition(x, y);
        if (cell) {
            this.startEditing(cell.row, cell.col);
        }
    }

    handleWheel(e) {
        e.preventDefault();

        const scrollSpeed = 50;

        if (e.shiftKey) {
            // Horizontal scroll when shift is held
            this.scrollX = Math.max(0, this.scrollX + e.deltaY);
        } else {
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

    checkResizeHandle(x, y) {
        // Only allow resizing in headers

        // Check column resize - only in column header area
        if (y >= 0 && y <= this.colHeaderHeight && x > this.rowHeaderWidth) {
            let currentX = this.rowHeaderWidth - this.scrollX;
            for (let i = 0; i < this.maxCols; i++) {
                const column = this.getColumn(i);
                const width = column ? column.width : 100;
                currentX += width;

                if (Math.abs(x - currentX) < 5 && currentX > this.rowHeaderWidth) {
                    this.resizing = true;
                    this.resizeType = 'col';
                    this.resizeIndex = i;
                    this.canvas.style.cursor = 'col-resize';
                    return true;
                }

                if (currentX > this.canvas.width) break;
            }
        }

        // Check row resize - only in row header area
        if (x >= 0 && x <= this.rowHeaderWidth && y > this.colHeaderHeight) {
            let currentY = this.colHeaderHeight - this.scrollY;
            for (let i = 0; i < this.maxRows; i++) {
                const row = this.rows.get(i);
                const height = row ? row.height : 25;
                currentY += height;

                if (Math.abs(y - currentY) < 5 && currentY > this.colHeaderHeight) {
                    this.resizing = true;
                    this.resizeType = 'row';
                    this.resizeIndex = i;
                    this.canvas.style.cursor = 'row-resize';
                    return true;
                }

                if (currentY > this.canvas.height) break;
            }
        }

        return false;
    } handleResize(x, y) {
        if (this.resizeType === 'col') {
            const column = this.getColumn(this.resizeIndex);
            if (column) {
                const oldWidth = column.width;
                const startX = this.getColumnPosition(this.resizeIndex);
                const newWidth = Math.max(20, x - startX);

                const command = new ResizeColumnCommand(this, this.resizeIndex, newWidth, oldWidth);
                commandManager.executeCommand(command);
            }
        } else if (this.resizeType === 'row') {
            const row = this.getRow(this.resizeIndex);
            if (row) {
                const oldHeight = row.height;
                const startY = this.getRowPosition(this.resizeIndex);
                const newHeight = Math.max(15, y - startY);

                const command = new ResizeRowCommand(this, this.resizeIndex, newHeight, oldHeight);
                commandManager.executeCommand(command);
            }
        }
    }

    updateCursor(x, y) {
        // Reset cursor first
        this.canvas.style.cursor = 'cell';

        // Only show resize cursor in header areas
        if ((y >= 0 && y <= this.colHeaderHeight && x > this.rowHeaderWidth) ||
            (x >= 0 && x <= this.rowHeaderWidth && y > this.colHeaderHeight)) {
            this.checkResizeHandle(x, y);
        }
    }

    getColumnAtPosition(x) {
        let currentX = this.rowHeaderWidth - this.scrollX;
        for (let i = 0; i < this.maxCols; i++) {
            const column = this.getColumn(i);
            const width = column ? column.width : 100;
            if (x >= currentX && x < currentX + width) {
                return i;
            }
            currentX += width;
        }
        return -1;
    }

    getRowAtPosition(y) {
        let currentY = this.colHeaderHeight - this.scrollY;
        for (let i = 0; i < this.maxRows; i++) {
            const row = this.rows.get(i);
            const height = row ? row.height : 25;
            if (y >= currentY && y < currentY + height) {
                return i;
            }
            currentY += height;
        }
        return -1;
    }

    clearAllSelection() {
        this.clearRowSelection();
        this.clearColumnSelection();
    }

    clearRowSelection() {
        this.rows.forEach(row => row.selected = false);
    }

    clearColumnSelection() {
        this.columns.forEach(col => col.selected = false);
    }

    startEditing(row, col) {
        this.editingCell = { row, col };
        const value = this.getCellValue(row, col);

        const x = this.getColumnPosition(col);
        const y = this.getRowPosition(row);
        const column = this.getColumn(col);
        const rowObj = this.getRow(row);

        this.cellEditor.style.left = x + 'px';
        this.cellEditor.style.top = y + 'px';
        this.cellEditor.style.width = column.width + 'px';
        this.cellEditor.style.height = rowObj.height + 'px';
        this.cellEditor.style.display = 'block';
        this.cellEditor.value = value;
        this.cellEditor.focus();
        this.cellEditor.select();
    }

    stopEditing() {
        if (!this.editingCell) return;

        const oldValue = this.getCellValue(this.editingCell.row, this.editingCell.col);
        const newValue = this.cellEditor.value;

        if (oldValue !== newValue) {
            const command = new SetCellValueCommand(
                this, this.editingCell.row, this.editingCell.col, newValue, oldValue
            );
            commandManager.executeCommand(command);
        }

        this.cellEditor.style.display = 'none';
        this.editingCell = null;
        this.render();
    }

    cancelEditing() {
        this.cellEditor.style.display = 'none';
        this.editingCell = null;
    }



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
                const column = this.getColumn(i);
                column.name = headers[i];
            }

            // Load data
            for (let rowIndex = 0; rowIndex < data.length && rowIndex < this.maxRows; rowIndex++) {
                const record = data[rowIndex];
                for (let colIndex = 0; colIndex < headers.length && colIndex < this.maxCols; colIndex++) {
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

// Initialize the application
const canvas = document.getElementById('gridCanvas');
const grid = new ExcelGrid(canvas);
const commandManager = new CommandManager();

// Handle window resize
// Handle window resize
window.addEventListener('resize', () => {
    grid.initializeCanvas();
    grid.render();
});

// Initial setup
commandManager.updateButtons();
