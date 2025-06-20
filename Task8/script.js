// Constants for grid dimensions and sizes
const ROW_COUNT = 100000;
const COLUMN_COUNT = 500;
const VISIBLE_ROW_COUNT = 40; // Number of rows visible in viewport (approx)
const VISIBLE_COLUMN_COUNT = 20; // Number of columns visible in viewport (approx)
const DEFAULT_ROW_HEIGHT = 24;
const DEFAULT_COLUMN_WIDTH = 100;
const HEADER_HEIGHT = 24;
const HEADER_WIDTH = 60;

// Utility function to generate column labels (A, B, ..., Z, AA, AB, ...)
function getColumnLabel(index) {
    let label = '';
    while (index >= 0) {
        label = String.fromCharCode((index % 26) + 65) + label;
        index = Math.floor(index / 26) - 1;
    }
    return label;
}

// Command pattern base class
class Command {
    execute() {}
    undo() {}
}

// CommandManager to handle undo-redo stack
class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    executeCommand(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
    }
}

// RowColumn class for rows and columns
class RowColumn {
    constructor(count, defaultSize) {
        this.count = count;
        this.sizes = new Array(count).fill(defaultSize); //count = 100000 height =24
        //[24,24,24,24,24,24,24,24,24,24,24,...]
    }

    getSize(index) {
        return this.sizes[index];
    }

    setSize(index, size) {
        this.sizes[index] = size;
    }

    getTotalSize() {
        return this.sizes.reduce((a, b) => a + b, 0);
    }

    getOffset(index) {
        let offset = 0;
        for (let i = 0; i < index; i++) {
            offset += this.sizes[i];
        }
        return offset;
    }
}

// Cell class
class Cell {
    constructor(row, col, value = '') {
        this.row = row;
        this.col = col;
        this.value = value;
    }
}

// CellRange class
class CellRange {
    constructor(startRow, startCol, endRow, endCol) {
        this.startRow = Math.min(startRow, endRow);
        this.endRow = Math.max(startRow, endRow);
        this.startCol = Math.min(startCol, endCol);
        this.endCol = Math.max(startCol, endCol);
    }

    contains(row, col) {
        return (
            row >= this.startRow &&
            row <= this.endRow &&
            col >= this.startCol &&
            col <= this.endCol
        );
    }

    getCells() {
        const cells = [];
        for (let r = this.startRow; r <= this.endRow; r++) {
            for (let c = this.startCol; c <= this.endCol; c++) {
                cells.push({ row: r, col: c });
            }
        }
        return cells;
    }
}

// Selection class
class Selection {
    constructor() {
        this.selectedRanges = [];
    }

    clear() {
        this.selectedRanges = [];
    }

    addRange(range) {
        this.selectedRanges.push(range);
    }

    isSelected(row, col) {
        return this.selectedRanges.some(range => range.contains(row, col));
    }

    getSelectedCells() {
        let cells = [];
        this.selectedRanges.forEach(range => {
            cells = cells.concat(range.getCells());
        });
        return cells;
    }
}

// ResizeCommand for resizing rows or columns
class ResizeCommand extends Command {
    constructor(rowColumn, index, oldSize, newSize) {
        super();
        this.rowColumn = rowColumn;
        this.index = index;
        this.oldSize = oldSize;
        this.newSize = newSize;
    }

    execute() {
        this.rowColumn.setSize(this.index, this.newSize);
    }

    undo() {
        this.rowColumn.setSize(this.index, this.oldSize);
    }
}

// EditCommand for editing cell value
class EditCommand extends Command {
    constructor(grid, row, col, oldValue, newValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    execute() {
        this.grid.setCellValue(this.row, this.col, this.newValue);
    }

    undo() {
        this.grid.setCellValue(this.row, this.col, this.oldValue);
    }
}

// Grid class
class Grid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight - 30; // leave space for formula bar
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.tabIndex = 0;

