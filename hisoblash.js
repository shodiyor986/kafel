/**
 * ============================================
 * HISOBLASH BO'LIMI - Kvadrat va 45° Gradus / Avalni
 * 45° = 2x, Avalni = 1x
 * Kvitansiyada 45° va Avalni chizmalari
 * ============================================
 */

// ====== TELEGRAM WEB APP ======
let tg = null;
let isTelegram = false;

try {
    tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        isTelegram = true;
        console.log('✅ Telegram Web App ulandi!');

        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#f0f4f8');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#0f172a');
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.hintColor || '#64748b');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.linkColor || '#3b82f6');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor || '#3b82f6');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.secondaryBackgroundColor || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-header-bg-color', tg.headerBackgroundColor || '#0f172a');
        document.documentElement.style.setProperty('--tg-theme-separator-color', tg.separatorColor || '#e2e8f0');
    }
} catch (e) {
    console.log('⚠️ Telegram Web App mavjud emas');
}

// ====== 1. KVADRAT HISOBLASH ======
function calculateSquare() {
    const price = parseFloat(document.getElementById('squarePrice').value) || 0;

    const walls = ['top', 'right', 'left', 'bottom', 'side'];
    const wallNames = {
        top: 'YUQORI',
        right: 'O\'NG',
        left: 'CHAP',
        bottom: 'PAST',
        side: 'YON'
    };
    const wallIcons = {
        top: '⬆',
        right: '➡',
        left: '⬅',
        bottom: '⬇',
        side: '↔'
    };

    let totalArea = 0;
    let allDetails = [];

    // Asosiy 5 ta devorni hisoblash
    walls.forEach(wall => {
        const length = parseFloat(document.querySelector(`.wall-input[data-wall="${wall}"][data-type="length"]`).value) || 0;
        const height = parseFloat(document.querySelector(`.wall-input[data-wall="${wall}"][data-type="height"]`).value) || 0;
        const area = length * height;

        if (area > 0) {
            totalArea += area;
            allDetails.push({
                label: wallNames[wall],
                icon: wallIcons[wall],
                length: length,
                height: height,
                area: area,
                price: area * price,
                isExtra: false
            });
        }
    });

    // Qo'shimcha devorlarni hisoblash
    const extraWalls = document.querySelectorAll('.extra-wall');
    extraWalls.forEach((wall) => {
        const select = wall.querySelector('.extra-wall-selector');
        const selectedText = select ? select.options[select.selectedIndex]?.text || "Qo'shimcha" : "Qo'shimcha";

        const length = parseFloat(wall.querySelector('.extra-length').value) || 0;
        const height = parseFloat(wall.querySelector('.extra-height').value) || 0;
        const area = length * height;

        if (area > 0) {
            totalArea += area;
            allDetails.push({
                label: selectedText,
                icon: '',
                length: length,
                height: height,
                area: area,
                price: area * price,
                isExtra: true
            });
        }
    });

    const totalPrice = totalArea * price;

    document.getElementById('squareAreaResult').textContent = totalArea.toFixed(2) + ' m²';
    document.getElementById('squarePriceResult').textContent = totalPrice.toLocaleString('uz-UZ') + " so'm";

    let detailsHTML = '';
    if (allDetails.length === 0) {
        detailsHTML = '<div style="color: #94a3b8; font-size: 12px;">Hech qanday o\'lcham kiritilmagan</div>';
    } else {
        allDetails.forEach(item => {
            detailsHTML += `
                <div class="detail-item">
                    <span class="detail-label">${item.icon} ${item.label}${item.isExtra ? ' 📌' : ''}: ${item.length} × ${item.height} = ${item.area.toFixed(2)} m²</span>
                    <span class="detail-value">${item.price.toLocaleString('uz-UZ')} so'm</span>
                </div>
            `;
        });
    }
    document.getElementById('squareDetails').innerHTML = detailsHTML;

    return {
        area: totalArea,
        total: totalPrice,
        details: allDetails
    };
}

