<?php
$host = 'localhost';
$user = 'root';
$password = ''; // Default XAMPP

// 1. Connect to MySQL Server (No database selected yet)
$conn = new mysqli($host, $user, $password);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 2. Create Database
$sql = "CREATE DATABASE IF NOT EXISTS uiu_canteen";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully or already exists.<br>";
} else {
    die("Error creating database: " . $conn->error);
}

// 3. Select the Database
$conn->select_db('uiu_canteen');

// 4. Create Tables
$tables = [
    "users" => "CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100)  NOT NULL,
        email       VARCHAR(150)  UNIQUE NOT NULL,
        password    VARCHAR(255)  NOT NULL,
        role        ENUM('student','staff','admin') DEFAULT 'student',
        student_id  VARCHAR(50),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "menu_items" => "CREATE TABLE IF NOT EXISTS menu_items (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100)  NOT NULL,
        description TEXT,
        price       DECIMAL(8,2)  NOT NULL,
        category    ENUM('rice','fast','healthy','drinks') NOT NULL,
        image_url   VARCHAR(300),
        available   TINYINT(1) DEFAULT 1,
        badge       VARCHAR(50),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "orders" => "CREATE TABLE IF NOT EXISTS orders (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        token_no    INT NOT NULL,
        status      ENUM('incoming','preparing','ready','collected','cancelled') DEFAULT 'incoming',
        note        TEXT,
        total       DECIMAL(8,2) NOT NULL,
        payment_method VARCHAR(50),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",
    "order_items" => "CREATE TABLE IF NOT EXISTS order_items (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        order_id    INT NOT NULL,
        item_id     INT NOT NULL,
        qty         INT DEFAULT 1,
        unit_price  DECIMAL(8,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (item_id)  REFERENCES menu_items(id)
    )",
    "promotions" => "CREATE TABLE IF NOT EXISTS promotions (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        title       VARCHAR(150),
        discount_code VARCHAR(50),
        target_role ENUM('all','student','staff') DEFAULT 'all',
        active_days VARCHAR(50),
        status      ENUM('active','queued','archived') DEFAULT 'queued',
        image_url   VARCHAR(300),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($tables as $tableName => $tableQuery) {
    if ($conn->query($tableQuery) === TRUE) {
        echo "Table '$tableName' created successfully or already exists.<br>";
    } else {
        echo "Error creating table '$tableName': " . $conn->error . "<br>";
    }
}

// 5. Insert Dummy Data (Only if empty)
$checkUsers = $conn->query("SELECT COUNT(*) AS count FROM users");
if ($checkUsers->fetch_assoc()['count'] == 0) {
    // Insert Users
    $conn->query("INSERT INTO users (name, email, password, role) VALUES 
        ('Nawshin Zaman', 'nawshin@student.uiu.ac.bd', '123456', 'student'),
        ('Fahim Ahmed', 'fahim@student.uiu.ac.bd', '123456', 'student'),
        ('Sadia Sultana', 'sadia@student.uiu.ac.bd', '123456', 'student'),
        ('Rifat Kabir', 'rifat@student.uiu.ac.bd', '123456', 'student'),
        ('Rahat Ahmed', 'rahat@staff.uiu.ac.bd', '123456', 'staff')
    ");

    // Insert Menu Items
    $conn->query("INSERT INTO menu_items (name, description, price, category, image_url, available) VALUES 
        ('Chicken Teriyaki Bowl', 'Premium chicken teriyaki with rice', 150.00, 'rice', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop', 1),
        ('Roasted Veg Medley', 'Healthy roasted vegetables', 120.00, 'healthy', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop', 1),
        ('Signature UIU Burger', 'Wagyu beef, caramelized onions', 180.00, 'fast', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop', 0),
        ('Pasta Alfredo', 'Creamy pasta alfredo', 160.00, 'fast', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop', 1),
        ('Cold Coffee', 'Chilled refreshing coffee', 80.00, 'drinks', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100&h=100&fit=crop', 1)
    ");

    // Insert Orders
    $conn->query("INSERT INTO orders (user_id, token_no, status, total, created_at) VALUES (1, 4482, 'incoming', 300.00, NOW() - INTERVAL 1 MINUTE)");
    $order1_id = $conn->insert_id;
    $conn->query("INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($order1_id, 1, 2, 150.00)");

    $conn->query("INSERT INTO orders (user_id, token_no, status, total, created_at) VALUES (2, 4483, 'incoming', 520.00, NOW() - INTERVAL 2 MINUTE)");
    $order2_id = $conn->insert_id;
    $conn->query("INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($order2_id, 3, 2, 180.00), ($order2_id, 5, 2, 80.00)");

    $conn->query("INSERT INTO orders (user_id, token_no, status, total, created_at) VALUES (3, 4479, 'preparing', 240.00, NOW() - INTERVAL 5 MINUTE)");
    $order3_id = $conn->insert_id;
    $conn->query("INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($order3_id, 2, 2, 120.00)");

    $conn->query("INSERT INTO orders (user_id, token_no, status, total, created_at) VALUES (4, 4470, 'ready', 240.00, NOW() - INTERVAL 10 MINUTE)");
    $order4_id = $conn->insert_id;
    $conn->query("INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($order4_id, 4, 1, 160.00), ($order4_id, 5, 1, 80.00)");

    echo "Dummy data inserted successfully!<br>";
} else {
    echo "Dummy data already exists. Skipping insertion.<br>";
}

echo "<br><b>Database setup complete!</b><br>";
echo "<a href='Frontend/pages/staff/staff_dashboard.html'>Go to Staff Dashboard</a>";

$conn->close();
?>
