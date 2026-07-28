import os
import json
import base64
from io import BytesIO
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
from PIL import Image
import logging

# ===== KONFIGURATSIYA =====
TOKEN = "8691876539:AAHgkvaGOLd8YWdG3keyoFP1YjA8a0PyFrE"  # O'z tokeningizni qo'ying
WEB_APP_URL = "https://github.com/shodiyor986/kafel/"  # GitHub Pages manzili

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

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
        f"📐 Quyidagi tugmani bosing va hisob-kitobni boshlang:",
        reply_markup=reply_markup
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Web App dan kelgan ma'lumotlarni qabul qilish"""
    data = update.effective_message.web_app_data
    
    if data and data.data:
        try:
            # JSON ma'lumotni o'qish
            json_data = json.loads(data.data)
            
            if json_data.get('type') == 'receipt':
                # Rasmni saqlash
                image_data = json_data.get('image', '').split(',')[1]
                image_bytes = base64.b64decode(image_data)
                
                # Rasmni faylga saqlash
                filename = f"kvitansiya_{json_data.get('date', 'now')}.png"
                with open(filename, 'wb') as f:
                    f.write(image_bytes)
                
                # Foydalanuvchiga yuborish
                with open(filename, 'rb') as f:
                    await update.message.reply_photo(
                        photo=f,
                        caption=f"🧾 Kvitansiya\n"
                               f"📅 Sana: {json_data.get('date', 'N/A')}\n"
                               f"💰 Jami: {json_data.get('total', '0')}\n\n"
                               f"✅ Hisob-kitob muvaffaqiyatli bajarildi!"
                    )
                
                # Faylni o'chirish
                os.remove(filename)
                
        except Exception as e:
            await update.message.reply_text(f"❌ Xatolik yuz berdi: {str(e)}")
    else:
        await update.message.reply_text("❌ Ma'lumot topilmadi!")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Yordam komandasi"""
    await update.message.reply_text(
        "📖 Yordam:\n\n"
        "1. 'Kafel Hisob-kitobi' tugmasini bosing\n"
        "2. Devor o'lchamlarini kiriting\n"
        "3. 45° gradus uchun metrlarni kiriting\n"
        "4. 'PNG yuklab olish' tugmasini bosing\n"
        "5. Kvitansiya avtomatik yuboriladi\n\n"
        "📱 Telegram orqali to'liq ishlaydi!"
    )

# ===== BOTNI ISHGA TUSHIRISH =====
def main():
    app = Application.builder().token(TOKEN).build()
    
    # Komandalar
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    
    # Web App ma'lumotlarini qabul qilish
    app.add_handler(MessageHandler(
        filters.StatusUpdate.WEB_APP_DATA, 
        handle_web_app_data
    ))
    
    print("🤖 Bot ishga tushdi...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
