document.addEventListener('DOMContentLoaded', () => {
    fetchAuthStatus();
    updateCartBadge();
});

async function fetchAuthStatus() {
    try {
        const res = await fetch('../../backend/auth/guard.php');
        const result = await res.json();
        if (result.status === 'error') {
            window.location.href = '../../index.html'; // Redirect to login if not authenticated
        }
    } catch (err) {
        console.error("Auth check failed", err);
    }
}

async function updateCartBadge() {
    try {
        const res = await fetch('../../backend/student/cart.php');
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