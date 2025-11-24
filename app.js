const mainMenu = document.getElementById("mainMenu");
const singleMode = document.getElementById("singleMode");
const batchMode = document.getElementById("batchMode");
const singleModeBtn = document.getElementById("singleModeBtn");
const batchModeBtn = document.getElementById("batchModeBtn");
const backToMenuBtn1 = document.getElementById("backToMenuBtn1");
const backToMenuBtn2 = document.getElementById("backToMenuBtn2");
const snackbar = document.getElementById("snackbar");

const singleImageInput = document.getElementById("singleImageInput");
const singleDropZone = document.getElementById("singleDropZone");
const singleSliderWrapper = document.getElementById("singleSliderWrapper");
const singleStatus = document.getElementById("singleStatus");
const downloadSingleBtn = document.getElementById("downloadSingleBtn");
const reconvertBtn = document.getElementById("reconvertBtn");

const batchImageInput = document.getElementById("batchImageInput");
const batchDropZone = document.getElementById("batchDropZone");
const batchProgress = document.getElementById("batchProgress");
const batchResults = document.getElementById("batchResults");
const batchStatus = document.getElementById("batchStatus");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const resultsList = document.getElementById("resultsList");

const qualityRange = document.getElementById("qualityRange");
const qualityValue = document.getElementById("qualityValue");
const losslessToggle = document.getElementById("losslessToggle");

let currentFile = null;
let currentWebPBlob = null;
let batchFiles = [];
let convertedFiles = [];

let currentZoom = 1.0;
let panX = 0;
let panY = 0;

singleModeBtn.addEventListener("click", () => showMode("single"));
batchModeBtn.addEventListener("click", () => showMode("batch"));
backToMenuBtn1.addEventListener("click", showMainMenu);
backToMenuBtn2.addEventListener("click", showMainMenu);

singleDropZone.addEventListener("click", () => singleImageInput.click());
singleImageInput.addEventListener("change", handleSingleFileSelect);
singleDropZone.addEventListener("dragover", handleDragOver);
singleDropZone.addEventListener("drop", (e) => handleDrop(e, "single"));

batchDropZone.addEventListener("click", () => batchImageInput.click());
batchImageInput.addEventListener("change", handleBatchFileSelect);
batchDropZone.addEventListener("dragover", handleDragOver);
batchDropZone.addEventListener("drop", (e) => handleDrop(e, "batch"));

downloadSingleBtn.addEventListener("click", downloadSingle);
reconvertBtn.addEventListener("click", reconvertSingle);
downloadAllBtn.addEventListener("click", downloadAllAsZip);

qualityRange.addEventListener("input", () => {
    qualityValue.textContent = qualityRange.value;
});

losslessToggle.addEventListener("change", () => {
    qualityRange.disabled = losslessToggle.checked;
    if (losslessToggle.checked) {
        qualityValue.textContent = "100 (Lossless)";
    } else {
        qualityValue.textContent = qualityRange.value;
    }
});

function showMainMenu() {
    mainMenu.classList.remove("hidden");
    singleMode.classList.add("hidden");
    batchMode.classList.add("hidden");
}

function showMode(mode) {
    mainMenu.classList.add("hidden");
    if (mode === "single") {
        singleMode.classList.remove("hidden");
        batchMode.classList.add("hidden");
    } else {
        singleMode.classList.add("hidden");
        batchMode.classList.remove("hidden");
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add("dragging");
}

function handleDrop(e, mode) {
    e.preventDefault();
    e.currentTarget.classList.remove("dragging");
    const files = Array.from(e.dataTransfer.files).filter(f => 
        f.type === "image/jpeg" || f.type === "image/png"
    );
    
    if (files.length === 0) {
        showSnack("Please drop JPG or PNG images only", "error");
        return;
    }
    
    if (mode === "single") {
        handleSingleFile(files[0]);
    } else {
        handleBatchFiles(files);
    }
}

function handleSingleFileSelect() {
    const file = singleImageInput.files[0];
    if (file) handleSingleFile(file);
}

function handleBatchFileSelect() {
    const files = Array.from(batchImageInput.files);
    if (files.length > 0) handleBatchFiles(files);
}

async function handleSingleFile(file) {
    currentFile = file;
    singleStatus.textContent = `Converting ${file.name}...`;
    singleStatus.style.color = "orange";
    
    try {
        const { originalBlob, webpBlob, originalSize, webpSize } = await convertToWebP(file);
        currentWebPBlob = webpBlob;
        
        const originalUrl = URL.createObjectURL(originalBlob);
        const webpUrl = URL.createObjectURL(webpBlob);
        
        renderSlider(originalUrl, webpUrl, originalSize, webpSize);
        
        singleSliderWrapper.classList.remove("hidden");
        singleStatus.textContent = `✅ Converted successfully`;
        singleStatus.style.color = "var(--color-success)";
        showSnack("Conversion completed!", "success");
    } catch (error) {
        singleStatus.textContent = `❌ Error: ${error.message}`;
        singleStatus.style.color = "var(--color-error)";
        showSnack("Conversion failed", "error");
        console.error(error);
    }
}

async function reconvertSingle() {
    if (currentFile) {
        singleSliderWrapper.classList.add("hidden");
        await handleSingleFile(currentFile);
    }
}

async function handleBatchFiles(files) {
    batchFiles = files;
    convertedFiles = [];
    batchProgress.classList.remove("hidden");
    batchResults.classList.add("hidden");
    batchStatus.textContent = `Converting ${files.length} images...`;
    batchStatus.style.color = "orange";
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressText.textContent = `Processing: ${i + 1}/${files.length}`;
        progressFill.style.width = `${((i + 1) / files.length) * 100}%`;
        
        try {
            const { webpBlob, originalSize, webpSize } = await convertToWebP(file);
            convertedFiles.push({
                name: file.name.replace(/\.(jpe?g|png)$/i, '.webp'),
                blob: webpBlob,
                originalSize,
                webpSize
            });
        } catch (error) {
            console.error(`Failed to convert ${file.name}:`, error);
        }
    }
    
    batchProgress.classList.add("hidden");
    batchResults.classList.remove("hidden");
    batchStatus.textContent = `✅ Converted ${convertedFiles.length}/${files.length} images`;
    batchStatus.style.color = "var(--color-success)";
    
    displayBatchResults();
    showSnack(`Converted ${convertedFiles.length} images!`, "success");
}

