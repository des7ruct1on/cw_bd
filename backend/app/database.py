from asyncpg import Connection, create_pool
import json
from typing import List
from datetime import datetime
from typing import Optional

class Database:
    def __init__(self, config_path: str):
        with open(config_path, 'r') as config_file:
            self.config = json.load(config_file)['database']
        self.pool = None

    async def create_connection_pool(self):
        self.pool = await create_pool(
            user=self.config['user'],
            password=self.config['password'],
            database=self.config['dbname'],
            host=self.config['host'],
            port=self.config['port']
        )

    async def fetch_user_by_email(self, conn: Connection, email: str):
        return await conn.fetchrow(
            'SELECT * FROM get_user_by_email($1);', 
            email
        )
    
    async def fetch_user_by_username(self, conn: Connection, username: str):
        return await conn.fetchrow(
            'SELECT * FROM get_user_by_username($1);', 
            username
        )

    async def add_user(self, conn: Connection, username: str, hashed_password: str, email: str, role_id: int):
        await conn.execute(
            'SELECT add_user($1, $2, $3, $4);', 
            username, 
            hashed_password,
            email,
            role_id
        )

    async def add_action_log(self, conn: Connection, action_title: str, user_id: int):
        await conn.execute(
            'SELECT add_action_log($1, $2);',
            action_title,
            user_id
        )

    async def fetch_cars(self, conn: Connection):
        return await conn.fetch(
            'SELECT * FROM get_cars();'
        )

    async def fetch_car_by_id(self, conn: Connection, car_id: int):
        return await conn.fetchrow(
            'SELECT * FROM get_car_by_id($1);',
            car_id
        )

    async def add_car(self, conn: Connection, name: str, description: str, price: float):
        await conn.execute(
            'SELECT add_car($1, $2, $3);',
            name,
            description,
            price
        )

    async def fetch_orders_by_user(self, conn: Connection, user_id: int):
        return await conn.fetch(
            'SELECT * FROM get_orders_by_user($1);',
            user_id
        )

    async def create_order(self, conn: Connection, username: str, car_name: str, shipment_method_name: str):
        await conn.execute(
            'SELECT create_order($1, $2, $3);',
            username,
            car_name,
            shipment_method_name
        )

    async def create_backup(self, conn: Connection):
        await conn.execute(
            'CALL create_backup();'
        )

    async def restore_backup(self, conn: Connection, backup_file: str):
        await conn.execute(
            'CALL restore_backup($1);',
            backup_file
        )

    async def search_cars(self, conn: Connection, name: Optional[str] = None):
        query = 'SELECT * FROM search_cars($1);'
        return await conn.fetch(query, name)
    
    async def get_tables(self, conn: Connection):
        return await conn.fetch(
            'SELECT * FROM get_tables();'
        )

    async def get_columns_by_table_name(self, conn: Connection, table_name: str):
        return await conn.fetch(
            'SELECT * FROM get_columns_by_table_name($1);',
            table_name
        )
    
    async def get_full_table(self, conn: Connection, table_name: str):
        return await conn.fetch(
            'SELECT * FROM get_full_table($1);',
            table_name
        )
    
    async def update_value(self, conn: Connection, table_name: str, column_name: str, new_value: str, id: int):
        await conn.execute(
            'SELECT update_value($1, $2, $3, $4);',
            table_name,
            column_name,
            new_value,
            id
        )
    
    async def delete_row(self, conn: Connection, table_name: str, id: int):
        await conn.execute(
            'SELECT delete_row($1, $2);',
            table_name,
            id
        )
    
    async def insert_row(self, conn: Connection, table_name: str, columns: List[str], values: List[str]):
        await conn.execute(
            'SELECT insert_row($1, $2, $3);',
            table_name,
            columns,
            values
        )
    
    async def get_order_summary(self, conn: Connection):
        return await conn.fetch(
            'SELECT * FROM order_summary;'
        )
