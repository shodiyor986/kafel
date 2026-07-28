/**
 * ============================================
 * KAFEL HISOB-KITOB ILOVASI
 * Telegram Web App uchun moslashtirilgan
 * ============================================
 */

// Telegram Web App
let tg = null;
try {
    tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        console.log('✅ Telegram Web App ulandi!');
    }
} catch (e) {
    console.log('⚠️ Telegram Web App mavjud emas');
}

// ====== 1. STEKIR (KVADRAT) HISOBLASH ======
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
    
    const extraWalls = document.querySelectorAll('.extra-wall');
    extraWalls.forEach((wall) => {
        const select = wall.querySelector('.extra-wall-selector');
        const selectedText = select ? select.options[select.selectedIndex]?.text || 'Qo\'shimcha' : 'Qo\'shimcha';
        
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
    document.getElementById('squarePriceResult').textContent = totalPrice.toLocaleString('uz-UZ') + ' so\'m';
    
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
    
    const inputs = div.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
        input.addEventListener('change', calculateAll);
    });
    
    calculateAll();
}

function removeExtraWall(btn) {
    btn.closest('.extra-wall').remove();
    calculateAll();
}

// ====== 3. 45 GRADUS ======
function addGradusRow() {
    const container = document.getElementById('gradusContainer');
    const div = document.createElement('div');
    div.className = 'input-with-btn';
    div.innerHTML = `
        <input type="number" class="gradus-meter-input" value="1" step="0.1" min="0" />
        <button class="btn-remove-row" onclick="removeGradusRow(this)">✖</button>
    `;
    container.appendChild(div);
    
    const inputs = div.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
        input.addEventListener('change', calculateAll);
    });
    
    calculateAll();
}

function removeGradusRow(btn) {
    const container = document.getElementById('gradusContainer');
    if (container.children.length > 1) {
        btn.closest('.input-with-btn').remove();
        calculateAll();
    } else {
        alert('Kamida 1 ta qator qolishi kerak!');
    }
}

function calculateGradus() {
    const price = parseFloat(document.getElementById('gradusPrice').value) || 0;
    const inputs = document.querySelectorAll('.gradus-meter-input');
    
    let totalMeter = 0;
    let details = [];
    
    inputs.forEach((input, index) => {
        const meter = parseFloat(input.value) || 0;
        totalMeter += meter;
        if (meter > 0) {
            details.push({
                label: `Qator ${index + 1}`,
                meter: meter,
                tiles: meter * 2,
                price: meter * price * 2,
                text: `${meter.toFixed(1)} m × 2 = ${(meter * 2).toFixed(1)} ta kafel`
            });
        }
    });
    
    const totalTiles = totalMeter * 2;
    const totalPrice = totalMeter * price * 2;
    
    document.getElementById('gradusTiles').textContent = totalTiles.toFixed(1) + ' ta';
    document.getElementById('gradusPriceResult').textContent = totalPrice.toLocaleString('uz-UZ') + ' so\'m';
    
    return {
        meter: totalMeter,
        tiles: totalTiles,
        total: totalPrice,
        details: details
    };
}

// ====== 4. LISTENERLAR ======
function addListeners() {
    const inputs = document.querySelectorAll('.wall-input, .extra-length, .extra-height, .gradus-meter-input, .extra-wall-selector');
    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
        input.addEventListener('change', calculateAll);
    });
}

// ====== 5. ASOSIY HISOB ======
function calculateAll() {
    const square = calculateSquare();
    const gradus = calculateGradus();
    const grand = square.total + gradus.total;
    
    document.getElementById('totalSquare').textContent = square.total.toLocaleString('uz-UZ') + ' so\'m';
    document.getElementById('totalGradus').textContent = gradus.total.toLocaleString('uz-UZ') + ' so\'m';
    document.getElementById('totalGrand').textContent = grand.toLocaleString('uz-UZ') + ' so\'m';
    
    updateReceipt(square, gradus, grand);
}

// ====== 6. KVITANSIYA ======
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
    
    let gradusDetailsHTML = '';
    if (gradus.details.length === 0) {
        gradusDetailsHTML += '<div class="receipt-item" style="color:#94a3b8;">Ma\'lumot kiritilmagan</div>';
    } else {
        gradus.details.forEach(item => {
            gradusDetailsHTML += `
                <div class="receipt-item">
                    ${item.label}: ${item.text} → ${item.price.toLocaleString('uz-UZ')} so'm
                </div>
            `;
        });
    }
    
    document.getElementById('gradusReceiptDetails').innerHTML = gradusDetailsHTML;
    document.getElementById('gradusReceiptTotal').textContent = 
        'JAMI: ' + gradus.total.toLocaleString('uz-UZ') + ' so\'m';
    
    document.getElementById('receiptGrandTotal').textContent = grand.toLocaleString('uz-UZ') + ' so\'m';
    document.getElementById('receipt').style.display = 'block';
}

// ====== 7. PNG YUKLAB OLISH (TELEGRAM UCHUN MOS) ======
function downloadPNG() {
    calculateAll();
    
    const receiptEl = document.getElementById('receipt');
    
    html2canvas(receiptEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        borderRadius: '16px',
        padding: 16
    }).then((canvas) => {
        // PNG ni yuklab olish
        const link = document.createElement('a');
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        link.download = `kvitansiya_${dateStr}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Telegram ga yuborish
        if (tg) {
            const dataUrl = canvas.toDataURL('image/png');
            tg.sendData(JSON.stringify({
                type: 'receipt',
                image: dataUrl,
                date: dateStr,
                total: document.getElementById('receiptGrandTotal').textContent
            }));
        }
        
    }).catch(function(err) {
        alert('PNG yaratishda xatolik:\n' + err.message);
    });
}

// ====== 8. TELEGRAMGA YUBORISH ======
function sendToTelegram() {
    if (!tg) {
        alert('Telegram Web App ulanishi topilmadi!\nIltimos, bot orqali oching.');
        return;
    }
    
    calculateAll();
    
    const receiptEl = document.getElementById('receipt');
    
    html2canvas(receiptEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true,
        logging: false,
        borderRadius: '16px',
        padding: 16
    }).then((canvas) => {
        const dataUrl = canvas.toDataURL('image/png');
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        
        tg.sendData(JSON.stringify({
            type: 'receipt',
            image: dataUrl,
            date: dateStr,
            total: document.getElementById('receiptGrandTotal').textContent
        }));
        
        tg.showAlert('✅ Kvitansiya Telegramga yuborildi!');
        
    }).catch(function(err) {
        alert('Yuborishda xatolik:\n' + err.message);
    });
}

// ====== 9. BOSHLASH ======
document.addEventListener('DOMContentLoaded', function() {
    addListeners();
    
    document.getElementById('squarePrice').addEventListener('input', calculateAll);
    document.getElementById('squarePrice').addEventListener('change', calculateAll);
    document.getElementById('gradusPrice').addEventListener('input', calculateAll);
    document.getElementById('gradusPrice').addEventListener('change', calculateAll);
    
    calculateAll();
    
    // Telegram theme
    if (tg) {
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
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active && active.tagName === 'INPUT') {
            calculateAll();
        }
    }
});

console.log('✅ Kafel hisob-kitobi ilovasi ishga tushdi!');
console.log('📱 Telegram Web App uchun moslashtirilgan!');
