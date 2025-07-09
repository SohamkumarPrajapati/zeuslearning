import { ColumnSelectionHandler } from './ColumnSelectionHandler.js';
import { RowSelectionHandler } from './RowSelectionHandler.js';
import { CellRangeSelectionHandler } from './CellRangeSelectionHandler.js';
import { InsertRowCommand, InsertColumnCommand } from '../CommandManager.js';
import { DeleteRowCommand, DeleteColumnCommand } from '../CommandManager.js';
import { ExcelGrid } from '../ExcelGrid.js';

export class RegisterEventHandler {
    /**
     * initialize the handler object for all possible events
     * @param {ExcelGrid} grid 
     * @param {Array} handlers 
     */
    constructor(grid, handlers) {
        this.grid = grid;
        this.handlers = handlers;
        this.activeHandler = null;
        this.lastSelectedCell = null;
        this.autoScrollInterval = null;
        this.autoScrollDirection = null;
        this.autoScrollType = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.setupKeyboardListeners();
        this.setupUIEventListeners();
        this.setupEventListeners();
    }

    /**
     * setups the keyboard events for the excel grid object
     */
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.grid.editingCell) return;

            // If a cell is selected and a character key is pressed, start editing
            if (this.lastSelectedCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                this.grid.startEditing(this.lastSelectedCell.row, this.lastSelectedCell.col);
                this.grid.cellEditor.value = e.key;
                this.grid.cellEditor.setSelectionRange(1, 1);
                e.preventDefault();
                return;
            }

            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // Undo/Redo
            if (isCtrl && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (isShift) {
                    this.grid.commandManager.redo();
                } else {
                    this.grid.commandManager.undo();
                }
                return;
            }

            // Arrow key scrolling
            const scrollSpeed = 50;
            let shouldRender = false;

            switch (e.key) {
                case 'ArrowRight':
                    this.grid.scrollX += scrollSpeed;
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.grid.scrollX = Math.max(0, this.grid.scrollX - scrollSpeed);
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.grid.scrollY += scrollSpeed;
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.grid.scrollY = Math.max(0, this.grid.scrollY - scrollSpeed);
                    shouldRender = true;
                    e.preventDefault();
                    break;
            }

            if (shouldRender) {
                this.grid.scheduleRender();
            }
        });
    }

    /**
     * setsup the ui events for excel grid object as clicks and keydowns
     */
    setupUIEventListeners() {
        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.grid.loadJSONFile(file);
            }
        });

        // Cell editor
        this.grid.cellEditor.addEventListener('blur', () => this.grid.stopEditing());
        this.grid.cellEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.grid.stopEditing();
            } else if (e.key === 'Escape') {
                this.grid.cancelEditing();
            }
        });

        // Row insertion buttons
        this.grid.insertRowUpBtn.addEventListener('click', () => {
            this.handleRowInsertion('up');
        });

        this.grid.insertRowDownBtn.addEventListener('click', () => {
            this.handleRowInsertion('down');
        });

        // Column insertion buttons
        this.grid.insertColumnLeftBtn.addEventListener('click', () => {
            this.handleColumnInsertion('left');
        });

        this.grid.insertColumnRightBtn.addEventListener('click', () => {
            this.handleColumnInsertion('right');
        });

        // Delete buttons
        this.grid.deleteRowBtn.addEventListener('click', () => {
            this.handleRowDeletion();
        });

        this.grid.deleteColumnBtn.addEventListener('click', () => {
            this.handleColumnDeletion();
        });
    }

    /**
     * setsup handling events for the register event handler class
     */
    setupEventListeners() {
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.grid.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.grid.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    }

    /**
     * handles the mouse down event on windows and sets the active handle to targeted event handle
     * @param {Event} e 
     * @returns void
     */
    handleMouseDown(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || y < 0) return;

        this.lastMouseX = x;
        this.lastMouseY = y;

        // Find the appropriate handler
        this.activeHandler = null;
        for (const handler of this.handlers) {
            if (handler.hitTest(x, y)) {
                this.activeHandler = handler;
                break;
            }
        }

        if (this.activeHandler) {
            this.activeHandler.pointerDown(x, y, e);
            this.updateCursor(x, y);
        }

        // Track last selected cell for keyboard input
        if (this.activeHandler instanceof CellRangeSelectionHandler) {
            const cell = this.grid.getCellAtPosition(x, y);
            if (cell) {
                this.lastSelectedCell = cell;
            }
        }

        // Disable UI buttons during interaction
        this.disableUIButtons();
    }

    /**
     * checks the cursor type based on the hitTest from the event handles and calls its respective pointermove functions
     * @param {Event} e 
     */
    handleMouseMove(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.lastMouseX = x;
        this.lastMouseY = y;

        if (this.activeHandler) {
            this.activeHandler.pointerMove(x, y, e);
            this.checkAutoScroll(x, y);
        }

        this.updateCursor(x, y);
    }

    /**
     * wraps the event handlers by calling their pointerdown function
     * @param {Event} e 
     */
    handleMouseUp(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.activeHandler) {
            this.activeHandler.pointerUp(x, y, e);
            this.activeHandler = null;
        }

        this.stopAutoScroll();
        this.updateCursor(x, y);
    }

    /**
     * handle dounble click on the window and checks if the input box should open or not
     * @param {Event} e 
     */
    handleDoubleClick(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cell = this.grid.getCellAtPosition(x, y);
        if (cell) {
            this.grid.selectionManager.resetSelections();
            this.lastSelectedCell = cell;
            this.grid.startEditing(cell.row, cell.col);
            this.grid.highlightCellHeaders(cell.row, cell.col);
        }
    }

    /**
     * scrolls and rerender the canvas based on the wheel scrolling
     * @param {Event} e 
     */
    handleWheel(e) {
        e.preventDefault();

        if (e.shiftKey) {
            this.grid.scrollX = Math.max(0, this.grid.scrollX + e.deltaY);
        } else {
            if (e.deltaX !== 0) {
                this.grid.scrollX = Math.max(0, this.grid.scrollX + e.deltaX);
            }
            if (e.deltaY !== 0) {
                this.grid.scrollY = Math.max(0, this.grid.scrollY + e.deltaY);
            }
        }

        this.grid.scheduleRender();
    }

    /**
     * updates the cursor type by hitting all the hitTest of the event Handler classes and change the cursor type based on that
     * @param {number} x 
     * @param {number} y 
     */
    updateCursor(x, y) {
        let cursor = 'cell';

        for (const handler of this.handlers) {
            if (handler.hitTest(x, y)) {
                cursor = handler.getCursor();
                break;
            }
        }

        this.grid.canvas.style.cursor = cursor;
    }

    /**
     * based on the mouse position checks if the auto scroll should be applied or not
     * @param {number} x 
     * @param {number} y 
     */
    checkAutoScroll(x, y) {
        const edgeThreshold = 10;
        let scrollNeeded = false;
        let direction = null;
        let type = null;

        // Determine scroll direction and type based on active handler
        if (this.activeHandler instanceof ColumnSelectionHandler) {
            if (x > this.grid.canvas.width - edgeThreshold) {
                scrollNeeded = true; direction = 'right'; type = 'column';
            } else if (x < this.grid.rowHeaderWidth + edgeThreshold) {
                scrollNeeded = true; direction = 'left'; type = 'column';
            }
        } else if (this.activeHandler instanceof RowSelectionHandler) {
            if (y > this.grid.canvas.height - edgeThreshold) {
                scrollNeeded = true; direction = 'down'; type = 'row';
            } else if (y < this.grid.colHeaderHeight + edgeThreshold) {
                scrollNeeded = true; direction = 'up'; type = 'row';
            }
        } else if (this.activeHandler instanceof CellRangeSelectionHandler) {
            if (x > this.grid.canvas.width - edgeThreshold) {
                scrollNeeded = true; direction = 'right'; type = 'range';
            } else if (x < this.grid.rowHeaderWidth + edgeThreshold) {
                scrollNeeded = true; direction = 'left'; type = 'range';
            } else if (y > this.grid.canvas.height - edgeThreshold) {
                scrollNeeded = true; direction = 'down'; type = 'range';
            } else if (y < this.grid.colHeaderHeight + edgeThreshold) {
                scrollNeeded = true; direction = 'up'; type = 'range';
            }
        }

        if (scrollNeeded) {
            this.startAutoScroll(direction, type);
        } else {
            this.stopAutoScroll();
        }
    }

    /**
     * starts the auto scroll based on the direction and type of the selection either column row or cell range selection
     * @param {string} direction 
     * @param {string} type 
     * @returns 
     */
    startAutoScroll(direction, type) {
        if (this.autoScrollInterval && this.autoScrollDirection === direction && this.autoScrollType === type) return;

        this.stopAutoScroll();
        this.autoScrollDirection = direction;
        this.autoScrollType = type;

        this.autoScrollInterval = setInterval(() => {
            const scrollSpeed = 20;
            let scrolled = false;

            switch (direction) {
                case 'right':
                    const maxScrollX = this.getMaxScrollX();
                    if (this.grid.scrollX < maxScrollX) {
                        this.grid.scrollX = Math.min(maxScrollX, this.grid.scrollX + scrollSpeed);
                        scrolled = true;
                    }
                    break;
                case 'left':
                    if (this.grid.scrollX > 0) {
                        this.grid.scrollX = Math.max(0, this.grid.scrollX - scrollSpeed);
                        scrolled = true;
                    }
                    break;
                case 'down':
                    const maxScrollY = this.getMaxScrollY();
                    if (this.grid.scrollY < maxScrollY) {
                        this.grid.scrollY = Math.min(maxScrollY, this.grid.scrollY + scrollSpeed);
                        scrolled = true;
                    }
                    break;
                case 'up':
                    if (this.grid.scrollY > 0) {
                        this.grid.scrollY = Math.max(0, this.grid.scrollY - scrollSpeed);
                        scrolled = true;
                    }
                    break;
            }

            if (scrolled && this.activeHandler) {
                this.updateSelectionDuringAutoScroll();
                this.grid.scheduleRender();
            }
        }, 30);
    }

    /**
     * during the auto scroll it is important to update the selection, 
     * this function updatest the selction in real time with the auto scroll
     */
    updateSelectionDuringAutoScroll() {
        if (this.activeHandler && this.activeHandler.pointerMove) {
            // Use the last mouse position for selection updates during auto-scroll
            let virtualX = Math.max(this.grid.rowHeaderWidth + 1, this.lastMouseX);
            let virtualY = Math.max(this.grid.colHeaderHeight + 1, this.lastMouseY);

            this.activeHandler.pointerMove(virtualX, virtualY, null);
        }
    }

    /**
     * stops the auto scroll and sets depedent variable to its default values
     */
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
            this.autoScrollDirection = null;
            this.autoScrollType = null;
        }
    }

    /**
     * turn off the ui buttons
     */
    disableUIButtons() {
        this.grid.insertRowUpBtn.disabled = true;
        this.grid.insertRowDownBtn.disabled = true;
        this.grid.insertColumnLeftBtn.disabled = true;
        this.grid.insertColumnRightBtn.disabled = true;
    }

    /**
     * turn on the ui buttons
     */
    enableUIButtons() {
        this.grid.insertRowUpBtn.disabled = false;
        this.grid.insertRowDownBtn.disabled = false;
        this.grid.insertColumnLeftBtn.disabled = false;
        this.grid.insertColumnRightBtn.disabled = false;
    }

    /**
     * inserts the row based on the directs up or bottom to the selected row
     * @param {string} direction 
     */
    handleRowInsertion(direction) {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'row') {
            const startRow = selection.startRow;
            const command = new InsertRowCommand(this.grid, startRow, direction);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            const newRow = direction === 'up' ? startRow + 1 : startRow;
            this.grid.selectionManager.addRowSelection(newRow);
            this.grid.scheduleRender();
        }
    }

    /**
     * inserts the column based on the direction
     * @param {string} direction 
     */
    handleColumnInsertion(direction) {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'column') {
            const startCol = selection.startCol;
            const command = new InsertColumnCommand(this.grid, startCol, direction);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            const newCol = direction === 'left' ? startCol + 1 : startCol;
            this.grid.selectionManager.addColumnSelection(newCol);
            this.grid.scheduleRender();
        }
    }

    /**
     * deleted the row
     */
    handleRowDeletion() {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'row') {
            const startRow = selection.startRow;
            const command = new DeleteRowCommand(this.grid, startRow);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            // Disable delete buttons
            this.grid.deleteRowBtn.disabled = true;
            this.grid.deleteColumnBtn.disabled = true;
            this.grid.scheduleRender();
        }
    }

    /**
     * deletes the column from the canvas
     */
    handleColumnDeletion() {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'column') {
            const startCol = selection.startCol;
            const command = new DeleteColumnCommand(this.grid, startCol);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            // Disable delete buttons
            this.grid.deleteRowBtn.disabled = true;
            this.grid.deleteColumnBtn.disabled = true;
            this.grid.scheduleRender();
        }
    }

    // Helper methods for scroll bounds
    /**
     * 
     * @returns {number} - max possible scroll possible 
     */
    getMaxScrollX() {
        let totalWidth = this.grid.rowHeaderWidth;
        for (let i = 0; i < this.grid.columns.noOfColumns; i++) {
            totalWidth += this.grid.columns.getColumnWidth(i);
        }
        return Math.max(0, totalWidth - this.grid.canvas.width);
    }

    /**
     * 
     * @returns {number} - max possible scroll possible in vertical direction
     */
    getMaxScrollY() {
        let totalHeight = this.grid.colHeaderHeight;
        for (let i = 0; i < this.grid.rows.noOfRows; i++) {
            totalHeight += this.grid.rows.getRowHeight(i);
        }
        return Math.max(0, totalHeight - this.grid.canvas.height);
    }
}