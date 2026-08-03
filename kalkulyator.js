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
let calcType = 'devor';
let calcGradusType = 'gradus';

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
    
    // ===== 45 GRADUS YOKI AVALNI =====
    let gradusTypeName = '';
    let gradusTypeIcon = '';
    let gradusExtraTiles = 0;
    
    if (calcGradusType === 'gradus') {
        // 45 gradus: qo'shimcha 1x (jami 2x)
        gradusExtraTiles = needed;
        gradusTypeName = '45° Gradus';
        gradusTypeIcon = '🔶';
    } else {
        // Avalni: qo'shimcha 0 (jami 1x)
        gradusExtraTiles = 0;
        gradusTypeName = 'Avalni (yon)';
        gradusTypeIcon = '🔷';
    }
    
    // ===== JAMI KAFEL (45° qo'shimchasi bilan) =====
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
        <div class="detail-item" style="border-top:2px solid #3b82f6;padding-top:6
