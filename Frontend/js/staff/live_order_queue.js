// live_order_queue.js

document.addEventListener("DOMContentLoaded", () => {
    fetchOrders();
    setInterval(fetchOrders, 5000); // Poll every 5s
});

function fetchOrders() {
    fetch('../../../backend/staff/order_queue.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                renderOrders('incoming', data.data.incoming || []);
                renderOrders('preparing', data.data.preparing || []);
                renderOrders('ready', data.data.ready || []);
                renderOrders('collected', data.data.collected || []);
            }
        });
}

function renderOrders(status, orders) {
    document.getElementById(`count-${status}`).innerText = orders.length < 10 ? '0' + orders.length : orders.length;
    const col = document.getElementById(`col-${status}`);
    col.innerHTML = '';

    orders.forEach(order => {
        let cardHTML = '';
        const av = order.customer_name.substring(0, 2).toUpperCase();

        if (status === 'incoming') {
            cardHTML = `
            <div class="card basic-card">
                <div class="card-top">
                    <p class="token-label">TOKEN ID</p>
                    <p class="chevron">></p>
                </div>
                <h3 class="token-number">#${order.token_no}</h3>
                <div class="customer-info">
                    <div class="cust-av">${av}</div>
                    <p class="cust-name">${order.customer_name}</p>
                </div>
                <div class="card-bottom">
                    <p class="item-meta">${order.items_count} Items • ${order.time_ago}</p>
                    <button class="btn btn-start-prepare" onclick="updateStatus(${order.id}, 'preparing')">Start Preparing</button>
                </div>
                <div style="font-size: 12px; color: #aaa; margin-top: 10px;">${order.items_str}</div>
            </div>`;
        } 
        else if (status === 'preparing') {
            cardHTML = `
            <div class="card active-prep-card">
                <div class="card-top">
                    <p class="token-label">TOKEN ID</p>
                </div>
                <h3 class="token-number">#${order.token_no}</h3>
                <div class="customer-info">
                    <div class="cust-av">${av}</div>
                    <p class="cust-name">${order.customer_name}</p>
                </div>
                <p class="items-list" style="margin-bottom: 12px;">${order.items_str}</p>
                <div class="progress-section">
                    <div class="prog-labels">
                        <span>PREPARING</span>
                    </div>
                    <div class="progress-bar">
                        <progress value="50" max="100" style="accent-color: #84532C;"></progress>
                    </div>
                </div>
                <button class="btn btn-ready" onclick="updateStatus(${order.id}, 'ready')">Mark as Ready</button>
            </div>`;
        }
        else if (status === 'ready') {
            cardHTML = `
            <div class="card ready-list-card flex-between">
                <div class="flex-row">
                    <div class="token-circle circle-blue">${order.token_no.toString().slice(-2)}</div>
                    <div class="ready-info">
                        <p class="ready-name">${order.customer_name}</p>
                        <p class="ready-time">Ready ${order.time_ago}</p>
                    </div>
                </div>
                <div class="action-buttons-small">
                    <button class="btn btn-solid-small" onclick="updateStatus(${order.id}, 'collected')">Collected</button>
                </div>
            </div>`;
        }
        else if (status === 'collected') {
            cardHTML = `
            <div class="card completed-card">
                <div class="card-top">
                    <p class="token-label">TOKEN ID</p>
                </div>
                <h3 class="token-number">#${order.token_no}</h3>
                <div class="customer-info">
                    <div class="cust-av">${av}</div>
                    <p class="cust-name">${order.customer_name}</p>
                </div>
                <div class="card-bottom">
                    <p class="item-meta">${order.items_count} Items • ${order.time_ago}</p>
                    <span class="pill pill-completed">Collected</span>
                </div>
            </div>`;
        }

        col.innerHTML += cardHTML;
    });
}

function updateStatus(orderId, newStatus) {
    fetch('../../../backend/staff/order_queue.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', order_id: orderId, new_status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            fetchOrders();
        } else {
            alert('Error updating status: ' + data.message);
        }
    });
}