// ====== 2. QO'SHIMCHA DEVOR ======
function addExtraWall() {
    const container = document.getElementById('extraWallsContainer');
    const div = document.createElement('div');
    div.className = 'extra-wall';
    div.innerHTML = `
        <div class="extra-wall-select">
            <select class="extra-wall-selector">
                <option value="top">⬆ YUQORI</option>
                <option value="right">➡ O'NG</option>
                <option value="left">⬅ CHAP</option>
                <option value="bottom">⬇ PAST</option>
                <option value="side">↔ YON</option>
                <option value="extra" selected>📌 Qo'shimcha</option>
            </select>
        </div>
        <div class="input-group-sm">
            <label>Uzunlik</label>
            <input type="number" class="extra-length" value="1" step="0.1" min="0" />
        </div>
        <div class="input-group-sm">
            <label>Balandlik</label>
            <input type="number" class="extra-height" value="2.5" step="0.1" min="0" />
        </div>
        <button class="btn-remove-row" onclick="removeExtraWall(this)">✖</button>
    `;
    container.appendChild(div);

    div.querySelectorAll('input, select').forEach(i => {
        i.addEventListener('input', calculateAll);
        i.addEventListener('change', calculateAll);
    });

    calculateAll();
}

function removeExtraWall(btn) {
    btn.closest('.extra-wall').remove();
    calculateAll();
}

// ====== 3. 45 GRADUS / AVALNI (QO'SHISH VA O'CHIRISH) ======
function addGradusRow() {
    const container = document.getElementById('gradusContainer');
    const div = document.createElement('div');
    div.className = 'input-with-btn gradus-row';
    div.innerHTML = `
        <div class="input-group-sm" style="flex:1.5;">
            <select class="gradus-type-select">
                <option value="gradus">🔶 45° Gradus</option>
                <option value="avalni">🔷 Avalni (yon)</option>
            </select>
        </div>
        <div class="input-group-sm" style="flex:1;">
            <label>Metr (m)</label>
            <input type="number" class="gradus-meter-input" value="1" step="0.1" min="0" />
        </div>
        <button class="btn-remove-row" onclick="removeGradusRow(this)">✖</button>
    `;
    container.appendChild(div);

    div.querySelectorAll('input, select').forEach(i => {
        i.addEventListener('input', calculateAll);
        i.addEventListener('change', function() {
            updateGradusVisual();
            calculateAll();
        });
    });

    updateGradusVisual();
    calculateAll();
}

function removeGradusRow(btn) {
    const container = document.getElementById('gradusContainer');
    if (container.children.length > 1) {
        btn.closest('.gradus-row').remove();
        updateGradusVisual();
        calculateAll();
    } else {
        alert('Kamida 1 ta qator qolishi kerak!');
    }
}

