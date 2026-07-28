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
TOKEN = "8691876539:AAHgkvaGOLd8YWdG3keyoFP1YjA8a0PyFrE"
WEB_APP_URL = "https://shodiyor986.github.io/kafel/"

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
                               f"✅ Hisob-kitob muvaffaqiyatli bajarildi!\n"
                               f"📱 Telegram orqali yuborildi.",
                        parse_mode='Markdown'
                    )
                
                # Faylni o'chirish
                os.remove(filename)
                logger.info(f"🗑️ Fayl o'chirildi: {filename}")
                
            except base64.binascii.Error as e:
                logger.error(f"❌ Base64 dekodlash xatosi: {e}")
                await update.message.reply_text("❌ Rasm ma'lumotlari noto'g'ri formatda!")
                
            except Exception as e:
                logger.error(f"❌ Rasmni qayta ishlashda xatolik: {e}")
                await update.message.reply_text(f"❌ Rasmni qayta ishlashda xatolik: {str(e)}")
        
        else:
            await update.message.reply_text(f"❌ Noma'lum ma'lumot turi: {json_data.get('type')}")
            
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON dekodlash xatosi: {e}")
        await update.message.reply_text("❌ Ma'lumot formati noto'g'ri!")
        
    except Exception as e:
        logger.error(f"❌ Kutilmagan xatolik: {e}")
        await update.message.reply_text(f"❌ Xatolik yuz berdi: {str(e)}")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Yordam komandasi"""
    await update.message.reply_text(
        "📖 *Yordam:*\n\n"
        "1. 'Kafel Hisob-kitobi' tugmasini bosing\n"
        "2. Devor o'lchamlarini kiriting\n"
        "3. 45° gradus uchun metrlarni kiriting\n"
        "4. 'Telegramga yuborish' tugmasini bosing\n"
        "5. Kvitansiya avtomatik yuboriladi\n\n"
        "📱 Telegram orqali to'liq ishlaydi!\n\n"
        "⚠️ *Eslatma:* Rasm o'lchami 5MB dan kichik bo'lishi kerak.",
        parse_mode='Markdown'
    )

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Bot haqida"""
    await update.message.reply_text(
        "🤖 *Kafel Hisob-kitobi Boti*\n\n"
        "📐 Uy egasi uchun kafel hisob-kitobi\n"
        "🔶 45° gradus hisoblash\n"
        "📊 Kvitansiya yaratish\n"
        "📤 Telegramga yuborish\n\n"
        "👨‍💻 Dasturchi: @shodiyor986\n"
        "📅 Versiya: 2.0\n"
        "🔗 GitHub: https://github.com/shodiyor986/kafel",
        parse_mode='Markdown'
    )

async def web_app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Web App ni ochish"""
    keyboard = [
        [InlineKeyboardButton(
            "🧱 Kafel Hisob-kitobini ochish", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "📱 *Kafel Hisob-kitobi Web App*\n\n"
        "Quyidagi tugmani bosing va hisob-kitobni boshlang:",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

# ===== BOTNI ISHGA TUSHIRISH =====
def main():
    # Botni yaratish
    app = Application.builder().token(TOKEN).build()
    
    # Komandalar
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("about", about_command))
    app.add_handler(CommandHandler("webapp", web_app_command))
    
    # Web App ma'lumotlarini qabul qilish
    app.add_handler(MessageHandler(
        filters.StatusUpdate.WEB_APP_DATA, 
        handle_web_app_data
    ))
    
    # Xatoliklarni log qilish
    logger.info("🤖 Bot ishga tushdi...")
    logger.info(f"🔗 Web App URL: {WEB_APP_URL}")
    logger.info(f"🤖 Bot token: {TOKEN[:10]}...")
    
    # Botni ishga tushirish
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
