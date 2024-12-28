import json

from exceptions import UserNotFoundHTTP, UnexpectedErrorHTTP, InvalidTokenHTTP, ExpiredTokenHTTP, ForbiddenAdminAccessHTTP, TableNotFoundHTTP, ColumnNotFoundHTTP

async def authorize(auth_service, token):
    try:
        user = await auth_service.get_user_by_token(token)
    except TimeoutError:
        raise ExpiredTokenHTTP()
    except ValueError:
        raise InvalidTokenHTTP()
    except LookupError:
        raise UserNotFoundHTTP()
    except RuntimeError:
        raise UnexpectedErrorHTTP()
    return user

def check_admin_permission(auth_service, user):
    if not auth_service.check_admin_permission(user):
        raise ForbiddenAdminAccessHTTP()

async def check_table_name(db, table_name):
    try:
        async with db.pool.acquire() as conn:
            tables = await db.get_tables(conn)
    except RuntimeError:
        raise UnexpectedErrorHTTP()
        
    tables = [table['table_name'] for table in tables]

    if table_name not in tables:
        raise TableNotFoundHTTP()

async def check_column_name(db, table_name, column_name):
    try:
        async with db.pool.acquire() as conn:
            columns = await db.get_columns_by_table_name(conn, table_name)
    except RuntimeError:
        raise UnexpectedErrorHTTP()
        
    columns = [column['column_name'] for column in columns]

    if column_name not in columns:
        raise ColumnNotFoundHTTP()

def deserialize_json_objects(json_strings_list):
    deserialized_objects_list = []
    for json_string in json_strings_list:
        obj = json.loads(json_string['result'])
        deserialized_objects_list.append(obj)
    return deserialized_objects_list