<?php
//セッション開始
session_start();

//session_destroy();

// 設定ファイル
require '../common/define.php';

require '../common/data/guildUsers.php'; 

$ADMIN_PASSWORD = CONFIG_ADMIN;
$MASTER_PASSWORD = CONFIG_MASTER;
$FREE_PASSWORD = CONFIG_FREE;

//Javascriptに渡すためのログイン情報
$loginType = "NULL";
$loginID = "NULL";

//テンプレHTMLソース
$html = getTempHTML();


//コンテンツページ
if (passCheck() != "NULL") {
    if($loginType == "ADMIN" && $_GET['mode'] == "logManage"){
        //管理画面
        echo manageMode($html);
    }
    else{
        if($_GET['mode'] == "info"){
            //戦績情報
            echo infoView($html);
        }
        else{
            //ユーザーページ
            echo adminMode($html);
        }
    }
}
//未ログインアクセス
else {
    echo adminLogin($html);
    //echo defaultMode($html);
}



//パスワード認証処理
function passCheck(){
    global $ADMIN_PASSWORD, $MASTER_PASSWORD, $FREE_PASSWORD, $loginType, $loginID;

    $input = "";

    $postMode = false;

    if (isset($_SESSION['guild_pass'])) $input = $_SESSION['guild_pass'];
    if (isset($_POST['pass'])) {
        $input = $_POST['pass'];
        $postMode = true;
    }

    //フリーパスワード照合
    foreach ($FREE_PASSWORD as $freePass) {
        if ($input == $freePass) {
            $loginType = "FREE";
            $_SESSION['guild_pass'] = $freePass;
            break;
        }
    }
    //無制限発行パスワード照合
    foreach ($MASTER_PASSWORD as $masterPass) {
        if ($input == $masterPass['pw']) {
            $loginType = "MASTER";
            $loginID = $masterPass['id'];
            $_SESSION['guild_pass'] = $masterPass['pw'];

            //アクセスログ保存
            if($postMode){
                $log_url = "./log/". $masterPass['pw'] .".json";
                if(file_exists($log_url)){
                    $log_json = file_get_contents($log_url);
                    $logList = json_decode($log_json, true);
                }
                else{
                    $logList  = ['logs'=> []];
                }

                $addInfo = ['date'=>time(), 'ip'=>$_SERVER["REMOTE_ADDR"], 'agent'=>$_SERVER['HTTP_USER_AGENT']];

                array_push($logList['logs'], $addInfo);
                

                $validate_json = json_encode($logList,JSON_UNESCAPED_UNICODE);
                file_put_contents($log_url, $validate_json, LOCK_EX);
            }

            break;
        }
    }
    //管理者用ログイン
    if ($input == $ADMIN_PASSWORD) {
        $loginType = "ADMIN";
        $loginID = 'leomal';
        $_SESSION['guild_pass'] = $ADMIN_PASSWORD;

        //アクセスログ保存
        if($postMode){
            $log_url = "./log/admin.json";
            if(file_exists($log_url)){
                $log_json = file_get_contents($log_url);
                $logList = json_decode($log_json, true);
            }
            else{
                $logList  = ['logs'=> []];
            }

            $addInfo = ['date'=>time(), 'ip'=>$_SERVER["REMOTE_ADDR"], 'agent'=>$_SERVER['HTTP_USER_AGENT']];

            array_push($logList['logs'], $addInfo);
            

            $validate_json = json_encode($logList,JSON_UNESCAPED_UNICODE);
            file_put_contents($log_url, $validate_json, LOCK_EX);
        }
    }

    session_write_close();
    if ($postMode) header("Location: " . $_SERVER['REQUEST_URI']);

    return $loginType;
}

