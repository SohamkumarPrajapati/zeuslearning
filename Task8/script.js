import { ExcelGrid } from "./modules/ExcelGrid.js";

class ExcelApp {
    constructor() {
        this.createDOM();
        this.grid = new ExcelGrid(this.canvas);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.grid.initializeCanvas();
            this.grid.render();
        });
    }

    createDOM() {
        document.body.innerHTML = "";

        // Container
        this.container = document.createElement("div");
        this.container.className = "container";

        // Toolbar
        this.toolbar = document.createElement("div");
        this.toolbar.className = "toolbar";

        // File input (hidden)
        this.fileInput = document.createElement("input");
        this.fileInput.type = "file";
        this.fileInput.id = "fileInput";
        this.fileInput.accept = ".json";
        this.fileInput.style.display = "none";

        // Load JSON button
        this.loadBtn = document.createElement("button");
        this.loadBtn.textContent = "Load JSON File";
        this.loadBtn.onclick = () => this.fileInput.click();

        // Insert Row Up button (disabled)
        this.insertRowUpBtn = document.createElement("button");
        this.insertRowUpBtn.id = "insertRowUpBtn";
        this.insertRowUpBtn.textContent = "Insert Row Up";
        this.insertRowUpBtn.disabled = true;

        // Insert Row Down button (disabled)
        this.insertRowDownBtn = document.createElement("button");
        this.insertRowDownBtn.id = "insertRowDownBtn";
        this.insertRowDownBtn.textContent = "Insert Row Down";
        this.insertRowDownBtn.disabled = true;

        // Insert Column Left button (disabled)
        this.insertColumnLeftBtn = document.createElement("button");
        this.insertColumnLeftBtn.id = "insertColumnLeftBtn";
        this.insertColumnLeftBtn.textContent = "Insert Column Left";
        this.insertColumnLeftBtn.disabled = true;

        // Insert Column Right button (disabled)
        this.insertColumnRightBtn = document.createElement("button");
        this.insertColumnRightBtn.id = "insertColumnRightBtn";
        this.insertColumnRightBtn.textContent = "Insert Column Right";
        this.insertColumnRightBtn.disabled = true;

        // Delete Row button (disabled)
        this.deleteRowBtn = document.createElement("button");
        this.deleteRowBtn.id = "deleteRowBtn";
        this.deleteRowBtn.textContent = "Delete Row";
        this.deleteRowBtn.disabled = true;

        // Delete Column button (disabled)
        this.deleteColumnBtn = document.createElement("button");
        this.deleteColumnBtn.id = "deleteColumnBtn";
        this.deleteColumnBtn.textContent = "Delete Column";
        this.deleteColumnBtn.disabled = true;

        // Stats div
        this.statsDiv = document.createElement("div");
        this.statsDiv.className = "stats";
        this.statsDiv.id = "stats";

        // Append all toolbar elements
        this.toolbar.appendChild(this.fileInput);
        this.toolbar.appendChild(this.loadBtn);
        this.toolbar.appendChild(this.insertRowUpBtn);
        this.toolbar.appendChild(this.insertRowDownBtn);
        this.toolbar.appendChild(this.insertColumnLeftBtn);
        this.toolbar.appendChild(this.insertColumnRightBtn);
        this.toolbar.appendChild(this.deleteRowBtn);
        this.toolbar.appendChild(this.deleteColumnBtn);
        this.toolbar.appendChild(this.statsDiv);

        // Canvas container
        this.canvasContainer = document.createElement("div");
        this.canvasContainer.className = "canvas-container";

        // Canvas
        this.canvas = document.createElement("canvas");
        this.canvas.id = "gridCanvas";

        // Cell editor input
        this.cellEditor = document.createElement("input");
        this.cellEditor.type = "text";
        this.cellEditor.className = "cell-editor";
        this.cellEditor.id = "cellEditor";
        this.cellEditor.style.display = "none";

        // Append canvas and editor to canvas container
        this.canvasContainer.appendChild(this.canvas);
        this.canvasContainer.appendChild(this.cellEditor);

        // Append toolbar and canvas container to container
        this.container.appendChild(this.toolbar);
        this.container.appendChild(this.canvasContainer);

        // Append container to body
        document.body.appendChild(this.container);
    }
}

// Initialize the application
new ExcelApp();