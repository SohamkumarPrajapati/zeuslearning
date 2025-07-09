// ColumnSelectionHandler.js
import { BaseEventHandler } from './BaseEventHandler.js';

export class ColumnSelectionHandler extends BaseEventHandler {
    constructor(grid) {
        super(grid);
        this.dragStart = null;
        this.dragCurrent = null;
        this.autoScrollInterval = null;
        this.autoScrollDirection = null;
        this.lastMouseX = 0;
    }

    hitTest(x, y) {
        // Column header area
        return y < this.grid.colHeaderHeight && x > this.grid.rowHeaderWidth;
    }

    pointerDown(x, y, e) {
        super.pointerDown(x, y, e);
        const col = this.grid.getColumnAtPosition(x);
        if (col >= 0) {
            this.dragStart = col;
            this.dragCurrent = col;
            this.grid.selectionManager.resetSelections();
            this.grid.selectionManager.addColumnSelection(col);
            this.grid.scheduleRender();
        }
    }

    pointerMove(x, y, e) {
        if (this.isActive && this.dragStart !== null) {
            this.lastMouseX = x;
            this.handleAutoScroll(x, y);
            
            const col = this.grid.getColumnAtPosition(x);
            if (col >= 0 && col !== this.dragCurrent) {
                this.updateColumnSelection(col);
                this.dragCurrent = col;
            }
        }
    }

    pointerUp(x, y, e) {
        super.pointerUp(x, y, e);
        this.stopAutoScroll();
        this.dragStart = null;
        this.dragCurrent = null;
    }

    updateColumnSelection(col) {
        const start = Math.min(this.dragStart, col);
        const end = Math.max(this.dragStart, col);
        let selection = this.grid.selectionManager.getColumnSelection(this.dragStart);
        if (!selection) {
            selection = this.grid.selectionManager.addColumnSelection(this.dragStart);
        }
        selection.startCol = start;
        selection.endCol = end;
        this.grid.scheduleRender();
    }

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
        }

        if (scrollNeeded) {
            this.startAutoScroll(direction);
        } else {
            this.stopAutoScroll();
        }
    }

    startAutoScroll(direction) {
        if (this.autoScrollInterval && this.autoScrollDirection === direction) return;
        this.stopAutoScroll();
        
        this.autoScrollDirection = direction;
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
            }

            if (scrolled) {
                const col = this.grid.getColumnAtPosition(this.lastMouseX);
                if (col >= 0) {
                    this.updateColumnSelection(col);
                }
            }
        }, 30);
    }

    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
            this.autoScrollDirection = null;
        }
    }

    getMaxScrollX() {
        let totalWidth = this.grid.rowHeaderWidth;
        for (let i = 0; i < this.grid.columns.noOfColumns; i++) {
            totalWidth += this.grid.columns.getColumnWidth(i);
        }
        return Math.max(0, totalWidth - this.grid.canvas.width);
    }

    cleanup() {
        super.cleanup();
        this.stopAutoScroll();
    }
}