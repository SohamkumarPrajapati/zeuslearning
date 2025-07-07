import { ExcelGrid } from "./modules/ExcelGrid.js";


document.body.innerHTML = "";

// Container
const container = document.createElement("div");
container.className = "container";

// Toolbar
const toolbar = document.createElement("div");
toolbar.className = "toolbar";

// File input (hidden)
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.id = "fileInput";
fileInput.accept = ".json";
fileInput.style.display = "none";

// Load JSON button
const loadBtn = document.createElement("button");
loadBtn.textContent = "Load JSON File";
loadBtn.onclick = () => fileInput.click();

// Insert Row Up button (disabled)
const insertRowUpBtn = document.createElement("button");
insertRowUpBtn.id = "insertRowUpBtn";
insertRowUpBtn.textContent = "Insert Row Up";
insertRowUpBtn.disabled = true;

// Insert Row Down button (disabled)
const insertRowDownBtn = document.createElement("button");
insertRowDownBtn.id = "insertRowDownBtn";
insertRowDownBtn.textContent = "Insert Row Down";
insertRowDownBtn.disabled = true;

// Insert Column Left button (disabled)
const insertColumnLeftBtn = document.createElement("button");
insertColumnLeftBtn.id = "insertColumnLeftBtn";
insertColumnLeftBtn.textContent = "Insert Column Left";
insertColumnLeftBtn.disabled = true;

// Insert Column Right button (disabled)
const insertColumnRightBtn = document.createElement("button");
insertColumnRightBtn.id = "insertColumnRightBtn";
insertColumnRightBtn.textContent = "Insert Column Right";
insertColumnRightBtn.disabled = true;

// Delete Row button (disabled)
const deleteRowBtn = document.createElement("button");
deleteRowBtn.id = "deleteRowBtn";
deleteRowBtn.textContent = "Delete Row";
deleteRowBtn.disabled = true;

// Delete Column button (disabled)
const deleteColumnBtn = document.createElement("button");
deleteColumnBtn.id = "deleteColumnBtn";
deleteColumnBtn.textContent = "Delete Column";
deleteColumnBtn.disabled = true;

// Stats div
const statsDiv = document.createElement("div");
statsDiv.className = "stats";
statsDiv.id = "stats";

// Append all toolbar elements
toolbar.appendChild(fileInput);
toolbar.appendChild(loadBtn);
toolbar.appendChild(insertRowUpBtn);
toolbar.appendChild(insertRowDownBtn);
toolbar.appendChild(insertColumnLeftBtn);
toolbar.appendChild(insertColumnRightBtn);
toolbar.appendChild(deleteRowBtn);
toolbar.appendChild(deleteColumnBtn);
toolbar.appendChild(statsDiv);

// Canvas container
const canvasContainer = document.createElement("div");
canvasContainer.className = "canvas-container";

// Canvas
const canvas = document.createElement("canvas");
canvas.id = "gridCanvas";

// Cell editor input
const cellEditor = document.createElement("input");
cellEditor.type = "text";
cellEditor.className = "cell-editor";
cellEditor.id = "cellEditor";
cellEditor.style.display = "none";

// Append canvas and editor to canvas container
canvasContainer.appendChild(canvas);
canvasContainer.appendChild(cellEditor);

// Append toolbar and canvas container to container
container.appendChild(toolbar);
container.appendChild(canvasContainer);

// Append container to body
document.body.appendChild(container);


// Initialize the application
const grid = new ExcelGrid(canvas);

// Handle window resize
window.addEventListener('resize', () => {
    grid.initializeCanvas();
    grid.render();
});