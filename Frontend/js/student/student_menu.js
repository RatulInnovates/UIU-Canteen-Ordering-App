document.addEventListener('DOMContentLoaded', () => {
    clearCartOnLoad().then(() => {
        loadMenuFromDatabase();
        setupFilters();
    });
});

async function clearCartOnLoad() {
    try {
        // Changed path to go up 3 folders
        await fetch('../../../backend/student/cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear' })
        });
        updateCartBadge(0);
    } catch (err) {
        console.error("Failed to clear cart", err);
    }
}

async function loadMenuFromDatabase() {
    try {
        // Changed path to go up 3 folders
        const res = await fetch('../../../backend/student/menu.php');
        const result = await res.json();
        
        if (result.status === 'success') {
            renderMenu(result.data);
        } else {
            console.error("Backend error:", result.message);
        }
    } catch (err) {
        console.error("Failed to fetch menu", err);
    }
}

function renderMenu(items) {
    document.querySelectorAll('.menu-grid').forEach(grid => grid.innerHTML = '');

    items.forEach(item => {
        const categorySection = document.querySelector(`section[data-cat="${item.category}"] .menu-grid`);
        if (!categorySection) return;

        const tile = document.createElement('article');
        tile.className = 'menu-tile';
        tile.dataset.tags = item.category;

        let badgeHtml = '';
        if (item.badge) {
            let badgeClass = 'menu-badge';
            if (item.badge.toLowerCase() === 'veg') badgeClass += ' menu-badge-veg';
            if (item.badge.toLowerCase() === 'popular') badgeClass += ' menu-badge-hot';
            badgeHtml = `<span class="${badgeClass}">${item.badge}</span>`;
        }

        tile.innerHTML = `
            <div class="menu-tile-img-wrap">
                <img src="${item.image_url}" alt="${item.name}" loading="lazy">
                ${badgeHtml}
            </div>
            <div class="menu-tile-body">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <div class="menu-tile-meta">
                    <span class="menu-price">৳${parseFloat(item.price).toFixed(2)}</span>
                    <a href="#" class="btn-add-cart" onclick="event.preventDefault(); addToCart(${item.id})">Add +</a>
                </div>
            </div>
        `;
        categorySection.appendChild(tile);
    });
}

async function addToCart(itemId) {
    try {
        // Changed path to go up 3 folders
        const res = await fetch('../../../backend/student/cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', item_id: itemId, qty: 1 })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            const cartItems = Object.values(result.data.cart);
            const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
            updateCartBadge(totalQty);
            
            if (window.UIToast) window.UIToast.show('Item added to tray!');
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Add to cart failed", err);
    }
}

function updateCartBadge(totalQty) {
    document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
    });
}

function setupFilters() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            chips.forEach(c => c.classList.remove('chip-active'));
            e.target.classList.add('chip-active');
            
            const filter = e.target.getAttribute('data-filter');
            document.querySelectorAll('.menu-category').forEach(section => {
                section.style.display = (filter === 'all' || section.getAttribute('data-cat') === filter) ? 'block' : 'none';
            });
        });
    });
}