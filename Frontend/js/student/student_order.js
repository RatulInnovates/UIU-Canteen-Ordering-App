let currentCart = {};

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutCart();
    
    const placeBtn = document.querySelector('.place-btn');
    if (placeBtn) placeBtn.addEventListener('click', placeOrder);
    
    // UI logic for selecting payment methods
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', (e) => {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});

async function loadCheckoutCart() {
    try {
        // Fetch current active user's cart straight from the database (using 3-folder path)
        const res = await fetch('../../../backend/student/cart.php');
        const result = await res.json();
        
        if (result.status === 'success') {
            currentCart = result.data;
            renderTray(currentCart);
        } else {
            console.error("Failed to fetch cart:", result.message);
        }
    } catch (err) {
        console.error("Failed to load checkout cart", err);
    }
}

function renderTray(cartData) {
    const trayBox = document.querySelector('.tray-box');
    
    // Clear out any old HTML, but keep the Header title
    trayBox.innerHTML = '<h2>Your Tray</h2>';
    
    const items = Object.values(cartData);
    let subtotal = 0;

    if (items.length === 0) {
        trayBox.innerHTML += '<p style="padding: 20px; color: #64748b; font-size: 15px;">Your tray is empty. Go back to the menu to add items.</p>';
        updateSummary(0);
        updateCartBadge(0);
        return;
    }

    // Build the tray dynamically based on database contents
    items.forEach(item => {
        subtotal += (parseFloat(item.price) * parseInt(item.qty));
        
        const trayItem = document.createElement('div');
        trayItem.className = 'tray-item';
        
        // Render exactly matching your CSS design
        trayItem.innerHTML = `
            <div class="tray-info">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>UIU Central Kitchen</p>
                    <div class="quantity-box" style="border: none; padding: 0;">
                        <span style="font-weight: 600; color: #0f172a;">Qty: ${item.qty}</span>
                    </div>
                </div>
            </div>
            <div class="tray-price">
                ৳${(item.price * item.qty).toFixed(2)}
            </div>
        `;
        trayBox.appendChild(trayItem);
    });

    updateSummary(subtotal);
    
    // Update the notification badge in the top navbar
    const totalQty = items.reduce((sum, item) => sum + parseInt(item.qty), 0);
    updateCartBadge(totalQty);
}

function updateSummary(subtotal) {
    const serviceFee = subtotal * 0.05; // 5% fee calculated dynamically
    const total = subtotal + serviceFee;
    
    const summaryRows = document.querySelectorAll('.summary-row span:nth-child(2)');
    if(summaryRows.length >= 2) {
        summaryRows[0].textContent = `৳${subtotal.toFixed(2)}`;
        summaryRows[1].textContent = `৳${serviceFee.toFixed(2)}`;
    }
    
    const totalEl = document.querySelector('.summary-total h1');
    if(totalEl) totalEl.textContent = `৳${total.toFixed(2)}`;
}

function updateCartBadge(totalQty) {
    document.querySelectorAll('.cart-badge').forEach(badge => {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
    });
}

async function placeOrder() {
    const itemsArray = Object.values(currentCart);
    if (itemsArray.length === 0) {
        if(window.UIToast) window.UIToast.show('Your tray is empty!');
        return;
    }

    const note = document.querySelector('.instruction-box textarea').value;
    const paymentMethod = document.querySelector('.payment-option.active').innerText.trim().toLowerCase();

    try {
        // Send order request to the backend order processor (using 3-folder path)
        const res = await fetch('../../../backend/student/order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: note, payment_method: paymentMethod })
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            // Show dynamic Token in UI
            document.querySelector('.queue-box h1').textContent = `#${result.data.token_no}`;
            document.querySelector('.live-box h3').textContent = '● Preparing Order';
            document.querySelector('.live-box h3').style.color = '#22c55e';
            
            if(window.UIToast) window.UIToast.show(`Order placed! Token: #${result.data.token_no}`);
            
            // Redirect to history after 3 seconds
            setTimeout(() => { window.location.href = 'student_settings.html'; }, 3000);
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Checkout failed", err);
    }
}