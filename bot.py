import os
import json
import base64
import io
import logging
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
from PIL import Image

# ===== KONFIGURATSIYA =====
TOKEN = "8691876539:AAHgkvaGOLd8YWdG3keyoFP1YjA8a0PyFrE"  # O'z tokeningizni qo'ying
WEB_APP_URL = "https://shodiyor986.github.io/kafel/"   # GitHub Pages manzili

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ===== BOT KOMANDALARI =====
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Botni ishga tushirish"""
    user = update.effective_user
    
    # Web App tugmasi
    keyboard = [
        [InlineKeyboardButton(
            "🧱 Kafel Hisob-kitobi", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"👋 Assalomu alaykum, {user.first_name}!\n\n"
        f"🏠 Uy egasi uchun kafel hisob-kitobi ilovasiga xush kelibsiz.\n\n"
        f"📐 Quyidagi tugmani bosing va hisob-kitobni boshlang:\n\n"
        f"📌 *Eslatma:* Hisob-kitob tugagach, 'Telegramga yuborish' tugmasini bosing.",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Web App dan kelgan ma'lumotlarni qabul qilish"""
    try:
        data = update.effective_message.web_app_data
        
        if not data or not data.data:
            await update.message.reply_text("❌ Ma'lumot topilmadi!")
            return
        
        # JSON ma'lumotni o'qish
        json_data = json.loads(data.data)
        logger.info(f"📨 Ma'lumot olindi: {json_data.get('type')}")
        
        if json_data.get('type') == 'receipt':
            # Rasm ma'lumotlarini olish
            image_data = json_data.get('image', '')
            if not image_data:
                await update.message.reply_text("❌ Rasm ma'lumotlari topilmadi!")
                return
            
            # Base64 dan rasmni olish
            if image_data.startswith('data:image/png;base64,'):
                image_data = image_data.replace('data:image/png;base64,', '')
            
            try:
                # Rasmni dekod qilish
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
                
                # Rasmni saqlash
                date_str = json_data.get('date', datetime.now().strftime('%Y-%m-%d'))
                filename = f"kvitansiya_{date_str}.png"
                
                # Rasmni saqlash
                image.save(filename, 'PNG', quality=95)
                logger.info(f"✅ Rasm saqlandi: {filename}")
                
                # Foydalanuvchiga yuborish
                with open(filename, 'rb') as f:
                    await update.message.reply_photo(
                        photo=f,
                        caption=f"🧾 *Kvitansiya*\n\n"
                               f"📅 Sana: {json_data.get('date', 'N/A')}\n"
                               f"💰 Jami: {json_data.get('total', '0')}\n\n"
                               f"✅ Hisob-kitob muvaff
