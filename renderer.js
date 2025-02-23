// Canvas setup
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const CANVAS_SIZE = 1280;

// Set fixed canvas size
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Image holders
let frameImage = null;
let photoImage = null;
let photoScale = 100;
let photoDragging = false;
let photoPos = { x: 0, y: 0 };
let dragStart = { x: 0, y: 0 };

// Text settings
const textElements = [
    {
        text: 'MEN',
        color: '#FFFFFF',
        size: 40,
        x: 200,
        y: 1260,
        dragging: false,
        resizing: false,
        selected: false,
        visible: true,
        category: 'men'
    },
    {
        text: 'WOMEN',
        color: '#FFFFFF',
        size: 40,
        x: 560,
        y: 1260,
        dragging: false,
        resizing: false,
        selected: false,
        visible: true,
        category: 'women'
    },
    {
        text: 'KIDS',
        color: '#FFFFFF',
        size: 40,
        x: 980,
        y: 1260,
        dragging: false,
        resizing: false,
        selected: false,
        visible: true,
        category: 'kids'
    }
];

// Additional elements settings
const additionalElements = {
    price: {
        visible: true,
        text: '349 и 245 €',
        color: '#FFFFFF',
        size: 35,
        x: 15,
        y: 1150,
        checkbox: document.getElementById('showPrice'),
        input: document.getElementById('priceText'),
        dragging: false
    },
    brandName: {
        visible: true,
        text: 'ARMANI EXCHANGE',
        color: '#FFFFFF',
        size: 45,
        x: 800,
        y: 1100,
        checkbox: document.getElementById('showBrandName'),
        input: document.getElementById('brandNameText'),
        dragging: false
    },
    sku: {
        visible: true,
        text: 'SKU:\nSROFRBAL1401S50',
        color: '#FFFFFF',
        size: 25,
        x: 1270,
        y: 250,
        checkbox: document.getElementById('showSku'),
        input: document.getElementById('skuText'),
        dragging: false
    },
    size: {
        visible: true,
        text: 'SIZE\n52',
        color: '#FFFFFF',
        size: 40,
        x: 1200,
        y: 420,
        checkbox: document.getElementById('showSize'),
        input: document.getElementById('sizeText'),
        dragging: false
    },
    sale: {
        visible: true,
        text: 'ФИНАЛЬНАЯ\nРАСПРОДАЖА\n-80%',
        color: '#FFFFFF',
        size: 35,
        x: 1140,
        y: 550,
        checkbox: document.getElementById('showSale'),
        input: document.getElementById('saleText'),
        dragging: false
    }
};

let activeText = null;
let resizeStartSize = 0;
let resizeStartY = 0;

// Initialize additional elements
Object.entries(additionalElements).forEach(([key, element]) => {
    if (element.checkbox) {
        element.checkbox.addEventListener('change', (e) => {
            element.visible = e.target.checked;
            updateCanvas();
        });
    }
    
    if (element.input) {
        element.input.addEventListener('input', (e) => {
            element.text = e.target.value;
            updateCanvas();
        });
    }
});

// Initialize text event listeners
textElements.forEach((element, index) => {
    if (!element.inputs) return;
    
    // Text input
    element.inputs.text.addEventListener('input', (e) => {
        element.text = e.target.value;
        updateCanvas();
    });
    
    // Color input
    element.inputs.color.addEventListener('input', (e) => {
        element.color = e.target.value;
        updateCanvas();
    });
    
    // Size input
    element.inputs.size.addEventListener('input', (e) => {
        element.size = parseInt(e.target.value);
        updateCanvas();
    });
    
    // Position X input
    element.inputs.x.addEventListener('input', (e) => {
        element.x = parseInt(e.target.value);
        updateCanvas();
    });
    
    // Position Y input
    element.inputs.y.addEventListener('input', (e) => {
        element.y = parseInt(e.target.value);
        updateCanvas();
    });
});

// Initialize visibility checkboxes
document.getElementById('showMen').addEventListener('change', function(e) {
    const menText = textElements.find(el => el.category === 'men');
    if (menText) {
        menText.visible = e.target.checked;
        updateCanvas();
    }
});

document.getElementById('showWomen').addEventListener('change', function(e) {
    const womenText = textElements.find(el => el.category === 'women');
    if (womenText) {
        womenText.visible = e.target.checked;
        updateCanvas();
    }
});

document.getElementById('showKids').addEventListener('change', function(e) {
    const kidsText = textElements.find(el => el.category === 'kids');
    if (kidsText) {
        kidsText.visible = e.target.checked;
        updateCanvas();
    }
});

