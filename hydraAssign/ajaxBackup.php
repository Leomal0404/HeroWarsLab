<?php
    header('Content-type: application/json; charset=utf-8'); // ヘッダ（データ形式、文字コードなど指定）
    //$data = filter_input(INPUT_POST, 'sendData');

    $name = $_POST['name'];
    $data = $_POST['sendData'];
    $dateCode = $_POST['dateCode'];

    $directory_path = "./userData/".$name;

    $file = $directory_path .'/'.$name."_".$dateCode.".json";
    file_put_contents($file, $data);

    $timeStamp = filemtime($file);

    //現在日付
    $todayDate = date("Ymd");
    if( date('H') < 11) $todayDate = date("Ymd", mktime(0, 0, 0, date("m"), date("d")-1, date("Y")));

    if($todayDate == $dateCode){
        $file = $directory_path .'/'.$name.".json";
        file_put_contents($file, $data);
        chmod($file, 0666);
    }


    $param = array("status"=>"BACKUP_COMPLETE", "timestamp"=>$timeStamp);
    echo json_encode($param);

