/**
 * ============================================
 * KALKULYATOR BO'LIMI - Kafel miqdorini hisoblash
 * Devor/Yer va 45° Gradus/Avalni bir funksiya ichida
 * ============================================
 */

// ====== 1. KAFEL O'LCHAMLARI ======
const TILE_SIZES = {
    '30x30': { width: 0.30, height: 0.30, name: '30×30 sm' },
    '30x60': { width: 0.30, height: 0.60, name: '30×60 sm' },
    '60x60': { width: 0.60, height: 0.60, name: '60×60 sm' },
    '60x120': { width: 0.60, height: 1.20, name: '60×120 sm' }
};

// ====== 2. KLEY SARFI (1 m² UCHUN KG) ======
const GLUE_CONSUMPTION = {
    '30x30': 3.5,
    '30x60': 4.0,
    '60x60': 5.0,
    '60x120': 6.0
};

// ====== 3. KONSTANTALAR ======
const GLUE_BAG_WEIGHT = 25;
const MIN_WASTE = 5;

// ====== 4. QO'SHISH FUNKSIYALARI ======

// --- 4.1. AREA (DEVOY / YER) QO'SHISH ---
function addAreaRow() {
    const container = document.getElementById('areaContainer');
    const div = document.createElement('div');
    div.className = 'input-with-btn area-row';
    div.innerHTML = `
        <div class="input-group-sm" style="flex:1.5;">
            <select class="area-type-select">
                <option value="devor">🧱 Devor</option>
                <option value="yer">🟫 Yer (pol)</option>
            </select>
        </div>
        <div class="input-group-sm" style="flex:1;">
            <label>Uzunlik (m)</label>
            <input type="number" class="area-length-input" value="1" step="0.1" min="0.1" />
        </div>
        <div class="input-group-sm" style="flex:1;">
            <label class="area-height-label">Balandlik (m)</label>
            <input type="number" class="area-height-input" value="2.5" step="0.1" min="0.1" />
        </div>
        <button class="btn-remove-row" onclick="removeAreaRow(this)">✖</button>
    `;
    container.appendChild(div);
    
    // Labelni yangilash
    updateAreaLabels(div);
    
    // Listenerlar
    div.querySelectorAll('input, select').forEach(i => {
        i.addEventListener('input', calculateTiles);
        i.addEventListener('change', function() {
            updateAreaLabels(this.closest('.area-row'));
            calculateTiles();
        });
    });
    
    calculateTiles();
}

function removeAreaRow(btn) {
    const container = document.getElementById('areaContainer');
    if (container.children.length > 1) {
        btn.closest('.area-row').remove();
        calculateTiles();
    } else {
        alert('Kamida 1 ta maydon qolishi kerak!');
    }
}

function updateAreaLabels(row) {
    const select = row.querySelector('.area-type-select');
    const label = row.querySelector('.area-height-label');
    if (select && label) {
        label.textContent = select.value === 'devor' ? 'Balandlik (m)' : 'Kenglik (m)';
    }
}

// --- 4.2. GRADUS (45° / AVALNI) QO'SHISH ---
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
        i.addEventListener('change', calculateAll);
    });
    
    calculateAll();
}

function removeGradusRow(btn) {
    const container = document.getElementById('gradusContainer');
    if (container.children.length > 1) {
        btn.closest('.gradus-row').remove();
        calculateAll();
    } else {
        alert('Kamida 1 ta qator qolishi kerak!');
    }
}

// --- 4.3. CALC GRADUS (45° / AVALNI) QO'SHISH ---
function addCalcGradusRow() {
    const container = document.getElementById('calcGradusContainer');
    const div = document.createElement('div');
    div.className = 'input-with-btn gradus-row';
    div.innerHTML = `
        <div class="input-group-sm" style="flex:1.5;">
            <select class="calc-gradus-type-select">
                <option value="gradus">🔶 45° Gradus</option>
                <option value="avalni">🔷 Avalni (yon)</option>
            </select>
        </div>
        <div class="input-group-sm" style="flex:1;">
            <label>Metr (m)</label>
            <input type="number" class="calc-gradus-meter-input" value="1" step="0.1" min="0" />
        </div>
        <button class="btn-remove-row" onclick="removeCalcGradusRow(this)">✖</button>
    `;
    container.appendChild(div);
    
    div.querySelectorAll('input, select').forEach(i => {
        i.addEventListener('input', calculateTiles);
        i.addEventListener('change', calculateTiles);
    });
    
    calculateTiles();
}

function removeCalcGradusRow(btn) {
    const container = document.getElementById('calcGradusContainer');
    if (container.children.length > 1) {
        btn.closest('.gradus-row').remove();
        calculateTiles();
    } else {
        alert('Kamida 1 ta qator qolishi kerak!');
    }
}

