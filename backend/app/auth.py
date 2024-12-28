import jwt
import json
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from typing import Optional
from asyncpg import exceptions

from database import Database

class AuthService:
    def __init__(self, config_path: str, db: Database):
        with open(config_path, "r") as config_file:
            self.config = json.load(config_file)['jwt']
        self.db = db
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def __verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def __hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def __create_jwt(self, user_id: int, username: str) -> str:
        expiration = datetime.now(timezone.utc) + timedelta(days=self.config["jwt_expiration_days"])
        token_data = {"sub": username, "id": user_id, "exp": expiration}
        return jwt.encode(token_data, self.config["jwt_secret_key"], algorithm=self.config["jwt_algorithm"])

    def __decode_token(self, token: str) -> dict:
        payload = jwt.decode(token, self.config["jwt_secret_key"], algorithms=[self.config["jwt_algorithm"]])
        return payload

    async def authenticate_user(self, username: str, password: str) -> Optional[str]:
        async with self.db.pool.acquire() as conn:
            try:
                user = await self.db.fetch_user_by_username(conn, username)
            except exceptions.PostgresError:
                raise RuntimeError("An unexpected error occurred.")
            if user and self.__verify_password(password, user['password_hash']):
                return self.__create_jwt(user["user_id"], user["username"])
            raise PermissionError("Invalid credentials.")

    async def register_user(self, username: str, password: str, email: str, role_id: int = 1) -> None:
        hashed_password = self.__hash_password(password)
        async with self.db.pool.acquire() as conn:
            try:
                await self.db.add_user(conn, username, hashed_password, email, role_id)
            except exceptions.UniqueViolationError:
                raise ValueError("User with this username or email already exists.")
            except exceptions.PostgresError:
                raise RuntimeError("An unexpected error occurred.")

    async def get_user_by_token(self, token: str):
        try:
            payload = self.__decode_token(token)
        except jwt.ExpiredSignatureError:
            raise TimeoutError("Token has expired.")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token.")
        
        username = payload.get("sub")
        if username is None:
            raise ValueError("Invalid token.")
        
        async with self.db.pool.acquire() as conn:
            try:
                user = await self.db.fetch_user_by_username(conn, username)
                if user is None:
                    raise LookupError("User not found.")
                return user
            except exceptions.PostgresError:
                raise RuntimeError("An unexpected error occurred.")
    
    def check_admin_permission(self, user):
        return user['role_name'] == 'admin'