// ====== 4. GRADUS VIZUALNI YANGILASH ======
function updateGradusVisual() {
    const rows = document.querySelectorAll('#gradusContainer .gradus-row');
    let hasGradus = false;
    let hasAvalni = false;
    
    rows.forEach(row => {
        const select = row.querySelector('.gradus-type-select');
        if (select) {
            const type = select.value;
            if (type === 'gradus') hasGradus = true;
            else if (type === 'avalni') hasAvalni = true;
        }
    });
    
    const title = document.getElementById('visualTitle');
    const tileBox = document.getElementById('tileBox');
    const explanation = document.getElementById('tileExplanation');
    const tilesLabel = document.getElementById('tilesLabel');
    const gradusInfo = document.getElementById('gradusInfo');
    const totalLabel = document.getElementById('totalGradusLabel');
    const receiptTitle = document.getElementById('receiptGradusTitle');
    const receiptBox = document.querySelector('.receipt-tile-box');
    const receiptExplanation = document.getElementById('receiptExplanation');
    
    if (hasGradus) {
        // 45° Gradus vizual
        title.textContent = '🔍 45° kesish va yopishtirish';
        tilesLabel.textContent = '🔪 Kesiladigan kafel:';
        totalLabel.textContent = '🔶 45° gradus:';
        receiptTitle.textContent = '🔶 2. 45° gradus hisoblash:';
        gradusInfo.textContent = '⚠️ 1 metr = 2 ta kafel 45° kesiladi';
        
        if (tileBox) {
            tileBox.innerHTML = `
                <div class="tile tile-1">
                    <span>1</span>
                    <div class="cut-line"></div>
                </div>
                <div class="tile tile-2">
                    <span>2</span>
                    <div class="cut-line"></div>
                </div>
            `;
        }
        if (explanation) {
            explanation.innerHTML = `
                <p><span class="dot red"></span> 1-kafel 45° kesiladi</p>
                <p><span class="dot blue"></span> 2-kafel 45° kesiladi</p>
                <p><span class="dot green"></span> 1 metr = 2 ta kafel</p>
            `;
        }
        if (receiptBox) {
            receiptBox.innerHTML = `
                <div class="receipt-tile receipt-tile-1">
                    <span>1</span>
                    <div class="receipt-cut-line"></div>
                </div>
                <div class="receipt-tile receipt-tile-2">
                    <span>2</span>
                    <div class="receipt-cut-line"></div>
                </div>
            `;
        }
        if (receiptExplanation) {
            receiptExplanation.innerHTML = `
                <p><span class="dot red"></span> 1-kafel 45° kesiladi</p>
                <p><span class="dot blue"></span> 2-kafel 45° kesiladi</p>
                <p><span class="dot green"></span> 1 metr = 2 ta kafel</p>
            `;
        }
    } else if (hasAvalni) {
        // Avalni vizual
        title.textContent = '🔍 Avalni (yon tomonini silliqlash)';
        tilesLabel.textContent = '🔪 Silliqlanadigan kafel:';
        totalLabel.textContent = '🔷 Avalni (yon):';
        receiptTitle.textContent = '🔷 2. Avalni (yon) hisoblash:';
        gradusInfo.textContent = 'ℹ️ 1 metr = 1 ta kafel yon tomoni silliqlanadi';
        
        if (tileBox) {
            tileBox.innerHTML = `
                <div class="tile-single">
                    <span>1</span>
                    <div class="cut-line-single"></div>
                </div>
            `;
        }
        if (explanation) {
            explanation.innerHTML = `
                <p><span class="dot blue"></span> 1-kafel yon tomoni silliqlanadi</p>
                <p><span class="dot green"></span> 1 metr = 1 ta kafel</p>
            `;
        }
        if (receiptBox) {
            receiptBox.innerHTML = `
                <div class="receipt-tile-avalni">
                    <span>1</span>
                    <svg viewBox="0 0 80 80">
                        <rect x="5" y="5" width="70" height="70" rx="4" fill="url(#avalniGrad)" stroke="#3b82f6" stroke-width="2.5"/>
                        <path d="M 40 5 Q 75 5 75 40" class="arc-45"/>
                        <path d="M 75 40 Q 75 75 40 75" class="arc-45"/>
                        <line x1="40" y1="5" x2="40" y2="15" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
                        <line x1="75" y1="40" x2="65" y2="40" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
                        <defs>
                            <linearGradient id="avalniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#dbeafe;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#93c5fd;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            `;
        }
        if (receiptExplanation) {
            receiptExplanation.innerHTML = `
                <p><span class="dot blue"></span> 1-kafel yon tomoni aylana (45°) yaxlitlanadi</p>
                <p><span class="dot green"></span> 1 metr = 1 ta kafel</p>
            `;
        }
    } else {
        // Default - 45°
        title.textContent = '🔍 45° kesish va yopishtirish';
        tilesLabel.textContent = '🔪 Kesiladigan kafel:';
        totalLabel.textContent = '🔶 45° gradus:';
        receiptTitle.textContent = '🔶 2. 45° gradus hisoblash:';
        gradusInfo.textContent = '⚠️ 1 metr = 2 ta kafel 45° kesiladi';
        
        if (tileBox) {
            tileBox.innerHTML = `
                <div class="tile tile-1">
                    <span>1</span>
                    <div class="cut-line"></div>
                </div>
                <div class="tile tile-2">
                    <span>2</span>
                    <div class="cut-line"></div>
                </div>
            `;
        }
        if (explanation) {
            explanation.innerHTML = `
                <p><span class="dot red"></span> 1-kafel 45° kesiladi</p>
                <p><span class="dot blue"></span> 2-kafel 45° kesiladi</p>
                <p><span class="dot green"></span> 1 metr = 2 ta kafel</p>
            `;
        }
        if (receiptBox) {
            receiptBox.innerHTML = `
                <div class="receipt-tile receipt-tile-1">
                    <span>1</span>
                    <div class="receipt-cut-line"></div>
                </div>
                <div class="receipt-tile receipt-tile-2">
                    <span>2</span>
                    <div class="receipt-cut-line"></div>
                </div>
            `;
        }
        if (receiptExplanation) {
            receiptExplanation.innerHTML = `
                <p><span class="dot red"></span> 1-kafel 45° kesiladi</p>
                <p><span class="dot blue"></span> 2-kafel 45° kesiladi</p>
                <p><span class="dot green"></span> 1 metr = 2 ta kafel</p>
            `;
        }
    }
}