//お問い合わせ投稿確認
function contactCheck()
{
    //POSTされたデータを変数に格納（変数の初期化）とデータの整形（前後にあるホワイトスペースを削除）
    $name = trim(filter_input(INPUT_POST, 'name'));
    $email = trim(filter_input(INPUT_POST, 'email'));
    $subject = trim(filter_input(INPUT_POST, 'subject'));
    $body = trim(filter_input(INPUT_POST, 'body'));

    //POSTされたデータをチェック  
    $_POST = checkInput($_POST);

    //エラーメッセージを保存する配列の初期化
    $error = array();

    //値の検証
    if ($name == '') {
        $error['name'] = '*お名前は必須項目です。(ハンドルネーム可)';
        //制御文字でないことと文字数をチェック
    } else if (preg_match('/\A[[:^cntrl:]]{1,30}\z/u', $name) == 0) {
        $error['name'] = '*お名前は30文字以内でお願いします。';
    }
    if ($email == '') {
        $error['email'] = '*メールアドレスは必須です。';
    } else { //メールアドレスを正規表現でチェック
        $pattern = '/\A([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}\z/uiD';
        if (!preg_match($pattern, $email)) {
            $error['email'] = '*メールアドレスの形式が正しくありません。';
        }
    }

    //エラーがなく且つ POST でのリクエストの場合
    if (empty($error) && $_SERVER['REQUEST_METHOD'] === 'POST') {

        //メールアドレス等を記述したファイルの読み込み
        require './mailvars.php'; 

        //メール本文の組み立て
        $mail_body = 'ヒーローシミュレータページからのお問い合わせ' . "\n\n";
        $mail_body .=  "お名前： " .h($name) . "\n";
        $mail_body .=  "Email： " . h($email) . "\n"  ;
        $mail_body .=  "＜お問い合わせ内容＞" . "\n" . h($body);

        //メールの宛先（名前<メールアドレス> の形式）。値は mailvars.php に記載
        $mailTo = mb_encode_mimeheader(MAIL_TO_NAME) ."<" . MAIL_TO. ">";
    
        //Return-Pathに指定するメールアドレス
        $returnMail = MAIL_RETURN_PATH; //
        //mbstringの日本語設定
        mb_language( 'ja' );
        mb_internal_encoding( 'UTF-8' );
    
        // 送信者情報（From ヘッダー）の設定
        $header = "From: " . mb_encode_mimeheader($name) ."<" . $email. ">\n";
        //$header .= "Cc: " . mb_encode_mimeheader(MAIL_CC_NAME) ."<" . MAIL_CC.">\n";
        //$header .= "Bcc: <" . MAIL_BCC.">";

        //メールの送信
        //メールの送信結果を変数に代入
        if ( ini_get( 'safe_mode' ) ) {
            //セーフモードがOnの場合は第5引数が使えない
            $result = mb_send_mail( $mailTo, $subject, $mail_body, $header );
        } else {
            $result = mb_send_mail( $mailTo, $subject, $mail_body, $header, '-f' . $returnMail );
        }


        //メール本文の組み立て
        $mail_body = '（※確認用の自動送信メールです。）' . "\n";
        $mail_body = 'れおまるヒーローシミュレータにお問い合わせを送信しました。' . "\n";
        $mail_body .=  "１～２日以内にはお返事差し上げますのでお待ち下さい。" . "\n\n";
        $mail_body .=  "お名前： " .h($name) . "\n";
        $mail_body .=  "Email： " . h($email) . "\n\n"  ;
        $mail_body .=  "＜お問い合わせ内容＞" . "\n" . h($body);

        //メールの宛先（名前<メールアドレス> の形式）。値は mailvars.php に記載
        $mailTo = mb_encode_mimeheader($name) ."<" . $email. ">";
    
        //Return-Pathに指定するメールアドレス
        $returnMail = MAIL_TO; //
        //mbstringの日本語設定
        mb_language( 'ja' );
        mb_internal_encoding( 'UTF-8' );
    
        // 送信者情報（From ヘッダー）の設定
        $header = "From: " . mb_encode_mimeheader(MAIL_TO_NAME) ."<" . MAIL_TO. ">\n";
        //$header .= "Cc: " . mb_encode_mimeheader(MAIL_CC_NAME) ."<" . MAIL_CC.">\n";
        //$header .= "Bcc: <" . MAIL_BCC.">";

        //メールの送信
        //メールの送信結果を変数に代入
        if ( ini_get( 'safe_mode' ) ) {
            //セーフモードがOnの場合は第5引数が使えない
            $result = mb_send_mail( $email, '【確認】ヒーローシミュレータへのお問い合わせ', $mail_body, $header );
        } else {
            $result = mb_send_mail( $email, '【確認】ヒーローシミュレータへのお問い合わせ', $mail_body, $header, '-f' . $returnMail );
        }

        //メール送信の結果判定
        if ( $result ) {
            $_POST = array(); //空の配列を代入し、すべてのPOST変数を消去
            //変数の値も初期化
            $name = '';
            $email = '';
            $tel = '';
            $subject = '';
            $body = '';
            
            //再読み込みによる二重送信の防止
            $params = '?result='. time();
            //サーバー変数 $_SERVER['HTTPS'] が取得出来ない環境用
            if(isset($_SERVER['HTTP_X_FORWARDED_PROTO']) and $_SERVER['HTTP_X_FORWARDED_PROTO'] === "https") {
            $_SERVER['HTTPS'] = 'on';
            }
            $url = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://').$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME']; 
            header('Location:' . $url . $params);
            exit;
        } 
    }
    else{
        return $error;
    }
}
//エスケープ処理を行う関数
function h($var)
{
    if (is_array($var)) {
        //$varが配列の場合、h()関数をそれぞれの要素について呼び出す（再帰）
        return array_map('h', $var);
    } else {
        return htmlspecialchars($var, ENT_QUOTES, 'UTF-8');
    }
}
//入力値に不正なデータがないかなどをチェックする関数
function checkInput($var)
{
    if (is_array($var)) {
        return array_map('checkInput', $var);
    } else {
        //NULLバイト攻撃対策
        if (preg_match('/\0/', $var)) {
            die('不正な入力です。');
        }
        //文字エンコードのチェック
        if (!mb_check_encoding($var, 'UTF-8')) {
            die('不正な入力です。');
        }
        //改行、タブ以外の制御文字のチェック
        if (preg_match('/\A[\r\n\t[:^cntrl:]]*\z/u', $var) === 0) {
            die('不正な入力です。制御文字は使用できません。');
        }
        return $var;
    }
}