function displayBatchResults() {
    resultsList.innerHTML = '';
    convertedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        const savings = Math.round((1 - file.webpSize / file.originalSize) * 100);
        item.innerHTML = `
            <span>${file.name}</span>
            <span class="savings">${formatBytes(file.webpSize)} (-${savings}%)</span>
            <button onclick="downloadFile(${index})">Download</button>
        `;
        resultsList.appendChild(item);
    });
}

function downloadFile(index) {
    const file = convertedFiles[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file.blob);
    link.download = file.name;
    link.click();
}

function downloadSingle() {
    if (!currentWebPBlob || !currentFile) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(currentWebPBlob);
    link.download = currentFile.name.replace(/\.(jpe?g|png)$/i, '.webp');
    link.click();
    showSnack("Downloaded!", "success");
}

async function downloadAllAsZip() {
    if (convertedFiles.length === 0) return;
    
    batchStatus.textContent = "Creating ZIP file...";
    batchStatus.style.color = "orange";
    
    const zip = new JSZip();
    convertedFiles.forEach(file => {
        zip.file(file.name, file.blob);
    });
    
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `webp-converted-${Date.now()}.zip`;
    link.click();
    
    batchStatus.textContent = `✅ ZIP downloaded`;
    batchStatus.style.color = "var(--color-success)";
    showSnack("ZIP downloaded!", "success");
}

async function convertToWebP(file) {
    const quality = losslessToggle.checked ? 100 : parseInt(qualityRange.value);
    
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const webpData = await webp.encode(imageData, {
        quality: quality,
        lossless: losslessToggle.checked
    });
    
    const webpBlob = new Blob([webpData], { type: 'image/webp' });
    
    return {
        originalBlob: file,
        webpBlob: webpBlob,
        originalSize: file.size,
        webpSize: webpBlob.size
    };
}

function renderSlider(originalUrl, webpUrl, originalSize, webpSize) {
    const container = document.createElement("div");
    container.className = "before-after-slider";
    
    const beforeImg = document.createElement("img");
    beforeImg.src = originalUrl;
    beforeImg.className = "before-img";
    beforeImg.draggable = false;
    
    const afterDiv = document.createElement("div");
    afterDiv.className = "after-image";
    
    const afterImg = document.createElement("img");
    afterImg.src = webpUrl;
    afterImg.draggable = false;
    
    const divider = document.createElement("div");
    divider.className = "divider";
    
    afterDiv.appendChild(afterImg);
    container.appendChild(beforeImg);
    container.appendChild(afterDiv);
    container.appendChild(divider);
    
    const footer = document.createElement("div");
    footer.className = "slider-footer";
    const savings = Math.round((1 - webpSize / originalSize) * 100);
    footer.innerHTML = `
        <div class="comparison-labels">
            <span class="label-original">Original (${formatBytes(originalSize)})</span>
            <span class="label-webp">WebP (${formatBytes(webpSize)}) <span style="color:var(--color-success)">-${savings}%</span></span>
        </div>
    `;
    
    singleSliderWrapper.innerHTML = '';
    singleSliderWrapper.appendChild(container);
    singleSliderWrapper.appendChild(footer);
    
    initSlider(container);
}

function initSlider(slider) {
    const afterImage = slider.querySelector(".after-image");
    const divider = slider.querySelector(".divider");
    let isDragging = false;
    
    function updateSlider(e) {
        if (!isDragging) return;
        const rect = slider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percentage = (x / rect.width) * 100;
        afterImage.style.width = `${100 - percentage}%`;
        divider.style.left = `${percentage}%`;
    }
    
    divider.addEventListener("mousedown", () => isDragging = true);
    document.addEventListener("mouseup", () => isDragging = false);
    document.addEventListener("mousemove", updateSlider);
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function showSnack(message, type = "success") {
    snackbar.textContent = message;
    snackbar.className = `show ${type}`;
    setTimeout(() => {
        snackbar.className = "";
    }, 3000);
}

showMainMenu();
