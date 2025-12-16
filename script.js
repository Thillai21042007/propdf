const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const previewImage = document.getElementById("previewImage");
const convertBtn = document.getElementById("convertBtn");
const resetBtn = document.getElementById("resetBtn");

let uploadedFiles = [];

// Click to upload
uploadBox.addEventListener("click", () => fileInput.click());

// File selection
fileInput.addEventListener("change", () => {
    handleFiles([...fileInput.files]);
});

// Drag & drop
uploadBox.addEventListener("dragover", e => {
    e.preventDefault();
    uploadBox.style.borderColor = "#0ea5e9";
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.borderColor = "#38bdf8";
});

uploadBox.addEventListener("drop", e => {
    e.preventDefault();
    uploadBox.style.borderColor = "#38bdf8";
    handleFiles([...e.dataTransfer.files]);
});

// Handle files
function handleFiles(files) {
    uploadedFiles = files.filter(file => file.type.startsWith("image/"));

    if (uploadedFiles.length === 0) {
        alert("Please upload image files only");
        return;
    }

    preview.innerHTML = "";
    preview.style.display = "block";

    uploadedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = document.createElement("img");
            img.src = reader.result;
            img.style.marginBottom = "10px";
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    convertBtn.disabled = false;
}

// Convert multiple images to PDF
convertBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    document.querySelector(".container").classList.add("loading");

    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const imgData = await readFile(file);
        const img = new Image();
        img.src = imgData;

        await new Promise(resolve => {
            img.onload = () => {
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (img.height * pdfWidth) / img.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
                resolve();
            };
        });
    }

    pdf.save("propdf-multiple-images.pdf");
    document.querySelector(".container").classList.remove("loading");
});

// Read file helper
function readFile(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// Reset
resetBtn.addEventListener("click", () => {
    uploadedFiles = [];
    preview.innerHTML = "";
    preview.style.display = "none";
    convertBtn.disabled = true;
    fileInput.value = "";
});
