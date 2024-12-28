CREATE VIEW order_summary AS
SELECT 
    COUNT(po.orders_id) AS total_orders,  
    SUM(p.price) AS total_amount,      
    AVG(p.price) AS average_amount      
FROM 
    orders po
JOIN 
    product p ON po.product_id = p.product_id;