// Text interaction helpers
function isInsideText(x, y, element) {
    if (!element.text) return false;
    
    ctx.save();
    ctx.font = `${element.size}px Arial`;
    const metrics = ctx.measureText(element.text);
    ctx.restore();
    
    const textHeight = element.size;
    const textWidth = metrics.width;
    
    // Check if point is inside text bounds
    return x >= element.x &&
           x <= element.x + textWidth &&
           y >= element.y - textHeight &&
           y <= element.y;
}

function isNearTextCorner(x, y, element) {
    if (!element.text) return false;
    
    ctx.save();
    ctx.font = `${element.size}px Arial`;
    const metrics = ctx.measureText(element.text);
    ctx.restore();
    
    const textHeight = element.size;
    const textWidth = metrics.width;
    const cornerSize = 10;
    
    // Check if point is near bottom-right corner
    return x >= element.x + textWidth - cornerSize &&
           x <= element.x + textWidth + cornerSize &&
           y >= element.y - cornerSize &&
           y <= element.y + cornerSize;
}

// Mouse event handlers for text
canvas.addEventListener('mousedown', e => {
    if (photoDragging) return;
    
    const pos = getCanvasMousePosition(e);
    
    // Check each text element
    textElements.forEach(element => {
        // Reset selection
        element.selected = false;
        
        if (element.text) {
            if (isNearTextCorner(pos.x, pos.y, element)) {
                element.resizing = true;
                element.selected = true;
                activeText = element;
                resizeStartSize = element.size;
                resizeStartY = pos.y;
            } else if (isInsideText(pos.x, pos.y, element)) {
                element.dragging = true;
                element.selected = true;
                activeText = element;
                dragStart = {
                    x: pos.x - element.x,
                    y: pos.y - element.y
                };
            }
        }
    });
    
    updateCanvas();
});

canvas.addEventListener('mousemove', e => {
    if (photoDragging) return;
    
    const pos = getCanvasMousePosition(e);
    
    // Update cursor style
    let cursorStyle = 'default';
    textElements.forEach(element => {
        if (element.text) {
            if (isNearTextCorner(pos.x, pos.y, element)) {
                cursorStyle = 'nwse-resize';
            } else if (isInsideText(pos.x, pos.y, element)) {
                cursorStyle = 'move';
            }
        }
    });
    canvas.style.cursor = cursorStyle;
    
    // Handle text dragging
    if (activeText?.dragging) {
        activeText.x = pos.x - dragStart.x;
        activeText.y = pos.y - dragStart.y;
        
        // Update input fields
        activeText.inputs.x.value = Math.round(activeText.x);
        activeText.inputs.y.value = Math.round(activeText.y);
        
        updateCanvas();
    }
    
    // Handle text resizing
    if (activeText?.resizing) {
        const deltaY = pos.y - resizeStartY;
        const newSize = Math.max(8, Math.min(72, resizeStartSize + deltaY));
        
        activeText.size = newSize;
        activeText.inputs.size.value = Math.round(newSize);
        
        updateCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    if (activeText) {
        activeText.dragging = false;
        activeText.resizing = false;
    }
    activeText = null;
});

// Initialize canvas and handle resize
function initCanvas() {
    const wrapper = document.querySelector('.editor-wrapper');
    const maxSize = Math.min(
        wrapper.parentElement.clientWidth - 40,
        wrapper.parentElement.clientHeight - 40
    );
    
    wrapper.style.width = maxSize + 'px';
    wrapper.style.height = maxSize + 'px';
}

// Resize observer for smooth adaptivity
const resizeObserver = new ResizeObserver(() => {
    initCanvas();
});

resizeObserver.observe(document.getElementById('editor-container'));
initCanvas();

// Frame upload handler
document.getElementById('frame').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file?.type.startsWith('image/')) {
        alert('Будь ласка, виберіть зображення');
        return;
    }
    
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        frameImage = img;
        updateCanvas();
    };
});

// Photo upload handler
document.getElementById('photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file?.type.startsWith('image/')) {
        alert('Будь ласка, виберіть зображення');
        return;
    }
    
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        photoImage = img;
        fitPhoto();
        updateCanvas();
    };
});

