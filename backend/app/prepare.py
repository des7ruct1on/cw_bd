from models import User, Token, Product, PurchaseOrderMain, LogTable, PurchaseOrderOut

def prepare_token(token: str):
    return Token(
        access_token=token,
        token_type='bearer'
    )

def prepare_user(user: dict):
    return User(
        username=user['username'],
        email=user['email'],
        user_id = user['user_id'],
        role = user['role_name'],
        created_at = user['created_at'],
        password_hash = user['password_hash']

    )

def prepare_product(product: dict):
    return Product(
        product_id=product['product_id'],
        product_name=product['product_name'],
        description=product.get('description'),
        price=product['price'],
        photo_url=product['photo_url']
    )

def prepare_products(products: list[dict]) -> list[Product]:
    return [
        Product(
            product_id=product['car_id'],
            product_name=product['car_name'],
            description=product.get('description'),
            price=product['price'],
            photo_url=product['photo_url']
        )
        for product in products
    ]

def prepare_orders(orders):
    return [
        PurchaseOrderOut(
            order_date = order['order_date'],
            car_name = order['car_name'],
            total_amount = order['total_amount'],
            shipment_method = order['shipment_method']
        )
        for order in orders
    ]

def prepare_purchase_order(purchase_order: dict):
    return PurchaseOrderMain(
        order_id=purchase_order['order_id'],
        order_date=purchase_order['order_date'],
        customer_id=purchase_order.get('customer_id'),
        shipment_method_id=purchase_order.get('shipment_method_id'),
        product_id=purchase_order.get('car_id'),
        total_amount=purchase_order.get('total_amount')
    )

def prepare_log(log: dict):
    return LogTable(
        log_id=log['log_id'],
        action_type=log['action_type'],
        action_timestamp=log['action_timestamp']
    )