//管理ログイン
function adminLogin($str){

    $contactDeal = "";
    $error = array();

    //投稿内容がある場合
    if (isset($_POST['contactMode'])) {
        $error = contactCheck();

        $contactDeal = 'ContactErrorFormBuild("'.$error['name'].'", "'.$error['email'].'", "'.$_POST['name'].'", "'.$_POST['email'].'", "'.$_POST['subject'].'", "'.$_POST['body'].'");';
    }
    else if(time() - (int)$_GET['result'] < 120){
        $contactDeal = 'ContactCompleteFormBuild();';
    }

    $title = "ヒドラ討伐計画ツール";
    $query = time();

    $src = <<<EOM

    <script type="text/javascript">
        function onload(){
            
        }
    </script>
    <div class="content-box">
        <div id="content">

            <div id="loginArea">
                <div id="loginFormArea">
                    ギルドパスワードを入力してください:
                    <form action="index.php" method="post">
                    <input type="text" name="pass">
                    <input type="submit" value="ログイン">
                    </form>
                </div>
            </div>
        </div>
    </div>

    EOM;

    $str = str_replace("<?=TITLE=>", $title, $str);
    //$str = str_replace("<?=LINK=>", '<a href="./index.php">閲覧ページ</a>', $str);
    $str = str_replace("<?=LINK=>", '', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

//アクセス管理ページ
function manageMode($str){

    global $MASTER_PASSWORD;

    $title = "ヒドラツール アクセス管理";

    $logFiles = glob('./log/*.json');

    $src = "<table>";
    $src .= "<tr><th>パスワード</th><th>ユーザー名</th><th>メールアドレス</th><th>最終ログイン日</th><th>総ログイン回数</th><th>アクセスIP数</th><th>端末数</th></tr>";

    foreach($logFiles as $accountFile){

        $src .= '<tr>';

        //パスワード
        $pw = basename($accountFile, ".json");
        $src .= '<td>'.substr($pw, 0, 2).'****'.'</td>';

        $user = "";
        $mail = "";

        foreach($MASTER_PASSWORD as $passInfo){
            if($passInfo['pw'] == $pw){
                $user = $passInfo['name'];
                $mail = $passInfo['mail'];
                break;
            }
        }

        //ユーザ名
        if($pw == "admin") $src .= '<td>'.'管理者'.'</td>';
        else $src .= '<td>'.$user.'</td>';

        //メールアドレス
        if($pw == "admin") $src .= '<td>'.'管理'.'</td>';
        else $src .= '<td>'.$mail.'</td>';

        $log_json = file_get_contents($accountFile);
        $logList = json_decode($log_json, true);

        $logTimes = count($logList['logs']);

        $ipArray = [];
        $agentArray = [];

        $lastAccess = 0;

        foreach($logList['logs'] as $logInfo){
            $ip = $logInfo['ip'];
            $agent = $logInfo['agent'];

            if($lastAccess < $logInfo['date']) $lastAccess = $logInfo['date'];

            $ipFind = false;
            foreach($ipArray as $ipInfo){
                if($ipInfo == $ip){
                    $ipFind = true;
                    break;
                }
            }
            if($ipFind == false) array_push($ipArray, $ip);

            $agentFind = false;
            foreach($agentArray as $agentInfo){
                if($agentInfo == $agent){
                    $agentFind = true;
                    break;
                }
            }
            if($agentFind == false) array_push($agentArray, $agent);
        }

        //最終ログイン日付
        $datetime = getdate($lastAccess);


        $src .= '<td>'.$datetime['year'].'/'.$datetime['mon'].'/'.$datetime['mday'].' - '.$datetime['hours'].':'.$datetime['minutes'].'</td>';
        $src .= '<td>'.$logTimes.'</td>';
        $src .= '<td>'.count($ipArray).'</td>';
        $src .= '<td>'.count($agentArray).'</td>';

        $src .= "</tr>";
    }

    $src .= "</table>";

    $src .= <<<EOM

    EOM;

    $str = str_replace("<?=TITLE=>", $title, $str);
    $str = str_replace("<?=LINK=>", '<a href="./index.php">閲覧ページ</a>', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);

    return $str;

}


//コンテンツページ
function adminMode($str){
    $src = '<h2>ヒドラ討伐計画ツール</h2>';

    return adminBuild($src, $str);
}

//ログ表示
function infoView($str){

    $src = <<<EOM
        <div class="content-box">
            <div id="content">
                <h2>ヒドラ討伐計画ツール</h2>
    EOM;

    global $loginType;
    global $loginID;

    $title = "ヒドラ討伐計画ツール";

    $query = time();

    $src .= $_SESSION['message'];
    $_SESSION['message'] = "";

    

    list($user, $year, $month, $day) = explode("_", $_GET['query']);

    $target_url = "./userData/". $loginID ."/". $loginID ."_". $year.$month.$day .".json";

    $guildList_json = file_get_contents($target_url);
    $guildList = json_decode($guildList_json, true);
    $targetDate_json = json_encode($guildList,JSON_UNESCAPED_UNICODE);


    $targetTime = strtotime($year .'-'. $month .'-'. $day);

    //前日
    // $prevDate = date('Y-m-d', strtotime('-1 day', $targetTime));

    // list($prevYear, $prevMonth, $prevDay) = explode("-", $prevDate);

    // $target_url = "./userData/". $loginID ."/". $loginID ."_". $prevYear.$prevMonth.$prevDay .".json";

    // $guildList_json = file_get_contents($target_url);
    // $guildList = json_decode($guildList_json, true);
    // $prevDate_json = json_encode($guildList,JSON_UNESCAPED_UNICODE);

    $src .= <<<EOM
        <link href="./css/style.css?$query" rel="stylesheet">
        <script type="text/javascript">
            let certName = "$loginID";

            let targetDayData = $targetDate_json;

            let targetYear = $year;
            let targetMonth = $month;
            let targetDay = $day;

            let logDataList = {};

            </script>
        <script src="info.js?$query"></script>

        <div id="container">
            <div id="infoArea">

            </div>
        </div>

        </div>
        </div>
    EOM;


    $str = str_replace("<?=TITLE=>", $title, $str);

    if($loginType == "ADMIN") $str = str_replace("<?=LINK=>", '<a href="./index.php?mode=logManage">アクセス管理ページ</a>', $str);
    else $str = str_replace("<?=LINK=>", '', $str);

    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;       
}

//シミュレータコンテンツ
function adminBuild($src, $str){

    global $loginType;
    global $loginID;

    $title = "ヒドラ討伐計画ツール";

    $query = time();

    $src = <<<EOM
        <div class="content-box">
            <div id="content">
                <h2>ヒドラ討伐計画ツール</h2>
    EOM;

    $src .= $_SESSION['message'];
    $_SESSION['message'] = "";

    $default_data = '{"guild":{"name":"","members":[],"complete":{},"plan":{"common":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"elder":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"ancient":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"dreadful":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"legend":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]}}}}';

    //現在日付
    $todayDate = date("Ymd");
    if( date('H') < 11) $todayDate = date("Ymd", mktime(0, 0, 0, date("m"), date("d")-1, date("Y")));

    $guildList_url = "./userData/". $loginID ."/". $loginID .".json";
    if(!file_exists($guildList_url)){
        file_put_contents($guildList_url, $default_data);
    }

    $timeStamp = filemtime($guildList_url);

    $guildList_json = file_get_contents($guildList_url);
    $guildList = json_decode($guildList_json, true);
    $guild_validate_json = json_encode($guildList,JSON_UNESCAPED_UNICODE);

    $src .= <<<EOM
        <link href="./css/style.css?$query" rel="stylesheet">
        <script type="text/javascript">
            let certName = "$loginID";

            let guildData = $guild_validate_json;

            let timeStamp = $timeStamp;

            let defaultData = $default_data;

            let logDataList = {};

            let nowTargetDate = "";

            </script>
        <script src="app.js?$query"></script>

        <div id="container">
            <section id="previw">
                <div style="margin:0px 0px 16px 0px;">
                    <div id="nowEditDate" class="nowDateContainer">
                    </div>
                    <div style="float:left;">
                        <form id="frm">
                            <button type="button" onclick="modalOpen();">プラン反映</button>
                            <button type="button" id="btn-clear">フォームのクリア</button>
                            <button type="button" id="btn-log">履歴一覧</button>
                        </form>
                    </div>
                    <div id="imageURL" style="margin:0px 0px 0px 16px;float:left;"></div>
                    <div class="BoxClear"></div>
                </div>
                <div id="planArea">

                </div>
            </section>

            <section id="previw">
                <div style="margin:64px 0px 0px 0px;">
                    <h2>■メンバーリスト</h2>
                    <div id="memberArea">

                    </div>
                </div>
            </section>

            
            <section id="previw">
                <div style="margin:64px 0px 0px 0px;">
                    <h2>■プレビュー</h2>
                    <canvas id="board" width="1220" height="640"></canvas>
                </div>
                <!-- 
                <form id="frm">
                    文字色:<input id="color-text" type="color" value="#0000FF"> 背景色:<input id="color-bg" type="color" value="#FFFFFF"><br>
                    <input type="text" id="txt-message" placeholder="文字を入力してください"><br>
                    <button type="button" id="btn-send">サーバへ保存</button>
                </form>
                -->
            </section>
            
            <!-- 
            <section id="savelist">
                <h2>保存済み画像</h2>
                <ul id="result"></ul>
            </section>
            -->

            <div id="planModalBox" class="plan_modal">
                <div class="plan_modal-content">
                    <div class="plan_modal-header">
                        <h1>プラン登録</h1>
                        <span class="plan_modalClose">×</span>
                    </div>
                    <div class="plan_modal-body">
                        <p>入力した内容を登録する日付を設定して反映ボタンを押してください。</p>
                        <p>設定した日付にすでにプラン情報がある場合、上書き保存されます。</p>
                        <div>
                            <select id="planDate" onchange="settingDateChange(this);">
                            </select>
                            <button type="button" id="btn-send">反映</button>
                            <button type="button" onclick="modalClose();">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        </div>

        </div>
    EOM;


    $str = str_replace("<?=TITLE=>", $title, $str);

    if($loginType == "ADMIN") $str = str_replace("<?=LINK=>", '<a href="./index.php?mode=logManage">アクセス管理ページ</a>', $str);
    else $str = str_replace("<?=LINK=>", '', $str);

    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}
