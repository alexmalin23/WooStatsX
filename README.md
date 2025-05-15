# WooStatsX - Advanced Analytics for WooCommerce

WooStatsX is a modern analytics dashboard plugin for WooCommerce that provides detailed insights into your store's performance. Track sales, top products, best sales days, and leading customers with a clean, modern UI.

## Features

- **Overview Dashboard**: KPI cards showing total sales, orders, and average order value
- **Revenue Trend**: Visualize your revenue trends over time
- **Top Products**: See your best-selling products with charts and tables
- **Top Customers**: Identify and analyze your most valuable customers
- **Sales Day Analysis**: Discover your best sales days with a heatmap visualization
- **Advanced Analytics**: Track refunds and coupon usage

## Requirements

- WordPress 5.8+
- WooCommerce 5.0+
- PHP 7.4+

## Installation

1. Download the plugin zip file
2. Go to WordPress Admin > Plugins > Add New
3. Click "Upload Plugin" and select the downloaded zip file
4. Activate the plugin through the 'Plugins' menu in WordPress
5. Access the dashboard from the "WooStatsX" menu in your admin sidebar

## Development

### Backend

The plugin utilizes WordPress REST API endpoints for data retrieval with optimized SQL queries and caching via transients. All data is automatically refreshed when new orders are placed or refunds are processed.

### Frontend

The frontend is built with:
- React 18
- TypeScript
- TanStack Query (React Query) for data fetching
- Chart.js for visualizations
- Tailwind CSS for styling

To build the frontend:

1. Install dependencies:
```
npm install
```

2. Run development server:
```
npm run dev
```

3. Build for production:
```
npm run build
```

## License

GPL v2 or later

## Support

For support, please create an issue on the GitHub repository or contact the plugin author. 