<?php

session_start();

//設定ファイル
require '../common/define.php';

//テンプレHTMLソース
$html = getTempHTML();


$List_url = "./js/dungeon_list.json";
$List_json = file_get_contents($List_url);
$List = json_decode($List_json, true);


//コンテンツページ
echo PageBuild($html, $List);


//閲覧ページ
function PageBuild($html, $List){

    $title = 'ダンジョン';
    $query = time();

    $src = <<<EOM
        <link href="./css/style.css?$query" rel="stylesheet">
        <div class="content-box">
            <div id="content">
                <h1>ダンジョン</h1>
                
                <div class="content-block">
                    <h2>出現属性法則</h2>
                    <p><span class="message">ダンジョンの敵属性の出現法則は、手持ちのタイタンの各属性ごとのパワーの合計値の一番高い属性によって決まります。</span></p>
                    <div>
                        <span class="selLabel">自陣最強属性選択</span>
                        <select id="topElement" onchange="selElement(this);">
                            <option value="water">水</option>
                            <option value="earth">大地</option>
                            <option value="fire">火</option>
                        </select>
                    </div>
                    <div id="dungeonRule">
                    </div>
                </div> 
                <h2>敵タイタン強化テーブル</h2>
                <p class="message">ダンジョンの敵のパワーは、属性選択し勝利した回数によって各属性ごとに決定されます。</p>
                <div class="dataTableContainer">
                    <div>
                        <table class="dataTable" style="width:680px;">
                            <tr>
                                <th width="80">バトル回数</th>
                                <th width="150">混色</th>
                                <th width="150">大地戦(敵水)</th>
                                <th width="150">水戦(敵火)</th>
                                <th width="150">火戦(敵大地)</th>
                            </tr>
                        </table>
                    </div>
                    <div class="dataTableBox" style="width:705px;">
                        <table class="dataTable" style="width:680px;">
    EOM;

    foreach($List['Battle'] as $key => $battleInfo){
        $times = $battleInfo['Id'];

        $colorClass = ' class="oddCell"';
        if($key % 2 == 0) $colorClass = ' class="evenCell"';

        if($times < 11){
            $src .= '<tr>';
            $src .= '<td width="80"'. $colorClass .'>'.$times.'</td>';
            $src .= '<td width="150"'. $colorClass .'>-</td>';
            $src .= '<td width="150"'. $colorClass .'>-</td>';
            $src .= '<td width="150"'. $colorClass .'>-</td>';
            $src .= '<td width="150"'. $colorClass .'>-</td>';
            $src .= '</tr>';
            continue;
        }

        $mixValue = $battleInfo["level"]["neutral"][2];
        $earthValue = $battleInfo["level"]["water"][2];
        $waterValue = $battleInfo["level"]["fire"][2];
        $fireValue = $battleInfo["level"]["earth"][2];

        if($times > 11){
            $beforeInfo = $List['Battle'][((int) $key - 1)];

            $mixValue .= ' (＋'.($battleInfo["level"]["neutral"][2] - $beforeInfo["level"]["neutral"][2]) .")";
            $earthValue .= ' (＋'.($battleInfo["level"]["water"][2] - $beforeInfo["level"]["water"][2]) .")";
            $waterValue .= ' (＋'.($battleInfo["level"]["fire"][2] - $beforeInfo["level"]["fire"][2]) .")";
            $fireValue .= ' (＋'.($battleInfo["level"]["earth"][2] - $beforeInfo["level"]["earth"][2]) .")";
        }

        $src .= '<tr>';
        $src .= '<td'. $colorClass .'>'. $times .'</td>';
        $src .= '<td'. $colorClass .'>'. $mixValue .'</td>';
        $src .= '<td'. $colorClass .'>'. $earthValue .'</td>';
        $src .= '<td'. $colorClass .'>'. $waterValue .'</td>';
        $src .= '<td'. $colorClass .'>'. $fireValue .'</td>';
        $src .= '</tr>';
    }

    $src .= <<<EOM
                        </table>
                    </div>
                </div>      
            </div>
        </div>

        <script type="text/javascript">

            let topElement = "water";

            function onload(){
                ruleBuild();
            }

            function selElement(e){
                topElement = e.value;
                ruleBuild();
            }

            //ダンジョン属性法則表構築
            function ruleBuild(){
                let html = "";

                let ruleList = [
                    ["prime","mix"],
                    ["other","mix"],
                    ["prime","other"],
                    ["prime","other","mix"],
                    ["other","mix"]
                ];

                let colorList = ["water", "earth", "fire"];

                let setList = {"prime":topElement};
                setList["other"] = [];
                for(let c of colorList){
                    if(c != setList["prime"]) setList["other"].push(c);
                }

                html += '<div class="dataTableContainer">';
                html += '<div class="table-block">';
                html += '<table class="dataTable table-block" style="width:770px;">';
                html += '<tr>';
                html += '<th style="width:90px;">扉末尾番号</td>';
                html += '<th style="width:135px;">1</td>';
                html += '<th style="width:135px;">2</td>';
                html += '<th style="width:135px;">3</td>';
                html += '<th style="width:140px;">4</td>';
                html += '<th style="width:135px;">5</td>';
                html += '</tr>';
                html += '<tr>';
                html += '<th>進行方向</td>';
                html += '<td><img src="./img/arrow_right.png"></td>';
                html += '<td><img src="./img/arrow_right.png"></td>';
                html += '<td><img src="./img/arrow_right.png"></td>';
                html += '<td><img src="./img/arrow_right.png"></td>';
                html += '<td><img src="./img/arrow_down.png"></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<th>選択肢</td>';
                html += '<td>単一</td>';
                html += '<td>選択</td>';
                html += '<td>選択</td>';
                html += '<td>単一</td>';
                html += '<td>選択</td>';
                html += '</tr>';
                html += '<tr>';
                html += '<th>出現属性</td>';
                for(let i = 0; i < ruleList.length; i++){

                    let iconHTML = "";

                    for(let type of ruleList[i]){
                        switch(type){
                            case "prime":
                                iconHTML += '<img src="./img/icon_'+ setList[type] +'_30.png">';
                                break;
                            case "other":
                                for(let other of setList["other"]){
                                    iconHTML += '<img src="./img/icon_'+ other +'_30.png">';
                                }
                                break;
                            case "mix":
                                iconHTML += '<img src="./img/icon_'+ type +'_30.png">';
                                break;
                        }
                    }
                    
                    html += '<td>'+ iconHTML +'</td>';
                }
                html += '</tr>';
                html += '<tr>';
                html += '<th rowspan="4">選択推奨</td>';
                html += '<td class="'+ topElement +'"></td>';
                html += '<td></td>';
                html += '<td class="'+ topElement +'"></td>';
                html += '<td class="'+ topElement +'"></td>';
                html += '<td></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<td></td>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<td></td>';
                html += '<td></td>';
                html += '<td></td>';
                html += '<td class="'+ setList["other"][1] +'"></td>';
                html += '<td></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<td class="gradient"></td>';
                html += '<td class="gradient"></td>';
                html += '<td></td>';
                html += '<td class="gradient"></td>';
                html += '<td class="gradient"></td>';
                html += '</tr>';
                html += '</table>';
                html += '</div>';
                
                html += '<div class="table-block">';
                html += '<table class="dataTable table-block" style="width:770px;">';
                html += '<tr>';
                html += '<th style="width:90px;">扉末尾番号</td>';
                html += '<th style="width:135px;">0</td>';
                html += '<th style="width:140px;">9</td>';
                html += '<th style="width:135px;">8</td>';
                html += '<th style="width:135px;">7</td>';
                html += '<th style="width:135px;">6</td>';
                html += '</tr>';
                html += '<tr>';
                html += '<th>進行方向</td>';
                html += '<td><img src="./img/arrow_left.png"></td>';
                html += '<td><img src="./img/arrow_left.png"></td>';
                html += '<td><img src="./img/arrow_left.png"></td>';
                html += '<td><img src="./img/arrow_left.png"></td>';
                html += '<td><img src="./img/arrow_left.png"></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<th>選択肢</td>';
                html += '<td>選択</td>';
                html += '<td>単一</td>';
                html += '<td>選択</td>';
                html += '<td>選択</td>';
                html += '<td>単一</td>';
                html += '</tr>';
                html += '<tr>';
                html += '<th>出現属性</td>';
                for(let i = ruleList.length - 1; i >= 0; i--){

                    let iconHTML = "";

                    for(let type of ruleList[i]){
                        switch(type){
                            case "prime":
                                iconHTML += '<img src="./img/icon_'+ setList[type] +'_30.png">';
                                break;
                            case "other":
                                for(let other of setList["other"]){
                                    iconHTML += '<img src="./img/icon_'+ other +'_30.png">';
                                }
                                break;
                            case "mix":
                                iconHTML += '<img src="./img/icon_'+ type +'_30.png">';
                                break;
                        }
                    }
                    
                    html += '<td>'+ iconHTML +'</td>';
                }
                html += '</tr>';
                html += '<tr>';
                html += '<th rowspan="4">選択推奨</td>';
                html += '<td></td>';
                html += '<td class="'+ topElement +'"></td>';
                html += '<td class="'+ topElement +'"></td>';
                html += '<td></td>';
                html += '<td class="'+ topElement +'"></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '<td class="'+ setList["other"][0] +'"></td>';
                html += '<td></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<td></td>';
                html += '<td class="'+ setList["other"][1] +'"></td>';
                html += '<td></td>';
                html += '<td></td>';
                html += '<td></td>';
                html += '</tr>';
                html += '<tr>';
                html += '<td class="gradient"></td>';
                html += '<td class="gradient"></td>';
                html += '<td></td>';
                html += '<td class="gradient"></td>';
                html += '<td class="gradient"></td>';
                html += '</tr>';
                html += '</table>';
                html += '</div>';

                html += '</div>';

                document.getElementById('dungeonRule').innerHTML = html;
            }
        </script>
    EOM;


    $html = str_replace("<?=TITLE=>", $title, $html);
    $html = str_replace("<?=LINK=>", '<a href="index.php?mode=admin">管理ページ</a>', $html);
    $html = str_replace("<?=MAIN=>", $src, $html);
    return $html;
}




?>