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
            this.grid.lastSelectedCell = cell;
            this.grid.selectionManager.resetSelections();
            this.grid.selectionManager.addRangeSelection(
                this.dragStart.row, this.dragStart.col, cell.row, cell.col
            );
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
        this.dragStart = null;
    }
}