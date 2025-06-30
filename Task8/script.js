import { ExcelGrid } from "./ExcelGrid.js";

// Initialize the application
const canvas = document.getElementById('gridCanvas');
const grid = new ExcelGrid(canvas);

// Handle window resize
window.addEventListener('resize', () => {
    grid.initializeCanvas();
    grid.render();
});
