// BaseEventHandler.js
export class BaseEventHandler {
    constructor(grid) {
        this.grid = grid;
        this.isActive = false;
    }

    /**
     * Check if this handler should be active based on mouse position
     * @param {number} x - Mouse x position
     * @param {number} y - Mouse y position
     * @returns {boolean}
     */
    hitTest(x, y) {
        throw new Error('hitTest method must be implemented by subclass');
    }

    /**
     * Handle pointer down event
     * @param {number} x - Mouse x position
     * @param {number} y - Mouse y position
     * @param {MouseEvent} e - Original mouse event
     */
    pointerDown(x, y, e) {
        this.isActive = true;
    }

    /**
     * Handle pointer move event
     * @param {number} x - Mouse x position
     * @param {number} y - Mouse y position
     * @param {MouseEvent} e - Original mouse event
     */
    pointerMove(x, y, e) {
        // Override in subclasses
    }

    /**
     * Handle pointer up event
     * @param {number} x - Mouse x position
     * @param {number} y - Mouse y position
     * @param {MouseEvent} e - Original mouse event
     */
    pointerUp(x, y, e) {
        this.isActive = false;
    }

    /**
     * Get cursor style for this handler
     * @returns {string}
     */
    getCursor() {
        return 'cell';
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.isActive = false;
    }
}