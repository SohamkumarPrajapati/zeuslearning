 /**
 * Represents a single cell in the Excel grid
 * Manages cell data, formulas, and styling
 */
export class Cell {
    /**
     * Initializes a new cell with optional value
     * @param {string} value - Initial value for the cell
     */
    constructor(value = '') {
        /** @type {string} Stores the actual value of the cell */
        this.value = value;
        /** @type {string|null} Stores formula if cell contains a formula */
        this.formula = null;
        /** @type {Object} Stores styling information for the cell */
        this.style = {};
    }

    /**
     * Gets the display value of the cell
     * Returns calculated formula result if cell has formula, otherwise returns raw value
     * @returns {string} The value to display in the cell
     */
    getValue() {
        return this.formula ? this.calculateFormula() : this.value;
    }

    /**
     * Sets the value of the cell and clears any existing formula
     * @param {string} value - New value to set in the cell
     */
    setValue(value) {
        this.value = value;
        this.formula = null;
    }

    /**
     * Calculates the result of a formula (basic implementation)
     * Can be extended to support complex formulas
     * @returns {string} The calculated result of the formula
     */
    calculateFormula() {
        // Basic formula calculation (can be extended)
        return this.value;
    }
}