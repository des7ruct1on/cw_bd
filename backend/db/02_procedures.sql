CREATE OR REPLACE FUNCTION get_user_by_email(email_input TEXT)
RETURNS TABLE(
    user_id BIGINT,
    username TEXT,
    password_hash TEXT,
    email TEXT,
    role_name TEXT,
    created_at TIMESTAMP
)
AS $$
BEGIN
    RETURN QUERY 
        SELECT 
            u.users_id,
            u.username,
            u.password_hash,
            u.email,
            r.role_name,
            u.created_at
        FROM users AS u
        JOIN roles AS r ON r.roles_id = u.role_id
        WHERE u.email = email_input;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_by_username(name_input TEXT)
RETURNS TABLE(
    user_id BIGINT,
    username TEXT,
    password_hash TEXT,
    email TEXT,
    role_name TEXT,
    created_at TIMESTAMP
)
AS $$
BEGIN
    RETURN QUERY 
        SELECT 
            u.users_id,
            u.username,
            u.password_hash,
            u.email,
            r.role_name,
            u.created_at
        FROM users AS u
        JOIN roles AS r ON r.roles_id = u.role_id
        WHERE u.username = name_input;
END;
$$ LANGUAGE plpgsql;

-- Процедура для добавления нового пользователя
CREATE OR REPLACE FUNCTION add_user(username_input TEXT, password_hash_input TEXT, email_input TEXT, role_id_input BIGINT)
RETURNS VOID
AS $$
BEGIN
    INSERT INTO users (username, password_hash, email, role_id)
    VALUES (username_input, password_hash_input, email_input, role_id_input);
END;
$$ LANGUAGE plpgsql;

-- Процедура для логирования действий пользователя
CREATE OR REPLACE FUNCTION add_action_log(action_title TEXT, user_id_input BIGINT)
RETURNS VOID
AS $$
BEGIN
    -- Проверяем, существует ли пользователь с указанным user_id
    IF NOT EXISTS (SELECT 1 FROM users WHERE users_id = user_id_input) THEN
        RAISE EXCEPTION 'User with id % does not exist', user_id_input;
    END IF;

    -- Если пользователь существует, вставляем запись в log_table
    INSERT INTO log (action_type, action_timestamp, user_id)
    VALUES (action_title, CURRENT_TIMESTAMP, user_id_input);
END;
$$ LANGUAGE plpgsql;




-- Процедура для получения списка автомобилей
CREATE OR REPLACE FUNCTION get_cars()
RETURNS TABLE(car_id BIGINT, car_name TEXT, description TEXT, price DECIMAL, photo_url TEXT)
AS $$
BEGIN
    RETURN QUERY SELECT product_id, product_name::TEXT, product.description, product.price, product.photo_url FROM product;
END;
$$ LANGUAGE plpgsql;

-- Процедура для получения автомобиля по ID
CREATE OR REPLACE FUNCTION get_car_by_id(car_id_input BIGINT)
RETURNS TABLE(car_id BIGINT, car_name TEXT, description TEXT, price DECIMAL)
AS $$
BEGIN
    RETURN QUERY SELECT product_id, product_name, product.description, product.price
    FROM product WHERE product_id = car_id_input;
END;
$$ LANGUAGE plpgsql;

-- Процедура для добавления нового автомобиля
CREATE OR REPLACE FUNCTION add_car(name_input TEXT, description_input TEXT, price_input DECIMAL)
RETURNS VOID
AS $$
BEGIN
    INSERT INTO product (product_name, product.description, product.price)
    VALUES (name_input, description_input, price_input);
END;
$$ LANGUAGE plpgsql;

-- Процедура для получения заказов пользователя
CREATE OR REPLACE FUNCTION get_orders_by_user(user_id_input BIGINT)
RETURNS TABLE(
    order_date DATE, 
    car_name TEXT,  
    shipment_method TEXT,  
    total_amount DECIMAL
)
AS $$
BEGIN
    RETURN QUERY 
    SELECT
        pom.order_date,
        p.product_name::text AS car_name,  -- Приведение типа
        sm.method_name::text AS shipment_method,  -- Приведение типа
        p.price AS total_amount
    FROM
        orders pom
    JOIN
        product p ON pom.product_id = p.product_id
    JOIN
        shipment_method sm ON pom.shipment_method_id = sm.shipment_method_id
    WHERE
        pom.customer_id = user_id_input;
END;
$$ LANGUAGE plpgsql;

