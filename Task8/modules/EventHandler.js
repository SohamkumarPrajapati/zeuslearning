import { ResizeColumnCommand, ResizeRowCommand } from './CommandManager.js';
import { InsertRowCommand, InsertColumnCommand } from './CommandManager.js';
import { DeleteRowCommand, DeleteColumnCommand } from './CommandManager.js';


export class EventHandler {
    /**
     * initialize the events and handle it for passed grid
     * @param {ExcelGrid} grid 
     */
    constructor(grid) {
        this.grid = grid;

        // Mouse interaction states
        this.mouseDown = false;
        this.resizing = false;
        this.resizeType = null; // 'row' or 'col'
        this.resizeIndex = -1;
        this.startX = 0;
        this.startY = 0;
        this.dragStart = null;
        this.headerDragType = null; // 'row' or 'col'
        this.headerDragStart = null;
        this.headerDragCurrent = null;
        this.resizeInitialValue = null; // initial width or height
        this.resizeInitialIndex = null; // index of column/row being resized
        this.lastSelectedCell = null;
        this.autoScrollInterval = null;
        this.autoScrollDirection = null;
        this.autoScrollType = null; // 'col', 'row', or 'range'
        this.lastMouseX = 0; // Track last mouse position
        this.lastMouseY = 0;

        this.setupKeyboardListeners();
        this.setupEventListeners();
    }


