import random
import logging
from aiogram import Bot

logger = logging.getLogger(__name__)

class OTPService:
    def __init__(self, bot: Bot) -> None:
        self.bot = bot

    async def send_otp(self, user_id: int) -> str:
        try:
            otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            await self.bot.send_message(user_id, otp)
            logger.info(f"OTP send to user {user_id} : {otp}")
            return otp
        except Exception as e:
            logger.error(f"Error sending OTP to user {user_id}: {e}")
            return None