// ====== 5. 45 GRADUS / AVALNI HISOBLASH ======
function calculateGradus() {
    const price = parseFloat(document.getElementById('gradusPrice').value) || 0;
    const rows = document.querySelectorAll('#gradusContainer .gradus-row');

    let totalMeter = 0;
    let totalTiles = 0;
    let totalPrice = 0;
    let details = [];
    let hasGradus = false;
    let hasAvalni = false;

    rows.forEach((row, index) => {
        const select = row.querySelector('.gradus-type-select');
        const type = select ? select.value : 'gradus';
        const meter = parseFloat(row.querySelector('.gradus-meter-input').value) || 0;
        
        // ===== MUHIM: 45° = 2x, Avalni = 1x =====
        const multiplier = (type === 'gradus') ? 2 : 1;
        const typeName = (type === 'gradus') ? '45° Gradus' : 'Avalni (yon)';
        const typeIcon = (type === 'gradus') ? '🔶' : '🔷';
        
        if (type === 'gradus') hasGradus = true;
        else if (type === 'avalni') hasAvalni = true;
        
        if (meter > 0) {
            const tiles = meter * multiplier;
            const priceTotal = meter * price * multiplier;
            
            totalMeter += meter;
            totalTiles += tiles;
            totalPrice += priceTotal;
            
            details.push({
                index: index + 1,
                typeName: typeName,
                typeIcon: typeIcon,
                type: type,
                meter: meter,
                multiplier: multiplier,
                tiles: tiles,
                price: priceTotal,
                text: `${meter.toFixed(1)} m × ${multiplier} = ${tiles.toFixed(1)} ta kafel`
            });
        }
    });

    document.getElementById('gradusTiles').textContent = totalTiles.toFixed(1) + ' ta';
    document.getElementById('gradusPriceResult').textContent = totalPrice.toLocaleString('uz-UZ') + " so'm";

    return {
        meter: totalMeter,
        tiles: totalTiles,
        total: totalPrice,
        details: details,
        hasGradus: hasGradus,
        hasAvalni: hasAvalni
    };
}

// ====== 6. LISTENERLAR ======
function addListeners() {
    document.querySelectorAll('.wall-input, .extra-length, .extra-height, .gradus-meter-input, .extra-wall-selector, .gradus-type-select').forEach(i => {
        i.addEventListener('input', calculateAll);
        i.addEventListener('change', function() {
            if (this.classList.contains('gradus-type-select') || this.classList.contains('gradus-meter-input')) {
                updateGradusVisual();
            }
            calculateAll();
        });
    });
}

// ====== 7. ASOSIY HISOB ======
function calculateAll() {
    const square = calculateSquare();
    const gradus = calculateGradus();
    const grand = square.total + gradus.total;

    document.getElementById('totalSquare').textContent = square.total.toLocaleString('uz-UZ') + " so'm";
    document.getElementById('totalGradus').textContent = gradus.total.toLocaleString('uz-UZ') + " so'm";
    document.getElementById('totalGrand').textContent = grand.toLocaleString('uz-UZ') + " so'm";

    updateReceipt(square, gradus, grand);
}

