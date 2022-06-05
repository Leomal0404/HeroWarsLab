<?php

//シミュレータコンテンツ
function adminMode($str){
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

    global $loginType;
    global $loginID;

    $title = "ヒドラダメージ計算ツール";

    $query = time();

    $src = $_SESSION['message'];
    $_SESSION['message'] = "";

    $heroImgFolder = '"../heroBattle/img/"';

    $heroList_url = "../heroBattle/js/heroData.json";
    $heroList_json = file_get_contents($heroList_url);
    $heroList = json_decode($heroList_json, true);
    $hero_validate_json = json_encode($heroList,JSON_UNESCAPED_UNICODE);

    $artifactList_url = "../artifact/js/heroArtifact_list.json";
    $artifactList_json = file_get_contents($artifactList_url);
    $artifactList = json_decode($artifactList_json, true);
    $artifact_validate_json = json_encode($artifactList,JSON_UNESCAPED_UNICODE);

    $skillList_url = "../skill/js/skillData.json";
    $skillList_json = file_get_contents($skillList_url);
    $skillList = json_decode($skillList_json, true);
    $skill_validate_json = json_encode($skillList,JSON_UNESCAPED_UNICODE);

    $skinList_url = "../skin/js/skinData.json";
    $skinList_json = file_get_contents($skinList_url);
    $skinList = json_decode($skinList_json, true);
    $skin_validate_json = json_encode($skinList,JSON_UNESCAPED_UNICODE);

    $glyphList_url = "../glyph/js/glyph_list.json";
    $glyphList_json = file_get_contents($glyphList_url);
    $glyphList = json_decode($glyphList_json, true);
    $glyph_validate_json = json_encode($glyphList,JSON_UNESCAPED_UNICODE);

    $elementGiftList_url = "../elementGift/js/elementGift_list.json";
    $elementGiftList_json = file_get_contents($elementGiftList_url);
    $elementGiftList = json_decode($elementGiftList_json, true);
    $elementGift_validate_json = json_encode($elementGiftList,JSON_UNESCAPED_UNICODE);

    $itemList_url = "../item/js/equip_list.json";
    $itemList_json = file_get_contents($itemList_url);
    $itemList = json_decode($itemList_json, true);
    $item_validate_json = json_encode($itemList,JSON_UNESCAPED_UNICODE);

    $campaignList_url = "../campaign/js/campaign_list.json";
    $campaignList_json = file_get_contents($campaignList_url);
    $campaignList = json_decode($campaignList_json, true);
    $campaign_validate_json = json_encode($campaignList,JSON_UNESCAPED_UNICODE);

    $hydraList_url = "../hydra/js/hydraData.json";
    $hydraList_json = file_get_contents($hydraList_url);
    $hydraList = json_decode($hydraList_json, true);
    $hydra_validate_json = json_encode($hydraList,JSON_UNESCAPED_UNICODE);


    //ユーザーデータ読み込み
    $myHeroData = "NULL";
    $ownTeamData = "NULL";
    $enemyTeamData = "NULL";
    $nameData = "NULL";
    for($d = 0; $d < 6; $d++){
        $own = $d.'_own';
        $enemy = $d.'_enemy';
        $$own = "NULL";
        $$enemy = "NULL";
    }
    if($loginID != "NULL"){
        $ustdir = '../heroBattle/userData/';
        $filename = $ustdir.$loginID."_heroData.json";
        if (file_exists($filename)) $myHeroData = file_get_contents($filename);

        $filename = $ustdir.$loginID."_ownHeroTeamData.json";
        if (file_exists($filename)) $ownTeamData = file_get_contents($filename);

        $filename = $ustdir.$loginID."_enemyHeroTeamData.json";
        if (file_exists($filename)) $enemyTeamData = file_get_contents($filename);

        $filename = $ustdir.$loginID."_saveNameData.json";
        if (file_exists($filename)) $nameData = file_get_contents($filename);

        for($d = 0; $d < 6; $d++){
            $own = 'custom_'.$d.'_own';
            $enemy = 'custom_'.$d.'_enemy';

            $filename = $ustdir.$loginID."_".$d."_own.json";
            if (file_exists($filename)) $$own = file_get_contents($filename);

            $filename = $ustdir.$loginID."_".$d."_enemy.json";
            if (file_exists($filename)) $$enemy = file_get_contents($filename);
        }
    }

    $src .= <<<EOM
        <link href="./css/style.css?$query" rel="stylesheet">

        <script type="text/javascript">

            let cert = "$loginType";

            let heroList = $hero_validate_json;
            let heroImgFolder = $heroImgFolder;
            
            let artifactList = $artifact_validate_json;
            let skillList = $skill_validate_json;
            let skinList = $skin_validate_json;
            let glyphList = $glyph_validate_json;
            let elementGiftList = $elementGift_validate_json;
            let itemList = $item_validate_json;
            let campaignList = $campaign_validate_json;
            let hydraList = $hydra_validate_json;
            
            let colorNames = ["white", "white", "green", "green", "blue", "blue", "blue", "violet", "violet", "violet", "violetLast", "orange", "orange", "orange", "orangeLast", "orangeLast", "red", "red", "redLast"];
            let colorView = ["なし", "緑", "緑+1", "青", "青+1", "青+2", "紫", "紫+1", "紫+2", "紫+3", "橙", "橙+1", "橙+2", "橙+3", "橙+4", "橙+4FULL"];
            let colorLabels = ["whiteLabel", "whiteLabel", "greenLabel", "greenLabel", "blueLabel", "blueLabel", "blueLabel", "violetLabel", "violetLabel", "violetLabel", "violetLabel", "orangeLabel", "orangeLabel", "orangeLabel", "orangeLabel", "orangeLabel", "redLabel", "redLabel", "redLabel"];
            let colorSuffix = ["", "", "", "+1", "", "+1", "+2", "", "+1", "+2", "+3", "", "+1", "+2", "+3", "+4", "", "+1", "+2"];
            
            let skinStatusNameConvert = {"strength":"stre", "agility":"agil", "intelligence":"inte", "magicPower":"mgatk", "physicalAttack":"phatk","physicalCritChance":"crit", "dodge":"dodge", "hp":"hp", "magicResist":"mgdef", "armorPenetration":"phpen", "armor":"armor", "magicPenetration":"mgpen"};
            
            let skinStatusName = {"strength":"力", "agility":"素早さ", "intelligence":"知力", "magicPower":"魔法攻撃", "physicalAttack":"物理攻撃","physicalCritChance":"クリティカル率", "dodge":"回避率", "hp":"HP", "magicResist":"魔法防御", "armorPenetration":"アーマー貫通", "armor":"アーマー", "magicPenetration":"魔法貫通"};
            
            let modal;
            let myData;
            
            let myUtility;
            let certName = "$loginID";
            
            let updownRange = 1;
            
            
            //ローカルストレージ
            let heroMyData = localStorage.getItem("heroData");
            let ownHeroTeamData = localStorage.getItem("ownHeroTeamData");
            let enemyHeroTeamData = localStorage.getItem("enemyHeroTeamData");
            let saveNameData = localStorage.getItem("saveHeroNameData");
            let utility = localStorage.getItem("heroUtility");
            
            //設定バリエーション
            let ownCustomArray = [];
            let enemyCustomArray = [];
            for(let cIndex = 0; cIndex < 6; cIndex++){
                ownCustomArray[cIndex] = localStorage.getItem(cIndex +"_ownHero");
                enemyCustomArray[cIndex] = localStorage.getItem(cIndex +"_enemyHero");
            }

            //サーバーストレージ
            let sv_heroData = '$myHeroData';
            let sv_ownHeroTeamData = '$ownTeamData';
            let sv_enemyHeroTeamData = '$enemyTeamData';
            let sv_saveNameData = '$nameData';

            let sv_0_own = '$custom_0_own';
            let sv_1_own = '$custom_1_own';
            let sv_2_own = '$custom_2_own';
            let sv_3_own = '$custom_3_own';
            let sv_4_own = '$custom_4_own';
            let sv_5_own = '$custom_5_own';
            let sv_0_enemy = '$custom_0_enemy';
            let sv_1_enemy = '$custom_1_enemy';
            let sv_2_enemy = '$custom_2_enemy';
            let sv_3_enemy = '$custom_3_enemy';
            let sv_4_enemy = '$custom_4_enemy';
            let sv_5_enemy = '$custom_5_enemy';

            if(certName != "NULL"){
                if(sv_heroData != "NULL") heroMyData = sv_heroData;
                if(sv_ownHeroTeamData != "NULL") ownHeroTeamData = sv_ownHeroTeamData;
                if(sv_enemyHeroTeamData != "NULL") enemyHeroTeamData = sv_enemyHeroTeamData;
                if(sv_saveNameData != "NULL") saveNameData = sv_saveNameData;

                for(cIndex = 0; cIndex < 6; cIndex++){
                    if(eval("sv_"+ cIndex +"_own") != "NULL" && eval("sv_"+ cIndex +"_own") != "") ownCustomArray[cIndex] = eval("sv_"+ cIndex +"_own");
                    if(eval("sv_"+ cIndex +"_enemy") != "NULL" && eval("sv_"+ cIndex +"_enemy") != "") enemyCustomArray[cIndex] = eval("sv_"+ cIndex +"_enemy");
                }
            }

            let own_team_array = [];
            let enemy_team_array = [];

            let saveNameArray = {};

            //初回アクセス（ストレージ保存がない場合）
            if(!heroMyData){
                //デフォルトデータを生成                
                let ownText = '{"own_hero":[';
                let enemyText = '"enemy_hero":[';

                let heroCount = 0;
                heroList.forEach(function(element){

                    let heroInfo = "";

                    if(heroCount > 0) heroInfo += ",";

                    heroInfo += '{"id":"'+ element["id"] +'", "lv":"1", "star":"'+ element["Other"]["MinStar"] +'", "color":"1", "equip":["0","0","0","0","0","0"], "skillLevel":["1","0","0","0"],';
                    
                    heroInfo += '"skinLevel":["0"';
                    for(let i = 0; i < element["Skin"].length; i++){
                        heroInfo += ',"0"';
                    }
                    heroInfo += '],';

                    heroInfo += '"artStar":["1", "1", "1"], "artLv":["0", "0", "0"],';
                    heroInfo += '"glyph":["0", "0", "0", "0", "0"],';
                    heroInfo += '"elementGift":"0", "target":"false", "targetColor":"15"}';

                    ownText += heroInfo;
                    enemyText += heroInfo;

                    heroCount++;

                });
                let defaultData = ownText +'],'+ enemyText +'],"equipHas":{"1":0}}';

                localStorage.setItem("heroData",defaultData);
                myData = JSON.parse(defaultData);
            }
            else{
                myData = JSON.parse(heroMyData);
                if(!myData["own_dir"]) myData["own_dir"] = "atk";
            }

            let nowDate = new Date();
            let nowYear = nowDate.getFullYear();
            let nowMonth = nowDate.getMonth();
            let nowDay = nowDate.getDate();

            if(!utility){
                let defalutUtility = '{"useTimes":"0", "year":'+ nowYear +', "month":'+ nowMonth +', "day":'+ nowDay +'}';
                localStorage.setItem("heroUtility",defalutUtility);

                myUtility = JSON.parse(defalutUtility);
            }
            else{
                myUtility = JSON.parse(utility);
            }


            if(ownHeroTeamData || enemyHeroTeamData){
                own_team_array = JSON.parse(ownHeroTeamData);
                enemy_team_array = JSON.parse(enemyHeroTeamData);
            }

            if(!saveNameData){
                saveNameData = '{"own_save":["自陣設定１","自陣設定２","自陣設定３","自陣設定４","自陣設定５","自陣設定６"],"enemy_save":["敵陣設定１","敵陣設定２","敵陣設定３","敵陣設定４","敵陣設定５","敵陣設定６"]}';
                localStorage.setItem("saveHeroNameData",saveNameData);
            }
            saveNameArray = JSON.parse(saveNameData);


            let kigen = 30;
            //現在の日付データを取得
            let date1 = new Date();
            //30日後の日付データを作成
            date1.setTime(date1.getTime() + kigen*24*60*60*1000);
            date2 = date1.toGMTString();

            //let expire = "expires=" + date2;


            let nowActive = "own";
            let nowCustom = "";
            let nowCustomTab = "status";

            //スクロール位置保持用
            let positionTop = 0;
            let scrollArea;

            //クッキー配列
            let cookieArray;
            let cookieData;

            // 選択しているヒドラの種類
            let targetRank = "common";
            let targetType = "fire";
            let targetRankName = "コモン";
            let targetTypeName = "炎";

            // 有効スキル持ちヒーロー名
            let usefulHero = ["コーネリウス","フェイスレス","フォボス","ルーサー","モリガン"];
            let usefulSkillIndex = {"コーネリウス":[2,3],"フェイスレス":[3,4],"フォボス":[1],"ルーサー":[4],"モリガン":[2]};
            let usefulSkillSwitch = {"コーネリウス":[false,false],"フェイスレス":[false,false],"フォボス":[false],"ルーサー":[false],"モリガン":[false]};

            function onload(){
                //フィールド設定
                formBuild();

                //設定ウィンドウ
                modal = document.getElementById('hero_custom_modal');
                let closeBtn = document.getElementById('closeBtn');
                closeBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                    //closeCustom(nowCustom);
                    nowCustom = "";
                    formBuild();
                });

                //汎用ウィンドウ
                let generalCloseBtn = document.getElementById('generalCloseBtn');
                generalCloseBtn.addEventListener('click', function() {
                    document.getElementById('general_modal').style.display = 'none';
                })

                //リソースウィンドウ
                let resourceCloseBtn = document.getElementById('resourceCloseBtn');
                resourceCloseBtn.addEventListener('click', function() {
                    document.getElementById('resource_modal').style.display = 'none';
                })

                //復活の呪文ウィンドウ
                let dataCodeCloseBtn = document.getElementById('dataCodeCloseBtn');
                dataCodeCloseBtn.addEventListener('click', function() {
                    document.getElementById('dataJSON_modal').style.display = 'none';
                })

                //お問い合わせウィンドウ
                let contactCloseBtn = document.getElementById('contactCloseBtn');
                contactCloseBtn.addEventListener('click', function() {
                    document.getElementById('contact_modal').style.display = 'none';
                })
                $contactDeal

                // 指定要素のスクロール量取得
                scrollArea = document.getElementById('detailContent');
                scrollArea.onscroll = function() {
                    positionTop  = this.scrollTop;
                };


                //要素の取得
                let elements = document.getElementsByClassName("drag-and-drop");
            
                //要素内のクリックされた位置を取得するグローバル（のような）変数
                let x;
                let y;
            
                //マウスが要素内で押されたとき、又はタッチされたとき発火
                for(var i = 0; i < elements.length; i++) {
                    elements[i].addEventListener("mousedown", mdown, false);
                    elements[i].addEventListener("touchstart", mdown, false);
                }
            }

            //メインテーブル生成
            function formBuild(){
                let html = "";                
            
                //ヒーロー選択リストボックス
                html += '<div id="hero_team_list" class="titan_list_height"><ul >';
            
                //ヒーローリストを50音順にソート
                heroList.sort(function(a,b){
                    if(a.name<b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                });                
            
                heroList.forEach(function(element){
                    html += '<li>';
                    html += '<div class="heroImage">';
            
                    html += '<div class="avatar-box">';
                    
                    onclickText = "";
                    html += '<div class="hero-avatar-image">';
                    onclickText = "";

                    let key = 0;
                    for(let _d = 0; _d < myData[nowActive +'_hero'].length; _d++){
                        if(myData[nowActive +'_hero'][_d] == element['id']){
                            key = _d;
                            break;
                        }
                    }                    

                    html += '<img id="ownList_'+ element['id'] +'" class="heroAvatorPos" src="'+ heroImgFolder + element['IconAssetTexture'] +'.png" alt="'+ element['name'] +'" title="'+ element['name'] +'" width="54" height="54">';
                    
                    onclickText = 'onclick="window.characterSet('+ "'"+ key +"', '"+ element['id'] +"'" +', '+ "'"+ element['name'] +"'" +', '+ "'"+ element['BattleOrder'] +"'" +')"';

            
                    html += '</div>';
            
                    let t_level = 1;
                    let t_star = 1;
                    let t_color = 0;
            
                    for(let t = 0; t < myData[nowActive +"_hero"].length; t++){
                        if(myData[nowActive +"_hero"][t]['id'] == element['id']){
                            t_level = myData[nowActive +"_hero"][t]['lv'];
                            t_star = myData[nowActive +"_hero"][t]['star'];
                            t_color = myData[nowActive +"_hero"][t]['color'];
                            break;
                        }
                    }
            
                    //アバターフレーム
                    html += '<div class="hero-frame">';
            
                    html += '<img src="'+ heroImgFolder +'heroFrame_'+ colorNames[t_color] +'.png" width="65" height="65" '+ onclickText +'>';
            
                    html += '</div>';
            
                    //レベル表示
                    html += '<div class="level-disp">';
            
                    html += t_level;
            
                    html += '</div>';
            
                    //★ランク表示
                    html += '<div class="star-disp">';
                    html += '<img src="../common/img/star_'+ t_star +'.png" width="60" height="15">';
                    html += '</div>';
            
                    html += '</div>';
                    html += '</div>';
            
                    //名前表示
                    html += '<div class="namePlate" onclick="window.characterCustom('+ "'"+ element['id'] +"'" +",'"+ nowActive + "'" +')">'+ element['name'] +'</div>';
            
                    html += '</li>';
                });
            
                html += '</ul></div>';
            
                html += '<div id="customSaveArea">';
                
                html += '<div class="customSaveButtonBox"><div><input id="saveName0" class="customSaveNameInput" type="text" value="'+ saveNameArray[nowActive +"_save"][0] +'" onchange="saveCustomName(0)"></div><div class="customSaveButtonLayer"><input type="button" value="保存" onclick="saveCustom(0);">';
                if(eval(nowActive +'CustomArray')[0]) html += '<input type="button" value="読込" onclick="loadCustom(0);">';
                html += '</div></div>';
                html += '<div class="customSaveButtonBox"><div><input id="saveName1" class="customSaveNameInput" type="text" value="'+ saveNameArray[nowActive +"_save"][1] +'" onchange="saveCustomName(1)"></div><div class="customSaveButtonLayer"><input type="button" value="保存" onclick="saveCustom(1);">';
                if(eval(nowActive +'CustomArray')[1]) html += '<input type="button" value="読込" onclick="loadCustom(1);">';
                html += '</div></div>';
                html += '<div class="customSaveButtonBox"><div><input id="saveName2" class="customSaveNameInput" type="text" value="'+ saveNameArray[nowActive +"_save"][2] +'" onchange="saveCustomName(2)"></div><div class="customSaveButtonLayer"><input type="button" value="保存" onclick="saveCustom(2);">';
                if(eval(nowActive +'CustomArray')[2]) html += '<input type="button" value="読込" onclick="loadCustom(2);">';
                html += '</div></div>';
                html += '<div class="customSaveButtonBox"><div><input id="saveName3" class="customSaveNameInput" type="text" value="'+ saveNameArray[nowActive +"_save"][3] +'" onchange="saveCustomName(3)"></div><div class="customSaveButtonLayer"><input type="button" value="保存" onclick="saveCustom(3);">';
                if(eval(nowActive +'CustomArray')[3]) html += '<input type="button" value="読込" onclick="loadCustom(3);">';
                html += '</div></div>';
                html += '<div class="customSaveButtonBox"><div><input id="saveName4" class="customSaveNameInput" type="text" value="'+ saveNameArray[nowActive +"_save"][4] +'" onchange="saveCustomName(4)"></div><div class="customSaveButtonLayer"><input type="button" value="保存" onclick="saveCustom(4);">';
                if(eval(nowActive +'CustomArray')[4]) html += '<input type="button" value="読込" onclick="loadCustom(4);">';
                html += '</div></div>';
                html += '<div class="customSaveButtonBox"><div><input id="saveName5" class="customSaveNameInput" type="text" value="'+ saveNameArray[nowActive +"_save"][5] +'" onchange="saveCustomName(5)"></div><div class="customSaveButtonLayer"><input type="button" value="保存" onclick="saveCustom(5);">';
                if(eval(nowActive +'CustomArray')[5]) html += '<input type="button" value="読込" onclick="loadCustom(5);">';
                html += '</div></div>';
                
                html += '<div class="BoxClear"></div></div>';
            
                document.getElementById('screen').innerHTML = html;
            
           
                for(let _index in own_team_array){
                    characterUpdate("own", _index);
                }

                //ボックス更新
                characterBoxSet();
                
            }

            window.addEventListener( "DOMContentLoaded" , ()=> {
                document.getElementsByName("updownRange").forEach(
                    r => r.addEventListener("change" ,
                            e => updownRange = Number(e.target.value)
                        )
                );
            });
            
            //タブの切り替え
            function tabSwitch(target){
                if(nowCustomTab == "skill") document.getElementById(nowCustomTab +'Tab').className = "heroTabHead heroTabDefault";
                else document.getElementById(nowCustomTab +'Tab').className = "heroTabLow heroTabDefault";
            
                nowCustomTab = target;
            
                if(nowCustomTab == "skill") document.getElementById(nowCustomTab +'Tab').className = "heroTabHead heroTabActive";
                else document.getElementById(nowCustomTab +'Tab').className = "heroTabLow heroTabActive";
            
                characterCustom(nowCustom, nowActive);
            }
        </script>
        
        <script src="./js/contactForm.js?$query"></script>
        <script src="./js/SaveAndLoad.js?$query"></script>
        <script src="./js/StatusCalc.js?$query"></script>
        <script src="./js/teamSetting.js?$query"></script>
        <script src="./js/hydraCalc.js?$query"></script>
        <script src="./js/heroCustom.js?$query"></script>
        <script src="./js/resourceWin.js?$query"></script>
        <script src="./js/dataControl.js?$query"></script>

        <script src="../common/js/cryptico.js"></script>
        <div class="content-box">
            <div id="content">
                <div id="app">
                    <h1>$title</h1>

                    <!-- モーダルウィンドウ関連 -->
                    <div id="hero_custom_modal" class="hero_custom_modal">
                        <div class="responsiveModalArea">
                            <div id="floatStatus_modal">
                                <div id="floatStatus_content" class="drag-and-drop">
                                    <div class="floatStatus_msgArea">※このウィンドウはドラッグで移動できます</div>
                                    
                                    <personal-data ref="personal"></personal-data>

                                    <div class="floatWinMenuArea">
                                        <button onclick="floatStatusClose();">閉じる</button>
                                    </div>

                                    <div id="skillCheckArea">
                                        <input type="checkbox" id="skill1" value="skill1" onchange="characterCustom(nowCustom, nowActive);">スキル１<br />
                                        <input type="checkbox" id="skill2" value="skill2" onchange="characterCustom(nowCustom, nowActive);">スキル２<br />
                                        <input type="checkbox" id="skill3" value="skill3" onchange="characterCustom(nowCustom, nowActive);">スキル３<br />
                                        <input type="checkbox" id="skill4" value="skill4" onchange="characterCustom(nowCustom, nowActive);">スキル４
                                    </div>                  
                                </div>
                            </div>
                            <div class="hero_custom_content">
                                <div id="tabMenu">
                                    <div id="skillTab" class="heroTabHead heroTabDefault" onclick="tabSwitch('skill')">スキル</div>
                                    <div id="skinTab" class="heroTabLow heroTabDefault" onclick="tabSwitch('skin')">スキン</div>
                                    <div id="statusTab" class="heroTabLow heroTabActive" onclick="tabSwitch('status')">ステータス</div>
                                    <div id="artifactTab" class="heroTabLow heroTabDefault" onclick="tabSwitch('artifact')">アーティファクト</div>
                                    <div id="glyphTab" class="heroTabLow heroTabDefault" onclick="tabSwitch('glyph')">グリフ</div>
                                    <div id="elementGiftTab" class="heroTabLow heroTabDefault" onclick="tabSwitch('elementGift')">エレメントギフト</div>

                                    <div id="configUIarea">
                                        <div id="pageMoveButtonArea">
                                            <div class="pageMoveButtonBox"><img id="customLeftArrow" src="../common/img/pageArrow_L" width="30" onclick="pageMove(-1);"></div>
                                            <div class="pageMoveButtonBox"><img id="customRightArrow" src="../common/img/pageArrow_R" width="30" onclick="pageMove(1);"></div>
                                            <div class="BoxClear"></div>
                                        </div>
                                        <div style="margin:0px 0px 10px 0px"><input type="radio" id="updown1" name="updownRange" value="1" checked><label for="updown1">±1</label></div>
                                        <div style="margin:0px 0px 10px 0px"><input type="radio" id="updown10" name="updownRange" value="10"><label for="updown10">±10</label></div>
                                        <div style="margin:0px 0px 20px 0px"><input type="radio" id="updownMAX" name="updownRange" value="120"><label for="updownMAX">±MAX</label></div>
                                    </div>
                                </div>
                                <div id="detailArea">
                                    <div id="detailContent">
                                    </div>
                                </div>
                                <div id="screenArea">
                                    <div id="screenHeader">
                                        <div id="nameLabelBox" class="nameLabel whiteLabel">
                                            <div id="nameArea"></div>
                                        </div>
                                        <div id="closeBtn"></div>
                                        <div class="BoxClear"></div>
                                        
                                    </div>

                                    <div id="heroImage">
                                        <div id="starArea"><img id="starRank" src="" width="155" height="40"></div>
                                        <div id="itemLeft"><div class="itemBox" id="item_0"></div><div class="itemBox" id="item_1"></div><div   class="itemBox" id="item_2"></div></div>
                                        <div id="itemCenter">
                                            <div id="infoBtnArea">
                                                <img src="../common/img/infoBtn.png" onclick="resourceInfoOpen();">
                                            </div>
                                            <div id="colorArea">
                                                <div class="color_down"><img src="../common/img/downbtn_s.png" class="btnPos" onclick="colorBtnHandler('down')"></div>
                                                <div class="color_text">カラーランク</div>
                                                <div class="color_up"><img src="../common/img/upbtn_s.png" class="btnPos" onclick="colorBtnHandler('up')"></div>
                                                <div class="BoxClear"></div>
                                            </div>
                                        </div>
                                        <div id="itemRight"><div class="itemBox" id="item_3"></div><div class="itemBox" id="item_4"></div><div class="itemBox" id="item_5"></div></div>
                                        <div class="BoxClear"></div>
                                    </div>

                                    <div>
                                        <div id="obtainArea">
                                            <div id="expArea">　レベル：<img src="../common/img/downbtn_s.png" class="btnPos" onclick="lvBtnHandler('down');"><span id="lvDisp" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="lvBtnHandler('up');"></div>
                                            <div id="soulArea">★ランク：<img src="../common/img/downbtn_s.png" class="btnPos" onclick="starBtnHandler('down');"><span id="starDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="starBtnHandler('up');"></div>
                                        </div>
                                        <div id="powerArea">
                                            <div id="powerView"></div>
                                        </div>
                                        <div class="BoxClear"></div>
                                    </div>
                                </div>
                                <div class="BoxClear"></div>
                            </div>
                        </div>
                    </div> 
                    
                    <div id="resource_modal" class="resource_modal">
                        <div class="responsiveModalArea">
                            <div class="resource_content">
                                <div id="resourceArea">
                                    <div id="resourceInfo">
                                        
                                    </div>
                                </div>
                                <div id="resourceCloseBtn"></div>
                                <div class="BoxClear"></div>
                            </div>
                        </div>
                    </div>

                    <div id="general_modal" class="general_modal">
                        <div class="responsiveModalArea">
                            <div class="general_content">
                                <div id="generalArea">
                                    <div id="generalInfo">
                                        
                                    </div>
                                </div>
                                <div id="generalCloseBtn"></div>
                                <div class="BoxClear"></div>
                            </div>
                        </div>
                    </div>

                    <div id="dataJSON_modal" class="dataJSON_modal">
                        <div class="responsiveModalArea">
                            <div class="resource_content">
                                <div id="dataCodeArea">
                                    <div id="dataCodeIndex">
                                    </div>
                                    <div id="dataCodeForm">
                                        
                                    </div>
                                    <div id="dataCodeButton">
                                        <input type="button" value="読み込み" onclick="importDataHandle();">
                                    </div>
                                </div>
                                <div id="dataCodeCloseBtn">
                                </div>
                                <div class="BoxClear"></div>
                            </div>
                        </div>
                    </div>

                    <div id="contact_modal" class="contact_modal">
                        <div class="responsiveModalArea">
                            <div class="resource_content">
                                <div id="contactArea">
                                    <form id="form" method="post">
                                        <input type="hidden" name="contactMode" value="true" />
                                        <div id="contactInputForm">

                                        </div>
                                    </form>
                                </div>
                                <div id="contactCloseBtn">
                                </div>
                                <div class="BoxClear"></div>
                            </div>
                        </div>
                    </div>

                    <!-- ヘッダコマンドメニュー -->
                    <div class="headListArea">
                        <div id="targetSwitch">
                            <ul>
                                <li id="formatButton" onclick="window.format()">&nbsp;初期化&nbsp;</li>
                                <li id="maxButton" onclick="window.maxBuild()">&nbsp;カンスト&nbsp;</li>
                                <li id="export_data" onclick="window.exportData()">&nbsp;自陣情報の出力&nbsp;</li>
                                <li id="import_data" onclick="window.importData()">&nbsp;陣営情報の入力&nbsp;</li>
                                <li id="contact" onclick="ContactFormBuild();">&nbsp;問い合わせ&nbsp;</li>
                            </ul>
                            <div class="BoxClear"></div>
                        </div>
                    </div>

                    <!-- 計算結果表示エリア -->
                    <result-table ref="result"></result-table>

                    <!-- レスポシンブエリア -->
                    <div class="responsiveContainer">
                        <div class="responsiveArea">
                            <!-- 出陣チームボックス -->
                            <div id="battle_team_box">                    
                                <!-- 自陣 -->
                                <div id="own_team_list">
                                    <div id="own-team-power" class="team-power-view"></div>
                                    <div class="member_pos">
                                        <div id="own_member_4" class="member_box"></div>
                                        <div id="own_member_3" class="member_box"></div>
                                        <div id="own_member_2" class="member_box"></div>
                                        <div id="own_member_1" class="member_box"></div>
                                        <div id="own_member_0" class="member_box"></div>
                                        <div class="BoxClear"></div>
                                    </div>
                                </div>
                
                                <!-- ヒドラ -->                            
                                <hydra-slot></hydra-slot>
                            </div>

                            <div id="screen"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="./js/vueComponent.js?$query"></script>
    EOM;


    $str = str_replace("<?=TITLE=>", $title, $str);

    if($loginType == "ADMIN") $str = str_replace("<?=LINK=>", '<a href="./index.php?mode=logManage">アクセス管理ページ</a>', $str);
    else $str = str_replace("<?=LINK=>", '', $str);

    $str = str_replace("<?=MAIN=>", $src, $str);
    return $str;
}

?>