-- Процедура для создания нового заказа
CREATE OR REPLACE FUNCTION create_order(
    p_username TEXT,
    p_car_name TEXT,
    p_shipment_method_name TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id BIGINT;
    v_car_id BIGINT;
    v_shipment_method_id BIGINT;
    v_customer_id BIGINT;
BEGIN
    -- Получение ID пользователя по имени
    SELECT u.users_id INTO v_user_id
    FROM users u
    WHERE u.username = p_username;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % does not exist', p_username;
    END IF;

    -- Проверка и добавление записи в таблицу customer, если её нет
    SELECT c.customer_id INTO v_customer_id
    FROM customer c
    WHERE c.customer_id = v_user_id;

    IF NOT FOUND THEN
        -- Добавляем запись в таблицу customer, если её нет
        INSERT INTO customer (customer_id, customer_name, contact_email)
        SELECT u.users_id, u.username, u.email
        FROM users u
        WHERE u.users_id = v_user_id;

        -- Получаем id вновь добавленного клиента
        SELECT users_id INTO v_customer_id
        FROM users
        WHERE users_id = v_user_id;
    END IF;

    -- Получение ID автомобиля по названию
    SELECT p.product_id INTO v_car_id
    FROM product p
    WHERE p.product_name = p_car_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Car % does not exist', p_car_name;
    END IF;

    -- Проверка наличия метода доставки
    SELECT sm.shipment_method_id INTO v_shipment_method_id
    FROM shipment_method sm
    WHERE sm.method_name = p_shipment_method_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shipment method % does not exist', p_shipment_method_name;
    END IF;

    -- Создание заказа
    INSERT INTO orders (
        order_date, 
        customer_id, 
        product_id, 
        shipment_method_id
    ) VALUES (
        CURRENT_DATE, 
        v_customer_id, 
        v_car_id, 
        v_shipment_method_id
    );

    -- Логирование
    RAISE NOTICE 'Order created successfully for user %, car %, shipment method %',
        p_username, p_car_name, p_shipment_method_name;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION search_cars(
    search_name TEXT
) 
RETURNS TABLE (
    product_id BIGINT,
    product_name TEXT,
    description TEXT,
    price DECIMAL(10, 2)
) 
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        product_id,
        product_name,
        description,
        price
    FROM product
    WHERE 
        (search_name IS NULL OR product_name ILIKE '%' || search_name || '%');
END;
$$ LANGUAGE plpgsql;




-- ADMIN PROCEDURES

-- Get list of all database tables

CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE(table_name TEXT) AS $$
BEGIN
    RETURN QUERY 
    SELECT t.table_name::text
    FROM information_schema.tables AS t
    WHERE t.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- Get list of all columns for single table

CREATE OR REPLACE FUNCTION get_columns_by_table_name(p_table_name TEXT)
RETURNS TABLE(
    column_name TEXT,
    data_type TEXT,
    is_nullable BOOLEAN
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable = 'YES'
    FROM information_schema.columns c
    WHERE c.table_name = p_table_name AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Get single table data

CREATE OR REPLACE FUNCTION get_full_table(table_name text)
RETURNS TABLE (result jsonb) AS $$
DECLARE
    query text;
    primary_key_column text;
BEGIN
    IF table_name = 'product' THEN
        primary_key_column := 'product_id';
    ELSIF table_name = 'roles' THEN
        primary_key_column := 'roles_id';
    ELSIF table_name = 'users' THEN
        primary_key_column := 'users_id';
    ELSIF table_name = 'customer' THEN
        primary_key_column := 'customer_id';
    ELSIF table_name = 'shipment_method' THEN
        primary_key_column := 'shipment_method_id';
    ELSIF table_name = 'orders' THEN
        primary_key_column := 'orders_id';
    ELSIF table_name = 'log' THEN
        primary_key_column := 'log_id';
    ELSE
        RAISE EXCEPTION 'Unsupported table: %', table_name;
    END IF;

    query := 'SELECT row_to_json(t)::jsonb FROM ' || quote_ident(table_name) || ' t ORDER BY t.' || quote_ident(primary_key_column);
    
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;

-- Update single value in table

CREATE OR REPLACE FUNCTION update_value(
    table_name TEXT,
    column_name TEXT,
    new_value TEXT,
    id BIGINT
)
RETURNS VOID AS $$
DECLARE
    query TEXT;
BEGIN
    query := 
        'UPDATE ' || quote_ident(table_name) || 
        ' SET ' || quote_ident(column_name) || 
        ' = ' || quote_literal(new_value) || 
        ' WHERE ' || quote_ident(table_name) || '_id = ' || quote_literal(id::TEXT);
    EXECUTE query;
END;
$$ LANGUAGE plpgsql;

-- Delete single row from table

CREATE OR REPLACE FUNCTION delete_row(
    table_name TEXT,
    id BIGINT
)
RETURNS VOID AS $$
DECLARE
    query TEXT;
BEGIN
    query := 
        'DELETE FROM ' || quote_ident(table_name) || 
        ' WHERE ' || quote_ident(table_name) || '_id = ' || quote_literal(id::TEXT);
    EXECUTE query;
END;
$$ LANGUAGE plpgsql;

-- Insert single row in table

CREATE OR REPLACE FUNCTION insert_row(
    table_name TEXT,
    column_names TEXT[], 
    input_values TEXT[]
)
RETURNS VOID AS $$
DECLARE
    query TEXT;
BEGIN
    query := 
        'INSERT INTO ' || quote_ident(table_name) || 
        ' (' || array_to_string(ARRAY(SELECT quote_ident(col) FROM unnest(column_names) col), ', ') || ') VALUES (' || 
        array_to_string(ARRAY(SELECT quote_literal(v) FROM unnest(input_values) v), ', ') || ')';
    
    EXECUTE query;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_user_admin(username_input VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET role_id = (SELECT roles.roles_id FROM roles WHERE role_name = 'admin')
    WHERE username = username_input;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with username "%" does not exist', username_input;
    END IF;
END;
$$ LANGUAGE plpgsql;
