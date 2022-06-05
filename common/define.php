<?php
//サイトのベースURL
define('ROOT', 'https://aille.net/HeroWars');

//テンプレHTML
define('TEMP', '/common/template/template_page.html');
define('TEMP_SYNC', '/common/template/template_page_sync.html');
define('TEMP_REACT', '/common/template/template_page_react.html');
define('TEMP_VUE', '/common/template/template_page_vue.html');

//グローバルパスワード
define('PASSWORD', 'waru1c0');

function getTempHTML($switch = 0){
    $html = "";
    //テンプレHTML
    switch($switch){
        case 0:
            $html = file_get_contents(ROOT.TEMP);
            break;
        case 1:
            $html = file_get_contents(ROOT.TEMP_SYNC);
            break;
        case 2:
            $html = file_get_contents(ROOT.TEMP_REACT);
            break;
        case 3:
            $html = file_get_contents(ROOT.TEMP_VUE);
            break;
    }

    //HTML内の読み込みクエリを生成
    $html = str_replace("<?=TIMECODE=>", time(), $html);
    //ROOTアドレス
    $html = str_replace("<?=ROOT=>", ROOT, $html);

    return $html;
}

?>