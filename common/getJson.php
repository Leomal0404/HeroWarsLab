<?php
    header('Content-type: application/json; charset=utf-8'); // ヘッダ（データ形式、文字コードなど指定）

    $data;
    
    if(isset($_POST['url'])) $data = file_get_contents($_POST['url']);
    else if(isset($_POST['urlArray'])){
        $urlArray = explode(",", $_POST['urlArray']);

        $data = array();
        foreach($urlArray as $url){
            array_push($data, file_get_contents($url));
        }
    }

    $param = array("data"=>$data);
    echo json_encode($param);

