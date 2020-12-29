const defaultRow = 10;
const defaultCol = 10;
let pixelData = {};
let penMode = 'pen';

function makeGrid(height, width, name = "pixel", prefix = "") {
    const table = document.getElementById(name + "Canvas");
    let grid = '';

    // loop over each row
    for (let i = 0; i < height; i++) {
        grid += '<tr class="' + name + 'Row">';
        // loop for each cell
        for (let j = 0; j < width; j++) {
            grid += '<td class=' + name + "Cell" + ' id="' + prefix + 'row-' + i + '_col-' + j + '"></td>';
        }
        grid += '</tr>';
    }
    // add grid into table element
    table.innerHTML = grid;

    restoreGridColor();
}

function getActiveRow() {
    return pixelData['gridRow'] ? pixelData['gridRow'] : defaultRow;
}

function getActiveCol() {
    return pixelData['gridCol'] ? pixelData['gridCol'] : defaultCol;
}

function restoreGridColor() {
    Object.entries(pixelData).forEach(entry => {
        const [gridId, color] = entry;
        colorizeGrid(gridId, color);
    });
}

function colorizeGrid(gridId, color) {
    if (document.getElementById(gridId) !== null) {
        document.getElementById(gridId).style.backgroundColor = color;
    }
}

function updateGridSize(row, col) {
    document.getElementById('inputHeight').value = row;
    document.getElementById('inputWidth').value = col;
    pixelData['gridRow'] = row;
    pixelData['gridCol'] = col;
    savePixelData();
}

// add click events to all cells
function addClickEventToCells() {
    let colorPicker = document.getElementById("colorPicker");
    const cells = document.getElementsByClassName('pixelCell');
    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener("click", function (event) {
            // left-click
            event.preventDefault();
            let clickedCell = event.target;
            if (penMode == 'pen') {
                clickedCell.style.backgroundColor = colorPicker.value;
                pixelData[clickedCell.id] = colorPicker.value;
                savePixelData();
                setPreviewCellColor(event);
            } else {
                if (clickedCell.style.backgroundColor) {
                    colorPicker.value = convertRGB2Hex(clickedCell.style.backgroundColor);
                }
            }
        });
        cells[i].addEventListener("contextmenu", function (event) {
            // right-click
            event.preventDefault();
            let clickedCell = event.target;
            clickedCell.style.backgroundColor = "";
            delete pixelData[clickedCell.id];
            savePixelData();
            setPreviewCellColor(event);
        });
    }
}

function reloadGrid() {
    if (localStorage.getItem("autosave")) {
        // Restore the contents of the text field
        pixelData = JSON.parse(localStorage.getItem("autosave"));
    }
    console.log(pixelData);

    // Build a default 10x10 grid.
    updateGridSize(getActiveRow(), getActiveCol());
    makeGrid(getActiveRow(), getActiveCol());
    makeGrid(getActiveRow(), getActiveCol(), 'preview', 'pv-');

    // click event to grid cells once the table grid
    addClickEventToCells();
}

// loop all previewCells and get color from Design Canvas
function reloadPreviewGrid() {
    const cells = document.getElementsByClassName('pixelCell');
    const previewCells = document.getElementsByClassName('previewCell');
    if (previewCells.length > 0) {
        for (let i = 0; i < cells.length; i++) {
            previewCells[i].style.backgroundColor = cells[i].style.backgroundColor;
        }
    }
}

// preview color
function setPreviewCellColor(event) {
    let clickedCell = event.target;
    let previewCell = document.getElementById('pv-' + clickedCell.id);
    if (previewCell) {
        previewCell.style.backgroundColor = clickedCell.style.backgroundColor;
    }
}

// save pixelData to local Storage
function savePixelData(dataname = 'autosave') {
    localStorage.setItem(dataname, JSON.stringify(pixelData));
    console.log(pixelData);
}

// clear pixelData from local Storage
document.getElementById("clearPixelData").onclick = function (e) {
    localStorage.clear();
    pixelData = {};
    reloadGrid();
    reloadPreviewGrid();
}

// on submit of form #sizePicker:revised submit the form and clear the painted cells
document.getElementById('sizePicker').onsubmit = function () {
    event.preventDefault();
    localStorage.clear();
    pixelData = {};
    const height = document.getElementById('inputHeight').value;
    const width = document.getElementById('inputWidth').value;
    updateGridSize(height, width);
    reloadGrid();
    reloadPreviewGrid();
};

document.addEventListener('DOMContentLoaded', (event) => {
    reloadPenMode();
    reloadGrid();
    reloadPreviewGrid();
})

function convertRGB2Hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+), \s*(\d+), \s*(\d+)\)$/);
    function hexCode(i) {

        // Take the last 2 characters and convert
        // them to Hexadecimal.
        return ("0" + parseInt(i).toString(16)).slice(-2);
    }
    return "#" + hexCode(rgb[1]) + hexCode(rgb[2]) + hexCode(rgb[3]);
}

document.getElementById("changePenMode").onclick = function (e) {
    if (penMode == 'pen') {
        penMode = 'eyedropper';
    } else {
        penMode = 'pen';
    }
    reloadPenMode();
}

function reloadPenMode() {
    const btnPenMode = document.getElementById("changePenMode");
    if (penMode == 'pen') {
        btnPenMode.className = 'fa fa-pencil';
        btnPenMode.innerHTML = 'Pen';
    } else {
        btnPenMode.className = 'fa fa-eyedropper';
        btnPenMode.innerHTML = 'Eyedropper';
    }
}
