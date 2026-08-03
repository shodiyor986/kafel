/**
 * ============================================
 * KALKULYATOR BO'LIMI - Kafel miqdorini hisoblash
 * Devor va Yer (pol) uchun, 45° Gradus va Avalni bilan
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

// ====== 4. HISOBLASH TURLARI ======
let calcType = 'devor';      // 'devor' yoki 'yer'
let calcGradusType = 'gradus'; // 'gradus' yoki 'avalni'

// ====== 5. TANLASH FUNKSIYALARI ======
function setCalcType(type) {
    calcType = type;
    document.querySelectorAll('.calc-type .btn-option').forEach(b => b.classList.remove('active'));
    document.querySelector(`.calc-type .btn-option[data-type="${type}"]`)?.classList.add('active');
    
    const label = document.getElementById('heightLabel');
    if (label) {
        label.textContent = type === 'devor' ? 'Balandlik (m)' : 'Kenglik (m)';
    }
    
    calculateTiles();
}

function setCalcGradusType(type) {
    calcGradusType = type;
    document.querySelectorAll('.calc-gradus-type .btn-option').forEach(b => b.classList.remove('active'));
    document.querySelector(`.calc-gradus-type .btn-option[data-type="${type}"]`)?.classList.add('active');
    
    calculateTiles();
}

// ====== 6. QO'SHISH FUNKSIYASI ======
function addAreaRow() {
    const container = document.getElementById('areaContainer');
    const div = document.createElement('div');
    div.className = 'input-with-btn area-row';
    const hLabel = calcType === 'devor' ? 'Balandlik' : 'Kenglik';
    div.innerHTML = `
        <div class="input-group-sm">
            <label>Uzunlik (m)</label>
            <input type="number" class="area-length-input" value="1" step="0.1" min="0.1" />
        </div>
        <div class="input-group-sm">
            <label>${hLabel} (m)</label>
            <input type="number" class="area-height-input" value="2.5" step="0.1" min="0.1" />
        </div>
        <button class="btn-remove-row" onclick="removeAreaRow(this)">✖</button>
    `;
    container.appendChild(div);
    
    div.querySelectorAll('input').forEach(i => {
        i.addEventListener('input', calculateTiles);
        i.addEventListener('change', calculateTiles);
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

// ====== 7. KAFEL HISOBLASH ======
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
    
    // ===== BARCHA MAYDONLARNI HISOBLASH =====
    const lInputs = document.querySelectorAll('.area-length-input');
    const hInputs = document.querySelectorAll('.area-height-input');
    
    let totalArea = 0;
    let areas = [];
    
    lInputs.forEach((i, idx) => {
        const l = parseFloat(i.value) || 0;
        const h = parseFloat(hInputs[idx]?.value) || 0;
        const a = l * h;
        if (a > 0) {
            totalArea += a;
            areas.push({
                index: idx + 1,
                length: l,
                height: h,
                area: a
            });
        }
    });
    
    const netArea = Math.max(0, totalArea - sub);
    const tileArea = tile.width * tile.height;
    
    // ===== KERAKLI KAFEL =====
    let needed = Math.ceil(netArea / tileArea);
    
    // ===== 45 GRADUS YOKI AVALNI BO'YICHA QO'SHIMCHA =====
    // 45 gradus: 1 metr = 2 ta kafel -> maydondan qat'iy nazar 2x
    // Avalni: 1 metr = 1 ta kafel -> maydondan qat'iy nazar 1x
    // Kafel sonini hisoblashda maydon asosida hisoblanadi, lekin
    // qo'shimcha sifatida 45 gradus uchun yana 1x qo'shiladi
    let extraMultiplier = 1;
    let gradusTypeName = '';
    let gradusTypeIcon = '';
    
    if (calcGradusType === 'gradus') {
        // 45 gradus: qo'shimcha 1x (jami 2x)
        extraMultiplier = 2;
        gradusTypeName = '45° Gradus';
        gradusTypeIcon = '🔶';
    } else {
        // Avalni: qo'shimcha 0 (jami 1x)
        extraMultiplier = 1;
        gradusTypeName = 'Avalni (yon)';
        gradusTypeIcon = '🔷';
    }
    
    // Kafel sonini hisoblash (maydon asosida)
    let baseTiles = needed;
    
    // 45 gradus uchun qo'shimcha kafel (1x qo'shimcha)
    let gradusExtraTiles = 0;
    if (calcGradusType === 'gradus') {
        // 45 gradusda har bir metr uchun 2x kafel kerak
        // Maydondan kelib chiqib hisoblaymiz
        gradusExtraTiles = needed; // 1x qo'shimcha
    }
    
    // Jami kafel (asosiy + 45 gradus qo'shimchasi)
    let totalTilesBeforeWaste = needed + gradusExtraTiles;
    
    // ===== QO'SHIMCHA FOIZ (ZAXIRA) =====
    waste = Math.max(waste, MIN_WASTE);
    const extraPercent = Math.ceil(totalTilesBeforeWaste * (waste / 100));
    const totalTiles = totalTilesBeforeWaste + extraPercent;
    
    // ===== KLEY HISOBLASH =====
    const gluePerM2 = GLUE_CONSUMPTION[size] || 4.0;
    const totalGlue = netArea * gluePerM2;
    const glueBags = Math.ceil(totalGlue / GLUE_BAG_WEIGHT);
    const glueTotal = glueBags * gluePrice;
    
    // ===== NATIJALARNI CHIQARISH =====
    const typeName = calcType === 'devor' ? '🧱 Devor' : '🟫 Yer (pol)';
    
    document.getElementById('calcTypeDisplay').textContent = typeName;
    document.getElementById('calcGradusTypeDisplay').textContent = gradusTypeIcon + ' ' + gradusTypeName;
    document.getElementById('tileArea').textContent = netArea.toFixed(2) + ' m²';
    document.getElementById('tileSingleArea').textContent = tileArea.toFixed(4) + ' m²';
    document.getElementById('tileCount').textContent = needed.toLocaleString() + ' ta';
    document.getElementById('tileExtra').textContent = extraPercent.toLocaleString() + ' ta (' + waste + '%)';
    document.getElementById('tileTotal').textContent = totalTiles.toLocaleString() + ' ta';
    document.getElementById('glueAmount').textContent = totalGlue.toFixed(1) + ' kg';
    document.getElementById('glueBags').textContent = glueBags + ' xalta';
    document.getElementById('glueTotalPrice').textContent = glueTotal.toLocaleString('uz-UZ') + " so'm";
    
    // ===== TAFSILOTLAR =====
    const hLabel = calcType === 'devor' ? 'Balandlik' : 'Kenglik';
    let h = `
        <div class="detail-item">
            <span class="detail-label">📏 Yuzaki turi:</span>
            <span class="detail-value">${typeName}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📏 Hisoblash turi:</span>
            <span class="detail-value">${gradusTypeIcon} ${gradusTypeName}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📏 Kafel o'lchami:</span>
            <span class="detail-value">${tile.name}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📐 Joy maydoni:</span>
            <span class="detail-value">${totalArea.toFixed(2)} m²</span>
        </div>
    `;
    
    areas.forEach(a => {
        h += `
            <div class="detail-item">
                <span class="detail-label">  📐 Maydon ${a.index}:</span>
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
    `;
    
    if (calcGradusType === 'gradus') {
        h += `
            <div class="detail-item" style="font-weight:600;color:#ef4444;">
                <span class="detail-label">🔶 45° QO'SHIMCHA (2x):</span>
                <span class="detail-value">${gradusExtraTiles.toLocaleString()} ta</span>
            </div>
        `;
    }
    
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

// ====== 8. PNG HISOBOT YUKLASH ======
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
    const typeName = calcType === 'devor' ? '🧱 Devor' : '🟫 Yer (pol)';
    const gradusName = calcGradusType === 'gradus' ? '🔶 45° Gradus' : '🔷 Avalni (yon)';
    
    reportDiv.innerHTML = `
        <div style="text-align:center;padding-bottom:16px;border-bottom:2px solid #e2e8f0;margin-bottom:16px;">
            <h1 style="font-size:24px;color:#0f172a;margin:0;">🧱 KAFEL HISOBI</h1>
            <p style="color:#64748b;font-size:13px;margin:4px 0 0;">🏠 Uy egasi uchun hisob-kitob</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:4px;">📅 ${dateStr} | 🕒 ${timeStr}</p>
            <p style="color:#3b82f6;font-size:14px;font-weight:600;margin-top:4px;">${typeName} | ${gradusName}</p>
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
        const typeName2 = calcType === 'devor' ? 'devor' : 'yer';
        const gradusName2 = calcGradusType === 'gradus' ? '45gradus' : 'avalni';
        link.download = `kafel_hisoboti_${typeName2}_${gradusName2}_${now2.toISOString().slice(0,10)}.png`;
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

// ====== 9. AVTOMATIK HISOBLASH ======
function setupCalcListeners() {
    document.querySelectorAll('#tab-kalkulyator input, #tab-kalkulyator select').forEach(i => {
        i.addEventListener('input', calculateTiles);
        i.addEventListener('change', calculateTiles);
    });
}

// ====== 10. BOSHLASH ======
document.addEventListener('DOMContentLoaded', function() {
    setupCalcListeners();
    
    // Devor turi faollashtirilgan
    document.querySelector('.calc-type .btn-option[data-type="devor"]')?.classList.add('active');
    document.querySelector('.calc-gradus-type .btn-option[data-type="gradus"]')?.classList.add('active');
    
    const label = document.getElementById('heightLabel');
    if (label) {
        label.textContent = 'Balandlik (m)';
    }
    
    calculateTiles();
    console.log('✅ Kalkulyator bo\'limi ishga tushdi! (Devor, Yer, 45° va Avalni)');
    console.log('📦 Minimal qo\'shimcha: ' + MIN_WASTE + '%');
    console.log('🧴 1 xalta kley: ' + GLUE_BAG_WEIGHT + ' kg');
});

// ====== 11. GLOBAL FUNKSIYALAR ======
window.setCalcType = setCalcType;
window.setCalcGradusType = setCalcGradusType;
window.addAreaRow = addAreaRow;
window.removeAreaRow = removeAreaRow;
window.calculateTiles = calculateTiles;
window.downloadCalcPNG = downloadCalcPNG;
