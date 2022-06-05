<?php
session_start();

//設定ファイル
require '../common/define.php';

// BOT用API
require './bot.php';

// CSV変換機能
require './csvConvert.php';

//管理画面処理
require './admin.php';

//閲覧ページ
require './default.php';

//パスワード
$PASSWORD = PASSWORD;

//テンプレHTMLソース
$html = getTempHTML();


$List_url = "./js/battlePass-list.json";
$List_json = file_get_contents($List_url);
$List = json_decode($List_json, true);


//管理ページの未ログインアクセス
if($_GET['mode']=='admin' && $_SESSION['password'] != $PASSWORD && $_POST['pass'] != $PASSWORD ){
    echo adminLogin($html);
    return;
}
//CSV変換
else if($_GET['mode']=='csv' && ( $_POST['pass'] == $PASSWORD || $_SESSION['password'] == $PASSWORD)){
    echo csvConvert($html, $List);
    return;
}
//管理ページの開発用ボタン処理
else if($_GET['mode']=='admin' && $_SESSION['password'] == $PASSWORD && $_POST['mode'] == 'validate'){
    echo adminValidate($html);
    return;
}
//管理ページ
else if($_GET['mode']=='admin' && ( $_POST['pass'] == $PASSWORD || $_SESSION['password'] == $PASSWORD)){
    $_SESSION['password'] = $PASSWORD;
    echo adminMode($html,$heroList,$itemList);
    return;
}
else if($_GET['mode']=='discord'){
    echo discordMessage($List);
    return;
}
else if($_GET['mode']=='discordAlert21'){
    echo discordAlert21($List);
    return;
}
//閲覧ページ
else{
    echo defaultMode($html, $List_json, $List);
    return;
}

?>