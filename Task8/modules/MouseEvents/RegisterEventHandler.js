import { ColumnSelectionHandler } from './ColumnSelectionHandler.js';
import { RowSelectionHandler } from './RowSelectionHandler.js';
import { CellRangeSelectionHandler } from './CellRangeSelectionHandler.js';
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
        this.autoScrollInterval = null;
        this.autoScrollDirection = null;
        this.autoScrollType = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.setupEventListeners();
    }

    /**
     * setsup handling events for the register event handler class
     */
    setupEventListeners() {
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
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
                this.grid.lastSelectedCell = cell;
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