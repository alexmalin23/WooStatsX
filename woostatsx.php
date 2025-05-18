<?php
/**
 * Plugin Name: WooStatsX
 * Description: Advanced analytics dashboard for WooCommerce
 * Version: 1.0.0
 * Author: Alex Malin
 * Text Domain: alexmalin23@gmail.com
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WOOSTATSX_VERSION', '1.0.0');
define('WOOSTATSX_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WOOSTATSX_PLUGIN_URL', plugin_dir_url(__FILE__));

// Check if WooCommerce is active
function woostatsx_is_woocommerce_active() {
    return in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')));
}

// Main plugin class
class WooStatsX {
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Only initialize if WooCommerce is active
        if (!woostatsx_is_woocommerce_active()) {
            add_action('admin_notices', [$this, 'woocommerce_not_active_notice']);
            return;
        }

        // Initialize plugin components
        $this->init();

        // Admin hooks
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        
        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        
        // Hook into WooCommerce events for cache invalidation
        add_action('woocommerce_new_order', [$this, 'invalidate_cache']);
        add_action('woocommerce_order_status_changed', [$this, 'invalidate_cache']);
        add_action('woocommerce_order_refunded', [$this, 'invalidate_cache']);
    }

    public function init() {
        // Include required files
        require_once WOOSTATSX_PLUGIN_DIR . 'includes/class-woostatsx-api.php';
    }

    public function add_admin_menu() {
        add_menu_page(
            __('WooStatsX', 'woostatsx'),
            __('WooStatsX', 'woostatsx'),
            'manage_woocommerce',
            'woostatsx',
            [$this, 'render_dashboard_page'],
            'dashicons-chart-bar',
            56
        );
    }

    public function render_dashboard_page() {
        echo '<div id="woostatsx-dashboard" class="wrap"></div>';
    }

    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_woostatsx') {
            return;
        }

        // Enqueue React app assets
        wp_enqueue_style(
            'woostatsx-styles',
            WOOSTATSX_PLUGIN_URL . 'assets/build/index.css',
            [],
            WOOSTATSX_VERSION
        );

        wp_enqueue_script(
            'woostatsx-script',
            WOOSTATSX_PLUGIN_URL . 'assets/build/index.js',
            [],
            WOOSTATSX_VERSION,
            true
        );

        // Localize script with necessary data
        wp_localize_script('woostatsx-script', 'wooStatsx', [
            'apiUrl' => esc_url_raw(rest_url('woostatsx/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'locale' => get_locale(),
        ]);
    }

    public function register_rest_routes() {
        // Register REST routes
        $api = new WooStatsX_API();
        $api->register_routes();
    }

    public function invalidate_cache() {
        // Delete all WooStatsX transients
        global $wpdb;
        $wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '%_transient_woostatsx_%'");
    }

    public function woocommerce_not_active_notice() {
        ?>
        <div class="notice notice-error">
            <p><?php _e('WooStatsX requires WooCommerce to be installed and activated.', 'woostatsx'); ?></p>
        </div>
        <?php
    }
}

// Initialize the plugin
function woostatsx_init() {
    WooStatsX::get_instance();
}
add_action('plugins_loaded', 'woostatsx_init'); 