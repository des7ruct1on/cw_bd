from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from database import Database
from auth import AuthService
from logger import DatabaseLogger
from models import UserReg, User, Token, Product, PurchaseOrderMain, PurchaseOrderOut, UpdateValueData, DeleteRowData, InsertRowData, BackupIn
from prepare import prepare_token, prepare_user, prepare_product, prepare_orders, prepare_products
import os
from utils import authorize, check_admin_permission, check_column_name, check_table_name, deserialize_json_objects
from backup_service import BackupService
from exceptions import UnexpectedErrorHTTP, BackupNotFoundHTTP, NonUniqueBackupNameHTTP
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config_path = os.path.join(os.path.dirname(__file__), 'config.json')
print(config_path, flush=True)
db = Database(config_path=config_path)
auth_service = AuthService(config_path=config_path, db=db)
logger = DatabaseLogger(db)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
backup_service = BackupService(None)

@app.on_event("startup")
async def startup():
    print("Starting application...", flush=True)
    await db.create_connection_pool()
    print("Database connection pool created.", flush=True)

@app.post("/register")
async def register(user: UserReg):
    try:
        await auth_service.register_user(user.username, user.password, user.email)
    except ValueError:
        raise HTTPException(status_code=409, detail="User with this username or email already exists.")
    except RuntimeError:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        token = await auth_service.authenticate_user(form_data.username, form_data.password)
    except PermissionError:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    except RuntimeError:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return Token(
        access_token=token,
        token_type='bearer'
    )

@app.get("/profile", response_model=User)
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        user = await auth_service.get_user_by_token(token)
    except TimeoutError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except LookupError:
        raise HTTPException(status_code=404, detail="User not found.")
    except RuntimeError:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return prepare_user(user)

@app.get("/profile/role")
async def get_current_user_role(token: str = Depends(oauth2_scheme)):
    try:
        user = await auth_service.get_user_by_token(token)
        print('\n\n\n')
        print(user)
        print('\n\n\n')
    except TimeoutError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except LookupError:
        raise HTTPException(status_code=404, detail="User not found.")
    except RuntimeError:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    return { 'role': user['role_name'] }

@app.get("/products", response_model=List[Product])
async def get_all_products():
    try:
        async with db.pool.acquire() as conn:
            records = await db.fetch_cars(conn)  # Получаем список Record
            products = [dict(record) for record in records]  # Преобразуем Record в словари
            print('\n\n\n')
            print(products)
            print('\n\n\n')
    except Exception:
        e = HTTPException(status_code=500, detail="An unexpected error occurred.")
        await logger.log("GET_PRODUCTS_ERROR__" + str(e), -1, to_db=True)
        raise e
    return prepare_products(products) 


@app.get("/products/search", response_model=List[Product])
async def search_products(name: str = None):
    try:
        async with db.pool.acquire() as conn:
            product = await db.search_cars(conn, name=name)
    except Exception:
        e = HTTPException(status_code=500, detail="An unexpected error occurred.")
        raise e
    return prepare_product(product)

@app.post("/order")
async def create_order(order: PurchaseOrderMain, token: str = Depends(oauth2_scheme)):
    try:
        user = await auth_service.get_user_by_token(token)
        async with db.pool.acquire() as conn:
            await db.create_order(
                conn=conn,
                username=user['username'],
                car_name= order.car_name,
                shipment_method_name=order.shipment_method_name
            )
    except TimeoutError:
        e = HTTPException(status_code=401, detail="Token has expired.")
        await logger.log("CREATE_ORDER_ERROR__" + str(e), user["user_id"] ,to_db=True)
        raise e
    except ValueError:
        e = HTTPException(status_code=401, detail="Invalid token.")
        await logger.log("CREATE_ORDER_ERROR__" + str(e), user["user_id"] ,to_db=True)
        raise e
    except LookupError:
        e = HTTPException(status_code=404, detail="User not found.")
        await logger.log("CREATE_ORDER_ERROR__" + str(e), user["user_id"] ,to_db=True)
        raise e
    except RuntimeError as ex:
        e = HTTPException(status_code=500, detail="An unexpected error occurred.")
        await logger.log("CREATE_ORDER_ERROR__" + str(e), user["user_id"] ,to_db=True)
        raise e


