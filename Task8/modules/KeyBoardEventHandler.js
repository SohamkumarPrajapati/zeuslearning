import { ExcelGrid } from "./ExcelGrid.js";

export class KeyBoardEventHandler {
    /**
     * initialize the keyboard event handler object
     * @param {ExcelGrid} grid 
     */
    constructor(grid) {
        this.grid = grid;
        this.setupKeyboardListeners();
    }

    /**
     * setups the keyboard events for the excel grid object
     */
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.grid.editingCell) return;

            // If a cell is selected and a character key is pressed, start editing
            if (this.grid.lastSelectedCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                this.grid.startEditing(this.grid.lastSelectedCell.row, this.grid.lastSelectedCell.col);
                this.grid.cellEditor.value = e.key;
                this.grid.cellEditor.setSelectionRange(1, 1);
                e.preventDefault();
                return;
            }

            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // Undo/Redo
            if (isCtrl && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (isShift) {
                    this.grid.commandManager.redo();
                } else {
                    this.grid.commandManager.undo();
                }
                return;
            }

            // Arrow key scrolling
            const scrollSpeed = 50;
            let shouldRender = false;

            switch (e.key) {
                case 'ArrowRight':
                    this.grid.scrollX += scrollSpeed;
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.grid.scrollX = Math.max(0, this.grid.scrollX - scrollSpeed);
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.grid.scrollY += scrollSpeed;
                    shouldRender = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.grid.scrollY = Math.max(0, this.grid.scrollY - scrollSpeed);
                    shouldRender = true;
                    e.preventDefault();
                    break;
            }

            if (shouldRender) {
                this.grid.scheduleRender();
            }
        });
        this.grid.cellEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.grid.stopEditing();
            } else if (e.key === 'Escape') {
                this.grid.cancelEditing();
            }
        });
    }
}