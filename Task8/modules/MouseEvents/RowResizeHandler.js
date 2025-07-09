import { BaseEventHandler } from './BaseEventHandler.js';
import { ResizeRowCommand } from '../CommandManager.js';
import { ExcelGrid } from '../ExcelGrid.js';

export class RowResizeHandler extends BaseEventHandler {
    /**
     * initialize the rowResizeHandler object
     * @param {ExcelGrid} grid 
     */
    constructor(grid) {
        super(grid);
        this.resizeIndex = -1;
        this.initialHeight = null;
        this.initialIndex = null;
    }

    /**
     * checks if the resizing row event should trigeer for this mouse position or not
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    hitTest(x, y) {
        // Only allow resizing in row header area
        if (x >= 0 && x <= this.grid.rowHeaderWidth && y > this.grid.colHeaderHeight) {
            let currentY = this.grid.colHeaderHeight - this.grid.scrollY;
            for (let i = 0; i < this.grid.rows.noOfRows; i++) {
                const rowHeight = this.grid.rows.getRowHeight(i);
                currentY += rowHeight;

                if (Math.abs(y - currentY) < 5 && currentY > this.grid.colHeaderHeight) {
                    this.resizeIndex = i;
                    return true;
                }

                if (currentY > this.grid.canvas.height) break;
            }
        }
        return false;
    }

    /**
     * executes when mouse is down at x y position
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerDown(x, y, e) {
        super.pointerDown(x, y, e);
        this.initialHeight = this.grid.rows.getRowHeight(this.resizeIndex);
        this.initialIndex = this.resizeIndex;
    }

    /**
     * eexcutes when mouse is moving and came to position x y
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerMove(x, y, e) {
        if (this.isActive) {
            const startY = this.grid.getRowPosition(this.resizeIndex);
            const newHeight = Math.max(15, y - startY);
            this.grid.rows.setRowHeight(this.resizeIndex, newHeight);
            this.grid.scheduleRender();
        }
    }

    /**
     * final execution and finish code for resizing row event when pointer is finally up
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerUp(x, y, e) {
        if (this.isActive) {
            const finalHeight = this.grid.rows.getRowHeight(this.initialIndex);
            if (finalHeight !== this.initialHeight) {
                const command = new ResizeRowCommand(
                    this.grid, this.initialIndex, finalHeight, this.initialHeight
                );
                this.grid.commandManager.executeCommand(command);
            }
        }
        super.pointerUp(x, y, e);
        this.initialHeight = null;
        this.initialIndex = null;
    }

    /**
     * cursor type for row resizing event
     * @returns {string}
     */
    getCursor() {
        return 'n-resize';
    }
}