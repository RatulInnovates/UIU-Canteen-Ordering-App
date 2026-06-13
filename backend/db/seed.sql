-- Users
INSERT INTO users (name, email, password, role) VALUES 
('Nawshin Zaman', 'nawshin@student.uiu.ac.bd', '123456', 'student'),
('Fahim Ahmed', 'fahim@student.uiu.ac.bd', '123456', 'student'),
('Sadia Sultana', 'sadia@student.uiu.ac.bd', '123456', 'student'),
('Rifat Kabir', 'rifat@student.uiu.ac.bd', '123456', 'student'),
('Rahat Ahmed', 'rahat@staff.uiu.ac.bd', '123456', 'staff'),
('Walk-in Customer', 'walkin@uiu.edu', '123456', 'student');

-- Menu Items
INSERT INTO menu_items (name, description, price, category, image_url, available) VALUES 
('Chicken Teriyaki Bowl', 'Premium chicken teriyaki with rice', 150.00, 'rice', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop', 1),
('Roasted Veg Medley', 'Healthy roasted vegetables', 120.00, 'healthy', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop', 1),
('Signature UIU Burger', 'Wagyu beef, caramelized onions', 180.00, 'fast', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop', 0),
('Pasta Alfredo', 'Creamy pasta alfredo', 160.00, 'fast', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop', 1),
('Cold Coffee', 'Chilled refreshing coffee', 80.00, 'drinks', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100&h=100&fit=crop', 1);

-- Orders
INSERT INTO orders (user_id, token_no, status, total, created_at) VALUES 
(1, 4482, 'incoming', 300.00, NOW() - INTERVAL 1 MINUTE),
(2, 4483, 'incoming', 520.00, NOW() - INTERVAL 2 MINUTE),
(3, 4479, 'preparing', 240.00, NOW() - INTERVAL 5 MINUTE),
(4, 4470, 'ready', 240.00, NOW() - INTERVAL 10 MINUTE);

-- Order Items
INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES 
(1, 1, 2, 150.00),
(2, 3, 2, 180.00),
(2, 5, 2, 80.00),
(3, 2, 2, 120.00),
(4, 4, 1, 160.00),
(4, 5, 1, 80.00);
