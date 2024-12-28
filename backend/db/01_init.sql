-- Создание таблицы product
CREATE TABLE product (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    photo_url TEXT
);

-- Таблица ролей
CREATE TABLE roles (
    roles_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Уникальный идентификатор роли
    role_name TEXT NOT NULL                    -- Название роли (например, 'user', 'admin')
);

-- Таблица пользователей
CREATE TABLE users (
    users_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Уникальный идентификатор пользователя
    username TEXT NOT NULL UNIQUE,            -- Уникальное имя пользователя
    password_hash TEXT NOT NULL,              -- Хешированный пароль
    email TEXT NOT NULL UNIQUE,               -- Уникальный email
    role_id INTEGER NOT NULL,                 -- Ссылка на роль пользователя
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(roles_id) ON DELETE CASCADE -- Связь с таблицей ролей
);
CREATE INDEX index_users_username ON users(username);

-- Создание таблицы customer
CREATE TABLE customer (
    customer_id BIGINT PRIMARY KEY,  -- customer_id совпадает с user_id
    customer_name TEXT NOT NULL,
    contact_email TEXT NOT NULL UNIQUE,
    FOREIGN KEY (customer_id) REFERENCES users(users_id) ON DELETE CASCADE-- Связь с таблицей users
);

-- Создание таблицы shipment_method
CREATE TABLE shipment_method (
    shipment_method_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    method_name TEXT NOT NULL
);

-- Создание таблицы purchase_order_main
CREATE TABLE orders (
    orders_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_date DATE NOT NULL,
    customer_id BIGINT,  -- Здесь связываем заказ с покупателем
    shipment_method_id BIGINT,
    product_id BIGINT,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE, -- Связь с таблицей customer
    FOREIGN KEY (shipment_method_id) REFERENCES shipment_method(shipment_method_id) ON DELETE CASCADE -- Связь с таблицей shipment_method
);

-- Создание таблицы для логирования действий
CREATE TABLE log (
    log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_type TEXT NOT NULL,       -- Название таблицы
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Время выполнения действия
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(users_id) ON DELETE CASCADE
);
