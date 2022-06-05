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


//管理者ページ
function adminMode($str,$heroList,$itemList){
    $src = '<h2>バトルシミュレータ開発ページ</h2>';

    return adminBuild($src,$str,$heroList,$itemList);
}

//管理者ページ構築
function adminBuild($src,$str,$heroList,$itemList){

    $title = "バトルパス管理ページ";

    $query = time();

    $src .= <<<EOM
    <form action="?mode=admin" method="post">
    EOM;

    $src .= <<<EOM
    <input type="hidden" name="mode" value="validate">
    <input type="submit" value="開発者用ボタン">
    </form>

    <input type="button" value="CSV変換" onclick="location.href='?mode=csv'">
    EOM;

   
    $str = str_replace("<?=TITLE=>", $title, $str);
    $str = str_replace("<?=LINK=>", '<a href="./index.php">閲覧ページ</a>', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

//開発補助機能
function adminValidate($str){

    $src = '<h2>管理者ページ</h2>';

    $text = file_get_contents('./Data/BattlePass.proto');


    $data = explode( "\n", $text );
    $cnt = count( $data );

    $src .= "";

    $ArrayStart = false;
    $count = 1;
    
    for( $i=0;$i<$cnt;$i++ ){

        $data[$i] = rtrim($data[$i]);

        //開始要素
        if(strpos($data[$i],"[[") === 0){
            $pattern = "{\[\[(.*)\]\]}";
            preg_match($pattern,$data[$i],$match);

            if($match[1] == "End"){
                $src .= '}';
                $ArrayStart = false;
                $src .= '<br />';
            }
            else if($match[1] == "End of File"){
                continue;
            }
            else{
                if($count > 1) $src .= ',';
                $element = explode("\t", $match[1]);
                $src .= '{"'.$element[0].'":"'.$element[1].'"';
                $src .= '<br />';
            }
        }
        //RAW要素
        else if(strpos($data[$i],"\t") > 0){
            $element = explode("\t", $data[$i]);

            if(count($element) > 2){
                if($count > 0) $src .= ',';
                $src .= '"'.$element[0].'":[';
                for($e = 1; $e < count($element); $e++){
                    if($e > 1) $src .= ',';
                    $src .= '"'.$element[$e].'"';
                }
                $src .= ']';
                $src .= '<br />';
            }
            else{
                if($count > 0) $src .= ',';
                $src .= '"'.$element[0].'":"'.$element[1].'"';
                $src .= '<br />';
            }
        }
        //親ノード
        else if(strpos($data[$i],"[") === 0){

            $pattern = "{\[(.*)\]}";

            preg_match($pattern,$data[$i],$match);

            if($match[1] == "End"){
                $src .= '}';
                $src .= '<br />';
                $ArrayStart = false;
            }
            else if($match[1] == "[End]"){
                continue;
            }
            else{
                if($count > 0) $src .= ',';
                $src .= '"'.$match[1].'":{';
                $src .= '<br />';
                $ArrayStart = true;
                $count = -1;
            }
        }
        else if(strpos($data[$i],"**") === 0){
            $pattern = '{\*\*(.*)\*\*}';

            preg_match($pattern,$data[$i],$match);

            if($match[1] == "End"){
                $src .= '}';
                $src .= '<br />';
            }
            else{
                if($count > 0) $src .= ',';
                $src .= '"'.$match[1].'":{';
                $ArrayStart = true;
                $count = -1;
            }
        }
        else if(strpos($data[$i],"*") === 0){
            $pattern = "{\*(.*)\*}";

            preg_match($pattern,$data[$i],$match);

            if($match[1] == "End"){
                $src .= '}';
                $src .= '<br />';
            }
            else{
                if($count > 0) $src .= ',';
                $src .= '"'.$match[1].'":{';
                $ArrayStart = true;
                $count = -1;
            }
        }

        $count++;

        
    }


    $src .= '<p>開発者用ボタンです。</p>';

    return adminBuild($src,$str,$heroList,$eventList,$spList,$spEventList);
   
}


?>