document.addEventListener('DOMContentLoaded', () => {
    fetchAuthStatus();
    updateCartBadge();
    loadDashboardData();
});

async function fetchAuthStatus() {
    try {
        const res = await fetch('../../../backend/auth/guard.php');
        const result = await res.json();
        if (result.status === 'error') {
            window.location.href = '../../index.html'; // Redirect to login if not authenticated
        }
    } catch (err) {
        console.error("Auth check failed", err);
    }
}

async function loadDashboardData() {
    try {
        const res = await fetch('../../../backend/student/dashboard.php');
        const result = await res.json();
        
        if (result.status === 'success') {
            const data = result.data;
            renderHero(data.hero);
            renderWeeklySpecials(data.weekly_specials);
            renderFlashSale(data.flash_sale);
            renderMainMenu(data.main_menu);
        } else {
            console.error('Failed to load dashboard data:', result.message);
        }
    } catch (err) {
        console.error('Error loading dashboard data:', err);
    }
}

function renderHero(heroItem) {
    const container = document.getElementById('hero-container');
    if (!container || !heroItem) return;
    
    container.innerHTML = `
        <span class="tag">${heroItem.badge ? heroItem.badge.toUpperCase() : 'SPECIAL'}</span>
        <h1>${heroItem.name}</h1>
        <p>${heroItem.description || 'Experience our delicious offerings today.'}</p>
        <div class="hero-buttons">
            <a href="#" class="order-btn" onclick="event.preventDefault(); addToCart(${heroItem.id})">Order Now</a>
            <a href="student_menu.html" class="details-btn">Browse menu</a>
        </div>
    `;
}

function renderWeeklySpecials(specials) {
    const container = document.getElementById('weekly-specials-container');
    if (!container || !specials) return;
    
    let html = '';
    specials.forEach(item => {
        html += `
            <div class="food-card">
                <img src="${item.image_url}" alt="${item.name}" loading="lazy">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <div class="card-bottom">
                    <span>৳${parseFloat(item.price).toFixed(2)}</span>
                    <a href="#" onclick="event.preventDefault(); addToCart(${item.id})">Pre-order</a>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderFlashSale(flashItem) {
    const container = document.getElementById('flash-sale-container');
    if (!container || !flashItem) return;
    
    container.innerHTML = `
        <span class="flash-tag">FLASH SALE: 50% OFF</span>
        <h2>Zero Waste Initiative</h2>
        <p>Help us reduce food waste! Grab unpicked orders at half price. Fresh, delicious and eco-friendly.</p>
        <div class="flash-item">
            <div class="flash-food">
                <img src="${flashItem.image_url}" alt="${flashItem.name}" loading="lazy">
                <div>
                    <h4>${flashItem.name}</h4>
                    <span>Limited items left</span>
                </div>
            </div>
            <div class="flash-price">
                <small>৳${parseFloat(flashItem.original_price).toFixed(2)}</small>
                <h3>৳${parseFloat(flashItem.price).toFixed(2)}</h3>
            </div>
            <a href="#" class="add-btn" aria-label="Add to tray" onclick="event.preventDefault(); addToCart(${flashItem.id})">+</a>
        </div>
    `;
}

function renderMainMenu(menuItems) {
    const container = document.getElementById('main-menu-container');
    if (!container || !menuItems) return;
    
    let html = '';
    menuItems.forEach(item => {
        html += `
            <div class="menu-card">
                <img src="${item.image_url}" alt="${item.name}" loading="lazy">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function addToCart(itemId) {
    try {
        const res = await fetch('../../../backend/student/cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', item_id: itemId, qty: 1 })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            const cartItems = Object.values(result.data.cart);
            const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
            
            const badges = document.querySelectorAll('.cart-badge');
            badges.forEach(badge => {
                badge.textContent = totalQty;
                badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
            });
            
            if (window.UIToast) window.UIToast.show('Item added to tray!');
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Add to cart failed", err);
    }
}

async function updateCartBadge() {
    try {
        const res = await fetch('../../../backend/student/cart.php');
        const result = await res.json();
        if (result.status === 'success') {
            const cartItems = Object.values(result.data);
            const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
            
            const badges = document.querySelectorAll('.cart-badge');
            badges.forEach(badge => {
                badge.textContent = totalQty;
                badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
            });
        }
    } catch (err) {
        console.error("Failed to load cart badge", err);
    }
}