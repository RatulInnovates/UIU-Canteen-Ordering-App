// Frontend/js/admin/admin_dashboard.js
document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
    setInterval(fetchDashboardData, 10000); // refresh every 10 seconds

    // Search input filtering for top items
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const items = document.querySelectorAll('.top-item-card');
            items.forEach(item => {
                const name = item.querySelector('.top-item-name').textContent.toLowerCase();
                if (name.includes(query)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});

function fetchDashboardData() {
    fetch('../../../backend/admin/dashboard.php')
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                const data = resData.data;

                // Update Revenue
                const revCard = document.querySelector('.stat-card:nth-child(1) .stat-value');
                if (revCard) {
                    revCard.textContent = `৳${parseFloat(data.daily_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                }

                // Update Active Orders
                const activeCard = document.querySelector('.stat-card:nth-child(2) .stat-value');
                if (activeCard) {
                    activeCard.textContent = data.active_orders;
                }
                const activeSub = document.querySelector('.stat-card:nth-child(2) .stat-sub');
                if (activeSub) {
                    activeSub.textContent = `${data.in_queue} IN QUEUE | ${data.preparing} PREP`;
                }

                // Update Capacity Percentage / Progress Bar
                const capacityCard = document.querySelector('.stat-card:nth-child(3) .stat-value');
                if (capacityCard) {
                    capacityCard.innerHTML = `${data.capacity_percentage}% <span class="capacity-label">capacity</span>`;
                }
                const progress = document.querySelector('.stat-card:nth-child(3) .progress-bar');
                if (progress) {
                    progress.style.width = `${Math.min(data.capacity_percentage, 100)}%`;
                }

                // Update Sales Share Pie Chart
                const pieChart = document.getElementById('salesPieChart');
                const pieLegend = document.getElementById('salesPieLegend');
                if (pieChart && pieLegend && data.top_items) {
                    pieLegend.innerHTML = '';
                    
                    const itemsWithSales = data.top_items.filter(item => parseInt(item.sales_count) > 0);
                    
                    if (itemsWithSales.length === 0) {
                        pieChart.style.background = 'conic-gradient(#888 0% 100%)';
                        pieLegend.innerHTML = '<div style="font-size: 12px; color: #888;">No sales data today.</div>';
                    } else {
                        const totalSales = itemsWithSales.reduce((acc, item) => acc + parseInt(item.sales_count), 0);
                        const colors = ['#f0a040', '#7c3aed', '#2563eb', '#10b981', '#ef4444'];
                        
                        let currentAngle = 0;
                        const gradientParts = [];
                        
                        itemsWithSales.forEach((item, index) => {
                            const count = parseInt(item.sales_count);
                            const pct = Math.round((count / totalSales) * 100);
                            const color = colors[index % colors.length];
                            
                            const nextAngle = currentAngle + pct;
                            gradientParts.push(`${color} ${currentAngle}% ${nextAngle}%`);
                            currentAngle = nextAngle;
                            
                            const legendRow = `
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 4px;">
                                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${color};"></span>
                                    <span>${item.name} <strong>${pct}%</strong> (${count} sold)</span>
                                </div>
                            `;
                            pieLegend.innerHTML += legendRow;
                        });
                        
                        pieChart.style.background = `conic-gradient(${gradientParts.join(', ')})`;
                    }
                }

                // Update Top Performing Items
                const topItemsList = document.querySelector('.top-items-list');
                if (topItemsList && data.top_items) {
                    topItemsList.innerHTML = '';
                    data.top_items.forEach(item => {
                        const html = `
                            <div class="top-item-card">
                                <img src="${item.image_url}" alt="${item.name}" class="top-item-img" onerror="this.src='https://via.placeholder.com/100'" />
                                <div class="top-item-info">
                                    <span class="top-item-name">${item.name}</span>
                                    <div class="top-item-sub">${item.sales_count} Sales today</div>
                                    <div class="top-item-meta">
                                        <span class="top-item-price">৳${parseFloat(item.revenue).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        topItemsList.innerHTML += html;
                    });
                }

                // Update Line Chart
                if (data.hourly_revenue) {
                    drawLineChart(data.hourly_revenue);
                }

                // Update Recent Orders Feed
                if (data.recent_orders) {
                    renderRecentOrders(data.recent_orders);
                }
            }
        })
        .catch(err => console.error("Error loading dashboard data:", err));
}