// ====== 8. KVITANSIYA (CHIZMALAR BILAN) ======
function updateReceipt(square, gradus, grand) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('receiptDate').textContent = dateStr;
    document.getElementById('receiptTime').textContent = timeStr;

    // ===== KVADRAT =====
    let squareHTML = '<h4>📐 1. Kvadrat hisoblash:</h4>';
    if (square.details.length === 0) {
        squareHTML += '<div class="receipt-item" style="color:#94a3b8;">Ma\'lumot kiritilmagan</div>';
    } else {
        square.details.forEach(item => {
            const icon = item.icon || '';
            const extra = item.isExtra ? ' 📌' : '';
            squareHTML += `
                <div class="receipt-item">
                    ${icon} ${item.label}${extra}: ${item.length} × ${item.height} = ${item.area.toFixed(2)} m² → ${item.price.toLocaleString('uz-UZ')} so'm
                </div>
            `;
        });
    }
    squareHTML += `<div class="receipt-total-small">JAMI: ${square.total.toLocaleString('uz-UZ')} so'm</div>`;
    document.getElementById('receiptSquare').innerHTML = squareHTML;

    // ===== 45 GRADUS / AVALNI (CHIZMA BILAN) =====
    let titleText = '';
    let diagramHTML = '';
    let hasAnyData = false;
    
    let gradusDetailsHTML = '';
    if (gradus.details.length === 0) {
        gradusDetailsHTML += '<div class="receipt-item" style="color:#94a3b8;">Ma\'lumot kiritilmagan</div>';
    } else {
        hasAnyData = true;
        gradus.details.forEach(item => {
            const typeDisplay = item.type === 'gradus' ? '🔶' : '🔷';
            gradusDetailsHTML += `
                <div class="receipt-item">
                    ${typeDisplay} ${item.typeName} ${item.index}: ${item.text} → ${item.price.toLocaleString('uz-UZ')} so'm
                </div>
            `;
        });
    }

    if (hasAnyData) {
        if (gradus.hasGradus && !gradus.hasAvalni) {
            // Faqat 45° Gradus
            titleText = '🔶 2. 45° gradus hisoblash:';
            diagramHTML = `
                <div class="receipt-diagram">
                    <div class="receipt-tile-box">
                        <div class="receipt-tile receipt-tile-1">
                            <span>1</span>
                            <div class="receipt-cut-line"></div>
                        </div>
                        <div class="receipt-tile receipt-tile-2">
                            <span>2</span>
                            <div class="receipt-cut-line"></div>
                        </div>
                    </div>
                    <div class="receipt-tile-explanation">
                        <p><span class="dot red"></span> 1-kafel 45° kesiladi</p>
                        <p><span class="dot blue"></span> 2-kafel 45° kesiladi</p>
                        <p><span class="dot green"></span> 1 metr = 2 ta kafel</p>
                    </div>
                </div>
            `;
        } else if (gradus.hasAvalni && !gradus.hasGradus) {
            // Faqat Avalni - 45° aylana (yoy) chizma
            titleText = '🔷 2. Avalni (yon) hisoblash:';
            diagramHTML = `
                <div class="receipt-diagram">
                    <div class="receipt-tile-box">
                        <div class="receipt-tile-avalni">
                            <span>1</span>
                            <svg viewBox="0 0 80 80">
                                <rect x="5" y="5" width="70" height="70" rx="4" fill="url(#avalniGrad2)" stroke="#3b82f6" stroke-width="2.5"/>
                                <path d="M 40 5 Q 75 5 75 40" class="arc-45"/>
                                <path d="M 75 40 Q 75 75 40 75" class="arc-45"/>
                                <line x1="40" y1="5" x2="40" y2="15" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
                                <line x1="75" y1="40" x2="65" y2="40" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
                                <defs>
                                    <linearGradient id="avalniGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#dbeafe;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#93c5fd;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    <div class="receipt-tile-explanation">
                        <p><span class="dot blue"></span> 1-kafel yon tomoni 45° aylana (yoy) yaxlitlanadi</p>
                        <p><span class="dot green"></span> 1 metr = 1 ta kafel</p>
                    </div>
                </div>
            `;
        } else if (gradus.hasGradus && gradus.hasAvalni) {
            // Ikkala tur ham mavjud
            titleText = '🔶🔷 2. 45° gradus va Avalni hisoblash:';
            diagramHTML = `
                <div class="receipt-diagram">
                    <div style="width:100%;text-align:center;font-size:13px;font-weight:600;color:#1e293b;padding-bottom:4px;border-bottom:1px dashed #e2e8f0;margin-bottom:6px;">
                        🔶 45° Gradus
                    </div>
                    <div class="receipt-tile-box">
                        <div class="receipt-tile receipt-tile-1">
                            <span>1</span>
                            <div class="receipt-cut-line"></div>
                        </div>
                        <div class="receipt-tile receipt-tile-2">
                            <span>2</span>
                            <div class="receipt-cut-line"></div>
                        </div>
                    </div>
                    <div class="receipt-tile-explanation" style="margin-bottom:6px;">
                        <p><span class="dot red"></span> 1-kafel 45° kesiladi</p>
                        <p><span class="dot blue"></span> 2-kafel 45° kesiladi</p>
                        <p><span class="dot green"></span> 1 metr = 2 ta kafel</p>
                    </div>
                    <div style="width:100%;text-align:center;font-size:13px;font-weight:600;color:#1e293b;padding:4px 0;border-top:1px dashed #e2e8f0;border-bottom:1px dashed #e2e8f0;margin:4px 0;">
                        🔷 Avalni (yon)
                    </div>
                    <div class="receipt-tile-box">
                        <div class="receipt-tile-avalni">
                            <span>1</span>
                            <svg viewBox="0 0 80 80">
                                <rect x="5" y="5" width="70" height="70" rx="4" fill="url(#avalniGrad3)" stroke="#3b82f6" stroke-width="2.5"/>
                                <path d="M 40 5 Q 75 5 75 40" class="arc-45"/>
                                <path d="M 75 40 Q 75 75 40 75" class="arc-45"/>
                                <line x1="40" y1="5" x2="40" y2="15" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
                                <line x1="75" y1="40" x2="65" y2="40" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
                                <defs>
                                    <linearGradient id="avalniGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#dbeafe;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#93c5fd;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    <div class="receipt-tile-explanation">
                        <p><span class="dot blue"></span> 1-kafel yon tomoni 45° aylana (yoy) yaxlitlanadi</p>
                        <p><span class="dot green"></span> 1 metr = 1 ta kafel</p>
                    </div>
                </div>
            `;
        }
    } else {
        // Hech narsa yo'q - default 45°
        titleText = '🔶 2. 45° gradus hisoblash:';
        diagramHTML = `
            <div class="receipt-diagram">
                <div class="receipt-tile-box">
                    <div class="receipt-tile receipt-tile-1">
                        <span>1</span>
                        <div class="receipt-cut-line"></div>
                    </div>
                    <div class="receipt-tile receipt-tile-2">
                        <span>2</span>
                        <div class="receipt-cut-line"></div>
                    </div>
                </div>
                <div class="receipt-tile-explanation">
                    <p><span class="dot red"></span> 1-kafel 45° kesiladi</p>
                    <p><span class="dot blue"></span> 2-kafel 45° kesiladi</p>
                    <p><span class="dot green"></span> 1 metr = 2 ta kafel</p>
                </div>
            </div>
        `;
    }
    
    document.getElementById('receiptGradusTitle').textContent = titleText;

    const receiptGradus = document.getElementById('receiptGradus');
    receiptGradus.innerHTML = `
        <h4 id="receiptGradusTitle">${titleText}</h4>
        ${diagramHTML}
        <div id="gradusReceiptDetails">${gradusDetailsHTML}</div>
        <div class="receipt-total-small" id="gradusReceiptTotal">JAMI: ${gradus.total.toLocaleString('uz-UZ')} so'm</div>
    `;

    document.getElementById('receiptGrandTotal').textContent = grand.toLocaleString('uz-UZ') + " so'm";
    document.getElementById('receipt').style.display = 'block';
}

