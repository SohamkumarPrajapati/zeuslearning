import { ExcelGrid } from '../ExcelGrid.js';
import { BaseEventHandler } from './BaseEventHandler.js';

export class CellRangeSelectionHandler extends BaseEventHandler {
    /**
     * initialize the cell range selection event handle for register handle
     * @param {ExcelGrid} grid 
     */
    constructor(grid) {
        super(grid);
        this.dragStart = null;
        this.autoScrollInterval = null;
        this.autoScrollDirection = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    /**
     * checks if the cell range selection event should trigger oor not based on the cursor position
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    hitTest(x, y) {
        // Cell area (not in headers)
        return x > this.grid.rowHeaderWidth && y > this.grid.colHeaderHeight;
    }

    /**
     * executes the cell range selection logic on pointer down
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerDown(x, y, e) {
        super.pointerDown(x, y, e);
        const cell = this.grid.getCellAtPosition(x, y);
        if (cell) {
            this.dragStart = cell;
            this.grid.selectionManager.resetSelections();
            this.grid.selectionManager.addSingleCellSelection(cell.row, cell.col);
            this.grid.scheduleRender();
        }
    }

    /**
     * executes the cell range selection logic on pointer move
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerMove(x, y, e) {
        if (this.isActive && this.dragStart) {
            this.lastMouseX = x;
            this.lastMouseY = y;
            this.handleAutoScroll(x, y);

            const cell = this.grid.getCellAtPosition(x, y);
            if (cell) {
                this.grid.selectionManager.addRangeSelection(
                    this.dragStart.row, this.dragStart.col, cell.row, cell.col
                );
                this.grid.scheduleRender();
            }
        }
    }

    /**
     * executes the cell range selection logic on pointer up
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerUp(x, y, e) {
        super.pointerUp(x, y, e);
        this.stopAutoScroll();
        this.dragStart = null;
    }

    /**
     * handles the auto scroll logic for cell range selection
     * @param {number} x 
     * @param {number} y 
     */
    handleAutoScroll(x, y) {
        const edgeThreshold = 10;
        let scrollNeeded = false;
        let direction = null;

        if (x > this.grid.canvas.width - edgeThreshold) {
            scrollNeeded = true;
            direction = 'right';
        } else if (x < this.grid.rowHeaderWidth + edgeThreshold) {
            scrollNeeded = true;
            direction = 'left';
        } else if (y > this.grid.canvas.height - edgeThreshold) {
            scrollNeeded = true;
            direction = 'down';
        } else if (y < this.grid.colHeaderHeight + edgeThreshold) {
            scrollNeeded = true;
            direction = 'up';
        }

        if (scrollNeeded) {
            this.startAutoScroll(direction);
        } else {
            this.stopAutoScroll();
        }
    }

    /**
     * starts the aut scroll for cell range selection in direction
     * @param {string} direction 
     * @returns 
     */
    startAutoScroll(direction) {
        if (this.autoScrollInterval && this.autoScrollDirection === direction) return;
        this.stopAutoScroll();

        this.autoScrollDirection = direction;
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

            if (scrolled) {
                const cell = this.grid.getCellAtPosition(this.lastMouseX, this.lastMouseY);
                if (cell) {
                    this.grid.selectionManager.addRangeSelection(
                        this.dragStart.row, this.dragStart.col, cell.row, cell.col
                    );
                    this.grid.scheduleRender();
                }
            }
        }, 30);
    }

    /**
     * stops the auto scroll
     */
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
            this.autoScrollDirection = null;
        }
    }

    /**
     * 
     * @returns maxScroll possible in x direction
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
     * @returns max Scroll possible in vertical direction
     */
    getMaxScrollY() {
        let totalHeight = this.grid.colHeaderHeight;
        for (let i = 0; i < this.grid.rows.noOfRows; i++) {
            totalHeight += this.grid.rows.getRowHeight(i);
        }
        return Math.max(0, totalHeight - this.grid.canvas.height);
    }

    /**
     * cleanup the auto scroll and stops it
     */
    cleanup() {
        super.cleanup();
        this.stopAutoScroll();
    }
}