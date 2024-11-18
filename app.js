class ImageProcessor {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.originalImage = null;
        this.backgroundColor = null;
        this.tolerance = 2;
    }

    initializeElements() {
        // Input elements
        this.imageInput = document.getElementById('imageInput');
        this.presetScales = document.getElementById('presetScales');
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.colorMode = document.getElementById('colorMode');
        this.outputFormat = document.getElementById('outputFormat');
        
        // Canvases
        this.originalCanvas = document.getElementById('originalCanvas');
        this.processedCanvas = document.getElementById('processedCanvas');
        
        // Initialize canvas contexts
        this.originalCtx = this.originalCanvas.getContext('2d', { willReadFrequently: true });
        this.processedCtx = this.processedCanvas.getContext('2d', { willReadFrequently: true });
        
        // Buttons
        this.saveButton = document.getElementById('saveButton');

        // Checkboxes
        this.pixelateCheckbox = document.getElementById('pixelateCheckbox');
        this.posterizeCheckbox = document.getElementById('posterizeCheckbox');
        this.invertCheckbox = document.getElementById('invertCheckbox');
        this.colorPaletteCheckbox = document.getElementById('colorPaletteCheckbox');
        this.thresholdCheckbox = document.getElementById('thresholdCheckbox');

        // Additional checkbox options
        this.colorPaletteOptions = document.getElementById('colorPaletteOptions')
        this.pixelateOptions = document.getElementById('pixelateOptions')
        this.posterizeOptions = document.getElementById('posterizeOptions')
        this.thresholdOptions = document.getElementById('thresholdOptions')

        // Add new adjustment controls
        this.contrastInput = document.getElementById('contrast');
        this.brightnessInput = document.getElementById('brightness');
        this.saturationInput = document.getElementById('saturation');
        this.rotationInput = document.getElementById('rotation');
        this.posterizeInput = document.getElementById('posterize');
        this.pixelateInput = document.getElementById('pixelate');
        this.colorPaletteInput = document.getElementById('colorPalette');
        this.thresholdInput = document.getElementById('threshold');

        // Add value display spans
        this.contrastValue = document.getElementById('contrastValue');
        this.brightnessValue = document.getElementById('brightnessValue');
        this.saturationValue = document.getElementById('saturationValue');
        this.rotationValue = document.getElementById('rotationValue');
        this.posterizeValue = document.getElementById('posterizeValue');
        this.pixelateValue = document.getElementById('pixelateValue');
        this.colorPaletteValue = document.getElementById('colorPaletteValue');
        this.thresholdValue = document.getElementById('thresholdValue');

        // Add transparency checkbox and controls
        this.transparencyCheckbox = document.getElementById('transparencyCheckbox');
        this.transparencyOptions = document.getElementById('transparencyOptions');
        this.toleranceSlider = document.getElementById('toleranceSlider');
        this.toleranceValue = document.getElementById('toleranceValue');
        this.backgroundColorPreview = document.getElementById('backgroundColorPreview');

        // Spinner
        this.spinnerOverlay = document.getElementById('spinner-overlay');
        
        // Initialize canvases with alpha support
        this.originalCanvas = document.getElementById('originalCanvas');
        this.processedCanvas = document.getElementById('processedCanvas');
        
        this.originalCtx = this.originalCanvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: true
        });
        this.processedCtx = this.processedCanvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: true
        });

        // Add new input elements for manual value entry
        this.contrastNumberInput = document.createElement('input');
        this.brightnessNumberInput = document.createElement('input');
        this.saturationNumberInput = document.createElement('input');
        this.rotationNumberInput = document.createElement('input');
        this.pixelateNumberInput = document.createElement('input');
        this.posterizeNumberInput = document.createElement('input');
        this.colorPaletteNumberInput = document.createElement('input');
        this.thresholdNumberInput = document.createElement('input');

        // Configure number inputs
        [this.contrastNumberInput, this.brightnessNumberInput, this.saturationNumberInput].forEach(input => {
            input.type = 'number';
            input.min = '0';
            input.max = '200';
            input.value = '100';
            input.className = 'number-input';
            input.style.width = '70px';
            input.style.marginTop = '5px';
        });

        [this.pixelateNumberInput, this.posterizeNumberInput, this.colorPaletteNumberInput, this.thresholdNumberInput].forEach(input => {
            input.type = 'number';
            input.min = '2';
            input.max = '256';
            input.value = '16';
            input.className = 'number-input';
            input.style.width = '70px';
            input.style.marginTop = '5px';
        });

        this.rotationNumberInput.type = 'number';
        this.rotationNumberInput.min = '-180';
        this.rotationNumberInput.max = '180';
        this.rotationNumberInput.value = '0';
        this.rotationNumberInput.className = 'number-input';
        this.rotationNumberInput.style.width = '70px';
        this.rotationNumberInput.style.marginTop = '5px';

        // Add number inputs to the DOM
        document.querySelector('#contrast').parentNode.appendChild(this.contrastNumberInput);
        document.querySelector('#brightness').parentNode.appendChild(this.brightnessNumberInput);
        document.querySelector('#saturation').parentNode.appendChild(this.saturationNumberInput);
        document.querySelector('#rotation').parentNode.appendChild(this.rotationNumberInput);
        document.querySelector('#pixelate').parentNode.appendChild(this.pixelateNumberInput);
        document.querySelector('#posterize').parentNode.appendChild(this.posterizeNumberInput);
        document.querySelector('#colorPalette').parentNode.appendChild(this.colorPaletteNumberInput);
        document.querySelector('#threshold').parentNode.appendChild(this.thresholdNumberInput);
    }

    initializeEventListeners() {
        this.imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        this.presetScales.addEventListener('change', this.handlePresetScaleChange.bind(this));
        this.colorMode.addEventListener('change', this.handleColorModeChange.bind(this));
        this.saveButton.addEventListener('click', this.saveImage.bind(this));

        const sliderInputs = {
            contrast: [this.contrastInput, this.contrastNumberInput],
            brightness: [this.brightnessInput, this.brightnessNumberInput],
            saturation: [this.saturationInput, this.saturationNumberInput],
            rotation: [this.rotationInput, this.rotationNumberInput],
            pixelate: [this.pixelateInput, this.pixelateNumberInput],
            posterize: [this.posterizeInput, this.posterizeNumberInput],
            colorPalette: [this.colorPaletteInput, this.colorPaletteNumberInput],
            threshold: [this.thresholdInput, this.thresholdNumberInput],
        };

        Object.entries(sliderInputs).forEach(([type, [slider, numberInput]]) => {
            const updateUI = (value) => {
                let suffix;
                switch (type) {
                    case 'rotation':
                        suffix = '°';
                        break;
                    case 'scale':
                        suffix = 'x';
                        break;
                    case 'saturation':
                    case 'brightness':
                    case 'contrast':
                        suffix = '%';
                        break;
                    // Add more cases as needed
                    default:
                        suffix = ''; // Default suffix if type is unrecognized
                }
                document.getElementById(`${type}Value`).textContent = `${value}${suffix}`;
            };
        
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                updateUI(value);
                numberInput.value = value;
        
                if (this.processingTimeout) {
                    clearTimeout(this.processingTimeout);
                }
                this.processingTimeout = setTimeout(() => {
                    this.processImageWithSpinner();
                }, 50);
            });
        
            numberInput.addEventListener('input', (e) => {
                const value = Math.min(Math.max(parseFloat(e.target.value), slider.min), slider.max);
                slider.value = value;
                updateUI(value);
        
                if (this.processingTimeout) {
                    clearTimeout(this.processingTimeout);
                }
                this.processingTimeout = setTimeout(() => {
                    this.processImageWithSpinner();
                }, 50);
            });
        });

        // Add transparency-related listeners
        this.transparencyCheckbox.addEventListener('change', (e) => {
            // Show/hide transparency options based on checkbox state
            this.transparencyOptions.classList.toggle('hidden', !e.target.checked);
        
            // Perform background detection and processing if checked
            if (e.target.checked) {
                this.detectAndProcessBackground();
            } else if (this.originalImage) {
            // Re-process image without transparency detection
            this.processImageWithSpinner();
            }
        });
        
        // Shared function for detection and processing
        this.detectAndProcessBackground = function () {
            if (this.originalImage) {
            // Create a temporary canvas to get the current processed state
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.processedCanvas.width;
            tempCanvas.height = this.processedCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.processedCanvas, 0, 0);
        
            // Get the processed image data
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
            // Detect background
            this.detectBackgroundFromImageData(imageData);
        
            // Process the image using the detected background
            this.processImageWithSpinner();
            }
        };

        // Add checkbox listeners to show/hide options
        this.invertCheckbox.addEventListener('change', (e) => {
            if (this.originalImage) {
                this.processImageWithSpinner();
            }
        });

        this.colorPaletteCheckbox.addEventListener('change', (e) => {
            this.colorPaletteOptions.classList.toggle('hidden', !e.target.checked);
            if (this.originalImage) {
                this.processImageWithSpinner();
            }
        });

        this.pixelateCheckbox.addEventListener('change', (e) => {
            this.pixelateOptions.classList.toggle('hidden', !e.target.checked);
            if (this.originalImage) {
                this.processImageWithSpinner();
            }
        });

        this.posterizeCheckbox.addEventListener('change', (e) => {
            this.posterizeOptions.classList.toggle('hidden', !e.target.checked);
            if (this.originalImage) {
                this.processImageWithSpinner();
            }
        });

        this.thresholdCheckbox.addEventListener('change', (e) => {
            this.thresholdOptions.classList.toggle('hidden', !e.target.checked);
            if (this.originalImage) {
                this.processImageWithSpinner();
            }
        });

        this.toleranceSlider.addEventListener('input', (e) => {
            this.tolerance = parseInt(e.target.value);
            this.toleranceValue.textContent = this.tolerance;
            if (this.originalImage) {
                this.processImageWithSpinner();
            }
        });

        // Modify output format listener
        this.outputFormat.addEventListener('change', (e) => {
            const isPNG = e.target.value === 'png';
            this.transparencyCheckbox.disabled = !isPNG;
            if (!isPNG) {
                this.transparencyCheckbox.checked = false;
                this.transparencyOptions.classList.add('hidden');
            }
            if (this.originalImage) {
                this.processImageWithSpinner();
            }
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
    
        // Security check for file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
    
        try {
            // Store the original file name without the extension
            const fileName = file.name;
            this.originalFileName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    
            this.originalImage = await this.loadImage(file);
            this.drawOriginalImage();
            this.resetControls();
            this.processImageWithSpinner();
        } catch (error) {
            console.error('Error loading image:', error);
            alert('Error loading image. Please try again.');
        }
    }    

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    drawOriginalImage() {
        const ctx = this.originalCanvas.getContext('2d');
        const scaleFactor = this.calculateScaleFactor(this.originalImage, 500); // Max width/height of 500px for preview
        
        // Resize the canvas for scaled image
        this.originalCanvas.width = this.originalImage.width * scaleFactor;
        this.originalCanvas.height = this.originalImage.height * scaleFactor;
        
        // Draw the scaled image on the canvas
        ctx.drawImage(
            this.originalImage, 
            0, 
            0, 
            this.originalCanvas.width, 
            this.originalCanvas.height
        );
        
        // Display the filename and dimensions
        const originalInfoElement = document.getElementById('originalImageInfo');
        const fileName = this.originalFileName || 'Unknown';
        const dimensions = `${this.originalImage.width} × ${this.originalImage.height}`;
        originalInfoElement.innerHTML = `
            <p>${fileName} (${dimensions})</p>
        `;
    }
    

    calculateScaleFactor(image, maxDimension) {
        const maxSize = Math.max(image.width, image.height);
        return maxSize > maxDimension ? maxDimension / maxSize : 1;
    }

    handlePixelateChange(event) {
        this.pixelateOptions.classList.toggle('hidden', !event.target.checked);
        if (this.originalImage) {
            this.processImageWithSpinner();
        }
    }

    handlePosterizeChange(event) {
        this.posterizeOptions.classList.toggle('hidden', !event.target.checked);
        if (this.originalImage) {
            this.processImageWithSpinner();
        }
    }

    pixelateImage(ctx, width, height, blockSize) {
        blockSize = parseInt(blockSize) || 1;
        if (blockSize <= 1) return;

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        
        // Calculate blocks
        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                // Calculate average color for this block
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;
                
                // Sample pixels in this block
                for (let by = 0; by < blockSize && y + by < height; by++) {
                    for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                        const idx = ((y + by) * width + (x + bx)) * 4;
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                        count++;
                    }
                }
                
                // Calculate average
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                a = Math.round(a / count);
                
                // Apply average color to all pixels in this block
                for (let by = 0; by < blockSize && y + by < height; by++) {
                    for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                        const idx = ((y + by) * width + (x + bx)) * 4;
                        pixels[idx] = r;
                        pixels[idx + 1] = g;
                        pixels[idx + 2] = b;
                        pixels[idx + 3] = a;
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    handlePresetScaleChange(event) {
        const selectedScale = parseFloat(event.target.value); // Ensure this is parsed correctly
        this.widthInput.value = Math.round(this.originalImage.width * selectedScale);
        this.heightInput.value = Math.round(this.originalImage.height * selectedScale);
        this.processImageWithSpinner();
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    handleColorModeChange(event) {
        this.processImageWithSpinner();
    }

    handlePosterizeOptionsChange(event) {
        this.processImageWithSpinner();
    }

    detectBackgroundFromImageData(imageData) {
        // Input validation
        if (!imageData || !imageData.data || !imageData.width || !imageData.height) {
            throw new Error('Invalid image data provided');
        }
    
        const { width, height, data: pixels } = imageData;
        
        try {
            // Validate dimensions
            if (width <= 0 || height <= 0 || pixels.length < width * height * 4) {
                throw new Error('Invalid image dimensions');
            }
    
            // Generate optimized sample points focusing on edges and corners
            const samplePoints = this.generateOptimizedSamplePoints(width, height);
            if (!samplePoints || !samplePoints.length) {
                throw new Error('Failed to generate sample points');
            }
    
            // Pre-calculate edge regions for faster lookup
            const edgeRegions = new Set(samplePoints
                .filter(point => point.isEdge)
                .map(point => `${point.x},${point.y}`));
    
            // Create color frequency map with spatial weighting
            const colorMap = new Map();
            const samples = new Float32Array(samplePoints.length * 3);
    
            // Batch process samples for better performance
            for (let i = 0; i < samplePoints.length; i++) {
                const { x, y, weight = 1 } = samplePoints[i];
                
                // Boundary check
                if (x < 0 || x >= width || y < 0 || y >= height) {
                    continue;
                }
    
                const index = (y * width + x) * 4;
                
                // Validate pixel index
                if (index + 2 >= pixels.length) {
                    continue;
                }
    
                const sampleIndex = i * 3;
                
                // Store RGB values in typed array for faster processing
                samples[sampleIndex] = pixels[index];
                samples[sampleIndex + 1] = pixels[index + 1];
                samples[sampleIndex + 2] = pixels[index + 2];
    
                // Quantize colors (reduced precision for grouping similar colors)
                const quantizedColor = this.quantizeColor(
                    pixels[index],
                    pixels[index + 1],
                    pixels[index + 2]
                );
    
                const spatialWeight = edgeRegions.has(`${x},${y}`) ? 2.0 : weight;
    
                if (!colorMap.has(quantizedColor)) {
                    colorMap.set(quantizedColor, {
                        count: 0,
                        weight: 0,
                        r: 0,
                        g: 0,
                        b: 0
                    });
                }
    
                const colorData = colorMap.get(quantizedColor);
                colorData.count++;
                colorData.weight += spatialWeight;
                colorData.r += pixels[index];
                colorData.g += pixels[index + 1];
                colorData.b += pixels[index + 2];
            }
    
            // Validate that we have collected some color data
            if (colorMap.size === 0) {
                throw new Error('No color data collected');
            }
    
            // Find the most likely background color using spatial and frequency analysis
            const backgroundColorData = this.analyzeCandidateColors(colorMap, width, height);
            
            // Validate background color data
            if (!backgroundColorData || typeof backgroundColorData.count !== 'number' || 
                backgroundColorData.count <= 0 || 
                !Number.isFinite(backgroundColorData.r) || 
                !Number.isFinite(backgroundColorData.g) || 
                !Number.isFinite(backgroundColorData.b)) {
                throw new Error('Invalid background color data');
            }
    
            // Calculate and validate the background color
            const r = Math.round(backgroundColorData.r / backgroundColorData.count);
            const g = Math.round(backgroundColorData.g / backgroundColorData.count);
            const b = Math.round(backgroundColorData.b / backgroundColorData.count);
    
            if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b) ||
                r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
                throw new Error('Invalid RGB values calculated');
            }
    
            this.backgroundColor = { r, g, b };
    
            // Safely update color preview if available
            if (this.backgroundColorPreview instanceof HTMLElement) {
                this.backgroundColorPreview.style.backgroundImage = 'none';
                this.backgroundColorPreview.style.backgroundColor =
                    `rgb(${this.backgroundColor.r}, ${this.backgroundColor.g}, ${this.backgroundColor.b})`;
            }
    
        } catch (error) {
            console.error('Background detection failed:', error);
            // Set a default background color or rethrow based on your needs
            this.backgroundColor = { r: 255, g: 255, b: 255 }; // Default to white
            throw error; // Rethrow if you want to handle it at a higher level
        }
    }
    
    generateOptimizedSamplePoints(width, height) {
        const points = [];
        const edgeSpacing = Math.max(5, Math.floor(Math.min(width, height) / 50));
        const innerSpacing = edgeSpacing * 2;
        
        // Sample corners more densely
        const cornerSize = Math.floor(Math.min(width, height) * 0.1);
        this.sampleCornerRegion(points, 0, 0, cornerSize, cornerSize);
        this.sampleCornerRegion(points, width - cornerSize, 0, width, cornerSize);
        this.sampleCornerRegion(points, 0, height - cornerSize, cornerSize, height);
        this.sampleCornerRegion(points, width - cornerSize, height - cornerSize, width, height);
        
        // Sample edges
        for (let i = cornerSize; i < width - cornerSize; i += edgeSpacing) {
            points.push({ x: i, y: 0, isEdge: true });
            points.push({ x: i, y: height - 1, isEdge: true });
        }
        
        for (let i = cornerSize; i < height - cornerSize; i += edgeSpacing) {
            points.push({ x: 0, y: i, isEdge: true });
            points.push({ x: width - 1, y: i, isEdge: true });
        }
        
        // Sample inner region sparsely
        const innerMargin = Math.floor(Math.min(width, height) * 0.15);
        for (let y = innerMargin; y < height - innerMargin; y += innerSpacing) {
            for (let x = innerMargin; x < width - innerMargin; x += innerSpacing) {
                points.push({
                    x, y,
                    isEdge: false,
                    weight: 0.5 // Lower weight for inner samples
                });
            }
        }
        
        return points;
    }
    
    sampleCornerRegion(points, startX, startY, endX, endY) {
        const spacing = 3; // Dense sampling in corners
        for (let y = startY; y < endY; y += spacing) {
            for (let x = startX; x < endX; x += spacing) {
                points.push({ x, y, isEdge: true, weight: 2.0 }); // High weight for corners
            }
        }
    }
    
    quantizeColor(r, g, b) {
        // Quantize to fewer colors for better grouping
        const quantizationLevel = 24;
        const qr = Math.round(r / quantizationLevel) * quantizationLevel;
        const qg = Math.round(g / quantizationLevel) * quantizationLevel;
        const qb = Math.round(b / quantizationLevel) * quantizationLevel;
        return `${qr},${qg},${qb}`;
    }
    
    analyzeCandidateColors(colorMap, width, height) {
        // Input validation
        if (!colorMap || colorMap.size === 0) {
            throw new Error('Empty or invalid color map');
        }
    
        // Convert to array and add debugging
        const allValues = [...colorMap.values()];
    
        // Calculate minimum pixel threshold (1% of image)
        const minPixelThreshold = width * height * 0.01;
    
        const candidates = allValues
            .filter(data => {
                const meetsThreshold = data.count > minPixelThreshold;
                return meetsThreshold;
            })
            .map(data => ({
                ...data,
                avgR: data.r / data.count,
                avgG: data.g / data.count,
                avgB: data.b / data.count,
                score: (data.weight / data.count) * Math.log(data.count)
            }))
            .sort((a, b) => b.score - a.score);
    
        // If no candidates found, use the most frequent color instead
        if (candidates.length === 0) {
            // Fall back to the color with highest count
            const mostFrequentColor = allValues
                .sort((a, b) => b.count - a.count)[0];
    
            if (!mostFrequentColor) {
                throw new Error('No valid colors found in the image');
            }
            return {
                r: mostFrequentColor.r,
                g: mostFrequentColor.g,
                b: mostFrequentColor.b,
                count: mostFrequentColor.count,
                weight: mostFrequentColor.weight
            };
        }
    
        // Validate the selected candidate
        const selectedCandidate = candidates[0];
        
        // Ensure we have valid numbers
        const result = {
            r: Math.max(0, Math.min(255, selectedCandidate.r)),
            g: Math.max(0, Math.min(255, selectedCandidate.g)),
            b: Math.max(0, Math.min(255, selectedCandidate.b)),
            count: Math.max(1, selectedCandidate.count),
            weight: selectedCandidate.weight
        };
    
        return result;
    }

    applyTransparency(pixels, width, height) {
        if (!this.backgroundColor) return;
        
        const uint8View = new Uint8Array(pixels.buffer);
        const threshold = this.tolerance * 25; // Adjusted threshold for RGB comparison
        const bg = this.backgroundColor;
        
        // Use typed arrays for better performance
        const distanceBuffer = new Float32Array(width * height);
        
        // Calculate color distances in a single pass
        for (let i = 0; i < uint8View.length; i += 4) {
            const dr = uint8View[i] - bg.r;
            const dg = uint8View[i + 1] - bg.g;
            const db = uint8View[i + 2] - bg.b;
            
            // Simple RGB distance - much faster than LAB conversion
            distanceBuffer[i/4] = Math.sqrt(dr * dr + dg * dg + db * db);
        }
        
        // Apply transparency based on distance and edge detection
        const pixelIndex = new Uint32Array(width * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                pixelIndex[idx] = idx * 4;
                
                // Check if pixel is at edge
                const isEdge = x === 0 || x === width - 1 || y === 0 || y === height - 1;
                const currentThreshold = isEdge ? threshold * 1.2 : threshold;
                
                if (distanceBuffer[idx] <= currentThreshold) {
                    uint8View[pixelIndex[idx] + 3] = 0; // Make pixel transparent
                }
            }
        }
    }

    async processImageWithSpinner() {
        
        try {
          // Show spinner
          this.spinnerOverlay.classList.add('active');
          
          // Wait for processImage to complete
          await this.processImage();  // Modified to return a Promise
          
        } catch (error) {
          console.error('Error processing image:', error);
        } finally {
          // Hide spinner
          this.spinnerOverlay.classList.remove('active');
        }
      }

    processImage() {
        return new Promise((resolve, reject) => {
            if (!this.originalImage) {
                reject(new Error('No image loaded'));
                return;
            }
    
            try {
                const width = parseInt(this.widthInput.value) || this.originalImage.width;
                const height = parseInt(this.heightInput.value) || this.originalImage.height;
                const rotation = parseInt(this.rotationInput.value) * Math.PI / 180;
                
                // Set up initial canvas with original dimensions
                this.processedCanvas.width = width;
                this.processedCanvas.height = height;
                
                // Clear the canvas
                this.processedCtx.clearRect(0, 0, width, height);
                
                // Draw resized image
                this.processedCtx.drawImage(this.originalImage, 0, 0, width, height);
                
                // Get image data for processing
                let imageData = this.processedCtx.getImageData(0, 0, width, height);
                const pixels = imageData.data;
                
                // Apply color modes first
                switch (this.colorMode.value) {
                    case 'grayscale':
                        this.applyGrayscale(pixels);
                        break;
                    case 'bw':
                        this.applyBlackAndWhite(pixels);
                        break;
                }
                
                // Apply adjustments
                const contrast = parseInt(this.contrastInput.value) / 100;
                const brightness = parseInt(this.brightnessInput.value) / 100;
                const saturation = parseInt(this.saturationInput.value) / 100;
                const pixelate = parseInt(this.pixelateInput.value);
                const posterize = parseInt(this.posterizeInput.value);
                const colorPalette = parseInt(this.colorPaletteInput.value);
                const threshold = parseInt(this.thresholdInput.value);
                
                this.applyImageAdjustments(pixels, contrast, brightness, saturation);
                
                // Apply other effects
                if (this.posterizeCheckbox.checked) {
                    this.applyPosterize(pixels, posterize);
                }
                
                if (this.invertCheckbox.checked) {
                    this.applyInvertColors(pixels);
                }
                
                if (this.colorPaletteCheckbox.checked) {
                    this.applyColorPalette(pixels, colorPalette);
                }
                
                if (this.thresholdCheckbox.checked) {
                    this.applyThreshold(pixels, threshold);
                }
                
                // Apply pixelate
                this.processedCtx.putImageData(imageData, 0, 0);
                if (this.pixelateCheckbox.checked) {
                    this.pixelateImage(this.processedCtx, width, height, pixelate);
                }
                
                // Create new image for rotation processing
                const processedImage = new Image();
                processedImage.onerror = () => {
                    reject(new Error('Failed to load processed image for rotation'));
                };
                
                processedImage.onload = () => {
                    try {
                        // Calculate dimensions for rotated canvas
                        let newWidth = width;
                        let newHeight = height;
                        
                        if (rotation !== 0) {
                            const absoluteRotation = Math.abs(rotation % (2 * Math.PI));
                            const sin = Math.abs(Math.sin(absoluteRotation));
                            const cos = Math.abs(Math.cos(absoluteRotation));
                            
                            newWidth = Math.ceil(width * cos + height * sin);
                            newHeight = Math.ceil(width * sin + height * cos);
                        }
                        
                        // Resize canvas to fit rotated image
                        this.processedCanvas.width = newWidth;
                        this.processedCanvas.height = newHeight;
                        
                        // Clear canvas
                        this.processedCtx.clearRect(0, 0, newWidth, newHeight);
                        
                        // Apply rotation
                        if (rotation !== 0) {
                            this.processedCtx.translate(newWidth / 2, newHeight / 2);
                            this.processedCtx.rotate(rotation);
                            this.processedCtx.translate(-width / 2, -height / 2);
                        }
                        
                        // Draw the processed image
                        this.processedCtx.drawImage(processedImage, 0, 0, width, height);
                        
                        // Apply transparency last
                        if (this.transparencyCheckbox.checked && this.outputFormat.value === 'png') {
                            const finalImageData = this.processedCtx.getImageData(0, 0, newWidth, newHeight);
                            this.applyTransparency(finalImageData.data, newWidth, newHeight);
                            this.processedCtx.putImageData(finalImageData, 0, 0);
                        }
                        
                        this.saveButton.disabled = false;
                        resolve(); // Resolve the promise after all processing is complete
                    } catch (error) {
                        reject(new Error(`Error during final image processing: ${error.message}`));
                    }
                };
                
                // Set the image source to trigger the load
                // Use try-catch as toDataURL can throw errors
                try {
                    processedImage.src = this.processedCanvas.toDataURL();
                } catch (error) {
                    reject(new Error(`Error creating image data URL: ${error.message}`));
                }
                
            } catch (error) {
                reject(new Error(`Error during initial image processing: ${error.message}`));
            }
        });
    }

    
    applyInvertColors(pixels) {
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];       // Red
            pixels[i + 1] = 255 - pixels[i + 1]; // Green
            pixels[i + 2] = 255 - pixels[i + 2]; // Blue
        }
    }

    applyColorPalette(pixels, numColors) {
        // Validate and ensure numColors is between 2 and 256
        numColors = Math.max(2, Math.min(parseInt(numColors) || 2, 256));
        
        // Create color buckets (divide the color space)
        const bucketSize = Math.floor(256 / Math.cbrt(numColors));
        const colorBuckets = new Map();
    
        // First pass: group similar colors into buckets
        for (let i = 0; i < pixels.length; i += 4) {
            const r = Math.floor(pixels[i] / bucketSize) * bucketSize;
            const g = Math.floor(pixels[i + 1] / bucketSize) * bucketSize;
            const b = Math.floor(pixels[i + 2] / bucketSize) * bucketSize;
            
            const key = `${r},${g},${b}`;
            if (!colorBuckets.has(key)) {
                colorBuckets.set(key, {
                    count: 0,
                    r: 0,
                    g: 0,
                    b: 0
                });
            }
            
            const bucket = colorBuckets.get(key);
            bucket.count++;
            bucket.r += pixels[i];
            bucket.g += pixels[i + 1];
            bucket.b += pixels[i + 2];
        }
    
        // Calculate average colors for each bucket
        const palette = Array.from(colorBuckets.values())
            .map(bucket => ({
                r: Math.round(bucket.r / bucket.count),
                g: Math.round(bucket.g / bucket.count),
                b: Math.round(bucket.b / bucket.count),
                count: bucket.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, numColors);
    
        // If we have fewer colors than requested, adjust bucket size and try again
        if (palette.length < numColors && palette.length > 0) {
            const lastColor = palette[palette.length - 1];
            while (palette.length < numColors) {
                palette.push({
                    r: lastColor.r,
                    g: lastColor.g,
                    b: lastColor.b,
                    count: 1
                });
            }
        }
    
        // Function to find closest palette color
        function findClosestColor(r, g, b) {
            let minDistance = Infinity;
            let closestColor = palette[0];
    
            for (const color of palette) {
                const dr = r - color.r;
                const dg = g - color.g;
                const db = b - color.b;
                // Using weighted distances for better perceptual results
                const distance = (dr * dr * 0.299) + (dg * dg * 0.587) + (db * db * 0.114);
    
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = color;
                }
            }
    
            return closestColor;
        }
    
        // Second pass: map each pixel to nearest palette color
        for (let i = 0; i < pixels.length; i += 4) {
            const closestColor = findClosestColor(
                pixels[i],
                pixels[i + 1],
                pixels[i + 2]
            );
    
            pixels[i] = closestColor.r;
            pixels[i + 1] = closestColor.g;
            pixels[i + 2] = closestColor.b;
            // Alpha remains unchanged
        }
    }

    applyPosterize(pixels, posterizeLevel) {
        const levels = Math.max(2, Math.min(parseInt(posterizeLevel) || 4, 256));
        if (levels < 2 || levels > 256) return;

        // Calculate the number of areas and values based on levels
        const numAreas = 256 / levels;
        const numValues = 255 / (levels - 1);

        for (let i = 0; i < pixels.length; i += 4) {
            // Process each RGB channel
            for (let j = 0; j < 3; j++) {
                // Calculate the new value using integer division
                let value = pixels[i + j];
                value = numValues * Math.floor(value / numAreas);
                
                // Clamp the value to 255
                pixels[i + j] = Math.min(255, value);
            }
            // Alpha channel remains unchanged
        }
    }

    applyThreshold(pixels, threshold) {
        // Ensure the threshold is within the valid range (0-255)
        threshold = Math.max(0, Math.min(parseInt(threshold) || 128, 255));
    
        for (let i = 0; i < pixels.length; i += 4) {
            // Compute the grayscale intensity using the RGB values
            const intensity = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    
            // Determine if the pixel should be black or white
            const value = intensity >= threshold ? 255 : 0;
    
            // Set RGB channels to either black or white
            pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
    
            // Alpha channel remains unchanged
        }
    }    
    
    applyGrayscale(pixels) {
        for (let i = 0; i < pixels.length; i += 4) {
            const gray = Math.round(
                (pixels[i] * 0.299 + 
                 pixels[i + 1] * 0.587 + 
                 pixels[i + 2] * 0.114)
            );
            pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
        }
    }

    applyBlackAndWhite(pixels) {
        for (let i = 0; i < pixels.length; i += 4) {
            const gray = Math.round(
                (pixels[i] * 0.299 + 
                 pixels[i + 1] * 0.587 + 
                 pixels[i + 2] * 0.114)
            );
            const bw = gray > 127 ? 255 : 0;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = bw;
        }
    }

    applyImageAdjustments(pixels, contrast, brightness, saturation) {
        for (let i = 0; i < pixels.length; i += 4) {
            // Convert to HSL
            const r = pixels[i] / 255;
            const g = pixels[i + 1] / 255;
            const b = pixels[i + 2] / 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }

            // Apply adjustments
            s = Math.min(1, Math.max(0, s * saturation));
            l = Math.min(1, Math.max(0, l * brightness));
            
            // Apply contrast
            l = ((l - 0.5) * contrast) + 0.5;
            l = Math.min(1, Math.max(0, l));

            // Convert back to RGB
            let r1, g1, b1;
            
            if (s === 0) {
                r1 = g1 = b1 = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;

                r1 = hue2rgb(p, q, h + 1/3);
                g1 = hue2rgb(p, q, h);
                b1 = hue2rgb(p, q, h - 1/3);
            }

            pixels[i] = Math.round(r1 * 255);
            pixels[i + 1] = Math.round(g1 * 255);
            pixels[i + 2] = Math.round(b1 * 255);
        }
    }

    saveImage() {
        const format = this.outputFormat.value;
        let mimeType;
        let quality = undefined;
    
        switch (format) {
            case 'png':
                mimeType = 'image/png';
                break;
            case 'jpeg':
                mimeType = 'image/jpeg';
                quality = 0.92;
                break;
            case 'webp':
                mimeType = 'image/webp';
                quality = 0.92;
                break;
            default:
                alert('Unsupported format selected.');
                return;
        }
    
        try {
            const dataUrl = this.processedCanvas.toDataURL(mimeType, quality);
    
            // Construct the file name using the original name
            const baseName = this.originalFileName || 'processed-image';
            const fileName = `${baseName}_processed.${format}`;
    
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error saving image:', error);
            alert('Error saving image. Please try again.');
        }
    }   

    resetControls() {
        this.presetScales.value = '1';
        this.widthInput.value = this.originalImage.width;
        this.heightInput.value = this.originalImage.height;
        this.colorMode.value = 'original';
        this.outputFormat.value = 'png';
        this.saveButton.disabled = true;

        this.posterizeCheckbox.checked = false;
        this.posterizeOptions.classList.add('hidden');

        this.pixelateCheckbox.checked = false;
        this.pixelateOptions.classList.add('hidden');

        this.thresholdCheckbox.checked = false;
        this.thresholdOptions.classList.add('hidden');

        this.colorPaletteCheckbox.checked = false;
        this.colorPaletteOptions.classList.add('hidden');

        this.invertCheckbox.checked = false;

        // Reset new controls
        this.contrastInput.value = 100;
        this.brightnessInput.value = 100;
        this.saturationInput.value = 100;
        this.rotationInput.value = 0;
        this.contrastNumberInput.value = '100';
        this.brightnessNumberInput.value = '100';
        this.saturationNumberInput.value = '100';
        this.rotationNumberInput.value = '0';
        
        // Reset value displays
        this.contrastValue.textContent = '100%';
        this.brightnessValue.textContent = '100%';
        this.saturationValue.textContent = '100%';
        this.rotationValue.textContent = '0°';
        this.posterizeValue.textContent = '4';
        this.pixelateValue.textContent = '16';
        this.colorPaletteValue.textContent = '16';
        this.thresholdValue.textContent = '16';
        this.toleranceValue.textContent = '2';
        
        // Clear processed canvas
        const ctx = this.processedCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);

        this.transparencyCheckbox.checked = false;
        this.transparencyOptions.classList.add('hidden');
        this.transparencyCheckbox.disabled = this.outputFormat.value !== 'png';
        this.backgroundColor = null;
        
        if (this.backgroundColorPreview) {
            this.backgroundColorPreview.style.backgroundColor = 'transparent';
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ImageProcessor();
});