const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const downloadBtn = document.getElementById("downloadBtn");
const eraserBtn = document.getElementById("eraserBtn");
const clearBtn = document.getElementById("clearBtn");
const grid = document.getElementById("grid");
const gridSizeSelector = document.getElementById("gridSize");
const zoomRange = document.getElementById("zoomRange");
let pixelSize = 25; 

let history = [];
let redoStack = [];
let isErasing = false;
let isDrawing = false;
let currentColor = "#000000";
let gridSize = 32;

/* -------------------- PICKR SETUP -------------------- */

const pickr = Pickr.create({
  el: '#colorPicker',
  theme: 'classic',
  default: '#000000',
  components: {
    preview: true,
    opacity: false,
    hue: true,
    interaction: {
      hex: true,
      rgba: false,
      input: true,
      save: true
    }
  }
});

// Save selected color
pickr.on('save', (color) => {
  currentColor = color.toHEXA().toString();
  pickr.hide();
});

// Prevent picker from opening while erasing
pickr.on('show', () => {
  if (isErasing) {
    pickr.hide();
  }
});

// Get pickr button AFTER it's created
const pickrButton = document.querySelector(".pcr-button");
pickrButton.classList.add("active");

/* -------------------- GRID SIZE -------------------- */

gridSizeSelector.addEventListener("change", () => {
  gridSize = parseInt(gridSizeSelector.value);
  createGrid();
});

/* -------------------- GRID CREATION -------------------- */

function createGrid() {
  grid.innerHTML = "";
grid.style.gridTemplateColumns = `repeat(${gridSize}, ${pixelSize}px)`;
  for (let i = 0; i < gridSize * gridSize; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.style.width = pixelSize + "px";
pixel.style.height = pixelSize + "px";

    function paint() {
      pixel.style.backgroundColor = isErasing
        ? "#ffffff"
        : currentColor;
    }

    pixel.addEventListener("mousedown", () => {
      isDrawing = true;
      saveState();
      paint();
    });

    pixel.addEventListener("mouseover", () => {
      if (isDrawing) paint();
    });

    grid.appendChild(pixel);
  }
}

document.addEventListener("mouseup", () => {
  isDrawing = false;
});

createGrid();

/* -------------------- ERASER TOGGLE -------------------- */

eraserBtn.addEventListener("click", () => {
  isErasing = !isErasing;

  if (isErasing) {
    eraserBtn.classList.add("active");
    pickrButton.classList.remove("active");
  } else {
    eraserBtn.classList.remove("active");
    pickrButton.classList.add("active");
  }
});

/* -------------------- CLEAR -------------------- */

clearBtn.addEventListener("click", () => {
  document.querySelectorAll(".pixel").forEach(pixel => {
    pixel.style.backgroundColor = "#ffffff";
  });
});

/* -------------------- DOWNLOAD -------------------- */

downloadBtn.addEventListener("click", () => {
  html2canvas(grid).then(canvas => {
    const link = document.createElement("a");
    link.download = "tiny-pixel.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

/* -------------------- UNDO / REDO -------------------- */

function saveState() {
  const pixels = document.querySelectorAll(".pixel");
  const state = [];

  pixels.forEach(pixel => {
    state.push(pixel.style.backgroundColor);
  });

  history.push(state);
  redoStack = [];
}

function restoreState(state) {
  const pixels = document.querySelectorAll(".pixel");

  pixels.forEach((pixel, index) => {
    pixel.style.backgroundColor = state[index] || "#ffffff";
  });
}

undoBtn.addEventListener("click", () => {
  if (history.length === 0) return;

  const currentState = history.pop();
  redoStack.push(currentState);

  const previousState = history[history.length - 1];
  if (previousState) {
    restoreState(previousState);
  } else {
    document.querySelectorAll(".pixel").forEach(pixel => {
      pixel.style.backgroundColor = "#ffffff";
    });
  }
});

redoBtn.addEventListener("click", () => {
  if (redoStack.length === 0) return;

  const state = redoStack.pop();
  history.push(state);
  restoreState(state);
});
zoomRange.addEventListener("input", () => {
  pixelSize = parseInt(zoomRange.value);

  const pixels = document.querySelectorAll(".pixel");

  pixels.forEach(pixel => {
    pixel.style.width = pixelSize + "px";
    pixel.style.height = pixelSize + "px";
  });

  grid.style.gridTemplateColumns = `repeat(${gridSize}, ${pixelSize}px)`;
});