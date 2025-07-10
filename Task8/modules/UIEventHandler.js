import { ExcelGrid } from "./ExcelGrid.js";
import { InsertRowCommand, InsertColumnCommand } from './CommandManager.js';
import { DeleteRowCommand, DeleteColumnCommand } from './CommandManager.js';

export class UIEventHandler {
    /**
     * inintialize the ui events and its handling
     * @param {ExcelGrid} grid 
     */
    constructor(grid) {
        this.grid = grid;
        this.setupUIEventListeners();
    }
    /**
    * setsup the ui events for excel grid object as clicks and keydowns
    */
    setupUIEventListeners() {
        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.grid.loadJSONFile(file);
            }
        });


        this.grid.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.grid.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Cell editor
        this.grid.cellEditor.addEventListener('blur', () => this.grid.stopEditing());

        // Row insertion buttons
        this.grid.insertRowUpBtn.addEventListener('click', () => {
            this.handleRowInsertion('up');
        });

        this.grid.insertRowDownBtn.addEventListener('click', () => {
            this.handleRowInsertion('down');
        });

        // Column insertion buttons
        this.grid.insertColumnLeftBtn.addEventListener('click', () => {
            this.handleColumnInsertion('left');
        });

        this.grid.insertColumnRightBtn.addEventListener('click', () => {
            this.handleColumnInsertion('right');
        });

        // Delete buttons
        this.grid.deleteRowBtn.addEventListener('click', () => {
            this.handleRowDeletion();
        });

        this.grid.deleteColumnBtn.addEventListener('click', () => {
            this.handleColumnDeletion();
        });
    }

    /**
     * inserts the row based on the directs up or bottom to the selected row
     * @param {string} direction 
     */
    handleRowInsertion(direction) {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'row') {
            const startRow = selection.startRow;
            const command = new InsertRowCommand(this.grid, startRow, direction);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            const newRow = direction === 'up' ? startRow + 1 : startRow;
            this.grid.selectionManager.addRowSelection(newRow);
            this.grid.scheduleRender();
        }
    }

    /**
     * inserts the column based on the direction
     * @param {string} direction 
     */
    handleColumnInsertion(direction) {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'column') {
            const startCol = selection.startCol;
            const command = new InsertColumnCommand(this.grid, startCol, direction);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            const newCol = direction === 'left' ? startCol + 1 : startCol;
            this.grid.selectionManager.addColumnSelection(newCol);
            this.grid.scheduleRender();
        }
    }

    /**
     * deleted the row
     */
    handleRowDeletion() {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'row') {
            const startRow = selection.startRow;
            const command = new DeleteRowCommand(this.grid, startRow);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            // Disable delete buttons
            this.grid.deleteRowBtn.disabled = true;
            this.grid.deleteColumnBtn.disabled = true;
            this.grid.scheduleRender();
        }
    }

    /**
     * deletes the column from the canvas
     */
    handleColumnDeletion() {
        const selection = this.grid.selectionManager.selection;
        if (selection && selection.type === 'column') {
            const startCol = selection.startCol;
            const command = new DeleteColumnCommand(this.grid, startCol);
            this.grid.commandManager.executeCommand(command);
            this.grid.selectionManager.resetSelections();

            // Disable delete buttons
            this.grid.deleteRowBtn.disabled = true;
            this.grid.deleteColumnBtn.disabled = true;
            this.grid.scheduleRender();
        }
    }

    /**
         * handle dounble click on the window and checks if the input box should open or not
         * @param {Event} e 
         */
    handleDoubleClick(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cell = this.grid.getCellAtPosition(x, y);
        if (cell) {
            this.grid.selectionManager.resetSelections();
            this.grid.lastSelectedCell = cell;
            this.grid.startEditing(cell.row, cell.col);
            this.grid.highlightCellHeaders(cell.row, cell.col);
        }
    }

    /**
     * scrolls and rerender the canvas based on the wheel scrolling
     * @param {Event} e 
     */
    handleWheel(e) {
        e.preventDefault();

        if (e.shiftKey) {
            this.grid.scrollX = Math.max(0, this.grid.scrollX + e.deltaY);
        } else {
            if (e.deltaX !== 0) {
                this.grid.scrollX = Math.max(0, this.grid.scrollX + e.deltaX);
            }
            if (e.deltaY !== 0) {
                this.grid.scrollY = Math.max(0, this.grid.scrollY + e.deltaY);
            }
        }

        this.grid.scheduleRender();
    }
}