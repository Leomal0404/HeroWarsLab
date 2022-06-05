<?php
    header('Content-type: application/json; charset=utf-8'); // ヘッダ（データ形式、文字コードなど指定）

    $name = $_POST['name'];

    $dateText = "";
    $dateCode = "";

    if($_POST['mode'] == "checkUpdate"){

        $dateCode = $_POST['dateCode'];
        
        $timestamp_check = $_POST['timestamp'];

        $file = './userData/'.$name. "/". $name ."_". $dateCode ."_temp.json";
        if(file_exists($file)) $timeStamp = filemtime($file);
        else $timeStamp = $timestamp_check;

        $data = "";
        if($timestamp_check < $timeStamp){
            $file_json = file_get_contents($file);
            $file_decode = json_decode($file_json, true);
            $data = json_encode($file_decode,JSON_UNESCAPED_UNICODE);
            $timestamp_check = $timeStamp;
        }

        $file = './userData/'.$name. "/". $name ."_". $dateCode .".json";
        if(file_exists($file)) $timeStamp_p = filemtime($file);
        else $timeStamp_p = $timestamp_check;

        if($timeStamp_p > $timeStamp) $timeStamp = $timeStamp_p;

        if($timestamp_check < $timeStamp){
            $file_json = file_get_contents($file);
            $file_decode = json_decode($file_json, true);
            $data = json_encode($file_decode,JSON_UNESCAPED_UNICODE);
            $timestamp_check = $timeStamp;
        }

    }
    else if($_POST['mode'] == "targetDateEdit"){

        $target = $_POST['target'];
        $dateText = $_POST['dateText'];
        $dateCode = $target;

        $targetFile = './userData/'.$name. "/". $name ."_". $target .".json";
        $target_json = file_get_contents($targetFile);
        $target_decode = json_decode($target_json, true);
        $data = json_encode($target_decode,JSON_UNESCAPED_UNICODE);

        $file = './userData/'.$name. "/". $name ."_". $target ."_temp.json";
        file_put_contents($file, $target_json);
        chmod($file, 0666);

        $timeStamp = filemtime($file);

    }
    else if($_POST['mode'] == "getLogList"){

        $rankList = ["common","elder","ancient","dreadful","legend"];
        $typeList = ["dark", "water", "earth", "light", "wind", "fire"];

        $imgDir = './img/'.$name;
        $logDir = './userData/'.$name;

        $logFiles = glob( $logDir.'/*.json' );
        $logFiles = array_reverse($logFiles);

        $data = "";

        $dateCount = 0;
        foreach($logFiles as $logFile){

            $filenameCode = basename($logFile, ".json");

            if(strpos($filenameCode, "_") !== false && strpos($filenameCode, "_temp") === false){
                $file_json = file_get_contents($logFile);
                $file_decode = json_decode($file_json, true);

                list($id, $dateCode) = explode("_", $filenameCode);

                $year = substr($dateCode, 0, 4);
                $month = substr($dateCode, 4, 2);
                $day = substr($dateCode, 6, 2);

                $memberNum = count($file_decode['guild']['members']);

                $members_turn = [];
                $attack_count = 0;
                $horn_count = 0;
                $attackMemberCount = 0;
                foreach($file_decode['guild']['plan'] as $rank => $types){
                    foreach($types as $type){
                        foreach($type as $member){
                            if($member){
                                $attack_count++;

                                if(!$members_turn[$member]){
                                    $members_turn[$member] = 1;
                                    $attackMemberCount++;
                                }
                                else $members_turn[$member]++;

                                if($members_turn[$member] > 3) $horn_count++;
                            }
                        }
                    }
                }

                $info = "";
                if($dateCount > 0) $info .= ',';
                $info .= '{"year":"'.$year.'","month":"'.$month.'","day":"'.$day.'","memberNum":"'.$memberNum.'","attackMemberCount":"'.$attackMemberCount.'","attack_count":"'.$attack_count.'","horn_count":"'.$horn_count.'","turns":[';
                    
                $compCount = 0;
                $hydraCount = 0;
                foreach($rankList as $rank){
                    foreach($typeList as $type){

                        if($hydraCount > 0) $info .= ",";

                        $deFlag = "false";
                        if($file_decode['guild']['complete'][$rank."_".$type] == "true"){
                            $deFlag = "true";
                            $compCount++;
                        }

                        $turnCount = count($file_decode['guild']['plan'][$rank][$type]);

                        $info .= '"'.$rank."_".$type."_".$turnCount."_".$deFlag.'"';

                        $hydraCount++;
                    }
                }

                $info .= ']}';

                $data .= $info;

                $dateCount++;
            }
        }
        $data = '['.$data.']';
        $timeStamp = "";
    }

    $param = array("data"=>$data, "timestamp"=>$timeStamp, "dateCode"=>$dateCode, "dateText"=>$dateText);
    echo json_encode($param);

