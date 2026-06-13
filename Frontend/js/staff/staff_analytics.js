document.addEventListener("DOMContentLoaded", () => {
    fetchAnalytics();
});

function fetchAnalytics() {
    fetch('../../../backend/staff/analytics.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                // Revenue
                document.querySelector('.revenue-amount').innerText = '৳' + data.data.revenue;
                
                // Top Items
                const topItemsContainer = document.querySelector('.items-card');
                // Remove existing item rows
                document.querySelectorAll('.top-item-row').forEach(e => e.remove());
                
                let itemsHTML = '';
                let maxSales = data.data.top_items.length > 0 ? data.data.top_items[0].sales : 1;
                
                data.data.top_items.forEach(item => {
                    let percent = (item.sales / maxSales) * 100;
                    itemsHTML += `
                    <div class="top-item-row">
                        <img src="${item.image_url}" alt="${item.name}" class="item-img">
                        <div class="item-info">
                            <span class="item-name">${item.name} (${item.sales} sold)</span>
                            <div class="item-bar-wrap">
                                <div class="item-bar" style="width: ${percent}%;"></div>
                            </div>
                        </div>
                        <span class="item-price">৳${item.price}</span>
                    </div>`;
                });
                // Insert items right after header
                document.querySelector('.items-header').insertAdjacentHTML('afterend', itemsHTML);
                
                // Transactions Table
                const tbody = document.querySelector('.transactions-table tbody');
                tbody.innerHTML = '';
                
                data.data.transactions.forEach(tx => {
                    let statusClass = tx.status === 'collected' ? 'status-completed' : 'status-processing';
                    tbody.innerHTML += `
                        <tr>
                            <td class="order-id">#ORD-${tx.id}</td>
                            <td>${tx.items_str}</td>
                            <td>${tx.time_formatted}</td>
                            <td>৳${tx.total}</td>
                            <td><span class="status-badge ${statusClass}">${tx.status.toUpperCase()}</span></td>
                        </tr>
                    `;
                });
            }
        });
}
