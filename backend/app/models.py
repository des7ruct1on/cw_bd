from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, date
from decimal import Decimal

# Модели для токенов
class Token(BaseModel):
    access_token: str
    token_type: str

# Модель для таблицы product
class Product(BaseModel):
    product_id: int
    product_name: str
    description: Optional[str]
    price: Decimal
    photo_url: str

# Модель для таблицы role
class Role(BaseModel):
    role_id: int
    role_name: str

# Модель для таблицы users
class User(BaseModel):
    user_id: int
    username: str
    password_hash: str
    email: str
    role: str
    created_at: datetime

class UserReg(BaseModel):
    username: str 
    password: str 
    email: str 

# Модель для таблицы customer
class Customer(BaseModel):
    customer_id: int  # Совпадает с user_id
    customer_name: str
    contact_email: Optional[str]

# Модель для таблицы shipment_method
class ShipmentMethod(BaseModel):
    shipment_method_id: int
    method_name: str

# Модель для таблицы purchase_order_main
class PurchaseOrderMain(BaseModel):
    car_name: str
    shipment_method_name: str

class PurchaseOrderOut(BaseModel):
    order_date: date
    car_name: str
    total_amount: Decimal  
    shipment_method: str

# Модель для таблицы log_table
class LogTable(BaseModel):
    log_id: int
    action_type: str
    action_timestamp: datetime
    user_id: Optional[int]

class UpdateValueData(BaseModel):
    table_name: str
    column_name: str
    new_value: str
    id: int

class DeleteRowData(BaseModel):
    table_name: str
    id: int

class InsertRowData(BaseModel):
    table_name: str
    columns: List[str]
    values: List[str]

class BackupIn(BaseModel):
    backup_name: str
