uiu_canteen_prototype/
│
├── index.html                          # Main landing page (optional: routes to specific logins)
│
├── pages/                              
│   ├── admin/                          # 📊 ADMIN PAGES
│   │   ├── admin_login.html
│   │   ├── admin_verify.html
│   │   ├── admin_dashboard.html
│   │   ├── sales_reports.html
│   │   ├── peak_hour_analytics.html
│   │   ├── promotions_manager.html
│   │   └── system_health_dashboard.html
│   │
│   ├── staff/                          # 👨‍🍳 STAFF PAGES
│   │   ├── staff_login.html
│   │   ├── staff_verify.html
│   │   ├── staff_dashboard.html
│   │   ├── live_order_queue.html
│   │   ├── menu_management.html
│   │   ├── staff_analytics.html
│   │   └── staff_setting.html
│   │
│   └── student/                        # 🎓 STUDENT PAGES
│       ├── student_login.html
│       ├── student_verify.html
│       ├── student_dashboard.html
│       └── student_settings.html
│
├── css/                                # STYLESHEETS
│   ├── global.css                      # Shared fonts, colors, and layout resets
│   ├── admin.css                       # Specific styling for admin dashboards/charts
│   ├── staff.css                       # Specific styling for kitchen queue/kanban
│   └── student.css                     # Specific styling for food menus/cart
│
├── js/                                 # JAVASCRIPT
│   ├── mock_data.js                    # The fake database (dummy orders, menu items)
│   ├── ui_helpers.js                   # Logic for popups, sidebars, and navigation
│   ├── admin.js                        # Logic for charts and admin interactions
│   ├── staff.js                        # Logic for moving orders through the queue
│   └── student.js                      # Logic for adding items to the cart
│
└── assets/                             # STATIC MEDIA
    ├── images/                         # Food images, banners
    └── icons/                          # UI svgs (search, settings, cart)