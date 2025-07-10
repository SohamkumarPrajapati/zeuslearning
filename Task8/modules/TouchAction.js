import { ColumnResizeHandler } from './MouseEvents/ColumnResizeHandler.js';
import { RowResizeHandler } from './MouseEvents/RowResizeHandler.js';
import { ColumnSelectionHandler } from './MouseEvents/ColumnSelectionHandler.js';
import { RowSelectionHandler } from './MouseEvents/RowSelectionHandler.js';
import { CellRangeSelectionHandler } from './MouseEvents/CellRangeSelectionHandler.js';
import { RegisterEventHandler } from './MouseEvents/RegisterEventHandler.js';
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

        this.registerEventHandler = new RegisterEventHandler(this.grid, this.handlers);
        this.keyBoardEventHandler = new KeyBoardEventHandler(this.grid);
        this.uIEventHandler = new UIEventHandler(this.grid);
    }
}