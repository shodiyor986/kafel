/**
 * ============================================
 * ASOSIY - Tab switch va boshqaruv
 * ============================================
 */

// ====== 1. TAB SWITCH ======
function switchTab(tabName) {
    // Barcha tablarni yashirish
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Barcha tugmalarni o'chirish
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.classList.remove('active');
    });

    // Tanlangan tabni ko'rsatish
    const activeTab = document.getElementById('tab-' + tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Tanlangan tugmani faollashtirish
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Kalkulyator tabiga o'tilganda hisoblashni yangilash
    if (tabName === 'kalkulyator') {
        if (typeof calculateTiles === 'function') {
            setTimeout(calculateTiles, 100);
        }
    }

    // Hisoblash tabiga o'tilganda hisoblashni yangilash
    if (tabName === 'hisoblash') {
        if (typeof calculateAll === 'function') {
            setTimeout(calculateAll, 100);
        }
    }

    console.log('📑 Tab o\'zgartirildi:', tabName);
}

// ====== 2. BOSHLASH ======
document.addEventListener('DOMContentLoaded', function() {
    // Default tab - hisoblash
    switchTab('hisoblash');
    console.log('✅ Main.js ishga tushdi!');
    console.log('📱 Ilova versiyasi: 3.0');
    console.log('🏠 Uy egasi uchun kafel hisob-kitobi');
});

// ====== 3. GLOBAL FUNKSIYALARNI OCHIQ QILISH ======
window.switchTab = switchTab;