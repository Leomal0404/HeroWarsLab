<?php
session_start();

//設定ファイル
require '../common/define.php';

//管理画面処理
require './admin.php';

//閲覧ページ
require './default.php';

//パスワード
$PASSWORD = PASSWORD;

//テンプレHTMLソース
$html = getTempHTML();

$heroList_url = "./js/hero_list.json";
$eventList_url = "./js/event_list.json";

$spList_url = "./js/sp_list.json";
$spEventList_url = "./js/spEvent_list.json";

$heroList_json = file_get_contents($heroList_url);
$eventList_json = file_get_contents($eventList_url);

$spList_json = file_get_contents($spList_url);
$spEventList_json = file_get_contents($spEventList_url);

$heroList = json_decode($heroList_json, true);
$eventList = json_decode($eventList_json, true);

$spList = json_decode($spList_json, true);
$spEventList = json_decode($spEventList_json, true);

$hero_validate_json = json_encode($heroList,JSON_UNESCAPED_UNICODE);
$event_validate_json = json_encode($eventList,JSON_UNESCAPED_UNICODE);
$sp_validate_json = json_encode($spList,JSON_UNESCAPED_UNICODE);
$spEvent_validate_json = json_encode($spEventList,JSON_UNESCAPED_UNICODE);


//管理ページの未ログインアクセス
if($_GET['mode']=='admin' && $_SESSION['password'] != $PASSWORD && $_POST['pass'] != $PASSWORD ){
    echo adminLogin($html);
    return;
}
//管理ページの開発用ボタン処理
else if($_GET['mode']=='admin' && $_SESSION['password'] == $PASSWORD && $_POST['mode'] == 'validate'){
    echo adminValidate($html,$heroList,$eventList,$spList,$spEventList,$eventList_url,$spList_url,$spEventList_url);
    return;
}
//登録処理
else if($_GET['mode']=='admin' && $_SESSION['password'] == $PASSWORD && $_POST['mode'] == 'regist'){
    echo adminRegist($html,$heroList,$eventList,$spList,$spEventList,$eventList_url,$spList_url,$spEventList_url);
    return;
}
//管理ページ
else if($_GET['mode']=='admin' && ( $_POST['pass'] == $PASSWORD || $_SESSION['password'] == $PASSWORD)){
    $_SESSION['password'] = $PASSWORD;
    echo adminMode($html,$heroList,$eventList,$spList,$spEventList);
    return;
}
//閲覧ページ
else{
    echo defaultMode($html,$hero_validate_json,$event_validate_json,$sp_validate_json,$spEvent_validate_json);
    return;
}


?>