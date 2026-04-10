from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove
from aiogram.utils.keyboard import ReplyKeyboardBuilder

SEARCH_BTN = "🔎 Найти клиентов"
BALANCE_BTN = "📊 Мой баланс"
CONFIRM_BTN = "✅ Запустить поиск"
CANCEL_BTN = "❌ Отменить"


def main_menu() -> ReplyKeyboardMarkup:
    builder = ReplyKeyboardBuilder()
    builder.add(KeyboardButton(text=SEARCH_BTN))
    builder.add(KeyboardButton(text=BALANCE_BTN))
    builder.adjust(1)
    return builder.as_markup(resize_keyboard=True)


def confirm_menu() -> ReplyKeyboardMarkup:
    builder = ReplyKeyboardBuilder()
    builder.add(KeyboardButton(text=CONFIRM_BTN))
    builder.add(KeyboardButton(text=CANCEL_BTN))
    builder.adjust(2)
    return builder.as_markup(resize_keyboard=True)


def remove_menu() -> ReplyKeyboardRemove:
    return ReplyKeyboardRemove()
