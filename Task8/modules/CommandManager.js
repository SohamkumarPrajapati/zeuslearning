import { ExcelGrid } from "./ExcelGrid.js";

/**
 * Base class for all command operations (used in undo/redo pattern).
 */
export class Command {
    /**
     * Executes the command.
     */
    execute() { }

    /**
     * Undoes the command.
     */
    undo() { }
}

/**
 * Command to set the value of a cell.
 */
export class SetCellValueCommand extends Command {
    /**
     * Creates a command to change a cell's value.
     * @param {object} grid - The grid instance.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {*} newValue - The new value to set.
     * @param {*} oldValue - The old value to restore during undo.
     */
    constructor(grid, row, col, newValue, oldValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }

    /**
     * Executes the cell value change.
     */
    execute() {
        this.grid.cells.setCellValue(this.row, this.col, this.newValue);
    }

    /**
     * Reverts the cell value to the old value.
     */
    undo() {
        this.grid.cells.setCellValue(this.row, this.col, this.oldValue);
    }
}

/**
 * Command to resize a column in the grid.
 */
export class ResizeColumnCommand extends Command {
    /**
     * Creates a command to resize a column.
     * @param {object} grid - The grid instance.
     * @param {number} colIndex - The index of the column to resize.
     * @param {number} newWidth - The new width to apply.
     * @param {number} oldWidth - The previous width to restore on undo.
     */
    constructor(grid, colIndex, newWidth, oldWidth) {
        super();
        this.grid = grid;
        this.colIndex = colIndex;
        this.newWidth = newWidth;
        this.oldWidth = oldWidth;
    }

    /**
     * Applies the new column width.
     */
    execute() {
        this.grid.columns.setColumnWidth(this.colIndex, this.newWidth);
    }

    /**
     * Restores the original column width.
     */
    undo() {
        this.grid.columns.setColumnWidth(this.colIndex, this.oldWidth);
    }
}

/**
 * Command to resize a row in the grid.
 */
export class ResizeRowCommand extends Command {
    /**
     * Creates a command to resize a row.
     * @param {object} grid - The grid instance.
     * @param {number} rowIndex - The index of the row to resize.
     * @param {number} newHeight - The new height to apply.
     * @param {number} oldHeight - The previous height to restore on undo.
     */
    constructor(grid, rowIndex, newHeight, oldHeight) {
        super();
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.newHeight = newHeight;
        this.oldHeight = oldHeight;
    }

    /**
     * Applies the new row height.
     */
    execute() {
        this.grid.rows.setRowHeight(this.rowIndex, this.newHeight);
    }

    /**
     * Restores the original row height.
     */
    undo() {
        this.grid.rows.setRowHeight(this.rowIndex, this.oldHeight);
    }
}

/**
 * Command to insert the row in the canvas
 */
export class InsertRowCommand extends Command {
    /**
     * initialize the insertRowCommand
     * @param {ExcelGrid} grid 
     * @param {number} rowIndex 
     * @param {string} direction - in which side you want to add the row up or down to rowIndex row
     */
    constructor(grid, rowIndex, direction = 'up') {
        super();
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.direction = direction; // 'up' or 'down'
    }
 
    /**
     * insert the new row and perform related logic
     */
    execute() {
        if (this.direction === 'up') {
            this.grid.cells.shiftCellsToNextRow(this.rowIndex);
            this.grid.rows.insertRowUp(this.rowIndex);
        } else {
            this.grid.cells.shiftCellsToNextRow(this.rowIndex + 1);
            this.grid.rows.insertRowDown(this.rowIndex);
        }
        this.grid.render();
    }

    /**
     * undo the previous row insertion by deleting it
     */
    undo() {
        // Remove the inserted row
        if (this.direction === 'up') {
            this.grid.rows.deleteRow(this.rowIndex);
            this.grid.cells.deleteCellsOnRow(this.rowIndex);
        } else {
            this.grid.rows.deleteRow(this.rowIndex + 1);
            this.grid.cells.deleteCellsOnRow(this.rowIndex + 1);
        }
        this.grid.render();
    }
}


/**
 * command for inserting the column in canvas
 */
export class InsertColumnCommand extends Command {
    /**
     * 
     * @param {ExcelGrid} grid 
     * @param {number} colIndex 
     * @param {string} direction - in which way to selected column you want to add the new column left or right to selected column
     */
    constructor(grid, colIndex, direction = 'left') {
        super();
        this.grid = grid;
        this.colIndex = colIndex;
        this.direction = direction; // 'left' or 'right'
    }

    /**
     * executes the insertColumn command and inserts the new column on position based on variable direction
     */
    execute() {
        if (this.direction === 'left') {
            this.grid.cells.shiftCellsToNextColumn(this.colIndex);
            this.grid.columns.insertColumnLeft(this.colIndex);
        } else {
            this.grid.cells.shiftCellsToNextColumn(this.colIndex + 1);
            this.grid.columns.insertColumnRight(this.colIndex);
        }
        this.grid.render();
    }

    /**
     * deletes the last inserted column and update the remaining column logic
     */
    undo() {
        // Remove the inserted column
        if (this.direction === 'left') {
            this.grid.columns.deleteColumn(this.colIndex);
            this.grid.cells.deleteCellsOnColumn(this.colIndex);
        } else {
            this.grid.columns.deleteColumn(this.colIndex + 1);
            this.grid.cells.deleteCellsOnColumn(this.colIndex + 1);
        }
        this.grid.render();
    }
}

/**
 * Manages a stack of commands for undo and redo functionality.
 */
export class CommandManager {
    /**
     * Initializes the command manager.
     * @param {object|null} grid - The grid instance (optional).
     */
    constructor(grid = null) {
        this.grid = grid;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 1000;
    }

    /**
     * Executes a command and pushes it onto the undo stack.
     * @param {Command} command - The command to execute.
     */
    executeCommand(command) {
        command.execute();
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    /**
     * Undoes the most recent command.
     */
    undo() {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            this.grid?.render();
        }
    }

    /**
     * Redoes the most recently undone command.
     */
    redo() {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            this.grid?.render();
        }
    }

}
