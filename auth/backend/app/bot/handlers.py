from aiogram import Dispatcher, types
from aiogram.filters import Command
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
)


def register_handlers(dp: Dispatcher):
    @dp.message(Command("start"))
    async def cmd_start(message: types.Message):
        await message.answer("Hello! I'm your registration bot.")

    @dp.message(Command("open"))
    async def cmd_open(message: types.Message):
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                InlineKeyboardButton(
                    text="Open Mini App",
                    web_app=WebAppInfo(url="http://localhost/auth"),
                )
            ]
        )
        await message.answer("Press button Open", reply_markup=keyboard)
