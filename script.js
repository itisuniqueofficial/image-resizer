let originalImage = null;
let fileName = '';
const imageInput = document.getElementById('imageInput');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const qualityInput = document.getElementById('quality');
const formatSelect = document.getElementById('format');
const maintainAspect = document.getElementById('maintainAspect');
const cropCheckbox = document.getElementById('crop');
const resizeButton = document.getElementById('resizeButton');
const clearButton = document.getElementById('clearButton');
const resultSection = document.getElementById('resultSection');
const resultInfo = document.getElementById('resultInfo');
const downloadLink = document.getElementById('downloadLink');

imageInput.addEventListener('change', handleImageUpload);
widthInput.addEventListener('input', maintainRatio);
heightInput.addEventListener('input', maintainRatio);

document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) item.classList.remove('active');
            item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        
        faqItem.classList.toggle('active');
        button.setAttribute('aria-expanded', !isActive);
        
        const answer = faqItem.querySelector('.faq-answer');
        if (faqItem.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
            answer.style.maxHeight = '0';
        }
    });
});

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileName = file.name.split('.').slice(0, -1).join('.');
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            widthInput.value = originalImage.width;
            heightInput.value = originalImage.height;
            resizeButton.disabled = false;
            resultSection.classList.remove('visible');
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function maintainRatio(e) {
    if (!maintainAspect.checked || !originalImage) return;
    
    const aspectRatio = originalImage.width / originalImage.height;
    if (e.target === widthInput) {
        heightInput.value = Math.round(widthInput.value / aspectRatio);
    } else {
        widthInput.value = Math.round(heightInput.value * aspectRatio);
    }
}

function toggleCrop() {
    maintainAspect.disabled = cropCheckbox.checked;
    if (cropCheckbox.checked) maintainAspect.checked = false;
}

async function resizeImage() {
    if (!originalImage) {
        alert('Please upload an image first!');
        return;
    }

    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const quality = parseFloat(qualityInput.value);
    const format = formatSelect.value;

    if (!width || !height || width < 1 || height < 1) {
        alert('Please enter valid width and height (min 1px)!');
        return;
    }

    if (quality < 0.1 || quality > 1) {
        alert('Quality must be between 0.1 and 1!');
        return;
    }

    resizeButton.disabled = true;
    resizeButton.textContent = 'Processing...';

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (cropCheckbox.checked) {
            const srcAspect = originalImage.width / originalImage.height;
            const destAspect = width / height;
            let sx, sy, sWidth, sHeight;

            if (srcAspect > destAspect) {
                sWidth = originalImage.height * destAspect;
                sHeight = originalImage.height;
                sx = (originalImage.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = originalImage.width;
                sHeight = originalImage.width / destAspect;
                sx = 0;
                sy = (originalImage.height - sHeight) / 2;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, width, height);
        } else {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(originalImage, 0, 0, width, height);
        }

        const resizedDataUrl = canvas.toDataURL(`image/${format}`, quality);
        const byteString = atob(resizedDataUrl.split(',')[1]);
        const fileSize = (byteString.length / 1024).toFixed(2);

        resultInfo.textContent = `Resized to ${width}x${height}px | Size: ${fileSize} KB`;
        downloadLink.href = resizedDataUrl;
        downloadLink.download = `${fileName}-resized-${width}x${height}.${format}`;
        resultSection.classList.add('visible');
    } catch (error) {
        alert('Error processing image: ' + error.message);
    } finally {
        resizeButton.disabled = false;
        resizeButton.textContent = 'Resize Image';
    }
}

function clearForm() {
    imageInput.value = '';
    widthInput.value = '';
    heightInput.value = '';
    qualityInput.value = '0.8';
    formatSelect.value = 'jpeg';
    maintainAspect.checked = true;
    cropCheckbox.checked = false;
    maintainAspect.disabled = false;
    originalImage = null;
    resizeButton.disabled = true;
    resultSection.classList.remove('visible');
}