@app.get("/orders", response_model=List[PurchaseOrderOut])
async def get_orders(token: str = Depends(oauth2_scheme)):
    try:
        user = await auth_service.get_user_by_token(token)
        async with db.pool.acquire() as conn:
            orders = await db.fetch_orders_by_user(conn, user["user_id"])
    except TimeoutError:
        e = HTTPException(status_code=401, detail="Token has expired.")
        await logger.log("GET_ORDERS__" + str(e), user["user_id"] ,to_db=True)
        raise e
    except ValueError:
        e = HTTPException(status_code=401, detail="Invalid token.")
        await logger.log("GET_ORDERS__" + str(e), user["user_id"] ,to_db=True)
        raise e
    except LookupError:
        e = HTTPException(status_code=404, detail="User not found.")
        await logger.log("GET_ORDERS__" + str(e), user["user_id"] ,to_db=True)
        raise e
    except RuntimeError as ex:
        e = HTTPException(status_code=500, detail="An unexpected error occurred.")
        await logger.log("GET_ORDERS__" + str(e), user["user_id"] ,to_db=True)
        raise e
    
    return prepare_orders(orders)


# ADMIN TOOLS ROUTES ---

@app.get("/database/{table_name}")
async def get_full_table(table_name: str, token = Depends(oauth2_scheme)):    
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)
    await check_table_name(db, table_name)

    try:
        async with db.pool.acquire() as conn:
            table = await db.get_full_table(conn, table_name)
    except RuntimeError:
        raise UnexpectedErrorHTTP()
    if len(table) == 0:
        async with db.pool.acquire() as conn:
            columns = await db.get_columns_by_table_name(conn, table_name)
        return [rec['column_name'] for rec in columns]
    return deserialize_json_objects(table)

@app.patch("/database/update-value")
async def update_value(data: UpdateValueData, token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)
    await check_table_name(db, data.table_name)
    await check_column_name(db, data.table_name, data.column_name)
    
    try:
        async with db.pool.acquire() as conn:
            await db.update_value(conn, data.table_name, data.column_name, data.new_value, data.id)
    except RuntimeError:
        raise UnexpectedErrorHTTP()

@app.delete("/database/delete-row")
async def delete_row(data: DeleteRowData, token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)
    await check_table_name(db, data.table_name)
    
    try:
        async with db.pool.acquire() as conn:
            await db.delete_row(conn, data.table_name, data.id)
    except RuntimeError:
        raise UnexpectedErrorHTTP()

@app.post("/database/insert-row")
async def insert_row(data: InsertRowData, token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)
    await check_table_name(db, data.table_name)

    try:
        async with db.pool.acquire() as conn:
            await db.insert_row(conn, data.table_name, data.columns, data.values)
    except RuntimeError:
        raise UnexpectedErrorHTTP()

@app.post("/backup/create")
async def create_backup(backup_in: BackupIn, token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)

    try:
        backup_service.create_backup(backup_in.backup_name)
    except ValueError:
        raise NonUniqueBackupNameHTTP()
    except RuntimeError:
        raise UnexpectedErrorHTTP()
    
    return {"message": "Backup created", "backup_name": backup_in.backup_name}

@app.delete("/backup/delete")
async def delete_backup(backup_in: BackupIn, token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)

    try:
        backup_service.delete_backup(backup_in.backup_name)
    except FileNotFoundError:
        raise BackupNotFoundHTTP()

    return {"message": "Backup deleted", "backup_name": backup_in.backup_name}

@app.post("/backup/restore")
async def restore_backup(backup_in: BackupIn, token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)

    try:
        backup_service.restore_backup(backup_in.backup_name)
    except FileNotFoundError:
        raise BackupNotFoundHTTP()
    except RuntimeError:
        raise UnexpectedErrorHTTP()

    return {"message": "Backup restored", "backup_name": backup_in.backup_name}

@app.get("/backup/list")
async def get_all_backups(token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)

    backups = backup_service.get_all_backups()

    return {"backups": backups}

@app.get("/database/analytics/order-summary")
async def get_all_backups(token = Depends(oauth2_scheme)):
    user = await authorize(auth_service, token)
    check_admin_permission(auth_service, user)

    try:
        async with db.pool.acquire() as conn:
            data = await db.get_order_summary(conn)
            print('\n\n\n')
            print(data)
            print('\n\n\n')
    except RuntimeError:
        raise UnexpectedErrorHTTP()

    return {"data": data}
