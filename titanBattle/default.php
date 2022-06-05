<?php

// シミュレータコンテンツ
function adminMode($str)
{
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

    $title = "タイタンギルド戦シミュレータ β版1.01";

    $query = time();

    $src = $_SESSION['message'];
    $_SESSION['message'] = "";

    $heroImgFolder = '"../titan/img/"';

    $heroList_url = "../titan/js/titan_list.json";
    $heroList_json = file_get_contents($heroList_url);
    $heroList = json_decode($heroList_json, true);
    $hero_validate_json = json_encode($heroList, JSON_UNESCAPED_UNICODE);

    $artifactList_url = "../titanArtifact/js/titanArtifact_list.json";
    $artifactList_json = file_get_contents($artifactList_url);
    $artifactList = json_decode($artifactList_json, true);
    $artifact_validate_json = json_encode($artifactList, JSON_UNESCAPED_UNICODE);

    $potionList_url = "../titan/js/titanPotion_list.json";
    $potionList_json = file_get_contents($potionList_url);
    $potionList = json_decode($potionList_json, true);
    $potion_validate_json = json_encode($potionList, JSON_UNESCAPED_UNICODE);

    $skillList_url = "../titanSkill/js/skill_list.json";
    $skillList_json = file_get_contents($skillList_url);
    $skillList = json_decode($skillList_json, true);
    $skill_validate_json = json_encode($skillList, JSON_UNESCAPED_UNICODE);

    $skinList_url = "../titanSkin/js/titanSkin_list.json";
    $skinList_json = file_get_contents($skinList_url);
    $skinList = json_decode($skinList_json, true);
    $skin_validate_json = json_encode($skinList, JSON_UNESCAPED_UNICODE);

    //ユーザーデータ読み込み
    $myTitanData = "NULL";
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
        $ustdir = './userData/';
        $filename = $ustdir.$loginID."_titanData.json";
        if (file_exists($filename)) $myTitanData = file_get_contents($filename);

        $filename = $ustdir.$loginID."_ownTitanTeamData.json";
        if (file_exists($filename)) $ownTeamData = file_get_contents($filename);

        $filename = $ustdir.$loginID."_enemyTitanTeamData.json";
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

            let developMode = true;
            let cert = "$loginType";
            let trialTimes = 1;

            let heroList = $hero_validate_json;
            let artifactList = $artifact_validate_json;
            let potionList = $potion_validate_json;
            let skillList = $skill_validate_json;
            let heroImgFolder = $heroImgFolder;
            let skinList = $skin_validate_json;

            let modal;
            let myData;
            let myUtility;
            let certName = "$loginID";

            let WinTimes = 0;

            let posType = {};

            let winText = '';
            let loseText = '';
            let winData = [];
            let loseData = [];

            let winOwnLog = [];
            let winEnemyLog = [];

            let winOwnTeam = {};
            let winEnemyTeam = {};

            let winEdenLog = [];
            let loseEdenLog = [];

            let skillCancelWinList = [];
            let skillCancelLoseList = [];

            let setPattern = "lose";

            let updownRange = 1;

            //ローカルストレージ
            let titanMyData = localStorage.getItem("titanData");
            let ownTitanTeamData = localStorage.getItem("ownTitanTeamData");
            let enemyTitanTeamData = localStorage.getItem("enemyTitanTeamData");
            let saveNameData = localStorage.getItem("saveNameData");
            let utility = localStorage.getItem("utility");

            //設定バリエーション
            let ownCustomArray = [];
            let enemyCustomArray = [];
            for(let cIndex = 0; cIndex < 6; cIndex++){
                ownCustomArray[cIndex] = localStorage.getItem(cIndex +"_own");
                enemyCustomArray[cIndex] = localStorage.getItem(cIndex +"_enemy");
            }

            //サーバーストレージ
            let sv_titanData = '$myTitanData';
            let sv_ownTitanTeamData = '$ownTeamData';
            let sv_enemyTitanTeamData = '$enemyTeamData';
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
                if(sv_titanData != "NULL") titanMyData = sv_titanData;
                if(sv_ownTitanTeamData != "NULL") ownTitanTeamData = sv_ownTitanTeamData;
                if(sv_enemyTitanTeamData != "NULL") enemyTitanTeamData = sv_enemyTitanTeamData;
                if(sv_saveNameData != "NULL") saveNameData = sv_saveNameData;

                for(cIndex = 0; cIndex < 6; cIndex++){
                    if(eval("sv_"+ cIndex +"_own") != "NULL" && eval("sv_"+ cIndex +"_own") != "") ownCustomArray[cIndex] = eval("sv_"+ cIndex +"_own");
                    if(eval("sv_"+ cIndex +"_enemy") != "NULL" && eval("sv_"+ cIndex +"_enemy") != "") enemyCustomArray[cIndex] = eval("sv_"+ cIndex +"_enemy");
                }
            }

            let own_team_array = [];
            let enemy_team_array = [];

            let saveNameArray = {};

            //シミュレータ用
            let ownHideMember = [];
            let enemyHideMember = [];

            let defLog = {
                'TimeView':'-',
                'mainThum':'-',
                'mainName':'-',
                'mainHP':'-',
                'mainEnergy':'-',
                'Content':'-',
                'targetThum':'-',
                'targetName':'-',
                'targetHP':'-',
                'targetEnergy':'-',
                'PostTime':'-',
                'develop':'-'
            };

            let elementConvert = {"水":"water", "炎":"fire", "地":"earth"};

            if(!titanMyData){
                let defaultData = '{"own_dir":"atk", "own_titan":[{"id":"4000","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4001","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4002","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4003","lv":"1","star":"3","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4010","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4011","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4012","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4013","lv":"1","star":"3","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4020","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4021","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4022","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4023","lv":"1","star":"3","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"}], "enemy_titan":[{"id":"4000","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4001","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4002","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4003","lv":"1","star":"3","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4010","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4011","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4012","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4013","lv":"1","star":"3","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4020","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4021","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4022","lv":"1","star":"1","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"},{"id":"4023","lv":"1","star":"3","art0star":"1","art0lv":"0","art1star":"1","art1lv":"0","art2star":"1","art2lv":"0","skin0":"0", "skin1":"0"}]}';

                localStorage.setItem("titanData",defaultData);
                myData = JSON.parse(defaultData);
            }
            else{
                myData = JSON.parse(titanMyData);
                if(!myData["own_dir"]) myData["own_dir"] = "atk";
            }

            let nowDate = new Date();
            let nowYear = nowDate.getFullYear();
            let nowMonth = nowDate.getMonth();
            let nowDay = nowDate.getDate();

            if(!utility){
                let defalutUtility = '{"useTimes":"0", "year":'+ nowYear +', "month":'+ nowMonth +', "day":'+ nowDay +'}';
                localStorage.setItem("utility",defalutUtility);

                myUtility = JSON.parse(defalutUtility);
            }
            else{
                myUtility = JSON.parse(utility);
            }

            
            if(ownTitanTeamData || enemyTitanTeamData){
                own_team_array = JSON.parse(ownTitanTeamData);
                enemy_team_array = JSON.parse(enemyTitanTeamData);
            }

            if(!saveNameData){
                saveNameData = '{"own_save":["自陣設定１","自陣設定２","自陣設定３","自陣設定４","自陣設定５","自陣設定６"],"enemy_save":["敵陣設定１","敵陣設定２","敵陣設定３","敵陣設定４","敵陣設定５","敵陣設定６"]}';
                localStorage.setItem("saveNameData",saveNameData);
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

            function onload(){
                formBuild();

                modal = document.getElementById('titan_custom_modal');
                let closeBtn = document.getElementById('closeBtn');
                closeBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                    closeCustom(nowCustom);
                    nowCustom = "";
                    formBuild();
                });

                let resourceCloseBtn = document.getElementById('resourceCloseBtn');
                resourceCloseBtn.addEventListener('click', function() {
                    document.getElementById('resource_modal').style.display = 'none';
                })

                let dataCodeCloseBtn = document.getElementById('dataCodeCloseBtn');
                dataCodeCloseBtn.addEventListener('click', function() {
                    document.getElementById('dataJSON_modal').style.display = 'none';
                })

                let contactCloseBtn = document.getElementById('contactCloseBtn');
                contactCloseBtn.addEventListener('click', function() {
                    document.getElementById('contact_modal').style.display = 'none';
                })
                $contactDeal
            }

            function storageUpdate(){
                let saveData = JSON.stringify(myData);
                localStorage.setItem("titanData", saveData);
                ajaxSave("titanData", saveData);
            }

            function ajaxSave(type, data){
                if(certName != "NULL"){
                    $.ajax({
                        type: "POST",
                        url: "ajaxSave.php",
                        data: { 'sendData': data, 'name': certName, 'type': type},
                        dataType : "json",
                        scriptCharset: 'utf-8'
                    })
                    .then(
                        function(param){
                            //console.log(param);
                        },
                        function(XMLHttpRequest, textStatus, errorThrown){
                            console.log(XMLHttpRequest);
                    });
                }
            }

            //使用回数加算
            function utilityUpdate(){
                localStorage.setItem("utility", JSON.stringify(myUtility));
            }

            //メインテーブル生成
            function formBuild(){

                let content = document.getElementById('screen');

                let headList = "";
            
                headList += '<ul>';
                
                if(nowActive == "own"){
                    headList += '<li id="own_switch" class="active" onclick="window.targetSwitch(this)">　自陣設定　</li><li id="enemy_switch" onclick="window.targetSwitch(this)">　敵陣設定　</li>';
                }
                else{
                    headList += '<li id="own_switch" onclick="window.targetSwitch(this)">　自陣設定　</li><li id="enemy_switch" class="active" onclick="window.targetSwitch(this)">　敵陣設定　</li>';
                }

                headList += '<li id="copy_own" onclick="window.copyToEnemy()">　自陣を敵陣に複製　</li><li id="copy_enemy" onclick="window.copyToOwn()">　敵陣を自陣に複製　</li><li id="export_data" onclick="window.exportData()">　自陣情報の出力　</li><li id="import_data" onclick="window.importData()">　陣営情報の入力　</li>';

                headList += '<li id="contact" onclick="ContactFormBuild();">　問い合わせ　</li>';

                document.getElementById('targetSwitch').innerHTML = headList;



                let html = "";
                
                //出陣チームボックス
                html += '<div id="battle_team_box">';
                html += '<div id="own_team_list"><div id="own-team-dir" class="team-dir-view" onclick="teamDirSwitch();"></div><div id="own-team-power" class="team-power-view"></div><div class="member_pos"><div id="own_member_4" class="member_box"></div><div id="own_member_3" class="member_box"></div><div id="own_member_2" class="member_box"></div><div id="own_member_1" class="member_box"></div><div id="own_member_0" class="member_box"></div><div class="BoxClear"></div></div></div>';
                html += '<div id="enemy_team_list"><div id="enemy-team-dir" class="team-dir-view" onclick="teamDirSwitch();"></div><div id="enemy-team-power" class="team-power-view"></div><div class="member_pos"><div id="enemy_member_0" class="member_box"></div><div id="enemy_member_1" class="member_box"></div><div id="enemy_member_2" class="member_box"></div><div id="enemy_member_3" class="member_box"></div><div id="enemy_member_4" class="member_box"></div><div class="BoxClear"></div></div></div>';
                html += '<div class="BoxClear"></div>';
                html += '</div>';

                //タイタン選択リストボックス
                html += '<div id="titan_team_list" class="titan_list_height"><ul>';

                //タイタンリストを50音順にソート
                heroList['titan'].sort(function(a,b){
                    if(a.name<b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                });

                

                heroList['titan'].forEach(function(element){
                    html += '<li>';
                    html += '<div class="titanImage">';

                    html += '<div class="avatar-box">';
                    
                    onclickText = "";

                    let key = 0;
                    for(let _d = 0; _d < myData[nowActive +'_titan'].length; _d++){
                        if(myData[nowActive +'_titan'][_d] == element['id']){
                            key = _d;
                            break;
                        }
                    }

                    if(nowActive == "own"){
                        html += '<img id="ownList_'+ element['id'] +'" src="'+ heroImgFolder +"titanFrame_"+ element['id'] +'.png" alt="'+ element['name'] +'" title="'+ element['name'] +'" width="60" height="60">';

                        onclickText = 'onclick="window.characterSet('+ "'"+ key +"', '"+ element['id'] +"'" +', '+ "'"+ element['name'] +"'" +', '+ "'"+ element['BattleOrder'] +"'" +')"';
                    }
                    else{
                        html += '<img id="enemyList_'+ element['id'] +'" class="flipHorizon" src="'+ heroImgFolder +"titanFrame_"+ element['id'] +'.png" alt="'+ element['name'] +'" title="'+ element['name'] +'" width="60" height="60">';

                        onclickText = 'onclick="window.characterSet('+ "'"+ key +"', '"+ element['id'] +"'" +', '+ "'"+ element['name'] +"'" +', '+ "'"+ element['BattleOrder'] +"'" +')"';
                    }
                    

                    //アバターフレーム
                    html += '<div class="titan-frame">';

                    html += '<img src="'+ heroImgFolder +'titan_frame.png" width="60" height="60" '+ onclickText +'>';

                    html += '</div>';

                    //レベル表示
                    html += '<div class="level-disp">';

                    let t_level = 1;
                    let t_star = 3;
                    for(let t = 0; t < myData[nowActive +"_titan"].length; t++){
                        if(myData[nowActive +"_titan"][t]['id'] == element['id']){
                            t_level = myData[nowActive +"_titan"][t]['lv'];
                            t_star = myData[nowActive +"_titan"][t]['star'];
                            break;
                        }
                    }

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

                content.innerHTML = html;

                //攻防表記
                if(myData['own_dir'] == "atk"){
                    document.getElementById('own-team-dir').innerHTML = '攻';
                    document.getElementById('enemy-team-dir').innerHTML = '防';
                    posType['own'] = "atk";
                    posType['enemy'] = "def";
                }
                else{
                    document.getElementById('own-team-dir').innerHTML = '防';
                    document.getElementById('enemy-team-dir').innerHTML = '攻';
                    posType['own'] = "def";
                    posType['enemy'] = "atk";
                }

                if(nowActive == "enemy") document.getElementById('titan_team_list').style.backgroundColor = '#350101';

                //ボックス更新
                characterBoxSet();
            }

            function saveCustom(slot){

                //let _data = Object.assign({}, myData[nowActive +"_titan"]);
                let _data = Array.from(myData[nowActive +"_titan"]);
                
                localStorage.setItem(slot +"_"+ nowActive, JSON.stringify(_data));
                ajaxSave(slot +"_"+ nowActive, JSON.stringify(_data));

                eval(nowActive +'CustomArray')[slot] = JSON.stringify(_data);

                formBuild();
            }

            function loadCustom(slot){
                myData[nowActive +"_titan"] = JSON.parse(eval(nowActive +'CustomArray')[slot]);
                
                storageUpdate();

                let t_index;
                //チームデータを更新
                for(t_index = 0; t_index < own_team_array.length; t_index++){
                    characterUpdate("own", t_index);
                }
                for(t_index = 0; t_index < enemy_team_array.length; t_index++){
                    characterUpdate("enemy", t_index);
                }

                formBuild();
            }

            function saveCustomName(slot){
                saveNameArray[nowActive +"_save"][slot] = document.getElementById('saveName'+ slot).value;

                let saveNameData = JSON.stringify(saveNameArray);
                
                localStorage.setItem("saveNameData", saveNameData);
                ajaxSave("saveNameData", saveNameData);
            }

            function characterSet(index, id, name, order){
                if(nowActive == "own"){
                    for(let i = 0; i < own_team_array.length; i++){
                        if(own_team_array[i]['id'] == id){
                            characterRemove('own', id);
                            return;
                        }
                    }
                    if(own_team_array.length < 5){

                        let member_info = {};
                        member_info.id = id;
                        member_info.name = name;
                        member_info.order = Number(order);

                        for(let j = 0; j < heroList['titan'].length; j++){
                            if(heroList['titan'][j]['id'] == id){

                                let heroInfo = heroList['titan'][j];

                                member_info.element = heroInfo['Other']['Element'];
                                member_info.titanType = heroInfo['Other']['TitanType'];

                                member_info.walkSpeed = heroInfo['walkPointPerFrame'];

                                //スキルデータ
                                member_info.skill = [];

                                for(let s = 0; s < heroInfo['Skill'].length; s++){
                                    for(let k = 0; k < skillList['skill'].length; k++){
                                        if(skillList['skill'][k]['Id'] == heroInfo['Skill'][s]){
                                            member_info.skill.push(skillList['skill'][k]);
                                            break;
                                        }
                                    }
                                }

                                break;
                            }
                        }

                        member_info.status = statusCalc("own", id);

                        own_team_array.push(member_info);

                        characterBoxSet();
                    }
                }
                else{
                    for(let i = 0; i < enemy_team_array.length; i++){
                        if(enemy_team_array[i]['id'] == id){
                            characterRemove('enemy', id);
                            return;
                        }
                    }

                    if(enemy_team_array.length < 5){

                        let member_info = {};
                        member_info.id = id;
                        member_info.name = name;
                        member_info.order = Number(order);

                        for(let j = 0; j < heroList['titan'].length; j++){
                            if(heroList['titan'][j]['id'] == id){

                                let heroInfo = heroList['titan'][j];

                                member_info.element = heroInfo['Other']['Element'];
                                member_info.titanType = heroInfo['Other']['TitanType'];

                                member_info.walkSpeed = heroInfo['walkPointPerFrame'];

                                //スキルデータ
                                member_info.skill = [];

                                for(let s = 0; s < heroInfo['Skill'].length; s++){
                                    for(let k = 0; k < skillList['skill'].length; k++){
                                        if(skillList['skill'][k]['Id'] == heroInfo['Skill'][s]){
                                            member_info.skill.push(skillList['skill'][k]);
                                            break;
                                        }
                                    }
                                }

                                break;
                            }
                        }

                        member_info.status = statusCalc("enemy", id);

                        enemy_team_array.push(member_info);

                        characterBoxSet();
                    }
                }
            }

            //シミュレーション時にチームの個別情報を更新する
            function characterUpdate(dir, index){

                let member_info;

                if(dir == "own") member_info = own_team_array[index];
                else member_info = enemy_team_array[index];
                
                let _id = member_info.id;
          

                for(let j = 0; j < heroList['titan'].length; j++){
                    if(heroList['titan'][j]['id'] == _id){

                        let heroInfo = heroList['titan'][j];

                        member_info.order = Number(heroInfo["BattleOrder"]);
                        member_info.name = heroInfo["name"];

                        member_info.element = heroInfo['Other']['Element'];
                        member_info.titanType = heroInfo['Other']['TitanType'];

                        member_info.walkSpeed = heroInfo['walkPointPerFrame'];

                        //スキルデータ
                        member_info.skill = [];

                        for(let s = 0; s < heroInfo['Skill'].length; s++){
                            for(let k = 0; k < skillList['skill'].length; k++){
                                if(skillList['skill'][k]['Id'] == heroInfo['Skill'][s]){
                                    member_info.skill.push(skillList['skill'][k]);
                                    break;
                                }
                            }
                        }

                        break;
                    }
                }

                member_info.status = statusCalc(dir, _id);
            }

            function characterRemove(type, id){

                if(type == "own"){
                    for(let i = 0; i < own_team_array.length; i++){
                        if(id == own_team_array[i]['id']){
                            own_team_array.splice(i, 1);
                            break;
                        }
                    }
                    if(nowActive == "own"){
                        let own_img = document.getElementById('ownList_'+ id);
                        own_img.className = "";
                    }
                }
                else{
                    for(let i = 0; i < enemy_team_array.length; i++){
                        if(id == enemy_team_array[i]['id']){
                            enemy_team_array.splice(i, 1);
                            break;
                        }
                    }
                    if(nowActive == "enemy"){
                        let enemy_img = document.getElementById('enemyList_'+ id);
                        enemy_img.className = "flipHorizon";
                    }
                }

                characterBoxSet();
            }

            function characterBoxSet(){
                
                //ボックスを一度リセット
                for(let i = 0; i < 5; i++){
                    let own_box = document.getElementById('own_member_'+ i);
                    own_box.innerHTML = "";

                    let enemy_box = document.getElementById('enemy_member_'+ i);
                    enemy_box.innerHTML = "";
                }

                //ストレージに保存
                let OTD = JSON.stringify(own_team_array);
                let ETD = JSON.stringify(enemy_team_array);

                localStorage.setItem("ownTitanTeamData", OTD);
                localStorage.setItem("enemyTitanTeamData", ETD);

                ajaxSave("ownTitanTeamData", OTD);
                ajaxSave("enemyTitanTeamData", ETD);

                //パワー値
                let ownPower = 0;
                let enemyPower = 0;


                //チーム配列をバトルオーダー順でソート
                own_team_array.sort(function(a,b){
                    if(a.order<b.order) return -1;
                    if(a.order > b.order) return 1;
                    return 0;
                });

                

                //自陣チーム配置
                for(let i = 0; i < own_team_array.length; i++){
                    let box = document.getElementById('own_member_'+ i);

                    let m_info = own_team_array[i];

                    let ownHTML = "";
                    ownHTML += '<div class="avatar-box2">';

                    let onclickText = 'onclick="window.characterRemove('+ "'own','"+ m_info.id +"'" +')"';

                    ownHTML += '<img id="own_'+ m_info.id +'" src="'+ heroImgFolder +"titanFrame_"+ m_info.id +'.png" alt="'+ m_info.name +"-"+ m_info.order +'" title="'+ m_info.name +"-"+ m_info.order +'" width="70" height="70">';


                    //パワー値
                    ownPower += Math.floor(Number(m_info['status']['power']));

                    //アバターフレーム
                    ownHTML += '<div class="titan-frame2">';

                    ownHTML += '<img src="'+ heroImgFolder +'titan_frame.png" width="70" height="70" '+ onclickText +'>';

                    ownHTML += '</div>';

                    //レベル表示
                    ownHTML += '<div class="level-disp2">';

                    let t_level = 1;
                    let t_star = 3;
                    for(let t = 0; t < myData[nowActive +"_titan"].length; t++){
                        if(myData[nowActive +"_titan"][t]['id'] == m_info.id){
                            t_level = myData["own_titan"][t]['lv'];
                            t_star = myData["own_titan"][t]['star'];
                            break;
                        }
                    }

                    ownHTML += t_level;

                    ownHTML += '</div>';

                    //★ランク表示
                    ownHTML += '<div class="star-disp2">';
                    ownHTML += '<img src="../common/img/star_'+ t_star +'.png" width="70" height="17">';
                    ownHTML += '</div>';

                    ownHTML += '</div>';
                    ownHTML += '</div>';




                    box.innerHTML = ownHTML;
                    

                    if(nowActive == "own"){
                        let own_img = document.getElementById('ownList_'+ m_info.id);
                        own_img.className = "greyDown";
                    }
                }

                //チーム配列をバトルオーダー順でソート
                enemy_team_array.sort(function(a,b){
                    if(a.order<b.order) return -1;
                    if(a.order > b.order) return 1;
                    return 0;
                });

                for(let i = 0; i < enemy_team_array.length; i++){
                    let box = document.getElementById('enemy_member_'+ i);

                    let m_info = enemy_team_array[i];



                    let ownHTML = "";
                    ownHTML += '<div class="avatar-box2">';

                    let onclickText = 'onclick="window.characterRemove('+ "'enemy','"+ m_info.id +"'" +')"';

                    ownHTML += '<img id="enemy_'+ m_info.id +'" class="flipHorizon" src="'+ heroImgFolder +"titanFrame_"+ m_info.id +'.png" alt="'+ m_info.name +"-"+ m_info.order +'" title="'+ m_info.name +"-"+ m_info.order +'" width="70" height="70">';

                    //パワー値
                    enemyPower += Math.floor(Number(m_info['status']['power']));

                    //アバターフレーム
                    ownHTML += '<div class="titan-frame2">';

                    ownHTML += '<img src="'+ heroImgFolder +'titan_frame.png" width="70" height="70" '+ onclickText +'>';

                    ownHTML += '</div>';

                    //レベル表示
                    ownHTML += '<div class="level-disp2">';

                    let t_level = 1;
                    let t_star = 3;
                    for(let t = 0; t < myData[nowActive +"_titan"].length; t++){
                        if(myData[nowActive +"_titan"][t]['id'] == m_info.id){
                            t_level = myData["enemy_titan"][t]['lv'];
                            t_star = myData["enemy_titan"][t]['star'];
                            break;
                        }
                    }

                    ownHTML += t_level;

                    ownHTML += '</div>';

                    //★ランク表示
                    ownHTML += '<div class="star-disp2">';
                    ownHTML += '<img src="../common/img/star_'+ t_star +'.png" width="70" height="17">';
                    ownHTML += '</div>';

                    ownHTML += '</div>';
                    ownHTML += '</div>';

                    box.innerHTML = ownHTML;

                    if(nowActive == "enemy"){
                        let enemy_img = document.getElementById('enemyList_'+ m_info.id);
                        enemy_img.className = "greyDown flipHorizon";
                    }
                }

                
                
                document.getElementById('own-team-power').innerHTML = ownPower;
                document.getElementById('enemy-team-power').innerHTML = enemyPower;
            }

            //攻防切り替え
            function teamDirSwitch(){
                if(myData['own_dir'] == "atk"){
                    myData['own_dir'] = "def";
                }
                else{
                    myData['own_dir'] = "atk";
                }

                storageUpdate();
                formBuild();
            }

            //自陣・敵陣の切り替え
            function targetSwitch(e){

                if(nowActive == "own" && e.id == "enemy_switch"){
                    nowActive = "enemy";
                }
                else if(nowActive == "enemy" && e.id == "own_switch"){
                    nowActive = "own";
                }
                formBuild();
            }

            
            //指定タイタンのステータス計算
            function statusCalc(pos, id){
                let getTitanData = myData[pos +"_titan"];


                for(let i = 0; i < heroList['titan'].length; i++){

                    let heroInfo = heroList['titan'][i];

                    let titanLevel;
                    let titanStar;
                    let titanIndex;

                    if(heroInfo['id'] == id){


                        for(let t = 0; t < getTitanData.length; t++){
                            if(getTitanData[t]['id'] == id){
                                titanIndex = t;
                                titanLevel = Number(getTitanData[titanIndex]['lv']);
                                titanStar = getTitanData[titanIndex]['star'];
                                break;
                            }
                        }

                        let artHP = 0;
                        let artATK = 0;

                        let HPregen = 0;
                        let weaponDamageToX = 0;
                        let weaponDamageFromX = 0;
                        let damageToX = 0;
                        let damageFromX = 0;
                        let extraWeapon = 0;

                        let typeExp = "";
                        let weaponRate = 0;
                        let weaponType = "";

                        //アーティファクト情報
                        for(let a = 0; a < heroInfo['Artifacts'].length; a++){
                            let art_id = heroInfo['Artifacts'][a];

                            let artStar = Number(getTitanData[titanIndex]['art'+ a +'star']);
                            let artLevel = Number(getTitanData[titanIndex]['art'+ a +'lv']);

                            let BattleEffectIdArray = artifactList['Artifact'][0]['Id'][art_id]['BattleEffect'];
                            let artEffectData = artifactList['Artifact'][0]['Battle Effect'];

                            for(let e = 0; e < BattleEffectIdArray.length; e++){

                                let effectID = BattleEffectIdArray[e];

                                for(let b = 0; b < artEffectData.length; b++){
                                    if(artEffectData[b][effectID]){
                                        let exp = artEffectData[b]['exp'];
                                        
                                        let value = Number(artEffectData[b]['level'][artLevel]);

                                        //★ランクによる詳細取得
                                        let artTypeData = artifactList['Artifact'][0]['Type'];
                                                
                                        //ウェポン
                                        if(a == 0){
                                            let rate = Number(artTypeData['weapon']['Evolution'][artStar][0]);

                                            if(artLevel > 0) weaponRate = Number(artTypeData['weapon']['Evolution'][artStar][3]);
                                            weaponType = exp;

                                            if(exp.indexOf("回復")> 0 ){
                                                if(artLevel > 0) HPregen += value * rate;
                                            }
                                            else if(exp.indexOf("追加")> 0 ){
                                                if(artLevel > 0) weaponDamageToX += value * rate;
                                                typeExp = exp;
                                            }
                                            else if(exp.indexOf("減少")> 0 ){
                                                if(artLevel > 0) weaponDamageFromX += value * rate;
                                                typeExp = exp;
                                            }
                                            else if(artLevel > 0) extraWeapon += value * rate;
                                        }
                                        //アーマー
                                        else if(a == 1){
                                            let rate = Number(artTypeData['armor']['Evolution'][artStar][0]);

                                            if(exp.indexOf("追加")> 0 ){
                                                if(artLevel > 0) damageToX += value * rate;
                                                typeExp = exp;
                                            }
                                            else if(exp.indexOf("減少")> 0 ){
                                                if(artLevel > 0) damageFromX += value * rate;
                                                typeExp = exp;
                                            }
                                        }
                                        //アミュレット
                                        else if(a == 2 && artLevel > 0){
                                            let rate = Number(artTypeData['amulet']['Evolution'][artStar][0]);
                                            if(artEffectData[b][effectID] == "physicalAttack") artATK = value * rate;
                                            if(artEffectData[b][effectID] == "hp") artHP = Math.floor(value * rate);
                                        }

                                        break;
                                    }
                                }
                            }
                        }

                        //ステータス
                        let BasicHP = Number(heroInfo['BaseStats']['Hp']);
                        let BasicATK = Number(heroInfo['BaseStats']['PhysicalAttack']);

                        let hp = BasicHP + (titanLevel * Number(heroInfo['Stars'][titanStar]['Hp']) * Math.pow(titanLevel, 0.5)) + artHP;
                        let atk = BasicATK + (titanLevel * Number(heroInfo['Stars'][titanStar]['PhysicalAttack']) * Math.pow(titanLevel, 0.5)) + artATK;

                        //スキン情報
                        let skinNumbers = heroInfo['Skin'];
                        //スキンによるステータス追加
                        let skinIndex;
                        for(let skinIndex = 0; skinIndex < skinNumbers.length; skinIndex++){
                            let skinID = skinNumbers[skinIndex];

                            if(!myData[pos +"_titan"][titanIndex]['skin'+ skinIndex]) myData[pos +"_titan"][titanIndex]['skin'+ skinIndex] = 0;
                            let skinLevel = myData[pos +"_titan"][titanIndex]['skin'+ skinIndex];

                            //スキンリスト
                            for(let listIndex = 0; listIndex < skinList["titanSkin"].length; listIndex++){
                                if(skinList["titanSkin"][listIndex]["Id"] == skinID){
                                    let statusCode = skinList["titanSkin"][listIndex]["StatData"]["1"][6];
                                    let skinValue = skinList["titanSkin"][listIndex]["StatData"][String(skinLevel)][7];

                                    switch(statusCode){
                                        case "hp":
                                            hp += Number(skinValue);
                                        break;
                                        case "physicalAttack":
                                            atk += Number(skinValue);
                                        break;
                                        case "defenseFromfire":
                                            damageFromX += Number(skinValue);
                                        break;
                                        case "damageTowater":
                                            damageToX += Number(skinValue);
                                        break;
                                    }
                                    break;
                                }
                            }
                        }

                        //パワー
                        let power = 0;

                        power += (hp * 0.0051);
                        power += (atk * 0.068);
                        power += (HPregen * 0.09) * 2;
                        power += (damageToX * 0.048);
                        power += (damageFromX * 0.05);
                        power += (weaponDamageToX * 0.048) * 2;
                        power += (weaponDamageFromX * 0.05) * 2;
                        power += (extraWeapon * 0.068) * 2;

                        let statusArray = {"power":power, "hp":hp, "atk":atk, "HPregen":HPregen, "damageToX":damageToX, "damageFromX":damageFromX, "weaponDamageToX":weaponDamageToX, "weaponDamageFromX":weaponDamageFromX, "extraWeapon":extraWeapon, "typeExp":typeExp, "weaponRate":weaponRate, "weaponType":weaponType};

                        return statusArray;
                    }
                }
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
                if(nowCustomTab == "status") document.getElementById(nowCustomTab +'Tab').className = "tabHead tabDefault";
                else document.getElementById(nowCustomTab +'Tab').className = "tabLow tabDefault";

                nowCustomTab = target;

                if(nowCustomTab == "status") document.getElementById(nowCustomTab +'Tab').className = "tabHead tabActive";
                else document.getElementById(nowCustomTab +'Tab').className = "tabLow tabActive";

                characterCustom(nowCustom, nowActive);
            }

        </script>
        <script src="./js/contactForm.js?$query"></script>
        <script src="./js/titanBattleSimulate.js?$query"></script>
        <script src="./js/titanCustom.js?$query"></script>
        <script src="./js/dataControl.js?$query"></script>
        <script src="../common/js/cryptico.js"></script>

        <div class="content-box">
            <div id="content">
                <h1>タイタンシミュレータ</h1>


        <div id="titan_custom_modal" class="titan_custom_modal">
        <div class="responsiveModalArea">
            <div class="titan_custom_content">
                <div id="tabMenu">
                    <div id="statusTab" class="tabHead tabActive" onclick="tabSwitch('status')">ステータス</div>
                    <div id="skinTab" class="tabLow tabDefault" onclick="tabSwitch('skin')">スキン</div>
                    <div style="margin:50px 0px 0px 10px">
                        <div style="margin:0px 0px 20px 0px">
                            <div class="arrowButtonBox"><img id="customLeftArrow" src="../common/img/pageArrow_L" onclick="pageMove(-1);"></div>
                            <div class="arrowButtonBox"><img id="customRightArrow" src="../common/img/pageArrow_R" onclick="pageMove(1);"></div>
                            <div class="BoxClear"></div>
                        </div>
                        <div style="margin:0px 0px 10px 0px"><input type="radio" id="updown1" name="updownRange" value="1" checked><label for="updown1">±1</label></div>
                        <div style="margin:0px 0px 10px 0px"><input type="radio" id="updown10" name="updownRange" value="10"><label for="updown10">±10</label></div>
                        <div style="margin:0px 0px 20px 0px"><input type="radio" id="updownMAX" name="updownRange" value="120"><label for="updownMAX">±MAX</label></div>
                        <div><input type="button" id="customSimulateButton" name="customSimulateButton" value="対戦実行" onclick="simulate();"></div>
                    </div>
                </div>
                <div id="detailArea">
                    <div id="statusDisplay">
                        <!-- レベル設定 -->
                        <div id="expArea">
                            <img src="../common/img/downbtn_s.png" class="btnPos" onclick="lvBtnHandler('down');"><span id="lvDisp" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="lvBtnHandler('up');"><img class="btnPos" src="../common/img/infoBtn.png" onclick="resourceView();">
                        </div>
                        <!-- 育成費用 -->
                        <div id="costArea"></div>
                        <!-- ステータス -->
                        <div id="statsArea"></div>
                        <!-- アーティファクト -->
                        <div id="artifactArea">
                            <div id="artifactIconArea">
                                <div class="titanArtifactBox">
                                    <div class="avatar-box">
                                        <div class="titan-avatar-image">
                                            <img id="artImage_0" src="" alt="" title="" width="70" height="70">
                                        </div>
                                        <div class="titanArtifactFrame">
                                            <img id="artFrame_0" src="" width="75" height="75" '+ onclickText +'>
                                        </div>
                                        <div id="artLevel_0" class="titanArtifactLevelDisp"></div>
                                        <div class="titanArtifactStarDisp">
                                            <img id="artStar_0" src="" width="75" height="20">
                                        </div>
                                    </div>
                                </div>

                                <div class="titanArtifactBox">
                                    <div class="avatar-box">
                                        <div class="titan-avatar-image">
                                            <img id="artImage_1" src="" alt="" title="" width="70" height="70">
                                        </div>
                                        <div class="titanArtifactFrame">
                                            <img id="artFrame_1" src="" width="75" height="75" '+ onclickText +'>
                                        </div>
                                        <div id="artLevel_1" class="titanArtifactLevelDisp"></div>
                                        <div class="titanArtifactStarDisp">
                                            <img id="artStar_1" src="" width="75" height="20">
                                        </div>
                                    </div>
                                </div>

                                <div class="titanArtifactBox">
                                    <div class="avatar-box">
                                        <div class="titan-avatar-image">
                                            <img id="artImage_2" src="" alt="" title="" width="70" height="70">
                                        </div>
                                        <div class="titanArtifactFrame">
                                            <img id="artFrame_2" src="" width="75" height="75" '+ onclickText +'>
                                        </div>
                                        <div id="artLevel_2" class="titanArtifactLevelDisp"></div>
                                        <div class="titanArtifactStarDisp">
                                            <img id="artStar_2" src="" width="75" height="20">
                                        </div>
                                    </div>
                                </div>

                                <div class="BoxClear"></div>
                            </div>
                            <div id="artifactStarArea">
                                <img src="../common/img/downbtn_s.png" class="artbtnPos" onclick="artStarBtnHandler(0,'down');"><span id="art0star" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="artStarBtnHandler(0,'up');">
                                <img src="../common/img/downbtn_s.png" class="artbtnPos" onclick="artStarBtnHandler(1,'down');"><span id="art1star" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="artStarBtnHandler(1,'up');">
                                <img src="../common/img/downbtn_s.png" class="artbtnPos" onclick="artStarBtnHandler(2,'down');"><span id="art2star" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="artStarBtnHandler(2,'up');">
                            </div>
                            <div id="artifactLevelArea">
                                <img src="../common/img/downbtn_s.png" class="artbtnPos" onclick="artLvBtnHandler(0,'down');"><span id="art0lv" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="artLvBtnHandler(0,'up');">
                                <img src="../common/img/downbtn_s.png" class="artbtnPos" onclick="artLvBtnHandler(1,'down');"><span id="art1lv" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="artLvBtnHandler(1,'up');">
                                <img src="../common/img/downbtn_s.png" class="artbtnPos" onclick="artLvBtnHandler(2,'down');"><span id="art2lv" class="valueDisp"></span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="artLvBtnHandler(2,'up');">
                            </div>
                        </div>
                    </div>
                    <div id="skinDisplay">
                        <div id="skinArrayArea">
                            <div id="defaultSkinBlock" class="titanSkinBox">
                                <div class="skillIconCol">
                                    <div class="avatarBox">
                                        <div class="skillAvatar">
                                            <img id="skin0img" class="titanAvatorPos_team" src="" width="68" height="68">
                                        </div>

                                        <div class="avatarFrame">
                                            <img src="../skin/img/skin_frame.png" alt="" title="スキン" width="80" height="80" onclick="">
                                        </div>
                                    </div>
                                </div>
                                <div class="skillDetailCol">
                                    <div class="skinNameIndex">デフォルトスキン</div>
                                    <div id="skin0status" class="skinNameIndex">ステータス名</span></div>
                                    <div class="skillLevelCustomArea">
                                    
                                    <img id="skin0downButton" src="../common/img/downbtn_s.png" class="btnPos" onclick="skinLvHandler('down',0);"><span id="skin0lv" class="skinLevelDisp">0/60</span><img id="skin0upButton" src="../common/img/upbtn_s.png" class="btnPos" onclick="skinLvHandler('up',0);">

                                    </div>
                                </div>

                                <div class="BoxClear"></div>
                            </div>
                            <div id="championSkinBlock" class="titanSkinBox">
                                <div class="skillIconCol">
                                    <div class="avatarBox">
                                        <div class="skillAvatar">
                                            <img id="skin1img" class="titanAvatorPos_team" src="" width="68" height="68">
                                        </div>

                                        <div class="avatarFrame">
                                            <img src="../skin/img/skin_frame.png" alt="" title="スキン" width="80" height="80" onclick="">
                                        </div>
                                    </div>
                                </div>
                                <div class="skillDetailCol">
                                    <div class="skinNameIndex">原始スキン</div>
                                    <div id="skin1status" class="skinNameIndex">ステータス名</span></div>
                                    <div class="skillLevelCustomArea">
                                    
                                    <img id="skin1downButton" src="../common/img/downbtn_s.png" class="btnPos" onclick="skinLvHandler('down',1);"><span id="skin1lv" class="skinLevelDisp">0/60</span><img id="skin1upButton" src="../common/img/upbtn_s.png" class="btnPos" onclick="skinLvHandler('up',1);">

                                    </div>
                                </div>

                                <div class="BoxClear"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="screenArea">
                    <div id="screenHeader">
                        <div class="nameLabel whiteLabel">
                            <div id="nameArea"></div>
                        </div>
                        <div id="closeBtn"></div>
                        <div class="BoxClear"></div>
                        
                    </div>

                    <div id="titanImageBox">
                        <div id="titanImage"></div>
                        <div id="starArea"><img id="starRank" src="" width="155" height="40"></div>
                        <div id="skillArea">
                            スキルウィンドウ
                        </div>
                    </div>

                    <div>
                        <div id="obtainArea">
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
                        <div id="titanResourceName"></div>
                        <div id="resourcePotionArea">
                            現レベルからレベル<input type="number" maxlength="3" step="1" id="aimLevelInput" value="120" style="width:45px;" max="120" onChange="resourceView()">までに
                            <img src="../titan/img/item_potion.png" width="20" height="20"><span id="resourcePotionNumber"></span>
                            <img src="../titan/img/item_emerald.png" width="20" height="20"><span id="resourceEmeraldNumber"></span>
                        </div>
                        <div id="resourceArtifactArea">
                            <table class="resourceTable">
                                <tr>
                                    <th><small>アーティファクト</small></th>
                                    <th>現レベル</th>
                                    <th>現レベルまでに消費したリソース</th>
                                    <th>目標レベル</th>
                                    <th>目標レベルまでにあと必要なリソース</th>
                                </tr>
                                <tr>
                                    <td>第１</td>
                                    <td><span id="resourceArtifact0Level"></span></td>
                                    <td>
                                        <img src="../titan/img/item_gold.png" width="20" height="20"><span id="resourceNowArtifact0Gold"></span><br />
                                        <img src="../titan/img/item_powder.png" width="20" height="20"><span id="resourceNowArtifact0Powder"></span>
                                    </td>
                                    <td><input type="number" maxlength="3" step="1" id="aimA0Input" value="120" style="width:45px;" max="120" onChange="resourceView()"></td>
                                    <td>
                                        <img src="../titan/img/item_gold.png" width="20" height="20"><span id="resourceArtifact0Gold"></span><br />
                                        <img src="../titan/img/item_powder.png" width="20" height="20"><span id="resourceArtifact0Powder"></span>
                                        <img src="../titan/img/item_emerald.png" width="20" height="20"><span id="resourceArtifact0Emerald"></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>第２</td>
                                    <td><span id="resourceArtifact1Level"></span></td>
                                    <td>
                                        <img src="../titan/img/item_gold.png" width="20" height="20"><span id="resourceNowArtifact1Gold"></span><br />
                                        <img src="../titan/img/item_powder.png" width="20" height="20"><span id="resourceNowArtifact1Powder"></span>
                                    </td>
                                    <td><input type="number" maxlength="3" step="1" id="aimA1Input" value="120" style="width:45px;" max="120" onChange="resourceView()"></td>
                                    <td>
                                        <img src="../titan/img/item_gold.png" width="20" height="20"><span id="resourceArtifact1Gold"></span><br />
                                        <img src="../titan/img/item_powder.png" width="20" height="20"><span id="resourceArtifact1Powder"></span>
                                        <img src="../titan/img/item_emerald.png" width="20" height="20"><span id="resourceArtifact1Emerald"></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>第３</td>
                                    <td><span id="resourceArtifact2Level"></span></td>
                                    <td>
                                        <img src="../titan/img/item_gold.png" width="20" height="20"><span id="resourceNowArtifact2Gold"></span><br />
                                        <img src="../titan/img/item_powder.png" width="20" height="20"><span id="resourceNowArtifact2Powder"></span>
                                    </td>
                                    <td><input type="number" maxlength="3" step="1" id="aimA2Input" value="120" style="width:45px;" max="120" onChange="resourceView()"></td>
                                    <td>
                                        <img src="../titan/img/item_gold.png" width="20" height="20"><span id="resourceArtifact2Gold"></span><br />
                                        <img src="../titan/img/item_powder.png" width="20" height="20"><span id="resourceArtifact2Powder"></span>
                                        <img src="../titan/img/item_emerald.png" width="20" height="20"><span id="resourceArtifact2Emerald"></span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div id="resourceSkinArea">
                            <table class="skinResourceTable">
                                <tr>
                                    <th>スキン名</th>
                                    <th>現レベル</th>
                                    <th>現レベルまでに消費したリソース</th>
                                    <th>目標レベル</th>
                                    <th>目標レベルまでにあと必要なリソース</th>
                                </tr>
                                <tr>
                                    <td><span id="resourceSkin0Name"></span></td>
                                    <td><span id="resourceSkin0Level"></span></td>
                                    <td><span id="resourceSkin0NowResource"></span></td>
                                    <td><input type="number" maxlength="2" step="1" id="aimS0Input" value="60" style="width:45px;" max="60" onChange="resourceView()"></td>
                                    <td><span id="resourceSkin0Resource"></span></td>
                                </tr>
                                <tr>
                                    <td><span id="resourceSkin1Name"></span></td>
                                    <td><span id="resourceSkin1Level"></span></td>
                                    <td><span id="resourceSkin1NowResource"></span></td>
                                    <td><input type="number" maxlength="2" step="1" id="aimS1Input" value="60" style="width:45px;" max="60" onChange="resourceView()"></td>
                                    <td><span id="resourceSkin1Resource"></span></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <div id="resourceCloseBtn"></div>
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

        <div class="headListArea">
            <div id="targetSwitch">
            </div>
        </div>

        <div class="responsiveContainer">
            <div class="responsiveArea">
                <div id="screen"></div>
            </div>
        </div>
            
        <input id="simulateButton" type="button" value="対戦シミュレート" onclick="simulate();" style="width:150px;">
        <span>バトル試行回数：</span>
        <select name="trialTimes" id="trialTimes">
            <option value="1">1回</option>
            <option value="100" selected>100回</option>
            <option value="1000">1000回</option>
            <option value="2000">2000回</option>
        </select>
        <span>（1000回以上を選択すると確率精度は上がりますが処理に少々時間がかかります）</span>

        <div id="BattleLog">
            <div id="battleResultArea">
                <div id="battleResultHeader">
                    <div id="battleResultWinRate"></div>
                    <div id="battleResultLeftButton" class="resultButton defCursor"></div>
                    <div id="battleResultRightButton" class="resultButton defCursor"></div>
                    <div class="resultTargetSelect">
                        <select id="logTargetSelect" onchange="logTargetChange(this);">
                            <option value="all">すべて</option>
                        </select>
                    </div>
                    <div class="BoxClear"></div>
                </div>
                <div id="reesultAnalysis">
                </div>
                <div id="logJournalHeader">
                </div>
                <div id="logJournalMain">
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

?>