// ====== 5. KAFEL HISOBLASH ======
function calculateTiles() {
    // Ma'lumotlarni olish
    const size = document.getElementById('tileSize').value;
    const sub = parseFloat(document.getElementById('subtractArea').value) || 0;
    let waste = parseFloat(document.getElementById('wastePercent').value) || 0;
    const gluePrice = parseFloat(document.getElementById('gluePrice').value) || 0;
    
    const tile = TILE_SIZES[size];
    if (!tile) {
        alert("Kafel o'lchami topilmadi!");
        return;
    }
    
    // ===== 1. DEVOR / YER MAYDONLARI =====
    const areaRows = document.querySelectorAll('#areaContainer .area-row');
    let totalArea = 0;
    let areaDetails = [];
    
    areaRows.forEach((row, idx) => {
        const select = row.querySelector('.area-type-select');
        const type = select ? select.value : 'devor';
        const typeName = type === 'devor' ? '🧱 Devor' : '🟫 Yer';
        
        const length = parseFloat(row.querySelector('.area-length-input').value) || 0;
        const height = parseFloat(row.querySelector('.area-height-input').value) || 0;
        const area = length * height;
        
        if (area > 0) {
            totalArea += area;
            areaDetails.push({
                index: idx + 1,
                type: typeName,
                length: length,
                height: height,
                area: area
            });
        }
    });
    
    const netArea = Math.max(0, totalArea - sub);
    const tileArea = tile.width * tile.height;
    const needed = Math.ceil(netArea / tileArea);
    
    // ===== 2. 45 GRADUS / AVALNI =====
    const gradusRows = document.querySelectorAll('#calcGradusContainer .gradus-row');
    let totalGradusTiles = 0;
    let gradusDetails = [];
    
    gradusRows.forEach((row, idx) => {
        const select = row.querySelector('.calc-gradus-type-select');
        const type = select ? select.value : 'gradus';
        const typeName = type === 'gradus' ? '🔶 45° Gradus' : '🔷 Avalni (yon)';
        const multiplier = type === 'gradus' ? 2 : 1;
        
        const meter = parseFloat(row.querySelector('.calc-gradus-meter-input').value) || 0;
        const tiles = meter * multiplier;
        
        if (meter > 0) {
            totalGradusTiles += tiles;
            gradusDetails.push({
                index: idx + 1,
                type: typeName,
                meter: meter,
                tiles: tiles,
                multiplier: multiplier
            });
        }
    });
    
    // ===== JAMI KAFEL =====
    let totalTilesBeforeWaste = needed + totalGradusTiles;
    
    // ===== ZAXIRA =====
    waste = Math.max(waste, MIN_WASTE);
    const extraPercent = Math.ceil(totalTilesBeforeWaste * (waste / 100));
    const totalTiles = totalTilesBeforeWaste + extraPercent;
    
    // ===== KLEY =====
    const gluePerM2 = GLUE_CONSUMPTION[size] || 4.0;
    const totalGlue = netArea * gluePerM2;
    const glueBags = Math.ceil(totalGlue / GLUE_BAG_WEIGHT);
    const glueTotal = glueBags * gluePrice;
    
    // ===== NATIJALAR =====
    document.getElementById('tileArea').textContent = netArea.toFixed(2) + ' m²';
    document.getElementById('tileSingleArea').textContent = tileArea.toFixed(4) + ' m²';
    document.getElementById('tileCount').textContent = needed.toLocaleString() + ' ta';
    document.getElementById('tileExtra').textContent = extraPercent.toLocaleString() + ' ta (' + waste + '%)';
    document.getElementById('tileTotal').textContent = totalTiles.toLocaleString() + ' ta';
    document.getElementById('glueAmount').textContent = totalGlue.toFixed(1) + ' kg';
    document.getElementById('glueBags').textContent = glueBags + ' xalta';
    document.getElementById('glueTotalPrice').textContent = glueTotal.toLocaleString('uz-UZ') + " so'm";
    
    // ===== TAFSILOTLAR =====
    let h = `
        <div class="detail-item">
            <span class="detail-label">📏 Kafel o'lchami:</span>
            <span class="detail-value">${tile.name}</span>
        </div>
        <div class="detail-item" style="border-top:2px solid #3b82f6;padding-top:6px;margin-top:4px;">
            <span class="detail-label">📐 1. Yuzaki maydonlari:</span>
            <span class="detail-value">${totalArea.toFixed(2)} m²</span>
        </div>
    `;
    
    areaDetails.forEach(a => {
        h += `
            <div class="detail-item">
                <span class="detail-label">  ${a.type} ${a.index}:</span>
                <span class="detail-value">${a.length} × ${a.height} = ${a.area.toFixed(2)} m²</span>
            </div>
        `;
    });
    
    h += `
        <div class="detail-item">
            <span class="detail-label">🚪 Eshik/deraza maydoni:</span>
            <span class="detail-value">${sub.toFixed(2)} m²</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📐 Sof maydon:</span>
            <span class="detail-value">${netArea.toFixed(2)} m²</span>
        </div>
        <div class="detail-item" style="border-top:2px solid #3b82f6;padding-top:6px;margin-top:4px;">
            <span class="detail-label">📏 1 ta kafel maydoni:</span>
            <span class="detail-value">${tileArea.toFixed(4)} m²</span>
        </div>
        <div class="detail-item" style="font-weight:700;color:#2563eb;">
            <span class="detail-label">🔢 KERAKLI KAFEL:</span>
            <span class="detail-value">${needed.toLocaleString()} ta</span>
        </div>
        <div class="detail-item" style="border-top:2px solid #3b82f6;padding-top:6px;margin-top:4px;">
            <span class="detail-label">📐 2. 45° / Avalni metrlari:</span>
            <span class="detail-value">${totalGradusTiles.toFixed(1)} ta</span>
        </div>
    `;
    
    gradusDetails.forEach(g => {
        h += `
            <div class="detail-item">
                <span class="detail-label">  ${g.type} ${g.index}:</span>
                <span class="detail-value">${g.meter} m × ${g.multiplier} = ${g.tiles.toFixed(1)} ta</span>
            </div>
        `;
    });
    
    h += `
        <div class="detail-item" style="font-weight:600;color:#eab308;">
            <span class="detail-label">📦 ZAXIRA (${waste}%):</span>
            <span class="detail-value">${extraPercent.toLocaleString()} ta</span>
        </div>
        <div class="detail-item" style="font-weight:700;border-top:2px solid #22c55e;padding-top:6px;margin-top:4px;background:#f0fdf4;">
            <span class="detail-label">💎 JAMI KAFEL:</span>
            <span class="detail-value">${totalTiles.toLocaleString()} ta</span>
        </div>
        <div class="detail-item" style="border-top:2px solid #3b82f6;padding-top:6px;margin-top:4px;">
            <span class="detail-label">🧴 Kley sarfi (1 m²):</span>
            <span class="detail-value">${gluePerM2} kg</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">🧴 1 xalta kley:</span>
            <span class="detail-value">${GLUE_BAG_WEIGHT} kg</span>
        </div>
        <div class="detail-item" style="font-weight:700;border-top:2px solid #3b82f6;padding-top:6px;margin-top:4px;background:#eff6ff;">
            <span class="detail-label">🧴 JAMI KLEY:</span>
            <span class="detail-value">${glueBags} xalta (${totalGlue.toFixed(1)} kg) = ${glueTotal.toLocaleString('uz-UZ')} so'm</span>
        </div>
    `;
    
    document.getElementById('tileDetails').innerHTML = h;
}

