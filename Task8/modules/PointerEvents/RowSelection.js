// RowSelectionHandler.js
import { BaseEventHandler } from './BaseEventHandler.js';

export class RowSelectionHandler extends BaseEventHandler {
    constructor(grid) {
        super(grid);
        this.dragStart = null;
        this.dragCurrent = null;
    }

    hitTest(x, y) {
        // Row header area
        return x < this.grid.rowHeaderWidth && y > this.grid.colHeaderHeight;
    }

    pointerDown(x, y, e) {
        super.pointerDown(x, y, e);
        const row = this.grid.getRowAtPosition(y);
        const col = 0;
        if (row >= 0) {
            this.dragStart = row;
            this.dragCurrent = row;
            this.grid.lastSelectedCell = {row,col};
            this.grid.selectionManager.resetSelections();
            this.grid.selectionManager.addRowSelection(row);
            this.grid.scheduleRender();
        }
    }

    pointerMove(x, y, e) {
        if (this.isActive && this.dragStart !== null) {
            
            const row = this.grid.getRowAtPosition(y);
            if (row >= 0 && row !== this.dragCurrent) {
                this.updateRowSelection(row);
                this.dragCurrent = row;
            }
        }
    }

    pointerUp(x, y, e) {
        super.pointerUp(x, y, e);
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
}
