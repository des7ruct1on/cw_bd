CREATE OR REPLACE FUNCTION log_action()
RETURNS TRIGGER AS $$
DECLARE
    log_user_id BIGINT;
    user_exists BOOLEAN;
BEGIN
    -- Определяем, какое поле использовать для логирования
    IF TG_TABLE_NAME = 'customer' THEN
        log_user_id := COALESCE(NEW.customer_id, OLD.customer_id);
    ELSE
        log_user_id := COALESCE(NEW.users_id, OLD.users_id);
    END IF;

    -- Проверяем, существует ли пользователь с таким user_id в таблице users
    SELECT EXISTS (SELECT 1 FROM users WHERE users_id = log_user_id) INTO user_exists;

    -- Если пользователь существует, вставляем запись в лог
    IF user_exists THEN
        INSERT INTO log (action_type, user_id, action_timestamp)
        VALUES (TG_TABLE_NAME || ' ' || TG_OP, log_user_id, CURRENT_TIMESTAMP);
    ELSE
        RAISE WARNING 'User with ID % does not exist in users table', log_user_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;



-- Пример добавления триггера для таблицы users
CREATE TRIGGER log_users
AFTER INSERT OR UPDATE OR DELETE
ON users
FOR EACH ROW
EXECUTE FUNCTION log_action();

-- Пример добавления триггера для других таблиц, где есть user_id
CREATE TRIGGER log_customer
AFTER INSERT OR UPDATE OR DELETE
ON customer
FOR EACH ROW
EXECUTE FUNCTION log_action();
