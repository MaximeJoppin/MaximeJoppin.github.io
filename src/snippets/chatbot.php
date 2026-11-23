<?php
// Le bot connaît le site : on lui donne les pages WordPress dans le prompt système
$pages = get_posts(array(
    'post_type' => 'page',
    'numberposts' => 5
));

$site_content = "";
foreach ($pages as $p) {
    $site_content .= $p->post_title . " - " . wp_trim_words($p->post_content, 20) . " - " . get_permalink($p) . "\n";
}

// Mémoire de conversation : l'historique envoyé par le widget est revalidé
$history = isset($_POST['history']) ? json_decode(stripslashes($_POST['history']), true) : [];

$messages = array(
    array("role" => "system", "content" => $system_prompt)
);

if (!empty($history)) {
    foreach ($history as $h) {
        if (isset($h['role']) && isset($h['content'])) {
            $messages[] = $h;
        }
    }
}

$messages[] = array("role" => "user", "content" => $msg);