        this.rows = new RowColumn(ROW_COUNT, DEFAULT_ROW_HEIGHT);
        this.columns = new RowColumn(COLUMN_COUNT, DEFAULT_COLUMN_WIDTH);

        this.data = new Map(); // key: "r,c", value: cell value

        this.selection = new Selection();

        this.commandManager = new CommandManager();

        this.scrollX = 0;
        this.scrollY = 0;

        this.isResizing = false;
        this.resizeType = null; // 'row' or 'column'
        this.resizeIndex = null;
        this.resizeStartPos = null;
        this.resizeStartSize = null;

        this.editingCell = null;

        this.initEvents();

        this.loadData();

        this.render();
    }

    loadData() {
        // Generate 50,000 records with different values and store in data map
        // Each record has id, firstName, lastName, Age, Salary
        // Map columns to keys: id, firstName, lastName, Age, Salary, and fill other columns with empty or dummy data

        const firstNames = ['Raj', 'John', 'Alice', 'Maria', 'David', 'Sophia', 'Michael', 'Emma', 'James', 'Olivia'];
        const lastNames = ['Solanki', 'Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez'];

        for (let i = 0; i < 50000; i++) {
            const id = i + 1;
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const age = 20 + (i % 50);
            const salary = 30000 + (i * 10) % 1000000;

            // Store values in columns 0 to 4
            this.setCellValue(i, 0, id.toString());
            this.setCellValue(i, 1, firstName);
            this.setCellValue(i, 2, lastName);
            this.setCellValue(i, 3, age.toString());
            this.setCellValue(i, 4, salary.toString());

            // Fill other columns with empty string
            for (let c = 5; c < COLUMN_COUNT; c++) {
                this.setCellValue(i, c, '');
            }
        }
    }

    setCellValue(row, col, value) {
        const key = `${row},${col}`;
        if (value === '' || value === null || value === undefined) {
            this.data.delete(key);
        } else {
            this.data.set(key, value);
        }
        if (this.editingCell && this.editingCell.row === row && this.editingCell.col === col) {
            this.editingCell.value = value;
        }
    }

    getCellValue(row, col) {
        const key = `${row},${col}`;
        return this.data.get(key) || '';
    }

    initEvents() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const deltaX = e.deltaX;
            const deltaY = e.deltaY;
            this.scrollX = Math.min(Math.max(this.scrollX + deltaX, 0), this.columns.getTotalSize() - this.width + HEADER_WIDTH);
            this.scrollY = Math.min(Math.max(this.scrollY + deltaY, 0), this.rows.getTotalSize() - this.height + HEADER_HEIGHT);
            this.render();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getMousePos(e);
            if (this.checkResizeHit(pos)) {
                this.isResizing = true;
                this.resizeStartPos = pos;
                this.render();
                return;
            }
            this.handleSelectionStart(pos);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(e);
            if (this.isResizing) {
                this.handleResizing(pos);
                this.render();
                return;
            }
            this.updateCursor(pos);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isResizing) {
                this.isResizing = false;
                this.resizeType = null;
                this.resizeIndex = null;
                this.resizeStartPos = null;
                this.resizeStartSize = null;
                this.render();
            }
        });

        this.canvas.addEventListener('dblclick', (e) => {
            const pos = this.getMousePos(e);
            this.startEditing(pos);
        });

        this.canvas.addEventListener('keydown', (e) => {
            if (this.editingCell) {
                if (e.key === 'Enter') {
                    this.finishEditing();
                } else if (e.key === 'Escape') {
                    this.cancelEditing();
                }
            } else {
                if (e.ctrlKey && e.key === 'z') {
                    this.commandManager.undo();
                    this.render();
                } else if (e.ctrlKey && e.key === 'y') {
                    this.commandManager.redo();
                    this.render();
                }
            }
        });

        // Formula bar input
        const formulaBar = document.getElementById('formulaBar');
        formulaBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.finishEditing();
                this.canvas.focus();
            }
        });
        formulaBar.addEventListener('input', (e) => {
            if (this.editingCell) {
                this.editingCell.value = e.target.value;
            }
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    checkResizeHit(pos) {
        // Check if mouse is near column or row border for resizing
        const x = pos.x + this.scrollX - HEADER_WIDTH;
        const y = pos.y + this.scrollY - HEADER_HEIGHT;

        // Check column resize (near vertical lines)
        let colOffset = 0;
        for (let c = 0; c < COLUMN_COUNT; c++) {
            colOffset += this.columns.getSize(c);
            if (Math.abs(x - colOffset) < 5 && pos.y < HEADER_HEIGHT) {
                this.isResizing = true;
                this.resizeType = 'column';
                this.resizeIndex = c;
                this.resizeStartSize = this.columns.getSize(c);
                return true;
            }
        }

        // Check row resize (near horizontal lines)
        let rowOffset = 0;
        for (let r = 0; r < ROW_COUNT; r++) {
            rowOffset += this.rows.getSize(r);
            if (Math.abs(y - rowOffset) < 5 && pos.x < HEADER_WIDTH) {
                this.isResizing = true;
                this.resizeType = 'row';
                this.resizeIndex = r;
                this.resizeStartSize = this.rows.getSize(r);
                return true;
            }
        }

        return false;
    }

    handleResizing(pos) {
        if (!this.isResizing) return;
        if (this.resizeType === 'column') {
            const delta = pos.x - this.resizeStartPos.x;
            const newSize = Math.max(20, this.resizeStartSize + delta);
            const cmd = new ResizeCommand(this.columns, this.resizeIndex, this.columns.getSize(this.resizeIndex), newSize);
            this.commandManager.executeCommand(cmd);
        } else if (this.resizeType === 'row') {
            const delta = pos.y - this.resizeStartPos.y;
            const newSize = Math.max(20, this.resizeStartSize + delta);
            const cmd = new ResizeCommand(this.rows, this.resizeIndex, this.rows.getSize(this.resizeIndex), newSize);
            this.commandManager.executeCommand(cmd);
        }
    }

    updateCursor(pos) {
        const x = pos.x + this.scrollX - HEADER_WIDTH;
        const y = pos.y + this.scrollY - HEADER_HEIGHT;

        // Check if near column border
        let colOffset = 0;
        for (let c = 0; c < COLUMN_COUNT; c++) {
            colOffset += this.columns.getSize(c);
            if (Math.abs(x - colOffset) < 5 && pos.y < HEADER_HEIGHT) {
                this.canvas.style.cursor = 'col-resize';
                return;
            }
        }

        // Check if near row border
        let rowOffset = 0;
        for (let r = 0; r < ROW_COUNT; r++) {
            rowOffset += this.rows.getSize(r);
            if (Math.abs(y - rowOffset) < 5 && pos.x < HEADER_WIDTH) {
                this.canvas.style.cursor = 'row-resize';
                return;
            }
        }

        this.canvas.style.cursor = 'default';
    }

    handleSelectionStart(pos) {
        // Calculate clicked cell
        const x = pos.x + this.scrollX - HEADER_WIDTH;
        const y = pos.y + this.scrollY - HEADER_HEIGHT;

        let col = 0;
        let colOffset = 0;
        for (; col < COLUMN_COUNT; col++) {
            colOffset += this.columns.getSize(col);
            if (x < colOffset) break;
        }

        let row = 0;
        let rowOffset = 0;
        for (; row < ROW_COUNT; row++) {
            rowOffset += this.rows.getSize(row);
            if (y < rowOffset) break;
        }

        if (row >= ROW_COUNT || col >= COLUMN_COUNT) return;

        // Support multi-cell selection with shift key
        if (this.isShiftDown && this.selection.selectedRanges.length > 0) {
            const lastRange = this.selection.selectedRanges[this.selection.selectedRanges.length - 1];
            this.selection.clear();
            this.selection.addRange(new CellRange(lastRange.startRow, lastRange.startCol, row, col));
        } else {
            this.selection.clear();
            this.selection.addRange(new CellRange(row, col, row, col));
        }
        this.render();

        // Set formula bar value
        const formulaBar = document.getElementById('formulaBar');
        formulaBar.value = this.getCellValue(row, col);
        formulaBar.focus();

        // Set editing cell
        this.editingCell = new Cell(row, col, this.getCellValue(row, col));
    }

    initEvents() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const deltaX = e.deltaX;
            const deltaY = e.deltaY;
            this.scrollX = Math.min(Math.max(this.scrollX + deltaX, 0), this.columns.getTotalSize() - this.width + HEADER_WIDTH);
            this.scrollY = Math.min(Math.max(this.scrollY + deltaY, 0), this.rows.getTotalSize() - this.height + HEADER_HEIGHT);
            this.render();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getMousePos(e);
            if (this.checkResizeHit(pos)) {
                this.isResizing = true;
                this.resizeStartPos = pos;
                this.render();
                return;
            }
            this.handleSelectionStart(pos);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(e);
            if (this.isResizing) {
                this.handleResizing(pos);
                this.render();
                return;
            }
            this.updateCursor(pos);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isResizing) {
                this.isResizing = false;
                this.resizeType = null;
                this.resizeIndex = null;
                this.resizeStartPos = null;
                this.resizeStartSize = null;
                this.render();
            }
        });

        this.canvas.addEventListener('dblclick', (e) => {
            const pos = this.getMousePos(e);
            this.startEditing(pos);
        });

        this.canvas.addEventListener('keydown', (e) => {
            if (this.editingCell) {
                if (e.key === 'Enter') {
                    this.finishEditing();
                } else if (e.key === 'Escape') {
                    this.cancelEditing();
                }
            } else {
                if (e.ctrlKey && e.key === 'z') {
                    this.commandManager.undo();
                    this.render();
                } else if (e.ctrlKey && e.key === 'y') {
                    this.commandManager.redo();
                    this.render();
                }
            }
        });

        // Formula bar input
        const formulaBar = document.getElementById('formulaBar');
        formulaBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.finishEditing();
                this.canvas.focus();
            }
        });
        formulaBar.addEventListener('input', (e) => {
            if (this.editingCell) {
                this.editingCell.value = e.target.value;
            }
        });
    }

    initEvents() {
        this.isShiftDown = false;

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.isShiftDown = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.isShiftDown = false;
            }
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const deltaX = e.deltaX;
            const deltaY = e.deltaY;
            this.scrollX = Math.min(Math.max(this.scrollX + deltaX, 0), this.columns.getTotalSize() - this.width + HEADER_WIDTH);
            this.scrollY = Math.min(Math.max(this.scrollY + deltaY, 0), this.rows.getTotalSize() - this.height + HEADER_HEIGHT);
            this.render();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getMousePos(e);
            if (this.checkResizeHit(pos)) {
                this.isResizing = true;
                this.resizeStartPos = pos;
                this.render();
                return;
            }
            this.handleSelectionStart(pos);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(e);
            if (this.isResizing) {
                this.handleResizing(pos);
                this.render();
                return;
            }
            this.updateCursor(pos);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isResizing) {
                this.isResizing = false;
                this.resizeType = null;
                this.resizeIndex = null;
                this.resizeStartPos = null;
                this.resizeStartSize = null;
                this.render();
            }
        });

        this.canvas.addEventListener('dblclick', (e) => {
            const pos = this.getMousePos(e);
            this.startEditing(pos);
        });

        this.canvas.addEventListener('keydown', (e) => {
            if (this.editingCell) {
                if (e.key === 'Enter') {
                    this.finishEditing();
                } else if (e.key === 'Escape') {
                    this.cancelEditing();
                }
            } else {
                if (e.ctrlKey && e.key === 'z') {
                    this.commandManager.undo();
                    this.render();
                } else if (e.ctrlKey && e.key === 'y') {
                    this.commandManager.redo();
                    this.render();
                }
            }
        });

        // Formula bar input
        const formulaBar = document.getElementById('formulaBar');
        formulaBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.finishEditing();
                this.canvas.focus();
            }
        });
        formulaBar.addEventListener('input', (e) => {
            if (this.editingCell) {
                this.editingCell.value = e.target.value;
            }
        });
    }

    drawSelectionStats() {
        const selectedCells = this.selection.getSelectedCells();
        if (selectedCells.length === 0) return;

        const values = selectedCells
            .map(({ row, col }) => this.getCellValue(row, col))
            .filter(v => !isNaN(parseFloat(v)))
            .map(v => parseFloat(v));

        if (values.length === 0) return;

        const count = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;

        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        const statsText = `Count: ${count}  Min: ${min}  Max: ${max}  Sum: ${sum}  Avg: ${avg.toFixed(2)}`;
        ctx.fillText(statsText, HEADER_WIDTH + 10, this.height - 10);
        ctx.restore();
    }
    
    drawSelectionStats() {
        // Moved to updateFunctionStats method to update function bar container
    }

    updateFunctionStats() {
        const selectedCells = this.selection.getSelectedCells();
        if (selectedCells.length === 0) {
            document.getElementById('functionStats').textContent = 'Count: 0  Min: 0  Max: 0  Sum: 0  Avg: 0';
            return;
        }

        const values = selectedCells
            .map(({ row, col }) => this.getCellValue(row, col))
            .filter(v => !isNaN(parseFloat(v)))
            .map(v => parseFloat(v));

        if (values.length === 0) {
            document.getElementById('functionStats').textContent = 'Count: 0  Min: 0  Max: 0  Sum: 0  Avg: 0';
            return;
        }

        const count = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;

        document.getElementById('functionStats').textContent =
            `Count: ${count}  Min: ${min}  Max: ${max}  Sum: ${sum}  Avg: ${avg.toFixed(2)}`;
    }

    startEditing(pos) {
        // Start editing on double click
        this.handleSelectionStart(pos);
        const formulaBar = document.getElementById('formulaBar');
        formulaBar.focus();
        formulaBar.select();
    }

    finishEditing() {
        if (!this.editingCell) return;
        const formulaBar = document.getElementById('formulaBar');
        const newValue = formulaBar.value;
        const oldValue = this.getCellValue(this.editingCell.row, this.editingCell.col);
        if (newValue !== oldValue) {
            const cmd = new EditCommand(this, this.editingCell.row, this.editingCell.col, oldValue, newValue);
            this.commandManager.executeCommand(cmd);
        }
        this.editingCell = null;
        this.render();
    }

    cancelEditing() {
        this.editingCell = null;
        const formulaBar = document.getElementById('formulaBar');
        formulaBar.value = '';
        this.render();
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.translate(HEADER_WIDTH, HEADER_HEIGHT);

        // Calculate visible rows and columns based on scroll
        let visibleRows = [];
        let visibleCols = [];

        let yOffset = 0;
        let startRow = 0;
        for (let r = 0; r < ROW_COUNT; r++) {
            const rowHeight = this.rows.getSize(r);
            if (yOffset + rowHeight > this.scrollY) {
                startRow = r;
                break;
            }
            yOffset += rowHeight;
        }

        let xOffset = 0;
        let startCol = 0;
        for (let c = 0; c < COLUMN_COUNT; c++) {
            const colWidth = this.columns.getSize(c);
            if (xOffset + colWidth > this.scrollX) {
                startCol = c;
                break;
            }
            xOffset += colWidth;
        }

        let yPos = yOffset - this.scrollY;
        for (let r = startRow; r < ROW_COUNT && yPos < this.height; r++) {
            visibleRows.push(r);
            yPos += this.rows.getSize(r);
        }

        let xPos = xOffset - this.scrollX;
        for (let c = startCol; c < COLUMN_COUNT && xPos < this.width; c++) {
            visibleCols.push(c);
            xPos += this.columns.getSize(c);
        }

        // Draw column headers
        ctx.fillStyle = '#f3f3f3';
        ctx.fillRect(0, 0, this.width, HEADER_HEIGHT);
        ctx.strokeStyle = '#ccc';
        ctx.beginPath();
        let colX = 0;
        for (const c of visibleCols) {
            const colWidth = this.columns.getSize(c);
            ctx.fillStyle = '#f3f3f3';
            ctx.fillRect(colX, 0, colWidth, HEADER_HEIGHT);
            ctx.fillStyle = '#000';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(getColumnLabel(c), colX + colWidth / 2, HEADER_HEIGHT / 2);
            ctx.moveTo(colX + colWidth, 0);
            ctx.lineTo(colX + colWidth, HEADER_HEIGHT + this.height);
            colX += colWidth;
        }
        ctx.stroke();

        // Draw row headers
        ctx.fillStyle = '#f3f3f3';
        ctx.fillRect(0, 0, HEADER_WIDTH, this.height);
        ctx.strokeStyle = '#ccc';
        ctx.beginPath();
        let rowY = 0;
        for (const r of visibleRows) {
            const rowHeight = this.rows.getSize(r);
            ctx.fillStyle = '#f3f3f3';
            ctx.fillRect(0, rowY, HEADER_WIDTH, rowHeight);
            ctx.fillStyle = '#000';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = 'bold 12px Arial';
            ctx.fillText((r + 1).toString(), HEADER_WIDTH / 2, rowY + rowHeight / 2);
            ctx.moveTo(0, rowY + rowHeight);
            ctx.lineTo(HEADER_WIDTH + this.width, rowY + rowHeight);
            rowY += rowHeight;
        }
        ctx.stroke();

        // Draw cells
        ctx.beginPath();
        ctx.strokeStyle = '#ddd';
        let cellY = 0;
        for (const r of visibleRows) {
            let cellX = 0;
            const rowHeight = this.rows.getSize(r);
            for (const c of visibleCols) {
                const colWidth = this.columns.getSize(c);
                const value = this.getCellValue(r, c);
                const isSelected = this.selection.isSelected(r, c);

                // Fill background for selected cells
                if (isSelected) {
                    ctx.fillStyle = 'rgba(0, 120, 215, 0.3)';
                    ctx.fillRect(cellX, cellY, colWidth, rowHeight);
                } else {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(cellX, cellY, colWidth, rowHeight);
                }

                ctx.strokeRect(cellX, cellY, colWidth, rowHeight);

                // Draw text
                ctx.fillStyle = 'black';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                ctx.font = '12px Arial';
                ctx.fillText(value, cellX + 4, cellY + rowHeight / 2);

                cellX += colWidth;
            }
            cellY += rowHeight;
        }
        ctx.stroke();

        ctx.restore();

        // Draw grid border
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(0, 0, this.width, this.height);

        // Compute and display stats for selected cells
        this.drawSelectionStats();
    }

    drawSelectionStats() {
        const selectedCells = this.selection.getSelectedCells();
        if (selectedCells.length === 0) return;

        const values = selectedCells
            .map(({ row, col }) => this.getCellValue(row, col))
            .filter(v => !isNaN(parseFloat(v)))
            .map(v => parseFloat(v));

        if (values.length === 0) return;

        const count = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;

        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        const statsText = `Count: ${count}  Min: ${min}  Max: ${max}  Sum: ${sum}  Avg: ${avg.toFixed(2)}`;
        ctx.fillText(statsText, HEADER_WIDTH + 10, this.height - 10);
        ctx.restore();
    }
}

// Initialize grid on window load
window.onload = () => {
    const canvas = document.getElementById('excelGrid');
    const grid = new Grid(canvas);
    window.grid = grid; // expose for debugging
};
