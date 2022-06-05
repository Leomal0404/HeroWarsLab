<?php

//閲覧ページ
function defaultMode($str, $List_json, $List){

    $nowMonth = date('n');
    $nowDay = date('j');
    $nowMinute = date('i');
    $nowYear = date('Y');

    $nowHour = date('G');

    //曜日配列
    $weekArray = array('日','月','火','水','木','金','土');


    $title = 'ヒーローの道ミッション予定表';
    $query = time();

    $src = <<<EOM
        <link href="./css/style.css?$query" rel="stylesheet">
        <script type="text/javascript">

            //本日の日
            let nowDay = $nowDay;
            //本日の月
            let nowMonth = $nowMonth;
            //本日の年
            let nowYear = $nowYear;

            //現在の時間
            let nowHour = $nowHour;

            //曜日配列
            let weekArray = ['日','月','火','水','木','金','土'];

            //バトルパス情報JSON
            let passList = $List_json;

            //ページ起動時にテーブル生成
            function onload(){
                tableBuild();
            }

            //テーブル生成(ミッション一覧表)
            function tableBuild(){

                //ミッション経験値合計
                let expsum = 0;

                let output = '';

                output += '<table class="dataTable" width="600">';

                //すべてのミッションを列挙
                let currentDay = 0;

                //現在の開催日を設定
                let eventDay = 0;
                if(nowHour > 10) eventDay = nowDay;
                else eventDay = nowDay - 1;


                //今月のイベントチェーンID(月ID)を取得
                let nowEventID = 0;
                for(let eID in passList['battlePass']["eventChainId"]){
                    let value = passList['battlePass']["eventChainId"][eID];
                    if(value[0] == nowYear && value[1] == nowMonth){
                        nowEventID = Number(eID);
                        break;
                    }
                }

                //JSONの走査
                let DayCount = 0;
                for(let i in passList['battlePass']['quest']){
                    //ミッション情報
                    let missionData = passList['battlePass']['quest'][i];

                    //ミッションが現在の年月用かどうかをチェック
                    let eventId = missionData["EventChainId"];

                    //過去月のミッションの場合はスキップ
                    if( eventId < nowEventID) continue;

                    //行の追加
                    output += '<tr>';

                    

                        
                    //日付チェーンの確認
                    if(currentDay != missionData['ChainOrder']){
                        DayCount++;

                        //日にち
                        currentDay = missionData['ChainOrder'];

                        //色付け用クラス
                        let className2 = "";
                        if(currentDay == eventDay && Number(passList['battlePass']["eventChainId"][eventId][0]) == nowYear && Number(passList['battlePass']["eventChainId"][eventId][1]) == nowMonth){
                            className2 = ' height="200" class="activeDay"';
                        }
                        else if(DayCount % 2 == 0){
                            className2 = ' class="subDay"';
                        }

                        //曜日取得
                        let date = new Date( nowYear, (Number(passList['battlePass']["eventChainId"][eventId][1])-1) , currentDay );

                        //縦４行分のセル化
                        output += '<td'+ className2 +' rowspan="4" width="90">';
                        
                        output += passList['battlePass']["eventChainId"][eventId][1] +'/'+ currentDay +'('+ weekArray[date.getDay()] +')</td>';
                       
                    }

                    let className = "";
                    if(currentDay == eventDay && Number(passList['battlePass']["eventChainId"][eventId][0]) == nowYear && Number(passList['battlePass']["eventChainId"][eventId][1]) == nowMonth){
                        className = ' class="activeDay"';
                    }
                    else if(DayCount % 2 == 0){
                        className = ' class="evenCell"';
                    }
                    else{
                        className = ' class="oddCell"';
                    }

                    //ミッションコード
                    let tranlateCode = missionData["TranslationMethod"];
                    let missionCode = passList['battlePass']["code"][tranlateCode];
                    //ミッション名
                    let missionName = passList['battlePass']["free"][missionCode][2];

                    output += '<td'+ className +' width="260">'+ missionName +'</td>';

                    //リピート回数
                    let repeatTime = Number(missionData["FarmRepeats"]);
                    //１回の経験値
                    let missionExp = Number(missionData["Reward"][1]);

                    //リピート数
                    output += '<td'+ className +' width="75">'+ repeatTime +'</td>';
                    //経験値
                    output += '<td'+ className +' width="90">'+ missionExp +'</td>';
                    //獲得可能最大経験値
                    output += '<td'+ className +' width="85">'+ repeatTime * missionExp +'</td>';


                    output += '</tr>';

                }
                output += '</table>';


                //テーブルの出力
                document.getElementById("missionList").innerHTML = output;

                let target = document.getElementById('missionList');
                target.scrollTop = (nowDay-1)*108;
            }


        </script>
        <div class="content-box">
            <div id="content">
             <h1>ヒーローの道 / バトルパスミッション予定表</h1>
    EOM;
    
    //現在時刻の表記
    $src .= '<h2>'.$nowMonth .'月'. $nowDay ."日(". $weekArray[ date('w', mktime(0,0,0,$nowMonth,$nowDay,$nowYear)) ] .")&nbsp;". $nowHour ."時". $nowMinute ."分現在</h2>";

    

    //進行中ミッション表示
    $src .= '<div class="battlePassMissionDailyArea">';
    $src .= '<table class="battlePassMissionDailyTable">';

    //開催日設定
    $eventDay = 0;

    $currrentYear = $nowYear;
    $currrentMonth = $nowMonth;
    $currrentDay = $nowDay;


    $src .= '<tr height="45"><th colspan="2" class="now">';
     //１日11:00～26日10:59までは進行中ミッション
    if(($nowDay < 26 && $nowHour > 10) || ($nowDay == 26 && $nowHour < 11) || ($nowDay > 1 && $nowDay < 27 && $nowHour < 11)){
        $src .= '【進行中】'.$nowMonth."月";
        
        //11時を過ぎている場合は終了時刻は翌日
        if($nowHour > 10){
            $currrentDay++;
            $src .= ($nowDay + 1);
            $eventDay = $nowDay;
        }
        //11時前の場合は終了時刻は当日
        else{
            $src .= $nowDay;
            $eventDay = $nowDay - 1;
        }
        $src .= '日('. $weekArray[ date('w', mktime(0,0,0,$currrentMonth,$currrentDay,$currrentYear)) ] .')10時59分まで';
    }
    else{
        $src .= '【現在開催されていません】';
    }
    $src .= '</th></tr>';

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

                $src .= '<tr><td style="width:75%">'.$missionName.'</td><td style="width:25%">'.$mission["FarmRepeats"].'</td></tr>';
                $count++;
            }
        }
        if($count == 4) break;
    }
    if($count == 0){
        $src .= '<tr><td colspan="2" rowspan="4">-</td></tr>';
    }
    $src .= '</table></div>';


    //次回予定ミッション
    $src .= '<div class="battlePassMissionDailyArea">';
    $src .= '<table class="battlePassMissionDailyTable">';

    $src .= '<tr height="45"><th colspan="2" class="next">';
    
    $src .= '【次回予定】';
    
    $nextYear = $nowYear;
    $nextMonth = $nowMonth;
    $nextDay = ($nowDay + 1);

    //次回は翌月１日
    if(($nowDay == 25 && $nowHour > 10) || $nowDay > 25){
        if($nowMonth == 12){
            $nextYear++;
            $nextMonth = 1;
        }
        else $nextMonth = $nowMonth+1;

        $nextDay = 1;

        $src .= $nextMonth."月". $nextDay;
        $eventDay = 1;
        $nowEventID++;
    }
    else{
        $src .= $nowMonth."月";

        //11時を過ぎている場合は次回開始時刻は翌日
        if($nowHour > 10){
            $src .= $nextDay;
            $eventDay = $nextDay;
        }
        else{
            $nextDay = $nowDay;
            $src .= $nextDay;
            $eventDay = $nextDay;
        }
    }
    $src .= '日('. $weekArray[ date('w', mktime(0,0,0,$nextMonth,$nextDay,$nextYear)) ] .')11時から'.'</th></tr>';

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

                $src .= '<tr><td width="250">'.$missionName.'</td><td width="80">'.$mission["FarmRepeats"].'</td></tr>';
                $count++;
            }
        }
        if($count == 4) break;
    }

    $src .= '</table></div>';


    $src .= '<div class="BoxClear"></div>';
    $src .= '<hr size="3" color="black" noshade>';


    $src .= '<h2>ミッションスケジュール</h2>';
    $src .= <<<EOM
        <div class="dataTableContainer">
            <div>
                <table class="dataTable" width="600">
                    <tr>
                        <th width="90">日付</th>
                        <th width="260">ミッション内容</th>
                        <th width="75">最大回数</th>
                        <th width="90">メダル数<br />(１回につき)</th>
                        <th width="85">最大メダル数</th>
                    </tr>
                </table>
            </div>
            <div id="missionList" class="dataTableBox" style="width:630px;">
            </div>
        </div>
    EOM;
    

    $src .= '</div>';
    $src .= '</div>';

    $str = str_replace("<?=TITLE=>", $title, $str);
    $str = str_replace("<?=LINK=>", '<a href="index.php?mode=admin">管理ページ</a>', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

?>