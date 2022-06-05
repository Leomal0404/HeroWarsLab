<?php
    header('Content-type: application/json; charset=utf-8'); // ヘッダ（データ形式、文字コードなど指定）
    //$data = filter_input(INPUT_POST, 'sendData');

    $name = $_POST['name'];
    $data = $_POST['sendData'];
    $type = $_POST['type'];

    $file = '../heroBattle/userData/'.$name."_".$type.".json";
    file_put_contents($file, $data);

    $param = array("status"=>"COMPLETE");
    echo json_encode($param);