// Scale handler with center scaling
document.getElementById('photoScale').addEventListener('input', function(e) {
    if (!photoImage) return;
    
    const newScale = parseInt(e.target.value);
    const oldScale = photoScale;
    
    // Calculate current photo center
    const canvasCenter = CANVAS_SIZE / 2;
    const currentPhotoCenter = {
        x: photoPos.x + (photoImage.width * oldScale / 100) / 2,
        y: photoPos.y + (photoImage.height * oldScale / 100) / 2
    };
    
    // Update scale
    photoScale = newScale;
    
    // Calculate new dimensions
    const newWidth = photoImage.width * newScale / 100;
    const newHeight = photoImage.height * newScale / 100;
    
    // Update position to maintain center
    photoPos.x = currentPhotoCenter.x - newWidth / 2;
    photoPos.y = currentPhotoCenter.y - newHeight / 2;
    
    updateCanvas();
});

// Mouse position helper
function getCanvasMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

// Drag handling
canvas.addEventListener('mousedown', e => {
    if (!photoImage) return;
    
    const pos = getCanvasMousePosition(e);
    
    if (isInsidePhoto(pos.x, pos.y)) {
        photoDragging = true;
        dragStart = {
            x: pos.x - photoPos.x,
            y: pos.y - photoPos.y
        };
    }
});

canvas.addEventListener('mousemove', e => {
    if (!photoDragging) return;
    
    const pos = getCanvasMousePosition(e);
    
    photoPos = {
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y
    };
    
    updateCanvas();
});

canvas.addEventListener('mouseup', () => {
    photoDragging = false;
});

// Touch handling
canvas.addEventListener('touchstart', e => {
    if (!photoImage) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const pos = getCanvasMousePosition(touch);
    
    if (isInsidePhoto(pos.x, pos.y)) {
        photoDragging = true;
        dragStart = {
            x: pos.x - photoPos.x,
            y: pos.y - photoPos.y
        };
    }
});

canvas.addEventListener('touchmove', e => {
    if (!photoDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const pos = getCanvasMousePosition(touch);
    
    photoPos = {
        x: pos.x - dragStart.x,
        y: pos.y - dragStart.y
    };
    
    updateCanvas();
});

canvas.addEventListener('touchend', () => {
    photoDragging = false;
});

// Mouse events for dragging
let draggedElement = null;
let dragStartX = 0;
let dragStartY = 0;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    Object.entries(additionalElements).forEach(([key, element]) => {
        if (!element.visible) return;

        const lines = element.text.split('\n');
        const lineHeight = element.size * 1.2;
        const totalHeight = lines.length * lineHeight;
        
        let maxWidth = 0;
        ctx.font = `${element.size}px Arial`;
        lines.forEach(line => {
            const metrics = ctx.measureText(line.trim());
            maxWidth = Math.max(maxWidth, metrics.width);
        });

        if (x >= element.x && x <= element.x + maxWidth &&
            y >= element.y - totalHeight && y <= element.y) {
            draggedElement = element;
            dragStartX = x - element.x;
            dragStartY = y - element.y;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggedElement) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    draggedElement.x = x - dragStartX;
    draggedElement.y = y - dragStartY;

    updateCanvas();
});

canvas.addEventListener('mouseup', () => {
    draggedElement = null;
});

canvas.addEventListener('mouseleave', () => {
    draggedElement = null;
});

// Helper functions
function centerPhoto() {
    if (!photoImage) return;
    
    const photoWidth = getPhotoWidth();
    const photoHeight = getPhotoHeight();
    
    photoPos = {
        x: (CANVAS_SIZE - photoWidth) / 2,
        y: (CANVAS_SIZE - photoHeight) / 2
    };
    
    updateCanvas();
}

function fitPhoto() {
    if (!photoImage) return;
    
    const scaleX = CANVAS_SIZE / photoImage.width;
    const scaleY = CANVAS_SIZE / photoImage.height;
    const newScale = Math.min(scaleX, scaleY) * 100;
    
    photoScale = Math.min(400, Math.max(1, newScale));
    document.getElementById('photoScale').value = photoScale;
    
    centerPhoto();
}

function getPhotoWidth() {
    return photoImage ? (photoImage.width * photoScale / 100) : 0;
}

function getPhotoHeight() {
    return photoImage ? (photoImage.height * photoScale / 100) : 0;
}

function isInsidePhoto(x, y) {
    if (!photoImage) return false;
    
    return x >= photoPos.x && 
           x <= photoPos.x + getPhotoWidth() &&
           y >= photoPos.y && 
           y <= photoPos.y + getPhotoHeight();
}

function drawMultilineText(text, x, y, fontSize, options = {}) {
    const {
        lineHeight = 1.2,
        align = 'left',
        stroke = false,
        strokeColor = '#000000',
        strokeWidth = 2,
        arcRadius = 0,
        arcStrokeColor = '#000000',
        arcStrokeWidth = 2
    } = options;

    const lines = text.split('\n');
    const lineHeightPixels = fontSize * lineHeight;
    
    // Розрахунок максимальної ширини тексту для вирівнювання
    let maxWidth = 0;
    ctx.font = `${fontSize}px Arial`;
    lines.forEach(line => {
        const metrics = ctx.measureText(line.trim());
        maxWidth = Math.max(maxWidth, metrics.width);
    });

    // Малюємо напівколо для SIZE
    if (arcRadius > 0) {
        ctx.save();
        ctx.strokeStyle = arcStrokeColor;
        ctx.lineWidth = arcStrokeWidth;
        ctx.beginPath();
        // Розраховуємо центр та розмір напівкола базуючись на тексті
        const totalHeight = lines.length * lineHeightPixels;
        const centerX = x + maxWidth/2;
        const centerY = y - totalHeight/2;
        ctx.arc(centerX, centerY, arcRadius, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
    }
    
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const metrics = ctx.measureText(trimmedLine);
        let xPos = x;
        
        // Вирівнювання тексту
        if (align === 'right') {
            xPos = x - metrics.width;
        } else if (align === 'center') {
            xPos = x - (metrics.width / 2);
        }
        
        const yPos = y + (index * lineHeightPixels);
        
        // Малюємо обводку тексту
        if (stroke) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(trimmedLine, xPos, yPos);
        }
        
        ctx.fillText(trimmedLine, xPos, yPos);
    });
}

