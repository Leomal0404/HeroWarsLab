<?php

//CSV変換
function csvConvert($str, $List){
    $title = "バトルパスCSV変換ページ";
    $src = '<h2>バトルシミュレータ開発ページ</h2>';

    $num = 1009;

    $text = file_get_contents('./Data/BattlePass_'.$num.'.csv');

    $cnum = $num * 100;


    $data = explode( "\n", $text );
    $cnt = count( $data );

    $src .= "";

    $count = 1;

    $chainNum = 0;
    $chainID = $num - 1000 + 1;
    
    for( $i=0;$i<$cnt;$i++ ){

        $data[$i] = rtrim($data[$i]);

        $elements = explode( ",", $data[$i] );

        //ミッション番号
        $missionNum = $cnum + $count;

        if($elements[2] == "") continue;
        if($elements[1] == "Day") continue;

        //日にち設定
        if($elements[1] > 0) $chainNum = $elements[1];

        //ミッション名取得
        $missionName = $elements[2];

        $missionCode = $List['battlePass']["excel"][$missionName];

        $missionCodeName = $List['battlePass']["codeExchange"][$missionCode];


        $src .= <<<EOM
        "$missionNum":{<br />
        "TranslationMethod":"$missionCodeName",<br />
        "EventChainId":"$chainID",<br />
        "ChainOrder":"$chainNum",<br />
        "Amount":"1",<br />
        "FarmRepeats":"$elements[3]",<br />
        "Reward":["pseudo","$elements[4]","$elements[5]"]<br />
        }
        EOM;

        if($count < 100) $src .= ',<br />';
        else $src .= '<br />';

        $count++;
    }

    $src .= "<br /><br /><br /><br />";

    $str = str_replace("<?=TITLE=>", $title, $str);
    $str = str_replace("<?=LINK=>", '<a href="./index.php">閲覧ページ</a>', $str);
    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

?>