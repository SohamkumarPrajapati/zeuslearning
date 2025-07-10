import { ColumnResizeHandler } from './PointerEvents/ColumnResize.js';
import { RowResizeHandler } from './PointerEvents/RowResize.js';
import { ColumnSelectionHandler } from './PointerEvents/ColumnSelection.js';
import { RowSelectionHandler } from './PointerEvents/RowSelection.js';
import { CellRangeSelectionHandler } from './PointerEvents/CellRangeSelection.js';
import { PointerEventHandler } from './PointerEvents/PointerEventHandler.js';
import { ExcelGrid } from './ExcelGrid.js';
import { KeyBoardEventHandler } from './KeyBoardEventHandler.js';
import { UIEventHandler } from './UIEventHandler.js';

export class TouchAction {
    /**
     * initializes the central touch action object which manages all events and buttons
     * @param {ExcelGrid} grid 
     */
    constructor(grid) {
        this.grid = grid;
        this.handlers = [
            new ColumnResizeHandler(this.grid),
            new RowResizeHandler(this.grid),
            new ColumnSelectionHandler(this.grid),
            new RowSelectionHandler(this.grid),
            new CellRangeSelectionHandler(this.grid)
        ];

        this.pointerEventHandler = new PointerEventHandler(this.grid, this.handlers);
        this.keyBoardEventHandler = new KeyBoardEventHandler(this.grid);
        this.uIEventHandler = new UIEventHandler(this.grid);
    }
}