function drawLineChart(hourlyRevenue) {
    const svg = document.getElementById("revenueLineChart");
    if (!svg) return;

    const chartLine = document.getElementById("chartLine");
    const chartArea = document.getElementById("chartArea");
    const chartDots = document.getElementById("chartDots");
    const chartLabels = document.getElementById("chartLabels");

    if (!chartLine || !chartArea || !chartDots || !chartLabels) return;

    // Clear previous dynamic elements
    chartDots.innerHTML = '';
    chartLabels.innerHTML = '';

    const width = 600;
    const height = 150;
    const paddingLeft = 50;
    const paddingRight = 40;
    const paddingTop = 35;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Find max value to scale Y axis
    const maxVal = Math.max(...hourlyRevenue.map(d => d.value), 100);

    const points = [];
    hourlyRevenue.forEach((d, i) => {
        const x = paddingLeft + (i / (hourlyRevenue.length - 1)) * chartWidth;
        const y = height - paddingBottom - (d.value / maxVal) * chartHeight;
        points.push({ x, y, label: d.label, value: d.value });
    });

    // Generate Path Data string
    let pathD = "";
    points.forEach((p, i) => {
        if (i === 0) {
            pathD += `M ${p.x} ${p.y}`;
        } else {
            pathD += ` L ${p.x} ${p.y}`;
        }
    });

    // Set line path
    chartLine.setAttribute("d", pathD);

    // Set gradient area path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    chartArea.setAttribute("d", areaD);

    // Draw dots and labels
    points.forEach((p, i) => {
        // Draw Dot
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x);
        circle.setAttribute("cy", p.y);
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", "#f0a040");
        circle.setAttribute("stroke", "#222");
        circle.setAttribute("stroke-width", 2);

        // Add tooltip overlay
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `${p.label} - ৳${parseFloat(p.value).toLocaleString()}`;
        circle.appendChild(title);

        chartDots.appendChild(circle);

        // Draw Label under the points (X Axis time labels)
        const textX = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textX.setAttribute("x", p.x);
        textX.setAttribute("y", height - 8);
        textX.setAttribute("fill", "#888");
        textX.setAttribute("font-size", "9");
        textX.setAttribute("text-anchor", "middle");
        textX.textContent = p.label;
        chartLabels.appendChild(textX);

        // Draw Value text above point
        const textVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textVal.setAttribute("x", p.x);
        textVal.setAttribute("y", p.y - 8);
        textVal.setAttribute("fill", "#fff");
        textVal.setAttribute("font-size", "9");
        textVal.setAttribute("text-anchor", "middle");
        textVal.textContent = `৳${Math.round(p.value)}`;
        chartLabels.appendChild(textVal);
    });

    // Update Y axis labels dynamically
    const maxText = document.getElementById("revenueMaxText");
    if (maxText) {
        maxText.textContent = `৳${Math.round(maxVal)}`;
    }
    const midText = document.getElementById("revenueMidText");
    if (midText) {
        midText.textContent = `৳${Math.round(maxVal / 2)}`;
    }
}

function renderRecentOrders(orders) {
    const list = document.getElementById("recentOrdersList");
    if (!list) return;

    if (!orders || orders.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No recent orders today.</div>';
        return;
    }

    list.innerHTML = '';
    orders.forEach(order => {
        const html = `
            <div class="feed-item">
                <div class="feed-left">
                    <span class="feed-user">${order.customer_name}</span>
                    <span class="feed-token">Token #${order.token_no}</span>
                </div>
                <div class="feed-right">
                    <span class="feed-price">৳${parseFloat(order.total).toLocaleString()}</span>
                    <span class="feed-status status-${order.status}">${order.status}</span>
                    <span class="feed-time">${order.time_ago}</span>
                </div>
            </div>
        `;
        list.innerHTML += html;
    });
}
