document.addEventListener('DOMContentLoaded', () => {
    // Initial data
    let segments = [
        { name: 'Segment 1', value: 30, color: '#4285F4' },
        { name: 'Segment 2', value: 20, color: '#EA4335' },
        { name: 'Segment 3', value: 50, color: '#FBBC05' }
    ];
    
    let activeColorElement = null;
    let selectedColor = '#4285F4';
    
    // Переменная для отслеживания направления сортировки
    let sortDirection = 'desc'; // 'desc' - от большего к меньшему, 'asc' - от меньшего к большему
    
    // DOM elements
    const segmentsContainer = document.getElementById('segments-container');
    const addSegmentBtn = document.getElementById('add-segment');
    const autoSortBtn = document.getElementById('auto-sort');
    const chartTitleInput = document.getElementById('chart-title');
    const chartTitleDisplay = document.getElementById('chart-title-display');
    const exportPngBtn = document.getElementById('export-png');
    const pieChart = document.getElementById('pie-chart');
    const segmentsGroup = document.getElementById('segments');
    const innerCircle = document.getElementById('inner-circle');
    const legendContainer = document.getElementById('legend-container');
    const resetDefaultsBtn = document.getElementById('reset-defaults');
    
    // Color picker modal
    const modal = document.getElementById('color-picker-modal');
    const closeBtn = document.querySelector('.close');
    const confirmColorBtn = document.getElementById('confirm-color');
    const colorInput = document.getElementById('color-input');
    const selectedColorPreview = document.getElementById('selected-color-preview');
    
    // Initialization
    createShadowFilter();
    loadSettings(); // Load saved settings
    renderSegments();
    updateChart();
    
    // Event handlers
    addSegmentBtn.addEventListener('click', addSegment);
    autoSortBtn.addEventListener('click', autoSortSegments);
    chartTitleInput.addEventListener('input', updateChartTitle);
    exportPngBtn.addEventListener('click', exportAsPng);
    closeBtn.addEventListener('click', closeModal);
    confirmColorBtn.addEventListener('click', confirmColor);
    colorInput.addEventListener('input', updateColorPreview);
    resetDefaultsBtn.addEventListener('click', resetToDefaults);
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Function to save settings to localStorage
    function saveSettings() {
        const settings = {
            segments: segments,
            chartTitle: chartTitleInput.value
        };
        
        localStorage.setItem('colorWheelSettings', JSON.stringify(settings));
    }
    
    // Function to load settings from localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('colorWheelSettings');
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Load segments
            if (settings.segments && settings.segments.length > 0) {
                segments = settings.segments;
            }
            
            // Load chart title
            if (settings.chartTitle) {
                chartTitleInput.value = settings.chartTitle;
                chartTitleDisplay.textContent = settings.chartTitle;
            }
        }
    }

    // Function to render segments
    function renderSegments() {
        segmentsContainer.innerHTML = '';
        
        segments.forEach((segment, index) => {
            const segmentItem = document.createElement('div');
            segmentItem.className = 'segment-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'segment-color';
            colorBox.style.backgroundColor = segment.color;
            colorBox.dataset.index = index;
            colorBox.addEventListener('click', () => openColorPicker(colorBox));
            
            const nameInput = document.createElement('input');
            nameInput.className = 'segment-input';
            nameInput.type = 'text';
            nameInput.value = segment.name;
            nameInput.placeholder = 'Name';
            nameInput.addEventListener('input', () => {
                segment.name = nameInput.value;
                updateChart();
                saveSettings(); // Save settings after changing name
            });
            
            const valueInput = document.createElement('input');
            valueInput.className = 'segment-input segment-value';
            valueInput.type = 'number';
            valueInput.min = '0.1';
            valueInput.step = '0.1';
            valueInput.value = segment.value;
            valueInput.addEventListener('input', () => {
                segment.value = parseFloat(valueInput.value) || 0;
                updateChart();
                saveSettings(); // Save settings after changing value
            });
            
            // Создаем контейнер для кнопок управления
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'segment-controls';
            
            // Кнопка вверх
            const upBtn = document.createElement('button');
            upBtn.className = 'segment-move-btn up-btn';
            upBtn.innerHTML = '&#9650;'; // Символ стрелки вверх
            upBtn.title = 'Переместить вверх';
            upBtn.disabled = index === 0; // Отключаем для первого элемента
            upBtn.addEventListener('click', () => {
                if (index > 0) {
                    // Меняем местами текущий сегмент с предыдущим
                    [segments[index], segments[index - 1]] = [segments[index - 1], segments[index]];
                    renderSegments();
                    updateChart();
                    saveSettings(); // Сохраняем изменения
                }
            });
            
            // Кнопка вниз
            const downBtn = document.createElement('button');
            downBtn.className = 'segment-move-btn down-btn';
            downBtn.innerHTML = '&#9660;'; // Символ стрелки вниз
            downBtn.title = 'Переместить вниз';
            downBtn.disabled = index === segments.length - 1; // Отключаем для последнего элемента
            downBtn.addEventListener('click', () => {
                if (index < segments.length - 1) {
                    // Меняем местами текущий сегмент со следующим
                    [segments[index], segments[index + 1]] = [segments[index + 1], segments[index]];
                    renderSegments();
                    updateChart();
                    saveSettings(); // Сохраняем изменения
                }
            });
            
            // Добавляем кнопки в контейнер
            controlsContainer.appendChild(upBtn);
            controlsContainer.appendChild(downBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'segment-delete';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', () => {
                segments.splice(index, 1);
                renderSegments();
                updateChart();
                saveSettings(); // Save settings after deleting segment
            });
            
            segmentItem.appendChild(colorBox);
            segmentItem.appendChild(nameInput);
            segmentItem.appendChild(valueInput);
            segmentItem.appendChild(controlsContainer);
            segmentItem.appendChild(deleteBtn);
            
            segmentsContainer.appendChild(segmentItem);
        });
    }
    
    // Function to generate random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // Function to add new segment
    function addSegment() {
        const newColor = getRandomColor(); // Random color for new segment
        segments.push({ name: `Segment ${segments.length + 1}`, value: 10, color: newColor });
        renderSegments();
        updateChart();
        saveSettings(); // Save settings after adding segment
    }
    
    // Function to update chart title
    function updateChartTitle() {
        chartTitleDisplay.textContent = chartTitleInput.value;
        saveSettings(); // Save settings after changing title
    }
    
    // Function to open color picker modal
    function openColorPicker(element) {
        activeColorElement = element;
        selectedColor = element.style.backgroundColor;
        selectedColorPreview.style.backgroundColor = selectedColor;
        
        // Convert RGB to HEX for input[type="color"]
        if (selectedColor.startsWith('rgb')) {
            const rgb = selectedColor.match(/\d+/g);
            if (rgb && rgb.length === 3) {
                const hex = '#' + rgb.map(x => {
                    const hex = parseInt(x).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
                colorInput.value = hex;
            }
        } else {
            colorInput.value = selectedColor;
        }
        
        modal.style.display = 'block';
    }
    
    // Function to close modal
    function closeModal() {
        modal.style.display = 'none';
    }
    
    // Function to confirm color selection
    function confirmColor() {
        if (activeColorElement) {
            activeColorElement.style.backgroundColor = selectedColor;
            const segmentIndex = parseInt(activeColorElement.dataset.index);
            segments[segmentIndex].color = selectedColor;
            updateChart();
        }
        closeModal();
    }
    
    // Function to update color preview
    function updateColorPreview() {
        selectedColor = colorInput.value;
        selectedColorPreview.style.backgroundColor = selectedColor;
    }
    
    // Function to update chart
    function updateChart() {
        // Clear current segments
        segmentsGroup.innerHTML = '';
        legendContainer.innerHTML = '';
        
        // Calculate total value
        const total = segments.reduce((sum, segment) => sum + segment.value, 0);
        
        // If no data, do not draw chart
        if (total === 0) return;
        
        let startAngle = 0;
        
        // Create segments
        segments.forEach((segment, index) => {
            // Calculate angle for current segment
            const angle = (segment.value / total) * 360;
            const endAngle = startAngle + angle;
            
            // Create path for segment
            const path = createSegmentPath(startAngle, endAngle);
            path.setAttribute('fill', segment.color);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '1');
            
            // Add shadow to segment
            path.setAttribute('filter', 'url(#drop-shadow)');
            
            segmentsGroup.appendChild(path);
            
            // Add segment label
            addSegmentLabel(segment.name, startAngle, endAngle, angle);
            
            // Add legend item
            addLegendItem(segment.name, segment.color, `${((segment.value / total) * 100).toFixed(1)}%`);
            
            // Update start angle for next segment
            startAngle = endAngle;
        });
    }
    
    // Function to create segment path
    function createSegmentPath(startAngle, endAngle) {
        // Convert angles to radians
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        // Calculate coordinates
        const centerX = 120;
        const centerY = 120;
        const outerRadius = 140;
        const innerRadius = 40; // Fixed inner radius
        
        // Determine if segment is large (more than 180 degrees)
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        
        // Calculate points for outer arc
        const outerStartX = centerX + outerRadius * Math.cos(startRad);
        const outerStartY = centerY + outerRadius * Math.sin(startRad);
        const outerEndX = centerX + outerRadius * Math.cos(endRad);
        const outerEndY = centerY + outerRadius * Math.sin(endRad);
        
        // Calculate points for inner arc
        const innerStartX = centerX + innerRadius * Math.cos(endRad);
        const innerStartY = centerY + innerRadius * Math.sin(endRad);
        const innerEndX = centerX + innerRadius * Math.cos(startRad);
        const innerEndY = centerY + innerRadius * Math.sin(startRad);
        
        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Form path commands
        let d = [
            `M ${outerStartX},${outerStartY}`, // Move to start of outer arc
            `A ${outerRadius},${outerRadius} 0 ${largeArcFlag},1 ${outerEndX},${outerEndY}`, // Draw outer arc
            `L ${innerStartX},${innerStartY}`, // Line to start of inner arc
            `A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${innerEndX},${innerEndY}`, // Draw inner arc
            'Z' // Close path
        ].join(' ');
        
        path.setAttribute('d', d);
        return path;
    }
    
    // Function to add segment label
    function addSegmentLabel(name, startAngle, endAngle, angle) {
        // Calculate middle angle for label placement
        const midAngle = (startAngle + endAngle) / 2;
        const midRad = (midAngle - 90) * Math.PI / 180;
        
        // Calculate coordinates for label placement
        const centerX = 120;
        const centerY = 120;
        const innerRadius = 40; // Fixed inner radius
        const outerRadius = 140;
        
        // Check segment width and angle
        // If segment is small or name is long - move label outside
        // const segmentWidth = (angle / 360) * 2 * Math.PI * ((innerRadius + outerRadius) / 2);
        const segmentWidth = outerRadius - innerRadius;
        const estimatedTextWidth = name.length * 6; // Estimated text width (5 pixels per character)
        const isSmallSegment = angle < 10 || estimatedTextWidth > segmentWidth;
        
        // Radius for label placement
        let labelRadius;
        let fontSize;
        let fontWeight;
        let textAnchor = 'middle';
        let dominantBaseline = 'middle';
        let fill = '#000';
        let offsetX = 0;
        let offsetY = 0;
        let rotation = 0;
        
        if (isSmallSegment) {
            // For small segments or long names - move label outside chart
            labelRadius = outerRadius + 30; // Distance from chart edge
            fontSize = 8;
            fontWeight = 'bold';
            
            // Determine text alignment based on position
            if (midAngle < 180 ) {
                textAnchor = 'start'; // For left side of chart - text starts from line
                offsetX = 2; // Small offset from end of line
            } else {
                textAnchor = 'end'; // For right side of chart - text ends at line
                offsetX = -2; // Small offset from end of line
            }
            
            // Small vertical offset for better alignment
            if (midAngle > 0 && midAngle < 180) {
                offsetY = -2; // For top half of chart
            } else {
                offsetY = 2; // For bottom half of chart
            }
        } else {
            // For regular segments - place label inside with radial rotation
            const radiusDiff = Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2);
            if (radiusDiff !== 0) {
                // Центроид кольцевого сектора: (2/3) * (R^3 - r^3) / (R^2 - r^2)
                labelRadius = (2 / 3) * (Math.pow(outerRadius, 3) - Math.pow(innerRadius, 3)) / radiusDiff;
            } else {
                labelRadius = (innerRadius + outerRadius) / 2;
            }
            // Смещаем подпись чуть ближе к центру, не заходя слишком глубоко
            // labelRadius = Math.max(innerRadius + 12, labelRadius - 12);
            fontSize = 8;
            fontWeight = 'bold';
            
            // Радиальное размещение текста (перпендикулярно дуге, вдоль радиуса)
            rotation = midAngle + 90;
            
            // Корректировка угла для читаемости (чтобы текст не был перевернутым)
            // Для нижней половины круга переворачиваем текст
            if (midAngle > 0 && midAngle < 180) {
                rotation = midAngle - 90; // Переворачиваем текст для нижней половины
            }
        }
        
        // Calculate label coordinates
        const x = centerX + labelRadius * Math.cos(midRad);
        const y = centerY + labelRadius * Math.sin(midRad);
        
        // Create text element
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        
        // If segment is small, add line from segment to label
        if (isSmallSegment) {
            // Calculate line points
            const segmentX = centerX + outerRadius * Math.cos(midRad);
            const segmentY = centerY + outerRadius * Math.sin(midRad);
            
            // Line end point
            const lineEndX = x;
            const lineEndY = y;
            
            // Create line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', segmentX);
            line.setAttribute('y1', segmentY);
            line.setAttribute('x2', lineEndX);
            line.setAttribute('y2', lineEndY);
            line.setAttribute('stroke', '#666');
            line.setAttribute('stroke-width', '0.5');
            segmentsGroup.appendChild(line);
            
            // Set text coordinates with offset from end of line
            text.setAttribute('x', x + offsetX);
            text.setAttribute('y', y + offsetY);
        } else {
            // For regular segments - simply set coordinates
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('transform', `rotate(${rotation}, ${x}, ${y})`);
        }
        
        text.setAttribute('text-anchor', textAnchor);
        text.setAttribute('dominant-baseline', dominantBaseline);
        text.setAttribute('fill', fill);
        text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', fontWeight);
        text.setAttribute('class', 'segment-label');
        
        // Set text without truncation
        text.textContent = name;
        
        // Add text to SVG
        segmentsGroup.appendChild(text);
    }
    
    // Function to add legend item
    function addLegendItem(name, color, percentage) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = color;
        
        const label = document.createElement('span');
        label.textContent = `${name}: ${percentage}`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    }
    
    // Function to export chart as PNG
    function exportAsPng() {
        // Create temporary div for SVG copy
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);
        
        // Create deep copy of SVG for export
        const svgCopy = pieChart.cloneNode(true);
        
        // Set extended viewBox to fit all elements, including moved labels
        svgCopy.setAttribute('viewBox', '-60 -60 360 360');
        
        // Set larger size for better quality, but keep proportions
        const scale = 3; // Scale for better quality
        svgCopy.setAttribute('width', 360 * scale);
        svgCopy.setAttribute('height', 360 * scale);
        
        // Add copy to DOM for styles to apply
        tempDiv.appendChild(svgCopy);
        
        // Add styles from original
        const fontStyle = document.createElement('style');
        fontStyle.textContent = `
            circle { stroke: #fff; stroke-width: 1; }
            path { stroke: #fff; stroke-width: 1; filter: url(#drop-shadow); }
            text { font-family: 'Roboto', Arial, sans-serif; }
            line { stroke: #666; stroke-width: 0.5; }
            .segment-label { 
                font-family: 'Roboto', Arial, sans-serif; 
                letter-spacing: 0.5px;
                text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
            }
            .segment-label-inside { 
                fill: #000; 
                font-weight: bold; 
            }
            .segment-label-outside { 
                fill: #000; 
            }
        `;
        svgCopy.appendChild(fontStyle);
        
        // Find all text elements and save their original attributes
        const textElements = svgCopy.querySelectorAll('text');
        textElements.forEach(text => {
            // Save original text and classes
            const originalText = text.textContent;
            const originalClasses = text.getAttribute('class') || '';
            
            // Remove all child elements and create new text node
            while (text.firstChild) {
                text.removeChild(text.firstChild);
            }
            
            // Create new text node with original text
            const textNode = document.createTextNode(originalText);
            text.appendChild(textNode);
            
            // Restore classes
            text.setAttribute('class', originalClasses);
        });
        
        // Wait a bit for styles to apply
        setTimeout(() => {
            // Convert SVG to string
            const svgData = new XMLSerializer().serializeToString(svgCopy);
            
            // Create Data URL from SVG
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Create temporary canvas with white background
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 360 * scale;
            canvas.height = 360 * scale;
            
            // Create image from SVG
            const img = new Image();
            
            // Error handler for debugging
            img.onerror = function(err) {
                console.error('Error loading image:', err);
                alert('Error exporting PNG. Please try again.');
                URL.revokeObjectURL(svgUrl);
                document.body.removeChild(tempDiv);
            };
            
            img.onload = function() {
                // Fill canvas with white color
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add chart title
                if (chartTitleInput.value) {
                    ctx.font = `bold ${12 * scale}px 'Montserrat', 'Segoe UI', sans-serif`;
                    ctx.fillStyle = '#1c66af';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 4 * scale;
                    ctx.shadowOffsetX = 2 * scale;
                    ctx.shadowOffsetY = 2 * scale;
                    ctx.fillText(chartTitleInput.value, canvas.width / 2, 20 * scale);
                    ctx.shadowColor = 'transparent';
                }
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                try {
                    // Convert canvas to PNG and download
                    const pngUrl = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pngUrl;
                    downloadLink.download = chartTitleInput.value || 'diagram.png';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                } catch (e) {
                    console.error('Error converting to PNG:', e);
                    alert('Error exporting PNG. Please try again.');
                } finally {
                    // Release resources
                    URL.revokeObjectURL(svgUrl);
                    document.body.removeChild(tempDiv);
                }
            };
            
            // Load SVG into image
            img.src = svgUrl;
        }, 100); // Small delay for styles to apply
    }
    
    // Function to create shadow filter
    function createShadowFilter() {
        // Create defs element for filter definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create filter
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'drop-shadow');
        filter.setAttribute('x', '-30%');
        filter.setAttribute('y', '-30%');
        filter.setAttribute('width', '160%');
        filter.setAttribute('height', '160%');
        
        // Create blur
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        feGaussianBlur.setAttribute('result', 'blur');
        
        // Create offset
        const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('in', 'blur');
        feOffset.setAttribute('dx', '2');
        feOffset.setAttribute('dy', '2');
        feOffset.setAttribute('result', 'offsetblur');
        
        // Create component transfer
        const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        const feFunc = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFunc.setAttribute('type', 'linear');
        feFunc.setAttribute('slope', '0.4');
        feComponentTransfer.appendChild(feFunc);
        feComponentTransfer.setAttribute('in', 'offsetblur');
        feComponentTransfer.setAttribute('result', 'shadow');
        
        // Create merge
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'shadow');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        
        // Assemble filter
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feOffset);
        filter.appendChild(feComponentTransfer);
        filter.appendChild(feMerge);
        
        // Add filter to defs
        defs.appendChild(filter);
        
        // Add defs to SVG
        pieChart.insertBefore(defs, pieChart.firstChild);
    }
    
    // Function to automatically sort segments by value
    function autoSortSegments() {
        // Меняем направление сортировки при каждом нажатии
        if (sortDirection === 'desc') {
            // Сортируем от меньшего к большему
            segments.sort((a, b) => a.value - b.value);
            sortDirection = 'asc';
            autoSortBtn.textContent = 'Auto sorting ↓';
            autoSortBtn.title = 'Sort from largest to smallest';
        } else {
            // Сортируем от большего к меньшему
            segments.sort((a, b) => b.value - a.value);
            sortDirection = 'desc';
            autoSortBtn.textContent = 'Auto sorting ↑';
            autoSortBtn.title = 'Sort from smallest to largest';
        }
        
        // Перерисовываем сегменты и обновляем диаграмму
        renderSegments();
        updateChart();
        saveSettings(); // Сохраняем изменения
    }
    
    // Function to reset to default settings
    function resetToDefaults() {
        // Default segments
        segments = [
            { name: 'Segment 1', value: 30, color: '#4285F4' },
            { name: 'Segment 2', value: 20, color: '#EA4335' },
            { name: 'Segment 3', value: 50, color: '#FBBC05' }
        ];
        
        // Reset chart title
        chartTitleInput.value = '';
        chartTitleDisplay.textContent = '';
        
        // Re-render everything
        renderSegments();
        updateChart();
        
        // Clear localStorage
        localStorage.removeItem('colorWheelSettings');
    }
});
