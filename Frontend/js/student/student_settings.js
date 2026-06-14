document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadOrderHistory();
});

async function loadUserProfile() {
    try {
        const res = await fetch('../../../backend/auth/guard.php');
        const result = await res.json();
        
        if (result.status === 'success') {
            const user = result.data;
            const inputs = document.querySelectorAll('.input-group input');
            
            if(inputs.length >= 3) {
                inputs[0].value = user.name;
                inputs[1].value = user.student_id || 'N/A';
                inputs[2].value = user.email;
            }
        }
    } catch (err) {
        console.error("Failed to load profile", err);
    }
}

async function loadOrderHistory() {
    try {
        const res = await fetch('../../../backend/student/order_history.php');
        const result = await res.json();
        
        if (result.status === 'success') {
            renderHistory(result.data);
        }
    } catch (err) {
        console.error("Failed to load history", err);
    }
}

function renderHistory(orders) {
    const contentDiv = document.querySelector('.content');
    
    // Remove the static HTML history cards to make room for the dynamic ones
    document.querySelectorAll('.order-card').forEach(card => card.remove());

    if (orders.length === 0) {
        const noOrders = document.createElement('p');
        noOrders.textContent = "You have no past orders.";
        noOrders.style.color = "#64748b";
        contentDiv.appendChild(noOrders);
        return;
    }

    orders.forEach(order => {
        // Formats date natively (e.g. Oct 24, 2023)
        const dateObj = new Date(order.created_at);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Get the first item's name to use as the title, or a default string
        const mainItemName = order.items && order.items.length > 0 ? order.items[0].name : 'Canteen Order';
        
        const card = document.createElement('div');
        card.className = 'order-card';
        
        let statusClass = order.status === 'cancelled' ? 'cancelled' : 'delivered'; // Using your CSS classes
        let statusText = order.status.toUpperCase();

        card.innerHTML = `
            <div class="order-left">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=120&auto=format&fit=crop">
                <div>
                    <div class="order-top">
                        <h3>${mainItemName} ${order.items.length > 1 ? `(+${order.items.length - 1} more)` : ''}</h3>
                        <span class="${statusClass}">${statusText}</span>
                    </div>
                    <p>Order #${order.token_no} • ${dateStr} • ${timeStr}</p>
                </div>
            </div>
            <div class="order-price">
                <h2>৳${parseFloat(order.total).toFixed(2)}</h2>
                <span>Receipt</span>
            </div>
        `;
        contentDiv.appendChild(card);
    });
}