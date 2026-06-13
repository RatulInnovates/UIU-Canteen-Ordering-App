// staff_dashboard.js

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
    fetchMenuOptions();

    setInterval(fetchDashboardData, 5000); // Poll every 5s

    // Manual Order Entry
    const btnCreate = document.getElementById("btnCreateOrder");
    btnCreate.addEventListener("click", () => {
        const itemId = document.getElementById("manualItem").value;
        const tokenNo = document.getElementById("manualToken").value;
        const type = document.getElementById("manualType").value;

        if (!itemId || !tokenNo) {
            alert("Please select an item and enter a token number.");
            return;
        }

        const data = {
            action: 'create_order',
            item_id: itemId,
            token_no: tokenNo,
            type: type
        };

        fetch('../../../backend/staff/dashboard.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                alert("Order created successfully!");
                document.getElementById("manualToken").value = '';
                fetchDashboardData();
            } else {
                alert("Error: " + resData.message);
            }
        });
    });
});

function fetchDashboardData() {
    fetch('../../../backend/staff/dashboard.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const queueDiv = document.getElementById("liveQueue");
                queueDiv.innerHTML = "";

                data.data.forEach(order => {
                    const statusPill = order.status === 'incoming' 
                        ? `<span class="pill" style="background: rgba(255, 193, 7, 0.2); color: #ffc107;">INCOMING</span>`
                        : `<span class="pill pill-inqueue">PREPARING</span>`;

                    const html = `
                    <div class="queue-card flex-between">
                        <div class="flex-row">
                            <img src="${order.image_url}" class="food-img">
                            <div>
                                <h4 class="item-title">${order.item_name}</h4>
                                <p class="item-subtitle">TOKEN #${order.token_no} • ${order.customer_name}</p>
                            </div>
                        </div>
                        <div class="flex-row">
                            <div class="time-box">
                                <p class="time-label">ELAPSED</p>
                                <h3 class="time-value">${order.elapsed}</h3>
                            </div>
                            ${statusPill}
                        </div>
                    </div>`;
                    queueDiv.innerHTML += html;
                });
            }
        });
}

function fetchMenuOptions() {
    fetch('../../../backend/staff/dashboard.php?action=get_menu')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const select = document.getElementById("manualItem");
                data.data.forEach(item => {
                    select.innerHTML += `<option value="${item.id}">${item.name} - ৳${item.price}</option>`;
                });
            }
        });
}
