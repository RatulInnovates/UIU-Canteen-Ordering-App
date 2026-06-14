<?php
require_once __DIR__ . '/../shared/db.php';

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            item_id INT NOT NULL,
            qty INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (item_id) REFERENCES menu_items(id)
        );
    ");

    // Clear existing data (except users)
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE order_items");
    $pdo->exec("TRUNCATE TABLE orders");
    $pdo->exec("TRUNCATE TABLE cart");
    $pdo->exec("TRUNCATE TABLE menu_items");
    $pdo->exec("TRUNCATE TABLE promotions");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // Insert Dummy Menu Items
    $menu_items = [
        ['name' => 'Spiced Basmati & Grilled Chicken', 'description' => 'Experience the royal fusion of aromatic spices and tender grilled chicken.', 'price' => 180.00, 'category' => 'rice', 'image_url' => 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => 'Today\'s Special'],
        ['name' => 'Kacchi Biriyani', 'description' => 'Slow cooked biriyani with aromatic spices.', 'price' => 220.00, 'category' => 'rice', 'image_url' => 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => 'Weekly'],
        ['name' => 'Chicken Polao', 'description' => 'Buttery polao with roasted chicken.', 'price' => 160.00, 'category' => 'rice', 'image_url' => 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => 'Weekly'],
        ['name' => 'Beef Tehari', 'description' => 'Mustard oil rice cooked with tender beef.', 'price' => 190.00, 'category' => 'rice', 'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => 'Weekly'],
        ['name' => 'Healthy Quinoa Bowl', 'description' => 'Fresh vegetables, quinoa, and light dressing.', 'price' => 150.00, 'category' => 'healthy', 'image_url' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => 'Veg'],
        ['name' => 'Steak Burger', 'description' => 'Juicy burger with fresh buns and cheese.', 'price' => 200.00, 'category' => 'fast', 'image_url' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => 'Popular'],
        ['name' => 'Creamy Pesto Pasta', 'description' => 'Pesto pasta with a creamy twist.', 'price' => 170.00, 'category' => 'fast', 'image_url' => 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => ''],
        ['name' => 'Cheesy Margherita Pizza', 'description' => 'Classic pizza with fresh mozzarella.', 'price' => 250.00, 'category' => 'fast', 'image_url' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => ''],
        ['name' => 'Chicken Cashew Salad', 'description' => 'Crispy chicken with fresh greens and cashew.', 'price' => 130.00, 'category' => 'healthy', 'image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => 'Flash Sale'],
        ['name' => 'Cold Brew Coffee', 'description' => 'Chilled refreshing coffee.', 'price' => 90.00, 'category' => 'drinks', 'image_url' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => ''],
        ['name' => 'Mango Smoothie', 'description' => 'Fresh seasonal mango smoothie.', 'price' => 110.00, 'category' => 'drinks', 'image_url' => 'https://images.unsplash.com/photo-1553530666-ba11a7ddbb54?q=80&w=1200&auto=format&fit=crop', 'available' => 1, 'badge' => '']
    ];

    $stmt = $pdo->prepare("INSERT INTO menu_items (name, description, price, category, image_url, available, badge) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($menu_items as $item) {
        $stmt->execute([$item['name'], $item['description'], $item['price'], $item['category'], $item['image_url'], $item['available'], $item['badge']]);
    }

    // Insert Dummy Promotions
    $pdo->exec("INSERT INTO promotions (title, discount_code, target_role, active_days, status, image_url) VALUES 
        ('Welcome Back 20%', 'WELCOME20', 'all', 'Mon,Tue,Wed', 'active', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop'),
        ('Staff Appreciation 10%', 'STAFF10', 'staff', 'Fri', 'active', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop')
    ");

    // Insert Dummy Orders to ensure charts are visible
    $pdo->exec("INSERT INTO orders (user_id, token_no, status, total, created_at) VALUES 
        (1, 101, 'completed', 350.00, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
        (1, 102, 'completed', 450.00, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
        (1, 103, 'completed', 180.00, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
        (1, 104, 'completed', 250.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
        (1, 105, 'completed', 500.00, DATE_SUB(NOW(), INTERVAL 2 DAY))
    ");

    echo "Dummy data seeded successfully.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
