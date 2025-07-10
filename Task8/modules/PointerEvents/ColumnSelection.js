// ColumnSelectionHandler.js
import { BaseEventHandler } from './BaseEventHandler.js';

export class ColumnSelectionHandler extends BaseEventHandler {
    constructor(grid) {
        super(grid);
        this.dragStart = null;
        this.dragCurrent = null;
    }

    hitTest(x, y) {
        // Column header area
        return y < this.grid.colHeaderHeight && x > this.grid.rowHeaderWidth;
    }

    pointerDown(x, y, e) {
        super.pointerDown(x, y, e);
        const col = this.grid.getColumnAtPosition(x);
        const row = 0;
        if (col >= 0) {
            this.dragStart = col;
            this.dragCurrent = col;
            this.grid.lastSelectedCell = {row,col};
            this.grid.selectionManager.resetSelections();
            this.grid.selectionManager.addColumnSelection(col);
            this.grid.scheduleRender();
        }
    }

    pointerMove(x, y, e) {
        if (this.isActive && this.dragStart !== null) {
            
            const col = this.grid.getColumnAtPosition(x);
            if (col >= 0 && col !== this.dragCurrent) {
                this.updateColumnSelection(col);
                this.dragCurrent = col;
            }
        }
    }

    pointerUp(x, y, e) {
        super.pointerUp(x, y, e);
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
}