class BackgroundDiv {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.div = document.createElement('div');
        this.div.className = 'background-div';
        this.container.appendChild(this.div);
    }

    getRect() {
        return this.div.getBoundingClientRect();
    }
}

class DraggableChildDiv {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;
        this.div = document.createElement('div');
        this.div.className = 'draggable-child';
        this.size = 50;
        this.div.style.left = '0px';
        this.div.style.top = '0px';

        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.div.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        document.addEventListener('pointermove', (e) => this.onPointerMove(e));
        document.addEventListener('pointerup', (e) => this.onPointerUp(e));

        this.parentDiv.appendChild(this.div);
    }

    onPointerDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.div.setPointerCapture(e.pointerId);

        const rect = this.div.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
    }

    onPointerMove(e) {
        if (!this.isDragging) return;

        const parentRect = this.parentDiv.getBoundingClientRect();
        let newLeft = e.clientX - parentRect.left - this.offsetX;
        let newTop = e.clientY - parentRect.top - this.offsetY;

        newLeft = Math.max(0, Math.min(newLeft, parentRect.width - this.size));
        newTop = Math.max(0, Math.min(newTop, parentRect.height - this.size));

        this.div.style.left = newLeft + 'px';
        this.div.style.top = newTop + 'px';
    }

    onPointerUp(e) {
        this.isDragging = false;
        this.div.releasePointerCapture(e.pointerId);
    }
}


class GameCreator {
    constructor(containerId,count) {
        this.container = document.getElementById(containerId);
        this.count = count;
        this.bg = [];
        this.children = [];
        for (let i = 0; i < count; i++) {
            this.bg[i] = new BackgroundDiv(containerId);
            this.children[i] = new DraggableChildDiv(this.bg[i].div);
        }

        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        for (let i = 0; i < this.count; i++) {
            const parentRect = this.bg[i].getRect();
            let left = parseInt(this.children[i].div.style.left, 10);
            let top = parseInt(this.children[i].div.style.top, 10);
            left = Math.max(0, Math.min(left, parentRect.width - this.children[i].size));
            top = Math.max(0, Math.min(top, parentRect.height - this.children[i].size));
            this.children[i].div.style.left = left + 'px';
            this.children[i].div.style.top = top + 'px';
        }
    }
}

const games = new GameCreator('container', +prompt("Enter the number of games:", "3"));

// window.addEventListener('resize', () => {
//     const parentRect = bg.getRect();
//     let left = parseInt(child.div.style.left, 10);
//     let top = parseInt(child.div.style.top, 10);
//     left = Math.max(0, Math.min(left, parentRect.width - child.size));
//     top = Math.max(0, Math.min(top, parentRect.height - child.size));
//     child.div.style.left = left + 'px';
//     child.div.style.top = top + 'px';
// });