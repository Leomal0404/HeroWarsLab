<?php

//BOT用API(21時ソウルストーンお知らせ)
function discordAlert21($List){
    $nowMonth = date('n', strtotime('+1 day'));
    $nowDay = date('j', strtotime('+1 day'));
    $nowYear = date('Y', strtotime('+1 day'));

    //開催日設定
    $eventDay = $nowDay;

    //イベントチェーンID(月ID)を取得
    $nowEventID = 0;
    foreach ($List['battlePass']["eventChainId"] as $eID => $value){
        if($value[0] == $nowYear && $value[1] == $nowMonth){
            $nowEventID = (int)$eID;
            break;
        }
    }

    $heroStone = "no";

    //ミッションリスト
    foreach ($List['battlePass']['quest'] as $i => $mission) {
        //月IDの照合
        if($mission["EventChainId"] == $nowEventID){
            
            //開催日の照合
            if($mission["ChainOrder"] == $eventDay){
                
                $missionTranslation = $mission["TranslationMethod"];
                
                if($missionTranslation == "fragmentheroget") $heroStone = "yes";
                
            }
            else if((int) $mission["ChainOrder"] > $eventDay){
                break;
            }
        }
        else if((int)$mission["EventChainId"] > $nowEventID){
            break;
        }
    }

    $json = '{"heroStone":"'. $heroStone .'"}';
    return $json;

}



//BOT用API
function discordMessage($List){
    $nowMonth = date('n');
    $nowDay = date('j');
    $nowMinute = date('i');
    $nowYear = date('Y');

    $nowHour = date('G');

    //曜日配列
    $weekArray = array('日','月','火','水','木','金','土');
    $weekColor = array('#ff3a3a','#dc4eff','#ffb74f','#4ff9ff','#60f72c','#ebff44','#4fa2ff');

    $head0 = "";
    $head1 = "";

    $mission0 = "";    
    $mission1 = "";

    $head0e = "";
    $head1e = "";

    $mission0 = "";    
    $mission1 = "";

    $mission0e = "";    
    $mission1e = "";
    

    //開催日設定
    $eventDay = 0;

    //現在の日付
    $currrentYear = $nowHour;
    $currrentMonth = $nowMonth;
    $currrentDay = $nowDay;


    //１日の11：00以前は進行中ミッションなし
    if($nowDay == 1 && $nowHour < 11){
        $head0 = '【現在開催されていません】';
        $head0e = '【Not currently held】';
    }
    //１日11:00～26日10:59までは進行中ミッション
    else if($nowDay >= 1 && $nowDay < 27 && $nowHour < 11){

        $head0 = '【進行中】'.$nowMonth."月";
        $head0e = '【Now in progress】'.'Up to 6 hours later';
        
        //11時を過ぎている場合は終了時刻は翌日
        if($nowHour > 10){
            $head0 .= ($nowDay + 1);
            $currrentDay++;
            $eventDay = $nowDay;
        }
        //11時前の場合は終了時刻は当日
        else{
            $currrentDay = $nowDay - 1;
            $head0 .= $nowDay;
            $eventDay = $nowDay - 1;
        }
        
        $head0 .= '日('. $weekArray[ date('w', mktime(0,0,0,$currrentMonth,$nowDay,$currrentYear)) ]  .') 10時59分まで';
    }
    //１日～２６日の１１時、あるいは月末日の１１時
    else if(($nowDay >= 1 && $nowDay < 27) || ($nowDay == date('t') && $nowHour > 10)){
        $head0 = '11alert';
        $head0e = 'empty';
    }
    //それ以外の日はなにもなし
    else{
        $head0 = 'empty';
        $head0e = 'empty';
    }


    //イベントチェーンID(月ID)を取得
    $nowEventID = 0;
    foreach ($List['battlePass']["eventChainId"] as $eID => $value){
        if($value[0] == $nowYear && $value[1] == $nowMonth){
            $nowEventID = (int)$eID;
            break;
        }
    }
    //ミッションリスト
    $count = 0;
    foreach ($List['battlePass']['quest'] as $i => $mission) {
        //月IDの照合
        if($mission["EventChainId"] == $nowEventID){
            
            //開催日の照合
            if($mission["ChainOrder"] == $eventDay){
                
                $missionTranslation = $mission["TranslationMethod"];
                $missionCode = $List['battlePass']["code"][$missionTranslation];
                $missionName = $List['battlePass']["free"][$missionCode][2];
                $missionEName = $List['battlePass']["free"][$missionCode][3];

                if($count > 0){
                    $mission0 .= ",";
                    $mission0e .= ",";
                }
                $mission0 .= $missionName.'：'.$mission["FarmRepeats"];
                $mission0e .= $missionEName.'：'.$mission["FarmRepeats"];
                $count++;
            }
        }
        if($count == 4) break;
    }


    //次回予定ミッション
    $head1 = '【次回予定】';
    $head1e = '【Coming next】';

    if($nowHour > 10 && $nowDay < 25){
        $head1 = '【明日の予定】';
        $head1e = '【 Tomorrow 】';
    }

    $nextYear = $nowYear;
    $nextMonth = $nowMonth;
    $nextDay = $nowDay + 1;

    if(($nowDay == 25 && $nowHour > 10) || $nowDay > 25){
        if($nowMonth == 12){
            $nextMonth = 1;
        }
        else{
            $nextMonth = $nowMonth + 1;
        }
        $nextDay = 1;

        $head1 .= $nextMonth ."月". $nextDay;
        $head1e .= 'Next Month 1st';
        $eventDay = 1;
        $nowEventID++;
    }
    else{
        $head1 .= $nextMonth."月";
        if($nowHour > 4 && $nowHour < 6) $head1e .= 'Six hours later';
        else $head1e .= 'Next update';

        //11時を過ぎている場合は次回開始時刻は翌日
        if($nowHour > 10){
            $head1 .= $nextDay;
            $eventDay = $nextDay;
        }
        else{
            $nextDay = $nowDay;
            $head1 .= $nextDay;
            $eventDay = $nextDay;
        }
    }
    $head1 .= '日('. $weekArray[ date('w', mktime(0,0,0,$nextMonth,$nextDay,$nextYear)) ] .') 11時から';

    $wColor = $weekColor[ date('w', mktime(0,0,0,$nextMonth,$nextDay,$nextYear)) ];

    //ミッションリスト
    $count = 0;
    foreach ($List['battlePass']['quest'] as $i => $mission) {
        //月IDの照合
        if($mission["EventChainId"] == $nowEventID){
            //開催日の照合
            if($mission["ChainOrder"] == $eventDay){
                $missionTranslation = $mission["TranslationMethod"];
                $missionCode = $List['battlePass']["code"][$missionTranslation];
                $missionName = $List['battlePass']["free"][$missionCode][2];
                $missionEName = $List['battlePass']["free"][$missionCode][3];

                if($count > 0){
                    $mission1 .= ",";
                    $mission1e .= ",";
                }
                $mission1 .= $missionName.'：'.$mission["FarmRepeats"];
                $mission1e .= $missionEName.'：'.$mission["FarmRepeats"];
                $count++;
            }
        }
        if($count == 4) break;
    }



    $json = '{"color":"'. $wColor .'","head0":"'. $head0 .'", "mission0":"'. $mission0 .'", "head1":"'. $head1 .'", "mission1":"'. $mission1 .'", "head0e":"'. $head0e .'", "mission0e":"'. $mission0e .'", "head1e":"'. $head1e .'", "mission1e":"'. $mission1e .'"}';
    return $json;
}

?>