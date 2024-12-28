import logging
from datetime import datetime
from typing import Optional
from asyncpg import Connection, exceptions
from database import Database 

class DatabaseLogger:
    def __init__(self, db: Database):
        self.db = db  
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)

        handler = logging.FileHandler('app.log') 
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    async def log_to_db(self, action_title: str, user_id: Optional[int] = None):
        try:
            async with self.db.pool.acquire() as conn:
                await self.db.add_action_log(conn, action_title, user_id)
                self.logger.info(f"Logged action: {action_title} for user_id: {user_id}")
        except exceptions.PostgresError as e:
            self.logger.error(f"Failed to log to database: {e}")


    def log_to_file(self, action_title: str, user_id: Optional[int] = None):
        self.logger.info(f"Action: {action_title}, User ID: {user_id}")

    async def log(self, action_title: str, user_id: Optional[int] = None, to_db: bool = True):
        if to_db:
            await self.log_to_db(action_title, user_id)
        self.log_to_file(action_title, user_id)