    /**
     * Listens for keyboard events like undo/redo and arrow key scrolling.
     */
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.grid.editingCell) return;

            // If a cell is selected and a character key is pressed, start editing
            if (this.lastSelectedCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                this.grid.startEditing(this.lastSelectedCell.row, this.lastSelectedCell.col);
                // Set the editor value to the pressed key
                this.grid.cellEditor.value = e.key;
                // Move cursor to end
                this.grid.cellEditor.setSelectionRange(1, 1);
                e.preventDefault();
                return;
            }

            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // === Undo/Redo ===
            if (isCtrl && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (isShift) {
                    this.grid.commandManager.redo();
                } else {
                    this.grid.commandManager.undo();
                }
                return;
            }

            const scrollSpeed = 50;
            let shouldRender = false;
            // Scroll using arrow keys

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
                this.grid.render();
            }
        });
    }


    /**
     * Sets up event listeners for user interactions.
     */
    setupEventListeners() {
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.grid.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.grid.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.grid.loadJSONFile(file);
            }
        });

        this.grid.cellEditor.addEventListener('blur', () => this.grid.stopEditing());
        this.grid.cellEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.grid.stopEditing();
            } else if (e.key === 'Escape') {
                this.grid.cancelEditing();
            }
        });

        this.grid.insertRowUpBtn.addEventListener('click', () => {
            let selections = this.grid.selectionManager.selections;
            for (let selection of selections.values()) {
                if (selection.type !== 'row') continue;
                let startRow = selection.startRow;
                const command = new InsertRowCommand(this.grid, startRow, 'up');
                this.grid.commandManager.executeCommand(command);
                this.grid.selectionManager.resetSelections();
                this.grid.selectionManager.addRowSelection(startRow + 1);
                this.grid.render();
                break;
            }
        });

        this.grid.insertRowDownBtn.addEventListener('click', () => {
            let selections = this.grid.selectionManager.selections;
            for (let selection of selections.values()) {
                if (selection.type !== 'row') continue;
                let startRow = selection.startRow;
                const command = new InsertRowCommand(this.grid, startRow, 'down');
                this.grid.commandManager.executeCommand(command);
                this.grid.selectionManager.resetSelections();
                this.grid.selectionManager.addRowSelection(startRow);
                this.grid.render();
                break;
            }
        });

        this.grid.insertColumnLeftBtn.addEventListener('click', () => {
            let selections = this.grid.selectionManager.selections;
            for (let selection of selections.values()) {
                if (selection.type !== 'column') continue;
                let startCol = selection.startCol;
                const command = new InsertColumnCommand(this.grid, startCol, 'left');
                this.grid.commandManager.executeCommand(command);
                this.grid.selectionManager.resetSelections();
                this.grid.selectionManager.addColumnSelection(startCol + 1);
                this.grid.render();
                break;
            }
        });

        this.grid.insertColumnRightBtn.addEventListener('click', () => {
            let selections = this.grid.selectionManager.selections;
            for (let selection of selections.values()) {
                if (selection.type !== 'column') continue;
                let startCol = selection.startCol;
                const command = new InsertColumnCommand(this.grid, startCol, 'right');
                this.grid.commandManager.executeCommand(command);
                this.grid.selectionManager.resetSelections();
                this.grid.selectionManager.addColumnSelection(startCol);
                this.grid.render();
                break;
            }
        });

        this.grid.deleteRowBtn.addEventListener('click', () => {
            let selections = this.grid.selectionManager.selections;
            for (let selection of selections.values()) {
                if (selection.type !== 'row') continue;
                let startRow = selection.startRow;
                const command = new DeleteRowCommand(this.grid, startRow);
                this.grid.commandManager.executeCommand(command);
                this.grid.selectionManager.resetSelections();
                this.grid.deleteRowBtn.disabled = true;      // Disable delete row button
                this.grid.deleteColumnBtn.disabled = true;   // Disable delete column button
                this.grid.render();
                break;
            }
        });

        this.grid.deleteColumnBtn.addEventListener('click', () => {
            let selections = this.grid.selectionManager.selections;
            for (let selection of selections.values()) {
                if (selection.type !== 'column') continue;
                let startCol = selection.startCol;
                const command = new DeleteColumnCommand(this.grid, startCol);
                this.grid.commandManager.executeCommand(command);
                this.grid.selectionManager.resetSelections();
                this.grid.deleteRowBtn.disabled = true;      // Disable delete row button
                this.grid.deleteColumnBtn.disabled = true;   // Disable delete column button
                this.grid.render();
                break;
            }
        });
    }

    /**
     * Handles mouse down events for selection, resizing, and editing.
     * @param {MouseEvent} e
     */
    handleMouseDown(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || y < 0) { //wont do anything if the mousedown is outside of the canvas
            return;
        }

        this.mouseDown = true;
        this.startX = x;
        this.startY = y;
        this.lastMouseX = x; // Store initial mouse position
        this.lastMouseY = y;

        // Check for resize handles
        if (this.checkResizeHandle(x, y)) {
            this.resizing = true;
            if (this.resizeType === 'col') {
                this.resizeInitialValue = this.grid.columns.getColumnWidth(this.resizeIndex);
                this.resizeInitialIndex = this.resizeIndex;
            } else if (this.resizeType === 'row') {
                this.resizeInitialValue = this.grid.rows.getRowHeight(this.resizeIndex);
                this.resizeInitialIndex = this.resizeIndex;
            }
            return;
        }


        this.grid.insertRowUpBtn.disabled = true;
        this.grid.insertRowDownBtn.disabled = true;
        this.grid.insertColumnLeftBtn.disabled = true;
        this.grid.insertColumnRightBtn.disabled = true;

        // --- Header drag selection logic ---
        // Column header drag selection
        if (y < this.grid.colHeaderHeight && x > this.grid.rowHeaderWidth) {
            const col = this.grid.getColumnAtPosition(x);
            if (col >= 0) {
                let row = 0;
                this.lastSelectedCell = { row, col };
                this.headerDragType = 'col';
                this.headerDragStart = col;
                this.headerDragCurrent = col;
                if (!e.ctrlKey) {
                    this.grid.selectionManager.resetSelections();
                }
                // Always add the starting column to the selection
                this.grid.selectionManager.addColumnSelection(col);
                let selection = this.grid.selectionManager.getColumnSelection(col);
                this.grid.render();
                // selection.drawSelection(this);
                return;
            }
        }

        // Row header drag selection
        if (x < this.grid.rowHeaderWidth && y > this.grid.colHeaderHeight) {
            const row = this.grid.getRowAtPosition(y);
            if (row >= 0) {
                let col = 0;
                this.lastSelectedCell = { row, col };
                this.headerDragType = 'row';
                this.headerDragStart = row;
                this.headerDragCurrent = row;
                if (!e.ctrlKey) {
                    this.grid.selectionManager.resetSelections();
                }
                this.grid.selectionManager.addRowSelection(row);
                let selection = this.grid.selectionManager.getRowSelection(row);
                this.grid.render();
                // selection.drawSelection(this);
                return;
            }
        }

        // Cell selection
        const cell = this.grid.getCellAtPosition(x, y);
        if (cell) {
            if (true) {
                this.grid.selectionManager.resetSelections();
            }
            this.grid.selectionManager.addSingleCellSelection(cell.row, cell.col);
            this.dragStart = cell;
            this.lastSelectedCell = cell; // <--- Track last selected cell
            this.grid.render();
        }
    }

    /**
     * Handles mouse move events for selection and resizing.
     * @param {MouseEvent} e
     */
    handleMouseMove(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Always update last mouse position for auto-scroll tracking
        this.lastMouseX = x;
        this.lastMouseY = y;

        const edgeThreshold = 10;
        let scrollNeeded = false;
        let direction = null;
        let type = null;

        if (this.mouseDown && this.headerDragType === 'col') {
            if (x > this.grid.canvas.width - edgeThreshold) {
                scrollNeeded = true; direction = 'right'; type = 'col';
            } else if (x < this.grid.rowHeaderWidth + edgeThreshold) {
                scrollNeeded = true; direction = 'left'; type = 'col';
            }
        } else if (this.mouseDown && this.headerDragType === 'row') {
            if (y > this.grid.canvas.height - edgeThreshold) {
                scrollNeeded = true; direction = 'down'; type = 'row';
            } else if (y < this.grid.colHeaderHeight + edgeThreshold) {
                scrollNeeded = true; direction = 'up'; type = 'row';
            }
        } else if (this.mouseDown && this.dragStart) {
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

        // --- Header drag selection logic ---
        if (this.mouseDown && this.headerDragType === 'col') {
            const col = this.grid.getColumnAtPosition(x);
            if (col >= 0 && col !== this.headerDragCurrent) {
                const start = Math.min(this.headerDragStart, col);
                const end = Math.max(this.headerDragStart, col);
                let selection = this.grid.selectionManager.getColumnSelection(this.headerDragStart);
                if (!selection) {
                    selection = this.grid.selectionManager.addColumnSelection(this.headerDragStart);
                }
                selection.startCol = start;
                selection.endCol = end;
                this.headerDragCurrent = col;
                this.grid.render();
            }
            return;
        }

        if (this.mouseDown && this.headerDragType === 'row') {
            const row = this.grid.getRowAtPosition(y);
            if (row >= 0 && row !== this.headerDragCurrent) {
                const start = Math.min(this.headerDragStart, row);
                const end = Math.max(this.headerDragStart, row);
                let selection = this.grid.selectionManager.getRowSelection(this.headerDragStart);
                if (!selection) {
                    selection = this.grid.selectionManager.addRowSelection(this.headerDragStart);
                }
                selection.startRow = start;
                selection.endRow = end;
                this.headerDragCurrent = row;
                this.grid.render();
            }
            return;
        }

        if (this.mouseDown && this.resizing && !this.headerDragType) {
            this.handleResize(x, y);
            return;
        }

        if (this.mouseDown && this.dragStart) {
            const cell = this.grid.getCellAtPosition(x, y);
            if (cell) {
                this.grid.selectionManager.addRangeSelection(this.dragStart.row, this.dragStart.col, cell.row, cell.col);
                this.grid.render();
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
        this.headerDragType = null;
        this.headerDragStart = null;
        this.headerDragCurrent = null;

        this.stopAutoScroll();

        if (this.resizing) {
            if (this.resizeType === 'col') {
                const finalWidth = this.grid.columns.getColumnWidth(this.resizeInitialIndex);
                if (finalWidth !== this.resizeInitialValue) {
                    const command = new ResizeColumnCommand(
                        this.grid, this.resizeInitialIndex, finalWidth, this.resizeInitialValue
                    );
                    this.grid.commandManager.executeCommand(command);
                }
            } else if (this.resizeType === 'row') {
                const finalHeight = this.grid.rows.getRowHeight(this.resizeInitialIndex);
                if (finalHeight !== this.resizeInitialValue) {
                    const command = new ResizeRowCommand(
                        this.grid, this.resizeInitialIndex, finalHeight, this.resizeInitialValue
                    );
                    this.grid.commandManager.executeCommand(command);
                }
            }
        }
        this.resizing = false;
        this.resizeType = null;
        this.resizeIndex = -1;
        this.resizeInitialValue = null;
        this.resizeInitialIndex = null;
        this.grid.canvas.style.cursor = 'cell';

        // Update cursor based on current position
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.updateCursor(x, y);
    }

    /**
     * Handles click events for cell selection and editing.
     * @param {MouseEvent} e
     */
    handleDoubleClick(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cell = this.grid.getCellAtPosition(x, y);
        if (cell) {
            if (!e.ctrlKey) {
                this.grid.selectionManager.resetSelections();
            }
            this.lastSelectedCell = cell; // <--- Track last selected cell
            this.grid.startEditing(cell.row, cell.col);
            this.grid.highlightCellHeaders(cell.row, cell.col);
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
            this.grid.scrollX = Math.max(0, this.grid.scrollX + e.deltaY);
        }
        else {
            // Normal vertical scroll
            if (e.deltaX !== 0) {
                // Native horizontal scroll (trackpad)
                this.grid.scrollX = Math.max(0, this.grid.scrollX + e.deltaX);
            }
            if (e.deltaY !== 0) {
                this.grid.scrollY = Math.max(0, this.grid.scrollY + e.deltaY);
            }
        }

        this.grid.render();
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
        if (y >= 0 && y <= this.grid.colHeaderHeight && x > this.grid.rowHeaderWidth) {
            let currentX = this.grid.rowHeaderWidth - this.grid.scrollX;
            for (let i = 0; i < this.grid.columns.noOfColumns; i++) {
                const columnWidth = this.grid.columns.getColumnWidth(i);
                currentX += columnWidth;

                if (Math.abs(x - currentX) < 5 && currentX > this.grid.rowHeaderWidth) {
                    this.resizeType = 'col';
                    this.resizeIndex = i;
                    this.grid.canvas.style.cursor = 'e-resize';
                    return true;
                }

                if (currentX > this.grid.canvas.width) break;
            }
        }

        // Check row resize - only in row header area
        if (x >= 0 && x <= this.grid.rowHeaderWidth && y > this.grid.colHeaderHeight) {
            let currentY = this.grid.colHeaderHeight - this.grid.scrollY;
            for (let i = 0; i < this.grid.rows.noOfRows; i++) {
                const rowHeight = this.grid.rows.getRowHeight(i);
                currentY += rowHeight;

                if (Math.abs(y - currentY) < 5 && currentY > this.grid.colHeaderHeight) {
                    this.resizeType = 'row';
                    this.resizeIndex = i;
                    this.grid.canvas.style.cursor = 'n-resize';
                    return true;
                }

                if (currentY > this.grid.canvas.height) break;
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
            const startX = this.grid.getColumnPosition(this.resizeIndex);
            const newWidth = Math.max(20, x - startX);
            this.grid.columns.setColumnWidth(this.resizeIndex, newWidth); // Just update visually
            this.grid.render();
        } else if (this.resizeType === 'row') {
            const startY = this.grid.getRowPosition(this.resizeIndex);
            const newHeight = Math.max(15, y - startY);
            this.grid.rows.setRowHeight(this.resizeIndex, newHeight); // Just update visually
            this.grid.render();
        }
    }

    /**
     * Updates the mouse cursor to show resize handles where applicable.
     * @param {number} x
     * @param {number} y
     */
    updateCursor(x, y) {
        // Reset cursor first
        this.grid.canvas.style.cursor = 'cell';

        // Only show resize cursor in header areas
        if ((y > 0 && y <= this.grid.colHeaderHeight && x > this.grid.rowHeaderWidth) ||
            (x > 0 && x <= this.grid.rowHeaderWidth && y > this.grid.colHeaderHeight)) {
            this.checkResizeHandle(x, y);
        }
    }

    /**
     * Starts auto-scrolling when dragging near canvas edges
     * @param {string} direction - 'up', 'down', 'left', 'right'
     * @param {string} type - 'col', 'row', or 'range'
     */
    startAutoScroll(direction, type) {
        if (this.autoScrollInterval && this.autoScrollDirection === direction && this.autoScrollType === type) return;
        this.stopAutoScroll();
        this.autoScrollDirection = direction;
        this.autoScrollType = type;
        this.autoScrollInterval = setInterval(() => {
            const scrollSpeed = 20;
            let scrolled = false;

            if (direction === 'right') {
                const maxScrollX = this.getMaxScrollX();
                if (this.grid.scrollX < maxScrollX) {
                    this.grid.scrollX = Math.min(maxScrollX, this.grid.scrollX + scrollSpeed);
                    scrolled = true;
                }
            } else if (direction === 'left') {
                if (this.grid.scrollX > 0) {
                    this.grid.scrollX = Math.max(0, this.grid.scrollX - scrollSpeed);
                    scrolled = true;
                }
            } else if (direction === 'down') {
                const maxScrollY = this.getMaxScrollY();
                if (this.grid.scrollY < maxScrollY) {
                    this.grid.scrollY = Math.min(maxScrollY, this.grid.scrollY + scrollSpeed);
                    scrolled = true;
                }
            } else if (direction === 'up') {
                if (this.grid.scrollY > 0) {
                    this.grid.scrollY = Math.max(0, this.grid.scrollY - scrollSpeed);
                    scrolled = true;
                }
            }

            // Only update selection if we actually scrolled
            if (scrolled) {
                this.updateSelectionDuringAutoScroll(type);
                this.grid.render();
            }
        }, 30);
    }

    /**
     * Updates selection during auto-scroll based on virtual mouse position
     * @param {string} type - 'col', 'row', or 'range'
     */
    updateSelectionDuringAutoScroll(type) {
        // Use actual mouse position for selection updates
        let virtualX = this.lastMouseX;
        let virtualY = this.lastMouseY;

        // Clamp to minimum bounds to prevent going into headers
        virtualX = Math.max(this.grid.rowHeaderWidth + 1, virtualX);
        virtualY = Math.max(this.grid.colHeaderHeight + 1, virtualY);

        if (type === 'col' && this.headerDragType === 'col') {
            const col = this.grid.getColumnAtPosition(virtualX);
            if (col >= 0) {
                const start = Math.min(this.headerDragStart, col);
                const end = Math.max(this.headerDragStart, col);
                let selection = this.grid.selectionManager.getColumnSelection(this.headerDragStart);
                if (!selection) {
                    selection = this.grid.selectionManager.addColumnSelection(this.headerDragStart);
                }
                selection.startCol = start;
                selection.endCol = end;
                this.headerDragCurrent = col;
            }
        } else if (type === 'row' && this.headerDragType === 'row') {
            const row = this.grid.getRowAtPosition(virtualY);
            if (row >= 0) {
                const start = Math.min(this.headerDragStart, row);
                const end = Math.max(this.headerDragStart, row);
                let selection = this.grid.selectionManager.getRowSelection(this.headerDragStart);
                if (!selection) {
                    selection = this.grid.selectionManager.addRowSelection(this.headerDragStart);
                }
                selection.startRow = start;
                selection.endRow = end;
                this.headerDragCurrent = row;
            }
        } else if (type === 'range' && this.dragStart) {
            const cell = this.grid.getCellAtPosition(virtualX, virtualY);
            if (cell) {
                this.grid.selectionManager.addRangeSelection(this.dragStart.row, this.dragStart.col, cell.row, cell.col);
            }
        }
    }

    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
            this.autoScrollDirection = null;
            this.autoScrollType = null;
        }
    }

    // Helpers to clamp scroll
    getMaxScrollX() {
        let totalWidth = this.grid.rowHeaderWidth;
        for (let i = 0; i < this.grid.columns.noOfColumns; i++) {
            totalWidth += this.grid.columns.getColumnWidth(i);
        }
        return Math.max(0, totalWidth - this.grid.canvas.width);
    }
    getMaxScrollY() {
        let totalHeight = this.grid.colHeaderHeight;
        for (let i = 0; i < this.grid.rows.noOfRows; i++) {
            totalHeight += this.grid.rows.getRowHeight(i);
        }
        return Math.max(0, totalHeight - this.grid.canvas.height);
    }
}