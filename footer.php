<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package BuddyBoss_Theme
 */

?>

<?php do_action( THEME_HOOK_PREFIX . 'end_content' ); ?>

</div><!-- .bb-grid -->
</div><!-- .container -->
</div><!-- #content -->

<?php do_action( THEME_HOOK_PREFIX . 'after_content' ); ?>

<?php do_action( THEME_HOOK_PREFIX . 'before_footer' ); ?>
<?php do_action( THEME_HOOK_PREFIX . 'footer' ); ?>
<?php do_action( THEME_HOOK_PREFIX . 'after_footer' ); ?>

</div><!-- #page -->

<?php do_action( THEME_HOOK_PREFIX . 'after_page' ); ?>

<?php wp_footer(); ?>

<!-- <div id="chatbotContainer" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; background:transparent; z-index: index 1000;">
    <iframe src="https://chat.awscertif.site/utrains"
            width="600"
            height="600"
            style="border:none; overflow:hidden; background:transparent !important;"
            scrolling="no"
            allow="autoplay; encrypted-media"
            frameborder="0"
            allowTransparency="true"></iframe>
</div> -->
<?php
/**
 * The template for displaying the footer
 */

?>

<?php do_action( THEME_HOOK_PREFIX . 'end_content' ); ?>

</div><!-- .bb-grid -->
</div><!-- .container -->
</div><!-- #content -->

<?php do_action( THEME_HOOK_PREFIX . 'after_content' ); ?>

<?php do_action( THEME_HOOK_PREFIX . 'before_footer' ); ?>
<?php do_action( THEME_HOOK_PREFIX . 'footer' ); ?>
<?php do_action( THEME_HOOK_PREFIX . 'after_footer' ); ?>

</div><!-- #page -->

<?php do_action( THEME_HOOK_PREFIX . 'after_page' ); ?>

<?php wp_footer(); ?>

<?php
// URL of the Flask API endpoint
$flask_url = 'https://chat.awscertif.site/';

// Generate a unique user token if it doesn't exist
if (!isset($_COOKIE['user_token'])) {
    $user_token = bin2hex(random_bytes(16)); // Generate a unique token
    setcookie('user_token', $user_token, time() + 3600 * 24, "/"); // Set 24-hour expiry
} else {
    $user_token = $_COOKIE['user_token'];
}

// Append the user_token as a query parameter
$flask_url_with_token = $flask_url . '?user_token=' . urlencode($user_token);

// Initialize a cURL session to call the Flask API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $flask_url_with_token);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the request and store the result in a variable
$response = curl_exec($ch);
curl_close($ch);

// Display the HTML content received from the Flask API
if ($response !== false) {
    echo $response;
} else {
    echo '<!-- Error retrieving content from Flask API -->';
}
?>


</body>
</html>
