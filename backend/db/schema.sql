CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  UNIQUE NOT NULL,
    password    VARCHAR(255)  NOT NULL,
    role        ENUM('student','staff','admin') DEFAULT 'student',
    student_id  VARCHAR(50),
    settings    JSON DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    description TEXT,
    price       DECIMAL(8,2)  NOT NULL,
    category    VARCHAR(50) NOT NULL,
    image_url   VARCHAR(300),
    available   TINYINT(1) DEFAULT 1,
    badge       VARCHAR(50),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    token_no    INT NOT NULL,
    status      ENUM('incoming','preparing','ready','collected','cancelled') DEFAULT 'incoming',
    note        TEXT,
    total       DECIMAL(8,2) NOT NULL,
    payment_method VARCHAR(50),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    item_id     INT NOT NULL,
    qty         INT DEFAULT 1,
    unit_price  DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (item_id)  REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS promotions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(150),
    discount_code VARCHAR(50),
    target_role ENUM('all','student','staff') DEFAULT 'all',
    active_days VARCHAR(50),
    status      ENUM('active','queued','archived') DEFAULT 'queued',
    image_url   VARCHAR(300),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
