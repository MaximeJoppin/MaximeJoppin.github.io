<?php
    public function hookDisplayHeader(): string
    {
        $controller = Dispatcher::getInstance()->getController();

        $rows = Db::getInstance()->executeS(
            'SELECT page_name, css_content, js_content
               FROM `' . _DB_PREFIX_ . 'customcssjs`
              WHERE page_name IN ("global", "' . pSQL($controller) . '")
                AND active = 1
              ORDER BY FIELD(page_name, "global", "' . pSQL($controller) . '") ASC'
        );

        $css = '';
        $js  = '';
        foreach ($rows as $row) {
            if (!empty(trim((string) $row['css_content']))) {
                $css .= $row['css_content'] . "\n";
            }
            if (!empty(trim((string) $row['js_content']))) {
                $js .= $row['js_content'] . "\n";
            }
        }

        $output = '';
        if ($css !== '') {
            $output .= '<style type="text/css">' . "\n" . $css . '</style>' . "\n";
        }
        if ($js !== '') {
            $output .= '<script type="text/javascript">' . "\n" . $js . '</script>' . "\n";
        }
        return $output;
    }
}