function drawText() {
    textElements.forEach(element => {
        if (!element.text || !element.visible) return;
        
        ctx.save();
        
        // Draw text
        ctx.fillStyle = element.color;
        ctx.font = `bold ${element.size}px Arial`;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(element.text, element.x, element.y);
        ctx.fillText(element.text, element.x, element.y);
        
        ctx.restore();
    });
}

function drawAdditionalElements() {
    ctx.save();
    
    // Draw Price
    if (additionalElements.price.visible) {
        ctx.font = `${additionalElements.price.size}px Arial`;
        ctx.fillStyle = additionalElements.price.color;
        drawMultilineText(additionalElements.price.text, 
            additionalElements.price.x, 
            additionalElements.price.y,
            additionalElements.price.size);
    }
    
    // Draw Brand Name
    if (additionalElements.brandName.visible) {
        ctx.font = `bold ${additionalElements.brandName.size}px Arial`;
        ctx.fillStyle = additionalElements.brandName.color;
        drawMultilineText(additionalElements.brandName.text,
            additionalElements.brandName.x,
            additionalElements.brandName.y,
            additionalElements.brandName.size);
    }

    // Draw SKU
    if (additionalElements.sku.visible) {
        ctx.font = `${additionalElements.sku.size}px Arial`;
        ctx.fillStyle = additionalElements.sku.color;
        drawMultilineText(additionalElements.sku.text,
            additionalElements.sku.x,
            additionalElements.sku.y,
            additionalElements.sku.size,
            { align: 'right' });
    }
    
    // Draw Size
    if (additionalElements.size.visible) {
        ctx.font = `bold ${additionalElements.size.size}px Arial`;
        ctx.fillStyle = additionalElements.size.color;
        drawMultilineText(additionalElements.size.text,
            additionalElements.size.x,
            additionalElements.size.y,
            additionalElements.size.size,
            { 
                align: 'center',
                stroke: true,
                strokeColor: '#FFFFFF',
                strokeWidth: 3
            });
    }
    
    // Draw Sale
    if (additionalElements.sale.visible) {
        ctx.font = `bold ${additionalElements.sale.size}px Arial`;
        ctx.fillStyle = additionalElements.sale.color;
        drawMultilineText(additionalElements.sale.text,
            additionalElements.sale.x,
            additionalElements.sale.y,
            additionalElements.sale.size,
            { 
                align: 'center',
                stroke: true,
                strokeColor: '#FF0000',
                strokeWidth: 2
            });
    }
    
    ctx.restore();
}

// Update the updateCanvas function
function updateCanvas() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    if (photoImage) {
        ctx.save();
        ctx.translate(photoPos.x, photoPos.y);
        ctx.drawImage(
            photoImage,
            0, 0,
            getPhotoWidth(),
            getPhotoHeight()
        );
        ctx.restore();
    }
    
    if (frameImage) {
        ctx.drawImage(frameImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    
    drawText();
    drawAdditionalElements();
}

// Center and fit buttons
document.getElementById('centerBtn').addEventListener('click', centerPhoto);
document.getElementById('fitBtn').addEventListener('click', fitPhoto);

// Export handler
document.getElementById('exportBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'framed-photo.png';
    link.href = canvas.toDataURL();
    link.click();
});
