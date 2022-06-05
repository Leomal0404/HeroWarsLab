<?php

session_start();

//設定ファイル
require '../common/define.php';

//テンプレHTMLソース
$html = getTempHTML();

//コンテンツページ
echo PageBuild($html);


//閲覧ページ
function PageBuild($html){

    $List_url = "../dungeon/js/dungeon_list.json";
    $List_json = file_get_contents($List_url);
    $List = json_decode($List_json, true);

    $hydraData_url = "../hydra/js/hydraData.json";
    $hydraData_json = file_get_contents($hydraData_url);
    $hydraData = json_decode($hydraData_json, true);
    $hydraData_validate_json = json_encode($hydraData, JSON_UNESCAPED_UNICODE);

    $rewardData_url = "../dungeon/js/dungeonReward_list.json";
    $rewardData_json = file_get_contents($rewardData_url);
    $rewardData = json_decode($rewardData_json, true);
    $rewardData_validate_json = json_encode($rewardData, JSON_UNESCAPED_UNICODE);


    $title = 'ダンジョンシミュレーション';
    $query = time();

    $src = <<<EOM
        <link href="./css/style.css?$query" rel="stylesheet">

        <script type="text/javascript">

            function onload(){
                resourceAmountCalc();
            }

            let hydraData = $hydraData_validate_json;
            let rewardData = $rewardData_validate_json;

            let hydraCount = "legend_3";

            let titaniteCount = 186;

            let oneDayBattleCount = 10;
            let soulStoneCount = 11 + oneDayBattleCount * 2;

            let oneDayGold = 0;

            let guildQuestSphere = 10;

            let nowFloor;

            let sphereCount = 0;
            let powderCount = 0;

            function hydraResourceUpdate(){
                let rank = hydraCount.split("_")[0];
                let count = Number(hydraCount.split("_")[1]);

                sphereCount = 0;
                powderCount = 0;

                for(let i = 0; i < hydraData["rankList"].length; i++){
                    let _rank = hydraData["rankList"][i];

                    if(rank != _rank){
                        for(let j = 0; j < 6; j++){
                            powderCount += hydraData["powderList"][_rank][j];
                            sphereCount += hydraData["sphereList"][_rank][j];
                        }
                    }
                    else if(rank == _rank){
                        for(let j = 0; j < count; j++){
                            powderCount += hydraData["powderList"][_rank][j];
                            sphereCount += hydraData["sphereList"][_rank][j];
                        }
                        break;
                    }
                }
            }

            function hydraCountHandler(e){
                let _idx = e.selectedIndex;
                let _value = e.options[_idx].value;

                hydraCount = _value;
                resourceAmountCalc();
            }

            function guildTitaniteHandler(e){
                let _idx = e.selectedIndex;
                guildQuestSphere = Number(e.options[_idx].value);

                resourceAmountCalc();
            }


            function soulstoneObtainUpdate(){
                oneDayBattleCount = (titaniteCount - 66) / 12

                soulStoneCount = 11 + oneDayBattleCount * 2;

            }

            function titaniteCountHandler(e){
                let _idx = e.selectedIndex;
                let _value = e.options[_idx].value;

                titaniteCount = _value;
                resourceAmountCalc();
            }

            function numCheck(e){
                if(e.value > e.max) e.value = e.max;
                if(e.value < 1) e.value = 1;

                resourceAmountCalc();
            }

            function dungeonRewardsCalc(){
                nowFloor = Number($("#floorNum").val());

                if(nowFloor % 5 > 0){
                    nowFloor += (5 - nowFloor % 5);
                }
                oneDayGold = getDungeonOneDayGoldCalc(nowFloor);

            }
            
            function getDungeonOneDayGoldCalc(nowFloor){
                let startFloor = nowFloor - 5;

                let savePointCount = oneDayBattleCount / 5;

                let _oneDayGold = 0;

                for(let i = 0; i < savePointCount; i++){
                    let _gold = (startFloor / 5) * 300 + 14800;
                    _oneDayGold += _gold;
                    startFloor += 5;
                }

                return _oneDayGold;
            }

            function resourceAmountCalc(){
                hydraResourceUpdate();
                soulstoneObtainUpdate();
                dungeonRewardsCalc();

                let _floor = Number(nowFloor);

                let getElSphere = 0;
                let getSmSphere = 0;
                let getGold = 0;
                let getPowder = 0;
                let getSoulStone = 0;

                let dayCount = 0;

                while(_floor < 10000){
                    //10000階になるまで日付を繰り返す
                    dayCount++;

                    getElSphere += sphereCount;
                    getPowder += powderCount;

                    getSmSphere += (3 + guildQuestSphere);


                    getGold += getDungeonOneDayGoldCalc(_floor);

                    getSoulStone += soulStoneCount;

                    _floor += Number(oneDayBattleCount);
                }

                let oneDayResource = '<table class="dataTable">';
                oneDayResource += '<tr><th>エレメントスフィア</th><td>'+ sphereCount.toLocaleString() +'個</td></tr>';
                oneDayResource += '<tr><th>妖精の粉</th><td>'+ powderCount.toLocaleString() +'個</td></tr>';
                oneDayResource += '<tr><th>ソウルコイン</th><td>'+ (soulStoneCount*10).toLocaleString() +'個</td></tr>';
                oneDayResource += '<tr><th>召喚スフィア</th><td>'+ (3+guildQuestSphere) +'個</td></tr>';
                oneDayResource += '<tr><th>ゴールド</th><td>'+ oneDayGold.toLocaleString() +'</td></tr>';

                $("#todayResource").html(oneDayResource);

                let output = '<table class="dataTable">';
                output += '<tr><th>到達フロア</th><td>'+ _floor.toLocaleString() +'</td></tr>';
                output += '<tr><th>経過日数</th><td>'+ dayCount +'日後</td></tr>';
                output += '<tr><th>エレメントスフィア</th><td>'+ getElSphere.toLocaleString() +'個</td></tr>';
                output += '<tr><th>妖精の粉</th><td>'+ getPowder.toLocaleString() +'個</td></tr>';
                output += '<tr><th>召喚スフィア</th><td>'+ getSmSphere.toLocaleString() +'個</td></tr>';
                output += '<tr><th>ゴールド</th><td>'+ getGold.toLocaleString() +'</td></tr>';                
                output += '<tr><th>ソウルコイン</th><td>'+ (getSoulStone*10).toLocaleString() +'枚</td></tr>';

                $("#resourceAmount").html(output);
            }

        </script>
        <div class="content-box">
            <div id="content">
                <h1>ダンジョンシミュレーション</h1>
                
                <div class="content-block">
                    <h2>各種設定</h2>
                    <div>
                        <span class="selLabel">ヒドラ討伐数</span>
                        <select id="hydraCountSelect" onchange="hydraCountHandler(this);">
                            <option value="legend_6">レジェンドすべて</option>
                            <option value="legend_5">レジェンド5首</option>
                            <option value="legend_4">レジェンド4首</option>
                            <option value="legend_3" selected>レジェンド3首</option>
                            <option value="legend_2">レジェンド2首</option>
                            <option value="legend_1">レジェンド1首</option>
                            <option value="dreadful_6">ドレッドフルすべて</option>
                            <option value="dreadful_5">ドレッドフル5首</option>
                            <option value="dreadful_4">ドレッドフル4首</option>
                            <option value="dreadful_3">ドレッドフル3首</option>
                            <option value="dreadful_2">ドレッドフル2首</option>
                            <option value="dreadful_1">ドレッドフル1首</option>
                            <option value="ancient_6">エンシェントすべて</option>
                            <option value="ancient_5">エンシェント5首</option>
                            <option value="ancient_4">エンシェント4首</option>
                            <option value="ancient_3">エンシェント3首</option>
                            <option value="ancient_2">エンシェント2首</option>
                            <option value="ancient_1">エンシェント1首</option>
                        </select>
                    </div>
                    
                    <div>
                        <span class="selLabel">ギルドチタン石掘削数</span>
                        <select id="guildTitaniteSelect" onchange="guildTitaniteHandler(this);">
                            <option value="15">7500</option>
                            <option value="10" selected>4500</option>
                            <option value="6">3000</option>
                            <option value="3">1500</option>
                            <option value="1">750</option>
                        </select>
                    </div>
                    <div>
                        <span class="selLabel">チタン石掘削数</span>
                        <select id="titaniteCountSelect" onchange="titaniteCountHandler(this);">
                            <option value="186">186</option>
                            <option value="246">246</option>
                            <option value="306">306</option>
                            <option value="366">366</option>
                            <option value="426">426</option>
                            <option value="486">486</option>
                            <option value="546">546</option>
                            <option value="606">606</option>
                            <option value="666">666</option>
                        </select>
                    </div>
                    
                    <div>
                        <span class="selLabel">現在のダンジョンフロア数</span>
                        <input id="floorNum" type="number" max="999999" onchange="numCheck(this);" style="width:70px;" value="3505" />
                    </div>
                    <!--
                    <div>
                        <span class="selLabel">混合バトル累計</span>
                        <input id="mixNum" type="number" max="2842" onchange="numCheck(this);" style="width:50px;" value="1314" />
                        <span class="selLabel">水バトル(vs火)累計</span>
                        <input id="waterNum" type="number" max="2842" onchange="numCheck(this);" style="width:50px;" value="1173" />
                        <span class="selLabel">大地バトル(vs水)累計</span>
                        <input id="earthNum" type="number" max="2842" onchange="numCheck(this);" style="width:50px;" value="785" />
                        <span class="selLabel">火バトル(vs大地)累計</span>
                        <input id="fireNum" type="number" max="2842" onchange="numCheck(this);" style="width:50px;" value="233" />
                    </div>
                    -->
                    
                    <h2>初日１日分の獲得リソース</h2>
                    <div id="todayResource">
                    </div>

                    <h2>10,000階層到着時までの累計獲得リソース</h2>
                    <div id="resourceAmount"></div>
                </div> 

    EOM;

    foreach($List['Battle'] as $key => $battleInfo){
        
    }

    $src .= <<<EOM
            </div>
        </div>
    EOM;

    $html = str_replace("<?=TITLE=>", $title, $html);
    $html = str_replace("<?=LINK=>", '<a href="index.php?mode=admin">管理ページ</a>', $html);
    $html = str_replace("<?=MAIN=>", $src, $html);
    return $html;
}




?>