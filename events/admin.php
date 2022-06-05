<?php

//管理ログイン
function adminLogin($str){
    $src = <<<EOM

    <script type="text/javascript">
        function onload(){
            return;
        }
    </script>

    管理者ログイン:
    <form action="index.php?mode=admin" method="post">
    <input type="text" name="pass">
    <input type="submit" value="ログイン">
    </form>
    EOM;
    
    $str = str_replace("<?=LINK=>", '<a href="./index.php">閲覧ページ</a>', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

//登録処理
function adminRegist($str,$heroList,$eventList,$spList,$spEventList,$eventList_url,$spList_url,$spEventList_url){
    
    $src = '<h2>管理者ページ</h2>';

    $type = $_POST['type'];

    //IDと名称を取得
    $id_arr = explode("_", $_POST['eName']);
    $hero_id = $id_arr[0];
    $hero_name = $id_arr[1];

    //入力不備は処理を終了
    if(!$hero_name && empty($_POST['event_name'])){

        if($type == "hero") $_SESSION['message'] = '<p>ヒーローを選択してください</p>';
        else if($type == "other") $_SESSION['message'] = '<p>イベント名を選択もしくは入力してください</p>';
        else $_SESSION['message'] = '<p>イベントの種類を正しく選択してください</p>';

        header("Location:".$_SERVER['PHP_SELF'] ."?mode=admin");
        exit;
    }
    if(!empty($hero_name) && !empty($_POST['event_name']) && $hero_name != $_POST['event_name'] && $type == "other"){
        $_SESSION['message'] = '<p>プルダウンでイベント名を選択する場合は、入力欄は空にしてください</p>';

        header("Location:".$_SERVER['PHP_SELF'] ."?mode=admin");
        exit;
    }
    
    //一般イベント名
    $event_name = $_POST['event_name'];

    //開催日入力情報
    $y = $_POST['year'];
    $m = $_POST['month'];
    $d = $_POST['day'];
    $t = strtotime($y.'-'.$m.'-'.$d.' 0:0:0');

    if($type == "hero"){
        $event_name = "";
        //同内容の検索
        $find = false;
        foreach ($eventList['event'] as $key => $event){
            //すでに登録されているヒーローの情報
            if($event['id'] == $hero_id){

                $find = true;

                //すでに同じ開催日の情報が登録されていないかチェック
                $wCheck = false;
                foreach($eventList['event'][$key]['date'] as $times => $eDate){
                    if($eDate['year'] == $y && $eDate['month'] == $m && $eDate['day'] == $d){
                        $wCheck = true;
                        break;
                    }
                }
                if($wCheck){
                    $_SESSION['message'] = '<p>すでに同じ情報が登録されています</p>';
                    header("Location:".$_SERVER['PHP_SELF'] ."?mode=admin");
                    exit;
                }

                //重複がなければ登録処理
                $eventList['event'][$key]['date'] = array_merge($eventList['event'][$key]['date'],array(array('year'=>$y, 'month'=>$m, 'day'=>$d, 'time'=>$t)));

                $sort = array();
                foreach ($eventList['event'][$key]['date'] as $i => $value) {
                    $sort[$i] = $value['time'];
                }
                array_multisort($sort, SORT_DESC, $eventList['event'][$key]['date']);

                $lasttime = $eventList['event'][$key]['date'][0]['time'];
                $eventList['event'][$key]['lasttime'] = $lasttime;
                $eventList['event'][$key]['times'] = (string) count($eventList['event'][$key]['date']);
            }
        }
        if(!$find){
            $date_arr = array('year'=>$y, 'month'=>$m, 'day'=>$d, 'time'=>$t);
            $eventList['event'] = array_merge($eventList['event'], array(array('id'=>$hero_id, 'name'=>$hero_name, 'evname'=>$event_name, 'date'=>array($date_arr), 'lasttime'=>$t, 'times'=>"1")));
        }

        $regist_json = json_encode($eventList,JSON_UNESCAPED_UNICODE);
        file_put_contents($eventList_url, $regist_json);
        
        $_SESSION['message'] = '<p>'.$hero_name.'：'.$y.'年'.$m.'月'.$d.'日に登録しました</p>';
    }
    else if($type == "other"){
        if(!empty($hero_id) && !empty($hero_name)){
            $event_ID = $hero_id;
            $event_name = $hero_name;
        }
        else $event_ID = "";

        //カテゴリリストの登録確認
        $find = false;
        $chkID = 0;
        foreach ($spList['sp'] as $key => $sp){
            if($sp['name'] == $event_name){
                $find = true;
                $event_ID = $sp['id'];
                break;
            }
            if($chkID < (int) $sp['id']) $chkID = (int) $sp['id'];
        }
        if(empty($event_ID)) $event_ID = ($chkID + 1);

        if(!$find){
            $spList['sp'] = array_merge($spList['sp'], array(array('id'=>$event_ID, 'name'=>$event_name)));
            $regist_json = json_encode($spList,JSON_UNESCAPED_UNICODE);
            file_put_contents($spList_url, $regist_json);
        }

        //イベントリストへの登録
        $find = false;
        foreach ($spEventList['event'] as $key => $event){
            //すでに登録されているイベントの情報
            if($event['id'] == $event_ID){

                $find = true;

                //すでに同じ開催日の情報が登録されていないかチェック
                $wCheck = false;
                foreach($spEventList['event'][$key]['date'] as $times => $eDate){
                    if($eDate['year'] == $y && $eDate['month'] == $m && $eDate['day'] == $d){
                        $wCheck = true;
                        break;
                    }
                }
                if($wCheck){
                    $_SESSION['message'] = '<p>すでに同じ情報が登録されています</p>';
                    header("Location:".$_SERVER['PHP_SELF'] ."?mode=admin");
                    exit;
                }

                //重複がなければ登録処理
                $spEventList['event'][$key]['date'] = array_merge($spEventList['event'][$key]['date'],array(array('year'=>$y, 'month'=>$m, 'day'=>$d, 'time'=>$t)));

                $sort = array();
                foreach ($spEventList['event'][$key]['date'] as $i => $value) {
                    $sort[$i] = $value['time'];
                }
                array_multisort($sort, SORT_DESC, $spEventList['event'][$key]['date']);

                $lasttime = $spEventList['event'][$key]['date'][0]['time'];
                $spEventList['event'][$key]['lasttime'] = $lasttime;
                $spEventList['event'][$key]['times'] = (string) count($spEventList['event'][$key]['date']);
            }
        }
        if(!$find){
            $date_arr = array('year'=>$y, 'month'=>$m, 'day'=>$d, 'time'=>$t);
            $spEventList['event'] = array_merge($spEventList['event'], array(array('id'=>$event_ID, 'name'=>$event_name, 'evname'=>$event_name, 'date'=>array($date_arr), 'lasttime'=>$t, 'times'=>"1")));
        }

        $regist_json = json_encode($spEventList,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
        file_put_contents($spEventList_url, $regist_json);
     
        $_SESSION['message'] = '<p>'.$event_name.'：'.$y.'年'.$m.'月'.$d.'日に登録しました</p>';
    }

    header("Location:".$_SERVER['PHP_SELF'] ."?mode=admin");
    exit;
}
//管理者ページ
function adminMode($str,$heroList,$eventList,$spList,$spEventList){
    $src = '<h2>管理者ページ</h2>';

    return adminBuild($src,$str,$heroList,$eventList,$spList,$spEventList);
}

//管理者ページ構築
function adminBuild($src,$str,$heroList,$eventList,$spList,$spEventList){

    $query = time();


    $src .= $_SESSION['message'];
    $_SESSION['message'] = "";

    $heroListJS = 'eName.options[0] = new Option("▼ヒーローを選択","000");';
    
    $sort = array();
    foreach ($heroList['hero'] as $i => $value) {
        $sort[$i] = $value['name'];
    }
    array_multisort($sort, SORT_ASC, $heroList['hero']);

    $count = 1;
    foreach ($heroList['hero'] as $hero){
        $heroListJS .= 'eName.options['.$count.'] = new Option("'.$hero['name'].'","'.$hero['id'].'_'.$hero['name'].'");';
        $count++;
    }

    $eventListJS = 'eName.options[0] = new Option("▼イベントを選択","000");';

    $sort = array();
    foreach ($spList['sp'] as $i => $value) {
        $sort[$i] = $value['name'];
    }
    array_multisort($sort, SORT_ASC, $spList['sp']);

    $count = 1;
    foreach ($spList['sp'] as $sp){
        $eventListJS .= 'eName.options['.$count.'] = new Option("'.$sp['name'].'","'.$sp['id'].'_'.$sp['name'].'");';
        $count++;
    }

    $src .= <<<EOM
    <link href="./css/style.css?$query" rel="stylesheet">
    <script type="text/javascript">

    function onload(){
        formBuild();
    }
    function formBuild(){

        //日付
        let date = new Date();

        //クッキー読み込み
        let cookies = document.cookie;
        let cookieArray = cookies.split(';');

        if(cookieArray.length < 2){
            document.cookie = "type=0";
            document.cookie = "name=0";
            document.cookie = "year="+ date.getFullYear();
            document.cookie = "month="+ (date.getMonth()+1);
            document.cookie = "day="+ date.getDate();

            cookies = document.cookie;
            cookieArray = cookies.split(';');
        }

        let cookieData = new Array();
        for(let i = 0; i < cookieArray.length; i++){
            let elements = cookieArray[i].split('=');
            cookieData[elements[0].trim()] = elements[1].trim();
        }
        
        //イベントの種類をクッキー情報で選択
        let eType = document.regist.type;
        eType.selectedIndex = cookieData['type'];
        
        let typeNum = eType.selectedIndex;

        let header = document.getElementById('header-text');

        //イベント種類の選択内容に合わせてリストを切り替え
        let eName = document.forms.regist.eName;
        eName.options.length = 0;
        if(typeNum == 0){
            header.innerHTML = "ヒーロー名";
            $heroListJS
            document.getElementById('nameInput').disabled = true;
        }
        else{
            header.innerHTML = "イベント名<br />(※リストにない場合は入力)";
            $eventListJS
            document.getElementById('nameInput').disabled = false;
        }
        eName.selectedIndex = cookieData['name'];

        let ySel = document.regist.year;
        let mSel = document.regist.month;
        let dSel = document.regist.day;
        ySel.selectedIndex = cookieData['year'];
        mSel.selectedIndex = cookieData['month'];
        dSel.selectedIndex = cookieData['day'];
    }
    function typeChange(){
        document.cookie = "type="+ event.target.selectedIndex;
        document.cookie = "name=0";
        formBuild();
    }
    function nameChange(){
        let eType = document.regist.type;
        document.cookie = "type="+ eType.selectedIndex;
        document.cookie = "name="+ event.target.selectedIndex;
    }
    function dateChange(){
        let ySel = document.regist.year;
        let mSel = document.regist.month;
        let dSel = document.regist.day;
        document.cookie = "year="+ ySel.selectedIndex;
        document.cookie = "month="+ mSel.selectedIndex;
        document.cookie = "day="+ dSel.selectedIndex;
    }

    const heroListHTML = '$heroListHTML';
    const eventListHTML = '$eventListHTML';

    </script>

    <table id="regist_table">
    <form name="regist" action="index.php?mode=admin" method="post">

        <tr>
            <th width="250">イベントの種類</th>
            <td>
                <select name="type" id="type-select" onchange="typeChange()">
                    <option value="hero">ヒーロー</option>
                    <option value="other">その他</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><p id="header-text"></p></th>
            <td>
                <div>
                    <select name="eName" id="name-select" onchange="nameChange()">
                    </select>
                </div>
                <div id="listArea"><br /><input id="nameInput" type="text" name="event_name"></div>
            </td>
        </tr>
        <tr>
            <th>イベント開始年月日</th>
            <td>
                <select name="year" id="event-year" onchange="dateChange()">
    EOM;

    for($i = 2017; $i < date("Y") + 2; $i++){
        $src .= '<option value="'.$i.'">'.$i.'</option>';
    }

    $src .= <<<EOM
                </select>年<nbsp;>
                <select name="month" id="event-month" onchange="dateChange()">
    EOM;

    for($i = 0; $i < 12; $i++){
        $src .= '<option value="'.($i+1).'">'.($i+1).'</option>';
    }
    
    $src .= <<<EOM
                </select>月<nbsp;>
                <select name="day" id="event-day" onchange="dateChange()">
    EOM;

    for($i = 0; $i < 31; $i++){
        $src .= '<option value="'.($i+1).'">'.($i+1).'</option>';
    }
        
    $src .= <<<EOM
                </select>日
            </td>
        </tr>
        <tr>
            <th>&nbsp;</th>
            <td><input type="submit" value="登録"></td>
        </tr>
    EOM;

    $src .= '<input type="hidden" name="mode" value="regist">';

    $src .= <<<EOM
    </form>
    </table>

    
    <form action="index.php?mode=admin" method="post">
    EOM;

    $src .= <<<EOM
    <input type="hidden" name="mode" value="validate">
    <input type="submit" value="開発者用ボタン">
    </form>

    

    EOM;
   
    $str = str_replace("<?=LINK=>", '<a href="./index.php">閲覧ページ</a>', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

//開発補助機能
function adminValidate($str,$heroList,$eventList,$spList,$spEventList,$eventList_url,$spList_url,$spEventList_url){
    // foreach ($eventList['event'] as $key => $event){
    //     foreach($eventList['event'][$key]['date'] as $i => $date){
    //         $t = strtotime($date['year'].'-'.$date['month'].'-'.$date['day'].' 0:0:0');
    //         $eventList['event'][$key]['date'][$i]['time'] = (string) $t;
    //         //echo $t."<br>";
    //     }
    // }
    
    // foreach ($eventList['event'] as $key => $event){
    //     $sort = array();
    //     foreach ($eventList['event'][$key]['date'] as $i => $value) {
    //         $sort[$i] = $value['time'];
    //     }
    //     array_multisort($sort, SORT_DESC, $eventList['event'][$key]['date']);
    // }

    // foreach ($eventList['event'] as $key => $event){
    //     if(count($eventList['event'][$key]['date']) > 0){
    //         $eventList['event'][$key]['lasttime'] = $eventList['event'][$key]['date'][0]['time'];
    //     }
    //     else{
    //         $eventList['event'][$key]['lasttime'] = "9999999999";
    //     }
    // }
    // foreach ($eventList['event'] as $key => $event){

    //     $eventList['event'][$key]['times'] = (string) count($eventList['event'][$key]['date']);
    // }

    // $validate_json = json_encode($eventList,JSON_UNESCAPED_UNICODE);
    // file_put_contents($eventList_url, $validate_json);

    $src = '<h2>管理者ページ</h2>';
    $src .= '<p>開発者用ボタンです。</p>';

    return adminBuild($src,$str,$heroList,$eventList,$spList,$spEventList);
}

?>