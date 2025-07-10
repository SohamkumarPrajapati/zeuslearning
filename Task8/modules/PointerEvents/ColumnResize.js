import { BaseEventHandler } from './BaseEventHandler.js';
import { ResizeColumnCommand } from '../CommandManager.js';
import { ExcelGrid } from '../ExcelGrid.js';

/**
 * event handler that manages the column resizing
 */
export class ColumnResizeHandler extends BaseEventHandler {
    /**
     * initialize with the reference to the excel grid object
     * @param {ExcelGrid} grid 
     */
    constructor(grid) {
        super(grid);
        this.resizeIndex = -1;
        this.initialWidth = null;
        this.initialIndex = null;
    }

    /**
     * checks if the mouse pointer is in this event triggering position or not
     * @param {number} x 
     * @param {number} y 
     * @returns true of false based on the mouse pointer position
     */
    hitTest(x, y) {
        // Only allow resizing in column header area
        if (y >= 0 && y <= this.grid.colHeaderHeight && x > this.grid.rowHeaderWidth) {
            let currentX = this.grid.rowHeaderWidth - this.grid.scrollX;
            for (let i = 0; i < this.grid.columns.noOfColumns; i++) {
                const columnWidth = this.grid.columns.getColumnWidth(i);
                currentX += columnWidth;

                if (Math.abs(x - currentX) < 5 && currentX > this.grid.rowHeaderWidth) {
                    this.resizeIndex = i;
                    return true;
                }

                if (currentX > this.grid.canvas.width) break;
            }
        }
        return false;
    }

    /**
     * function code that got executed by register handler on hittest's truthy value
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerDown(x, y, e) {
        super.pointerDown(x, y, e);
        this.initialWidth = this.grid.columns.getColumnWidth(this.resizeIndex);
        this.initialIndex = this.resizeIndex;
    }

    /**
     * function code to execute when the handler is active and mouse is hovring for that area
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerMove(x, y, e) {
        if (this.isActive) {
            const startX = this.grid.getColumnPosition(this.resizeIndex);
            const newWidth = Math.max(20, x - startX);
            this.grid.columns.setColumnWidth(this.resizeIndex, newWidth);
            this.grid.scheduleRender();
        }
    }

    /**
     * function code to execute when mouse is up
     * @param {number} x 
     * @param {number} y 
     * @param {Event} e 
     */
    pointerUp(x, y, e) {
        if (this.isActive) {
            const finalWidth = this.grid.columns.getColumnWidth(this.initialIndex);
            if (finalWidth !== this.initialWidth) {
                const command = new ResizeColumnCommand(
                    this.grid, this.initialIndex, finalWidth, this.initialWidth
                );
                this.grid.commandManager.executeCommand(command);
            }
        }
        super.pointerUp(x, y, e);
        this.initialWidth = null;
        this.initialIndex = null;
    }

    /**
     * cursor type based on this event
     * @returns {string}
     */
    getCursor() {
        return 'e-resize';
    }
}