// ====== 6. PNG HISOBOT YUKLASH ======
function downloadCalcPNG() {
    calculateTiles();
    
    const reportDiv = document.createElement('div');
    reportDiv.style.cssText = 'padding:20px;background:#ffffff;border-radius:16px;max-width:600px;font-family:Segoe UI,system-ui,sans-serif;';
    
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
    
    reportDiv.innerHTML = `
        <div style="text-align:center;padding-bottom:16px;border-bottom:2px solid #e2e8f0;margin-bottom:16px;">
            <h1 style="font-size:24px;color:#0f172a;margin:0;">🧱 KAFEL HISOBI</h1>
            <p style="color:#64748b;font-size:13px;margin:4px 0 0;">🏠 Uy egasi uchun hisob-kitob</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:4px;">📅 ${dateStr} | 🕒 ${timeStr}</p>
        </div>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;border:2px dashed #dce3ec;">
            ${document.getElementById('tileDetails').innerHTML}
        </div>
        <div style="margin-top:16px;padding-top:12px;border-top:2px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;">
            🕒 Hisobot vaqti: ${timeStr}
        </div>
    `;
    
    document.body.appendChild(reportDiv);
    
    html2canvas(reportDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        borderRadius: '16px',
        padding: 16
    }).then((canvas) => {
        const link = document.createElement('a');
        const now2 = new Date();
        link.download = `kafel_hisoboti_${now2.toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.body.removeChild(reportDiv);
    }).catch(function(err) {
        alert('PNG yaratishda xatolik:\n' + err.message);
        document.body.removeChild(reportDiv);
    });
}

// ====== 7. AVTOMATIK HISOBLASH ======
function setupCalcListeners() {
    document.querySelectorAll('#tab-kalkulyator input, #tab-kalkulyator select').forEach(i => {
        i.addEventListener('input', calculateTiles);
        i.addEventListener('change', calculateTiles);
    });
    
    // Area row labelni yangilash
    document.querySelectorAll('#areaContainer .area-row').forEach(row => {
        updateAreaLabels(row);
    });
}

// ====== 8. BOSHLASH ======
document.addEventListener('DOMContentLoaded', function() {
    setupCalcListeners();
    calculateTiles();
    console.log('✅ Kalkulyator bo\'limi ishga tushdi!');
});

// ====== 9. GLOBAL FUNKSIYALAR ======
window.addAreaRow = addAreaRow;
window.removeAreaRow = removeAreaRow;
window.addGradusRow = addGradusRow;
window.removeGradusRow = removeGradusRow;
window.addCalcGradusRow = addCalcGradusRow;
window.removeCalcGradusRow = removeCalcGradusRow;
window.calculateTiles = calculateTiles;
window.downloadCalcPNG = downloadCalcPNG;
window.updateAreaLabels = updateAreaLabels;
