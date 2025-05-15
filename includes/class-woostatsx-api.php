<?php
/**
 * WooStatsX API
 * 
 * Handles all REST API endpoints for the WooStatsX plugin
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class WooStatsX_API {
    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route('woostatsx/v1', '/stats', [
            'methods' => 'GET',
            'callback' => [$this, 'get_stats'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('woostatsx/v1', '/products', [
            'methods' => 'GET',
            'callback' => [$this, 'get_top_products'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('woostatsx/v1', '/revenue-trend', [
            'methods' => 'GET',
            'callback' => [$this, 'get_revenue_trend'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('woostatsx/v1', '/customers', [
            'methods' => 'GET',
            'callback' => [$this, 'get_top_customers'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('woostatsx/v1', '/sales-days', [
            'methods' => 'GET',
            'callback' => [$this, 'get_best_sales_days'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('woostatsx/v1', '/refunds', [
            'methods' => 'GET',
            'callback' => [$this, 'get_refunds'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('woostatsx/v1', '/coupons', [
            'methods' => 'GET',
            'callback' => [$this, 'get_coupons_used'],
            'permission_callback' => [$this, 'check_permission'],
        ]);

        register_rest_route('woostatsx/v1', '/refresh', [
            'methods' => 'POST',
            'callback' => [$this, 'refresh_cache'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }

    /**
     * Check if user has permission to access the API
     */
    public function check_permission() {
        return current_user_can('manage_woocommerce');
    }

    /**
     * Get date range from request parameters
     */
    private function get_date_range($request) {
        // Check if the all_time parameter is set
        $all_time = filter_var($request->get_param('all_time') ?? false, FILTER_VALIDATE_BOOLEAN);
        
        if ($all_time) {
            // Return a date range from the oldest possible date to now
            return [
                'from' => '1970-01-01', // A very early date to ensure all orders are included
                'to' => date('Y-m-d') . ' 23:59:59', // Today, end of day
                'is_all_time' => true,
            ];
        }
        
        $from = sanitize_text_field($request->get_param('from') ?? '');
        $to = sanitize_text_field($request->get_param('to') ?? '');

        // If no date range is specified, default to last 30 days
        if (empty($from) && empty($to)) {
            return [
                'from' => date('Y-m-d', strtotime('-30 days')),
                'to' => date('Y-m-d') . ' 23:59:59', // Today, end of day
                'is_all_time' => false,
            ];
        }
        
        if (empty($from)) {
            // Default to last 30 days if only 'to' is specified
            $from = date('Y-m-d', strtotime('-30 days'));
        }

        if (empty($to)) {
            $to = date('Y-m-d');
        }

        return [
            'from' => $from,
            'to' => $to . ' 23:59:59', // Include the entire 'to' day
            'is_all_time' => false,
        ];
    }

    /**
     * Get cache key based on endpoint and parameters
     */
    private function get_cache_key($endpoint, $params = []) {
        return 'woostatsx_' . $endpoint . '_' . md5(serialize($params));
    }

    /**
     * Get overview stats (KPIs)
     */
    public function get_stats($request) {
        $date_range = $this->get_date_range($request);
        $cache_key = $this->get_cache_key('stats', $date_range);
        
        // Try to get from cache
        $stats = get_transient($cache_key);
        if ($stats !== false) {
            return rest_ensure_response($stats);
        }

        global $wpdb;
        
        // Get completed and processing orders within date range
        $order_statuses = "'wc-completed', 'wc-processing'";
        
        // Total sales
        $total_sales = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(meta_value) 
                FROM {$wpdb->posts} p
                JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                WHERE p.post_type = 'shop_order'
                AND p.post_status IN ($order_statuses)
                AND p.post_date BETWEEN %s AND %s
                AND pm.meta_key = '_order_total'",
                $date_range['from'],
                $date_range['to']
            )
        );
        
        // Total orders
        $total_orders = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(ID) 
                FROM {$wpdb->posts}
                WHERE post_type = 'shop_order'
                AND post_status IN ($order_statuses)
                AND post_date BETWEEN %s AND %s",
                $date_range['from'],
                $date_range['to']
            )
        );
        
        // Average order value
        $average_order_value = $total_orders > 0 ? $total_sales / $total_orders : 0;
        
        $stats = [
            'total_sales' => (float) $total_sales,
            'total_orders' => (int) $total_orders,
            'average_order_value' => (float) $average_order_value,
            'date_range' => $date_range,
        ];
        
        // Store in cache for 12 hours
        set_transient($cache_key, $stats, 12 * HOUR_IN_SECONDS);
        
        return rest_ensure_response($stats);
    }

    /**
     * Get top selling products
     */
    public function get_top_products($request) {
        $date_range = $this->get_date_range($request);
        $limit = (int) ($request->get_param('limit') ?? 10);
        $cache_key = $this->get_cache_key('top_products', array_merge($date_range, ['limit' => $limit]));
        
        // Try to get from cache
        $products = get_transient($cache_key);
        if ($products !== false) {
            return rest_ensure_response($products);
        }

        global $wpdb;
        
        $order_statuses = "'wc-completed', 'wc-processing'";
        
        $products = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    oi.order_item_name as name,
                    SUM(oim.meta_value) as quantity,
                    SUM(oim2.meta_value) as total
                FROM {$wpdb->prefix}woocommerce_order_items oi
                JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim ON oi.order_item_id = oim.order_item_id
                JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim2 ON oi.order_item_id = oim2.order_item_id
                JOIN {$wpdb->posts} p ON oi.order_id = p.ID
                WHERE oi.order_item_type = 'line_item'
                AND p.post_type = 'shop_order'
                AND p.post_status IN ($order_statuses)
                AND p.post_date BETWEEN %s AND %s
                AND oim.meta_key = '_qty'
                AND oim2.meta_key = '_line_total'
                GROUP BY oi.order_item_name
                ORDER BY total DESC
                LIMIT %d",
                $date_range['from'],
                $date_range['to'],
                $limit
            ),
            ARRAY_A
        );
        
        // Convert values to proper types
        foreach ($products as &$product) {
            $product['quantity'] = (int) $product['quantity'];
            $product['total'] = (float) $product['total'];
        }
        
        // Store in cache for 12 hours
        set_transient($cache_key, $products, 12 * HOUR_IN_SECONDS);
        
        return rest_ensure_response($products);
    }

    /**
     * Get revenue trend by day/week/month
     */
    public function get_revenue_trend($request) {
        $date_range = $this->get_date_range($request);
        $interval = sanitize_text_field($request->get_param('interval') ?? 'day');
        $cache_key = $this->get_cache_key('revenue_trend', array_merge($date_range, ['interval' => $interval]));
        
        // Try to get from cache
        $revenue_trend = get_transient($cache_key);
        if ($revenue_trend !== false) {
            return rest_ensure_response($revenue_trend);
        }

        global $wpdb;
        
        $order_statuses = "'wc-completed', 'wc-processing'";
        
        $format = '%Y-%m-%d';
        $group_by = 'YEAR(p.post_date), MONTH(p.post_date), DAY(p.post_date)';
        
        if ($interval === 'week') {
            $format = '%Y-%u'; // Year and week number
            $group_by = 'YEAR(p.post_date), WEEK(p.post_date)';
        } elseif ($interval === 'month') {
            $format = '%Y-%m';
            $group_by = 'YEAR(p.post_date), MONTH(p.post_date)';
        }
        
        $revenue_trend = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE_FORMAT(p.post_date, %s) as period,
                    SUM(pm.meta_value) as total
                FROM {$wpdb->posts} p
                JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                WHERE p.post_type = 'shop_order'
                AND p.post_status IN ($order_statuses)
                AND p.post_date BETWEEN %s AND %s
                AND pm.meta_key = '_order_total'
                GROUP BY $group_by
                ORDER BY p.post_date ASC",
                $format,
                $date_range['from'],
                $date_range['to']
            ),
            ARRAY_A
        );
        
        // Convert values to proper types
        foreach ($revenue_trend as &$item) {
            $item['total'] = (float) $item['total'];
        }
        
        // Store in cache for 12 hours
        set_transient($cache_key, $revenue_trend, 12 * HOUR_IN_SECONDS);
        
        return rest_ensure_response($revenue_trend);
    }

    /**
     * Get top customers
     */
    public function get_top_customers($request) {
        $date_range = $this->get_date_range($request);
        $limit = (int) ($request->get_param('limit') ?? 10);
        $cache_key = $this->get_cache_key('top_customers', array_merge($date_range, ['limit' => $limit]));
        
        // Try to get from cache
        $customers = get_transient($cache_key);
        if ($customers !== false) {
            return rest_ensure_response($customers);
        }

        global $wpdb;
        
        $order_statuses = "'wc-completed', 'wc-processing'";
        
        $customers = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    pm_billing_email.meta_value as email,
                    CONCAT(pm_billing_first.meta_value, ' ', pm_billing_last.meta_value) as name,
                    COUNT(p.ID) as order_count,
                    SUM(pm_total.meta_value) as total_spent
                FROM {$wpdb->posts} p
                JOIN {$wpdb->postmeta} pm_billing_email ON p.ID = pm_billing_email.post_id AND pm_billing_email.meta_key = '_billing_email'
                JOIN {$wpdb->postmeta} pm_billing_first ON p.ID = pm_billing_first.post_id AND pm_billing_first.meta_key = '_billing_first_name'
                JOIN {$wpdb->postmeta} pm_billing_last ON p.ID = pm_billing_last.post_id AND pm_billing_last.meta_key = '_billing_last_name'
                JOIN {$wpdb->postmeta} pm_total ON p.ID = pm_total.post_id AND pm_total.meta_key = '_order_total'
                WHERE p.post_type = 'shop_order'
                AND p.post_status IN ($order_statuses)
                AND p.post_date BETWEEN %s AND %s
                GROUP BY pm_billing_email.meta_value
                ORDER BY total_spent DESC
                LIMIT %d",
                $date_range['from'],
                $date_range['to'],
                $limit
            ),
            ARRAY_A
        );
        
        // Convert values to proper types
        foreach ($customers as &$customer) {
            $customer['order_count'] = (int) $customer['order_count'];
            $customer['total_spent'] = (float) $customer['total_spent'];
        }
        
        // Store in cache for 12 hours
        set_transient($cache_key, $customers, 12 * HOUR_IN_SECONDS);
        
        return rest_ensure_response($customers);
    }

    /**
     * Get best sales days
     */
    public function get_best_sales_days($request) {
        $date_range = $this->get_date_range($request);
        $limit = (int) ($request->get_param('limit') ?? 10);
        $cache_key = $this->get_cache_key('best_sales_days', array_merge($date_range, ['limit' => $limit]));
        
        // Try to get from cache
        $sales_days = get_transient($cache_key);
        if ($sales_days !== false) {
            return rest_ensure_response($sales_days);
        }

        global $wpdb;
        
        $order_statuses = "'wc-completed', 'wc-processing'";
        
        $sales_days = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE(p.post_date) as date,
                    COUNT(p.ID) as order_count,
                    SUM(pm.meta_value) as total
                FROM {$wpdb->posts} p
                JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                WHERE p.post_type = 'shop_order'
                AND p.post_status IN ($order_statuses)
                AND p.post_date BETWEEN %s AND %s
                AND pm.meta_key = '_order_total'
                GROUP BY DATE(p.post_date)
                ORDER BY total DESC
                LIMIT %d",
                $date_range['from'],
                $date_range['to'],
                $limit
            ),
            ARRAY_A
        );
        
        // Convert values to proper types
        foreach ($sales_days as &$day) {
            $day['order_count'] = (int) $day['order_count'];
            $day['total'] = (float) $day['total'];
        }
        
        // Store in cache for 12 hours
        set_transient($cache_key, $sales_days, 12 * HOUR_IN_SECONDS);
        
        return rest_ensure_response($sales_days);
    }

    /**
     * Get refunds
     */
    public function get_refunds($request) {
        $date_range = $this->get_date_range($request);
        $cache_key = $this->get_cache_key('refunds', $date_range);
        
        // Try to get from cache
        $refunds = get_transient($cache_key);
        if ($refunds !== false) {
            return rest_ensure_response($refunds);
        }

        global $wpdb;
        
        $refunds = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE(p.post_date) as date,
                    COUNT(p.ID) as refund_count,
                    SUM(ABS(pm.meta_value)) as total
                FROM {$wpdb->posts} p
                JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                WHERE p.post_type = 'shop_order_refund'
                AND p.post_date BETWEEN %s AND %s
                AND pm.meta_key = '_refund_amount'
                GROUP BY DATE(p.post_date)
                ORDER BY date ASC",
                $date_range['from'],
                $date_range['to']
            ),
            ARRAY_A
        );
        
        // Convert values to proper types
        foreach ($refunds as &$refund) {
            $refund['refund_count'] = (int) $refund['refund_count'];
            $refund['total'] = (float) $refund['total'];
        }
        
        // Get total refund amount
        $total_refund_amount = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT 
                    SUM(ABS(pm.meta_value))
                FROM {$wpdb->posts} p
                JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
                WHERE p.post_type = 'shop_order_refund'
                AND p.post_date BETWEEN %s AND %s
                AND pm.meta_key = '_refund_amount'",
                $date_range['from'],
                $date_range['to']
            )
        );
        
        $result = [
            'total_refund_amount' => (float) $total_refund_amount,
            'refund_count' => count($refunds),
            'refunds' => $refunds,
        ];
        
        // Store in cache for 12 hours
        set_transient($cache_key, $result, 12 * HOUR_IN_SECONDS);
        
        return rest_ensure_response($result);
    }

    /**
     * Get coupons used
     */
    public function get_coupons_used($request) {
        $date_range = $this->get_date_range($request);
        $cache_key = $this->get_cache_key('coupons', $date_range);
        
        // Try to get from cache
        $coupons = get_transient($cache_key);
        if ($coupons !== false) {
            return rest_ensure_response($coupons);
        }

        global $wpdb;
        
        $order_statuses = "'wc-completed', 'wc-processing'";
        
        $coupons = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    oi.order_item_name as code,
                    COUNT(oi.order_item_id) as usage_count,
                    SUM(oim.meta_value) as discount_amount
                FROM {$wpdb->prefix}woocommerce_order_items oi
                JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim ON oi.order_item_id = oim.order_item_id
                JOIN {$wpdb->posts} p ON oi.order_id = p.ID
                WHERE oi.order_item_type = 'coupon'
                AND p.post_type = 'shop_order'
                AND p.post_status IN ($order_statuses)
                AND p.post_date BETWEEN %s AND %s
                AND oim.meta_key = 'discount_amount'
                GROUP BY oi.order_item_name
                ORDER BY usage_count DESC",
                $date_range['from'],
                $date_range['to']
            ),
            ARRAY_A
        );
        
        // Convert values to proper types
        foreach ($coupons as &$coupon) {
            $coupon['usage_count'] = (int) $coupon['usage_count'];
            $coupon['discount_amount'] = (float) $coupon['discount_amount'];
        }
        
        // Store in cache for 12 hours
        set_transient($cache_key, $coupons, 12 * HOUR_IN_SECONDS);
        
        return rest_ensure_response($coupons);
    }

    /**
     * Refresh cache (manual trigger)
     */
    public function refresh_cache() {
        // Delete all WooStatsX transients
        global $wpdb;
        
        $deleted = $wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '%_transient_woostatsx_%'");
        
        return rest_ensure_response([
            'success' => true,
            'message' => sprintf(__('Cache refreshed. %d items deleted.', 'woostatsx'), $deleted),
        ]);
    }
} 