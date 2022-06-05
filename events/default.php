<?php

//閲覧ページ
function defaultMode($str,$heroList_json,$eventList_json,$spList_json,$spEventList_json){

    // 一般イベントモード
    if($_GET['mode']=='event'){
        $nameList = $spList_json;
        $eventList = $spEventList_json;
        $title = '一般イベント';
        $isEvent = true;
        $imgFolder = './e_img/';
    }
    // ヒーローイベントモード
    else{
        $nameList = $heroList_json;
        $eventList = $eventList_json;
        $title = 'ヒーローイベント';
        $isEvent = false;
        $imgFolder = './img/';
    }
    
    $query = time();
    $src = <<<EOM
            <link href="./css/style.css?$query" rel="stylesheet">
            <script type="text/javascript">
                let nameList = $nameList;
                let eventList = $eventList;

                let imgFolder = "$imgFolder";

                let title = "$title";

                //一般イベントフラグ
                let isEvent = true;
                if(title == "ヒーローイベント") isEvent = false;

                function onload(){
                    //tableBuild("lasttime",0);
                }
            </script>
    EOM;

    $src .= <<<EOM
        <script type="text/javascript">
            function tableBuild(sort,n_order,l_order,t_order){
                let content = document.getElementById('content');
                
                let html = "";

                html += '<div id="linkList">';
                html += '<a href="./"><span>&nbsp;&nbsp;ヒーローイベント&nbsp;&nbsp;</span></a>';
                html += '<a href="./?mode=event"><span>&nbsp;&nbsp;一般イベント&nbsp;&nbsp;</span></a>';
                html += '</div>';
                html += '<div class="dataTableContainer">';
                html += '<div>';
                
                let n_dir = "▼";
                let l_dir = "▼";
                let t_dir = "▼";

                
                //ソート
                if(sort == "name"){
                    if(n_order){
                        eventList['event'].sort(function(a, b) {
                            if (a.name < b.name) {
                                return 1;
                              } else {
                                return -1;
                              }
                        });
                        n_order = 0;
                        n_dir = "▼";
                        
                    }
                    else{
                        eventList['event'].sort(function(a, b) {
                            if (a.name > b.name) {
                                return 1;
                              } else {
                                return -1;
                              }
                        });
                        n_order = 1;
                        n_dir = "▲";
                    }
                    l_order = 0;
                    l_dir = "▼";
                    t_order = 0;
                    t_dir = "▼";
                }
                else if(sort == "lasttime"){
                    if(l_order){
                        eventList['event'].sort(function(a, b) {
                            return a.lasttime - b.lasttime;
                        });
                        l_order = 0;
                        l_dir = "▼";
                    }
                    else{
                        eventList['event'].sort(function(a, b) {
                            return b.lasttime - a.lasttime;
                        });
                        l_order = 1;
                        l_dir = "▲";
                    }
                    n_order = 0;
                    n_dir = "▼";
                    t_order = 0;
                    t_dir = "▼";
                }
                else if(sort == "times"){
                    if(t_order){
                        eventList['event'].sort(function(a, b) {
                            return a.times - b.times;
                        });
                        t_order = 0;
                        t_dir = "▼";
                    }
                    else{
                        eventList['event'].sort(function(a, b) {
                            return b.times - a.times;
                        });
                        t_order = 1;
                        t_dir = "▲";
                    }
                    n_order = 0;
                    n_dir = "▼";
                    l_order = 0;
                    l_dir = "▼";
                }

                //最大回数の取得
                let maxCount = 0;
                eventList['event'].forEach(function(element){
                    if(maxCount < element['date'].length){
                        maxCount = element['date'].length;
                    }
                });
                if(isEvent) maxCount = 3;
                else maxCount = 4;

                //表の列数
                let colCount = 6 + maxCount;
                if(isEvent) colCount++;

                let today = new Date();

                let widthList;
                if(isEvent) widthList = [42, 150, 100, 80, 70, 80, 100];
                else widthList = [42, 160, 100, 80, 70, 80, 100];                    

                let headWidth = widthList[0] + widthList[1] + widthList[2] + widthList[3] + widthList[4] + widthList[5] + widthList[6]*maxCount;
                if(isEvent) headWidth += widthList[1];

                html += '<table class="dataTable" width="'+ headWidth +'">';
                html += '<thead><tr><th class="firstHead" width="'+ headWidth +'"colspan="'+ colCount +'">'+ title +'&nbsp;('+ today.getFullYear() +'年'+ (today.getMonth()+1) +'月'+ today.getDate() +'日現在)</th></tr>';
                html += '<tr class="secondHead"><th width="'+ widthList[0] +'">画像</th>';
                html += '<th width="'+ widthList[1] +'">名前&nbsp;<button name="nameSort" onclick="tableBuild('+ "'name',"+ n_order +","+ l_order +","+ t_order +');">'+ n_dir +'</button></th>';

                if(isEvent){
                    html += '<th width="'+ widthList[1] +'">概要</th>';
                }


                html += '<th width="'+ widthList[2] +'">経過日数&nbsp;<button name="nameSort" onclick="tableBuild('+ "'lasttime',"+ n_order +","+ l_order +","+ t_order +');">'+ l_dir +'</button></th>';
                html += '<th width="'+ widthList[3] +'">直近開催</th>';
                html += '<th width="'+ widthList[4] +'">回数&nbsp;<button name="nameSort" onclick="tableBuild('+ "'times',"+ n_order +","+ l_order +","+ t_order +');">'+ t_dir +'</button></th>';
                html += '<th width="'+ widthList[5] +'">平均間隔日</th>';
                
                html += '<th width="'+ widthList[6]*maxCount +'" colspan="'+ maxCount +'">開催日履歴</th></tr></thead></table></div>';

                html += '<div class="dataTableBox" style="width:'+ headWidth +'px">';
                html += '<table class="dataTable" width="'+ headWidth +'"><tbody>';

                let count = 0;
                eventList['event'].forEach(function(element){
                    count++;

                    let cellClass = "oddCell";
                    if(count % 2 == 0) cellClass = "evenCell";

                    html += '<tr>';
                    html += '<td class="'+ cellClass +'" width="'+ widthList[0] +'"><img src="'+ imgFolder + element['id'] +'.jpg" alt="'+ element['name'] +'" title="'+ element['name'] +'" width="36" height="36"></td>';
                    html += '<td class="'+ cellClass +'" width="'+ widthList[1] +'">'+ element['name'] +'</td>';
                    if(isEvent) html += '<td class="'+ cellClass +'" width="'+ widthList[1] +'">'+ element['exp'] +'</td>';

                    let dateArr = element['date'];
                    
                    let todaySec = today.getTime();

                    let secArr = new Array();

                    for(let i = 0; i < dateArr.length; i++){
                        let d = new Date(dateArr[i]['year'], (dateArr[i]['month']-1), dateArr[i]['day'], 0, 0, 0, 0);
                        secArr.push(d.getTime());
                    }
                    
                    console.log("TEST");
                    if(secArr.length > 0){
                        let postSec = todaySec - secArr[0];
                        let postDay = Math.floor(postSec / (1000 * 60 * 60 * 24));

                        

                        html += '<td class="'+ cellClass +'" width="'+ widthList[2] +'">'+ postDay +'日</td>';
                    }
                    else html += '<td class="'+ cellClass +'" width="'+ widthList[2] +'">-</td>';

                    //直近の開催日
                    if(dateArr.length == 0) html += '<td class="'+ cellClass +'" width="'+ widthList[3] +'">-</td>';
                    else html += '<td class="'+ cellClass +'" width="'+ widthList[3] +'"><b>'+ dateArr[0]['year'] +"/"+ dateArr[0]['month'] +"/"+ dateArr[0]['day'] +'</b></td>';

                    //開催回数
                    html += '<td class="'+ cellClass +'" width="'+ widthList[4] +'">'+ dateArr.length +'回</td>';

                    //平均間隔
                    if(secArr.length > 1){
                        let spanSum = 0;
                        for(let i = 0; i < secArr.length; i++){
                            if(i == 0) continue;
                            spanSum += Number(secArr[i-1] - secArr[i]);
                        }
                        let spanAve = Math.floor(spanSum / (secArr.length-1));

                        let spanDay = Math.floor(spanAve / (1000 * 60 * 60 * 24));

                        html += '<td class="'+ cellClass +'" width="'+ widthList[5] +'">'+ spanDay +'日</td>';
                    }
                    else html += '<td class="'+ cellClass +'" width="'+ widthList[5] +'">-</td>';


                    for(let i = 0; i < maxCount; i++){
                        if( i >= dateArr.length){
                            html += '<td class="'+ cellClass +'">&nbsp;</td>';
                        }
                        else{
                            html += '<td class="'+ cellClass +'">'+ dateArr[i]['year'] +"/"+ dateArr[i]['month'] +"/"+ dateArr[i]['day'] +'</td>';
                        }
                    }
                    html += '</tr>';
                });

                html += '</tbody></table></div>';

                content.innerHTML = html;
            }
        </script>
    EOM;

    $src .= <<<EOM
            <div class="content-box">
                <div id="content">
                    <div id="linkList"><a href="./"><span>&nbsp;&nbsp;ヒーローイベント&nbsp;&nbsp;</span></a><a href="./?mode=event"><span>&nbsp;&nbsp;一般イベント&nbsp;&nbsp;</span></a></div>

                    <div class="dataTableContainer">
                    <div>
    EOM;
    
    $n_dir = "▼";
    $l_dir = "▼";
    $t_dir = "▼";

    $l_order = 0;
    $t_order = 0;
    $n_order = 0;

    // ソート要素
    $sort = "lasttime";

    // イベントJSONを連想配列に戻す
    $eventArray = json_decode($eventList, true);

    // ソート用の仮格納配列
    $sortsArray = array();
    foreach($eventArray["event"] as $key => $row){
        $sortsArray[$key] = $row[$sort];
    }

    // ソート処理
    array_multisort($sortsArray, SORT_DESC, $eventArray["event"]);
    
    //最大回数の取得
    $maxCount = 0;
    foreach($eventArray["event"] as $element){
        if($maxCount < count($element['date'])){
            $maxCount = count($element['date']);
        }
    }
    if($isEvent) $maxCount = 3;
    else $maxCount = 4;

    //表の列数
    $colCount = 6 + $maxCount;
    if($isEvent) $colCount++;

    if($isEvent) $widthList = [42, 150, 100, 80, 70, 80, 100];
    else $widthList = [42, 160, 100, 80, 70, 80, 100];
    
    $headWidth = $widthList[0] + $widthList[1] + $widthList[2] + $widthList[3] + $widthList[4] + $widthList[5] + $widthList[6]*$maxCount;
    if($isEvent) $headWidth += $widthList[1];

    $src .= '<table class="dataTable" width="'. $headWidth .'">';
    $src .= '<thead><tr><th class="firstHead" width="'.$headWidth.'"colspan="'.$colCount.'">'.$title.'&nbsp;('.date('Y').'年'.date('n').'月'.date('j').'日現在)</th></tr>';
    $src .= '<tr class="secondHead"><th width="'.$widthList[0].'">画像</th>';
    $src .= '<th width="'.$widthList[1].'">名前&nbsp;<button name="nameSort" onclick="tableBuild('."'name',".$n_order.",".$l_order.",".$t_order.');">'.$n_dir.'</button></th>';

    if($isEvent){
        $src .= '<th width="'.$widthList[1].'">概要</th>';
    }

    $src .= '<th width="'.$widthList[2].'">経過日数&nbsp;<button name="nameSort" onclick="tableBuild('."'lasttime',".$n_order.",".$l_order.",".$t_order.');">'.$l_dir.'</button></th>';
    $src .= '<th width="'.$widthList[3].'">直近開催</th>';
    $src .= '<th width="'.$widthList[4].'">回数&nbsp;<button name="nameSort" onclick="tableBuild('."'times',".$n_order.",".$l_order.",".$t_order.');">'.$t_dir.'</button></th>';
    $src .= '<th width="'.$widthList[5].'">平均間隔</th>';
    //html += '<th width="'+ widthList[4] +'">次回予想開催日</th>';
    
    $src .= '<th width="'.$widthList[6]*$maxCount.'" colspan="'.$maxCount.'">開催日履歴</th></tr></thead></table></div>';

    $src .= '<div class="dataTableBox" style="width:'. $headWidth .'px">';
    $src .= '<table class="dataTable" width="'. $headWidth .'"><tbody>';

    $count = 0;
    foreach($eventArray["event"] as $element){
        $count++;

        $cellClass = "oddCell";
        if($count % 2 == 0) $cellClass = "evenCell";

        $src .= '<tr>';
        $src .= '<td class="'. $cellClass .'" width="'. $widthList[0] .'"><img src="'.$imgFolder.$element['id'].'.jpg" alt="'.$element['name'].'" title="'.$element['name'].'" width="36" height="36"></td>';
        $src .= '<td class="'. $cellClass .'" width="'. $widthList[1] .'">'.$element['name'].'</td>';
        if($isEvent) $src .= '<td class="'. $cellClass .'" width="'. $widthList[1] .'">'.$element['exp'].'</td>';

        $dateArr = $element['date'];
        //$dateArr = array_reverse($dateArr);
        
        $todaySec = time() * 1000;

        $secArr = array();

        foreach($dateArr as $i => $date){
            $d = new DateTime($date['year']."-".$date['month']."-".$date['day'].' 00:00:00');
            array_push($secArr, ($d->format('U') * 1000) );
        }
        
        //var_dump($secArr);

        if(count($secArr) > 0){
            $postSec = $todaySec - $secArr[0];
            $postDay = floor($postSec / (1000 * 60 * 60 * 24));

            $src .= '<td class="'. $cellClass .'" width="'. $widthList[2] .'">'.$postDay.'日</td>';
        }
        else $src .= '<td class="'. $cellClass .'" width="'. $widthList[2] .'">-</td>';

        //直近の開催日
        if(count($dateArr) == 0) $src .= '<td class="'. $cellClass .'" width="'. $widthList[3] .'">-</td>';
        else $src .= '<td class="'. $cellClass .'" width="'. $widthList[3] .'"><b>'.$dateArr[0]['year']."/".$dateArr[0]['month']."/".$dateArr[0]['day'].'</b></td>';

        //開催回数
        $src .= '<td class="'. $cellClass .'" width="'. $widthList[4] .'">'.count($dateArr).'回</td>';

        //平均間隔と予想開催日
        if(count($secArr) > 1){
            $spanSum = 0;
            for($i = 0; $i < count($secArr); $i++){
                if($i == 0) continue;
                $spanSum += ($secArr[$i-1] - $secArr[$i]);
            }
            $spanAve = floor($spanSum / (count($secArr)-1));

            $spanDay = floor($spanAve / (1000 * 60 * 60 * 24));

            $src .= '<td class="'. $cellClass .'" width="'. $widthList[5] .'">'.$spanDay.'日</td>';

            //$preD = new Date( Number(secArr[0] + spanAve) );

            //if($preD.getTime() < $todaySec) $src .= '<td><b><font color="dadada">'+ preD.getFullYear() +"/"+ (preD.getMonth()+1) +"/"+ preD.getDate() +'</font></b></td>';
            //else $src .= '<td><b>'+ preD.getFullYear() +"/"+ (preD.getMonth()+1) +"/"+ preD.getDate() +'</b></td>';
        }
        else $src .= '<td class="'. $cellClass .'" width="'. $widthList[5] .'">-</td>';


        for($i = 0; $i < $maxCount; $i++){
            if( $i >= count($dateArr)){
                $src .= '<td class="'. $cellClass .'">&nbsp;</td>';
            }
            else{
                $src .= '<td class="'. $cellClass .'">'.$dateArr[$i]['year']."/".$dateArr[$i]['month']."/".$dateArr[$i]['day'].'</td>';
            }
        }
        $src .= '</tr>';
    }

    $src .= '</tbody>';

    $src .= <<<EOM

                    </table>
                </div>
            </div>
            </div>
    EOM;

    $str = str_replace("<?=TITLE=>", $title."履歴一覧", $str);
    $str = str_replace("<?=LINK=>", '<a href="index.php?mode=admin">管理ページ</a>', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

?>