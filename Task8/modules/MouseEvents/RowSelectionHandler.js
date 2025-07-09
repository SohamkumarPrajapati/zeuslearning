// RowSelectionHandler.js
import { BaseEventHandler } from './BaseEventHandler.js';

export class RowSelectionHandler extends BaseEventHandler {
    constructor(grid) {
        super(grid);
        this.dragStart = null;
        this.dragCurrent = null;
        this.autoScrollInterval = null;
        this.autoScrollDirection = null;
        this.lastMouseY = 0;
    }

    hitTest(x, y) {
        // Row header area
        return x < this.grid.rowHeaderWidth && y > this.grid.colHeaderHeight;
    }

    pointerDown(x, y, e) {
        super.pointerDown(x, y, e);
        const row = this.grid.getRowAtPosition(y);
        if (row >= 0) {
            this.dragStart = row;
            this.dragCurrent = row;
            this.grid.selectionManager.resetSelections();
            this.grid.selectionManager.addRowSelection(row);
            this.grid.scheduleRender();
        }
    }

    pointerMove(x, y, e) {
        if (this.isActive && this.dragStart !== null) {
            this.lastMouseY = y;
            this.handleAutoScroll(x, y);
            
            const row = this.grid.getRowAtPosition(y);
            if (row >= 0 && row !== this.dragCurrent) {
                this.updateRowSelection(row);
                this.dragCurrent = row;
            }
        }
    }

    pointerUp(x, y, e) {
        super.pointerUp(x, y, e);
        this.stopAutoScroll();
        this.dragStart = null;
        this.dragCurrent = null;
    }

    updateRowSelection(row) {
        const start = Math.min(this.dragStart, row);
        const end = Math.max(this.dragStart, row);
        let selection = this.grid.selectionManager.getRowSelection(this.dragStart);
        if (!selection) {
            selection = this.grid.selectionManager.addRowSelection(this.dragStart);
        }
        selection.startRow = start;
        selection.endRow = end;
        this.grid.scheduleRender();
    }

    handleAutoScroll(x, y) {
        const edgeThreshold = 10;
        let scrollNeeded = false;
        let direction = null;

        if (y > this.grid.canvas.height - edgeThreshold) {
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

    startAutoScroll(direction) {
        if (this.autoScrollInterval && this.autoScrollDirection === direction) return;
        this.stopAutoScroll();
        
        this.autoScrollDirection = direction;
        this.autoScrollInterval = setInterval(() => {
            const scrollSpeed = 20;
            let scrolled = false;

            if (direction === 'down') {
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

            if (scrolled) {
                const row = this.grid.getRowAtPosition(this.lastMouseY);
                if (row >= 0) {
                    this.updateRowSelection(row);
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

    getMaxScrollY() {
        let totalHeight = this.grid.colHeaderHeight;
        for (let i = 0; i < this.grid.rows.noOfRows; i++) {
            totalHeight += this.grid.rows.getRowHeight(i);
        }
        return Math.max(0, totalHeight - this.grid.canvas.height);
    }

    cleanup() {
        super.cleanup();
        this.stopAutoScroll();
    }
}
