<?php
//セッション開始
session_start();

//session_destroy();

// 設定ファイル
require '../common/define.php';

// 表示用ファイル
require './default.php';

// アカウント管理ファイル
require './admin.php';

// ユーザーアカウントデータ
require '../common/data/users.php'; 

$ADMIN_PASSWORD = CONFIG_ADMIN;
$MASTER_PASSWORD = CONFIG_MASTER;
$FREE_PASSWORD = CONFIG_FREE;
$SPECIAL_PASSWORD = CONFIG_SPECIAL;

//Javascriptに渡すためのログイン情報
$loginType = "NULL";
$loginID = "NULL";

//テンプレHTMLソース
$html = getTempHTML(3);


//コンテンツページ
if (passCheck() != "NULL") {
    if($loginType == "ADMIN" && $_GET['mode'] == "logManage"){
        echo manageMode($html);
    }
    else echo adminMode($html);
}
//未ログインアクセス
else {
    echo adminLogin($html);
    //echo defaultMode($html);
}

?>