// ====== 9. PNG YUKLAB OLISH ======
function downloadPNG() {
    calculateAll();

    const receiptEl = document.getElementById('receipt');

    if (receiptEl.style.display === 'none') {
        alert('Iltimos, avval hisob-kitobni bajaring!');
        return;
    }

    html2canvas(receiptEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        borderRadius: '16px',
        padding: 16
    }).then((canvas) => {
        const link = document.createElement('a');
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        link.download = `kvitansiya_${dateStr}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (isTelegram && tg) {
            try {
                const data = {
                    type: 'receipt',
                    image: canvas.toDataURL('image/png', 0.8),
                    date: dateStr,
                    total: document.getElementById('receiptGrandTotal').textContent
                };
                tg.sendData(JSON.stringify(data));
                console.log('✅ Telegramga yuborildi!');
            } catch (e) {
                console.error('❌ Xatolik:', e);
            }
        }

    }).catch(function(err) {
        alert('PNG yaratishda xatolik:\n' + err.message);
    });
}

// ====== 10. TELEGRAMGA YUBORISH ======
function sendToTelegram() {
    if (!isTelegram || !tg) {
        alert('⚠️ Telegram Web App ulanishi topilmadi!\n\nIltimos, bot orqali oching yoki "PNG yuklab olish" tugmasidan foydalaning.');
        return;
    }

    calculateAll();

    const receiptEl = document.getElementById('receipt');

    if (receiptEl.style.display === 'none') {
        alert('Iltimos, avval hisob-kitobni bajaring!');
        return;
    }

    const btn = document.querySelector('.btn-telegram');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Yuborilmoqda...';
    btn.disabled = true;

    html2canvas(receiptEl, {
        scale: 1.8,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        borderRadius: '16px',
        padding: 16
    }).then((canvas) => {
        try {
            const now = new Date();
            const data = {
                type: 'receipt',
                image: canvas.toDataURL('image/png', 0.7),
                date: now.toISOString().slice(0, 10),
                total: document.getElementById('receiptGrandTotal').textContent
            };

            tg.sendData(JSON.stringify(data));
            tg.showAlert('✅ Kvitansiya muvaffaqiyatli yuborildi!');

        } catch (e) {
            tg.showAlert('❌ Xatolik: ' + e.message);
        }

        btn.textContent = originalText;
        btn.disabled = false;

    }).catch(function(err) {
        alert('PNG yaratishda xatolik:\n' + err.message);
        btn.textContent = originalText;
        btn.disabled = false;
    });
}

// ====== 11. BOSHLASH ======
document.addEventListener('DOMContentLoaded', function() {
    addListeners();

    document.getElementById('squarePrice').addEventListener('input', calculateAll);
    document.getElementById('squarePrice').addEventListener('change', calculateAll);
    document.getElementById('gradusPrice').addEventListener('input', calculateAll);
    document.getElementById('gradusPrice').addEventListener('change', calculateAll);

    updateGradusVisual();
    calculateAll();

    console.log('✅ Hisoblash bo\'limi ishga tushdi!');
    console.log('📐 45° Gradus: 1 metr = 2 ta kafel');
    console.log('📐 Avalni: 1 metr = 1 ta kafel');
    console.log('📐 Kvitansiyada 45° va Avalni chizmalari mavjud!');
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active && active.tagName === 'INPUT') {
            calculateAll();
        }
    }
});

// ====== 12. GLOBAL FUNKSIYALAR ======
window.addExtraWall = addExtraWall;
window.removeExtraWall = removeExtraWall;
window.addGradusRow = addGradusRow;
window.removeGradusRow = removeGradusRow;
window.calculateAll = calculateAll;
window.downloadPNG = downloadPNG;
window.sendToTelegram = sendToTelegram;
window.updateGradusVisual = updateGradusVisual;
