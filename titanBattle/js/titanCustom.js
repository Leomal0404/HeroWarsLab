//カスタムウィンドウ
function characterCustom(id, nowActive){
    modal.style.display = 'block';

    //編集中タイタンID
    nowCustom = id;

    //タイタンリスト
    for(let i = 0; i < heroList['titan'].length; i++){

        let heroInfo = heroList['titan'][i];

        let titanLevel;
        let titanStar;
        let titanIndex;

        let titanType;

        let skinNumbers = [];

        if(heroInfo['id'] == nowCustom){

            if(i == 0){
                document.getElementById('customLeftArrow').src = "";
            }
            else{
                document.getElementById('customLeftArrow').src = "../common/img/pageArrow_L";
            }
            if(i == (heroList['titan'].length-1)){
                document.getElementById('customRightArrow').src = "";
            }
            else{
                document.getElementById('customRightArrow').src = "../common/img/pageArrow_R";
            }

            titanType = heroInfo['Other']['Element'];

            //タイタン名表示
            document.getElementById('nameArea').innerHTML = heroInfo['name'];
            if(nowActive == "enemy") document.getElementById('nameArea').innerHTML = heroInfo['name'] +"(敵陣)";

            //タイタン画像
            document.getElementById('titanImage').style.backgroundImage = 'url("../titan/img/'+ heroInfo['id'] +'_custom.png")';
            if(nowActive == "enemy") document.getElementById('titanImage').style.transform = 'scale(-1, 1)';
            else document.getElementById('titanImage').style.transform = 'scale(1, 1)';

            //ユーザー情報データ
            let getTitanData = myData[nowActive +"_titan"];

            for(let t = 0; t < getTitanData.length; t++){
                if(getTitanData[t]['id'] == id){

                    //データ配列インデックス
                    titanIndex = t;

                    titanLevel = Number(getTitanData[titanIndex]['lv']);
                    titanStar = getTitanData[titanIndex]['star'];

                    //タイタンレベル表記
                    document.getElementById('lvDisp').innerHTML = titanLevel;

                    //☆ランク
                    if(titanStar > 5) document.getElementById('starDisp').innerHTML = "MAX";
                    else document.getElementById('starDisp').innerHTML = titanStar;

                    //☆画像
                    document.getElementById('starRank').src = "../common/img/star_"+ titanStar +".png";

                    break;
                }
            }

            //スキン情報
            skinNumbers = heroInfo['Skin'];

            let artWeaponString = "";
            let artArmor0Exp = "";
            let artArmor0Value = 0;
            let artArmor1Exp = "";
            let artArmor1Value = 0;


            let artHP = 0;
            let artATK = 0;

            let costGold = 0;

            let HPregen = 0;
            let weaponDamageToX = 0;
            let weaponDamageFromX = 0;
            let damageToX = 0;
            let damageFromX = 0;
            let extraWeapon = 0;

            //アーティファクト情報
            for(let a = 0; a < heroInfo['Artifacts'].length; a++){
                let art_id = heroInfo['Artifacts'][a];
                let imgName = artifactList['Artifact'][0]['Id'][art_id]['AssetTexture'];

                let art_img = document.getElementById("artImage_"+ a);
                art_img.src = "../titanArtifact/img/"+ imgName +".png";

                let artStar = Number(getTitanData[titanIndex]['art'+ a +'star']);
                let artLevel = Number(getTitanData[titanIndex]['art'+ a +'lv']);

                let star_img = document.getElementById("artStar_"+ a);
                if(artStar == 0) artStar = 1;
                star_img.src = "../common/img/star_"+ artStar +".png";

                document.getElementById("artLevel_"+ a).innerHTML = artLevel;

                let frame_img = document.getElementById("artFrame_"+ a);

                let colorName = "";
                if(artLevel < 25) colorName = "white";
                else if(artLevel < 50) colorName = "green";
                else if(artLevel < 70) colorName = "blue";
                else if(artLevel < 90) colorName = "purple";
                else if(artLevel > 89) colorName = "orange";

                frame_img.src = "../common/img/artifact_big_"+ colorName +".png";
                document.getElementsByClassName('titanArtifactLevelDisp')[a].style.backgroundImage = 'url("../common/img/level_'+ colorName +'.png")';

                let BattleEffectIdArray = artifactList['Artifact'][0]['Id'][art_id]['BattleEffect'];
                let artEffectData = artifactList['Artifact'][0]['Battle Effect'];

                let wCostCalced = false;
                let aCostCalced = false;
                let mCostCalced = false;

                for(let e = 0; e < BattleEffectIdArray.length; e++){

                    let effectID = BattleEffectIdArray[e];

                    for(let b = 0; b < artEffectData.length; b++){
                        if(artEffectData[b][effectID]){
                            let exp = artEffectData[b]['exp'];

                            let value = Number(artEffectData[b]['level'][artLevel]);

                            //★ランクによる詳細取得
                            let artTypeData = artifactList['Artifact'][0]['Type']
                            
                            //ウェポン
                            if(a == 0 && artLevel > 0){
                                let rate = Number(artTypeData['weapon']['Evolution'][artStar][0]);
                                artWeaponString += exp +"："+ Math.ceil(value * rate) + "&nbsp;("+ artTypeData['weapon']['Evolution'][artStar][3] +"%)"+ "<br />";
                                

                                if(exp.indexOf("回復")> 0 ) HPregen += value * rate;
                                else if(exp.indexOf("追加")> 0 ) weaponDamageToX += value * rate;
                                else if(exp.indexOf("減少")> 0 ) weaponDamageFromX += value * rate;
                                else extraWeapon += value * rate;

                                if(wCostCalced == false){
                                    wCostCalced = true;
                                    for(let l = 0; l < (artLevel + 1); l++){
                                        costGold += Number(artTypeData['weapon']['Levels'][l][2]);
                                    }
                                }
                            }
                            //アーマー
                            else if(a == 1){
                                let rate = Number(artTypeData['armor']['Evolution'][artStar][0]);
                                

                                if(exp.indexOf("追加")> 0 ){
                                    damageToX += value * rate;
                                    artArmor1Exp = exp;
                                    artArmor1Value = value * rate;
                                }
                                else if(exp.indexOf("減少")> 0 ){
                                    damageFromX += value * rate;
                                    artArmor0Exp = exp;
                                    artArmor0Value = value * rate;
                                }

                                if(aCostCalced == false){
                                    aCostCalced = true;
                                    for(let l = 0; l < (artLevel + 1); l++){
                                        costGold += Number(artTypeData['armor']['Levels'][l][2]);
                                    }
                                }
                            }
                            //アミュレット
                            else if(a == 2 && artLevel > 0){
                                let rate = Number(artTypeData['amulet']['Evolution'][artStar][0]);
                                if(artEffectData[b][effectID] == "physicalAttack") artATK = value * rate;
                                if(artEffectData[b][effectID] == "hp") artHP = Math.floor(value * rate);

                                if(mCostCalced == false){
                                    mCostCalced = true;
                                    for(let l = 0; l < (artLevel + 1); l++){
                                        costGold += Number(artTypeData['amulet']['Levels'][l][2]);
                                    }
                                }
                            }

                            break;
                        }
                    }
                }

                if(artStar < 6) document.getElementById('art'+ a +'star').innerHTML = '★'+ artStar;
                else document.getElementById('art'+ a +'star').innerHTML = '★MAX';

                document.getElementById('art'+ a +'lv').innerHTML = 'Lv'+ artLevel;
            }

            //ステータス
            let BasicHP = Number(heroInfo['BaseStats']['Hp']);
            let BasicATK = Number(heroInfo['BaseStats']['PhysicalAttack']);

            let hp = BasicHP + (titanLevel * Number(heroInfo['Stars'][titanStar]['Hp']) * Math.pow(titanLevel, 0.5)) + artHP;
            let atk = BasicATK + (titanLevel * Number(heroInfo['Stars'][titanStar]['PhysicalAttack']) * Math.pow(titanLevel, 0.5)) + artATK;


            //スキンによるステータス追加
            let skinIndex;
            let skinStatus = [];
            for(skinIndex = 0; skinIndex < skinNumbers.length; skinIndex++){
                let skinID = skinNumbers[skinIndex];

                if(!myData[nowActive +"_titan"][titanIndex]['skin'+ skinIndex]) myData[nowActive +"_titan"][titanIndex]['skin'+ skinIndex] = 0;
                let skinLevel = myData[nowActive +"_titan"][titanIndex]['skin'+ skinIndex];

                //スキンリスト
                for(let listIndex = 0; listIndex < skinList["titanSkin"].length; listIndex++){
                    if(skinList["titanSkin"][listIndex]["Id"] == skinID){
                        let statusCode = skinList["titanSkin"][listIndex]["StatData"]["1"][6];

                        let skinValue = skinList["titanSkin"][listIndex]["StatData"][String(skinLevel)][7];
                        

                        switch(statusCode){
                            case "hp":
                                skinStatus[skinIndex] = "HP+"+ skinValue;
                                hp += Number(skinValue);
                            break;
                            case "physicalAttack":
                                skinStatus[skinIndex] = "物理攻撃力+"+ skinValue;
                                atk += Number(skinValue);
                            break;
                            case "defenseFromfire":

                                damageFromX += Number(skinValue);
                                artArmor0Value += Number(skinValue);

                                switch(titanType){
                                    case "water":
                                        skinStatus[skinIndex] = "炎ダメージ減少+"+ skinValue;
                                    break;
                                    case "fire":
                                        skinStatus[skinIndex] = "地ダメージ減少+"+ skinValue;
                                    break;
                                    case "earth":
                                        skinStatus[skinIndex] = "水ダメージ減少+"+ skinValue;
                                    break;
                                }
                            break;
                            case "damageTowater":

                                damageToX += Number(skinValue);
                                artArmor1Value += Number(skinValue);

                                switch(titanType){
                                    case "water":
                                        skinStatus[skinIndex] = "炎へのダメージ追加+"+ skinValue;
                                    break;
                                    case "fire":
                                        skinStatus[skinIndex] = "地へのダメージ追加+"+ skinValue;
                                    break;
                                    case "earth":
                                        skinStatus[skinIndex] = "水へのダメージ追加+"+ skinValue;
                                    break;
                                }
                            break;
                        }
                        break;
                    }
                }
            }

            let statusString = "HP："+ Math.floor(hp).toLocaleString() +"<br />物理攻撃力："+ Math.round(atk).toLocaleString() +"<br />";
            statusString += artWeaponString;
            if(Math.floor(artArmor1Value) > 0) statusString += artArmor1Exp +"："+ Math.floor(artArmor1Value) +"<br />";

            //属性ダメージ減少
            if(Math.floor(artArmor0Value) > 0){
                let downRate = Math.floor((1 - (1 / (1 + (artArmor0Value / 300000)))) * 10000);
                statusString += artArmor0Exp +"："+ Math.floor(artArmor0Value) +"("+ Math.floor(downRate) / 100 +"％減少)";
            }

            //ステータス情報表記
            document.getElementById('statsArea').innerHTML = statusString;

            //スキル情報表記
            let skillString = "";
            let skillCount = 0;
            for(let s = 0; s < heroInfo['Skill'].length; s++){
                for(let k = 0; k < skillList['skill'].length; k++){
                    if(skillList['skill'][k]['Id'] == heroInfo['Skill'][s]){

                        let skillData = skillList['skill'][k];

                        if(skillData['IconAssetTexture']){
                            skillCount++;
                            skillString += '<div class="titanSkillBox">';

                            skillString += '<div class="titanSkillIcon">';
                            skillString += '<img src="../titanSkill/img/'+ skillData['IconAssetTexture'] +'.png" width="35" height="35">';
                            skillString += '</div>';

                            skillString += '<div class="titanSkillDetail">';
                            skillString += '<span class="titanSkillName">'+ skillData["name"] +'</span><br />';
                            let skillBehave = skillData["Behavior"]["Prime"][1];
                            let skillRate = skillData["Behavior"]["Prime"][2];
                            let skillValue = 0;

                            skillString += skillData['exp'];

                            switch(skillBehave){
                                case 'pa debuf %':

                                break;
                                case "speed %":

                                break;
                                case "shield hp":
                                    skillValue = Math.floor(skillRate * atk);
                                break;
                                case "physical":
                                    skillValue = Math.floor(skillRate * atk);
                                break;
                                case "heal":
                                    skillValue = Math.floor(skillRate * atk);
                                break;
                                case "pa buff":

                                break;
                            }
                            skillString = skillString.replace('$V', '<span class="titanSkillValue">'+ skillValue +"</span>");

                            skillString += '</div>';
                            skillString += '<div class="BoxClear"></div>';
                            skillString += '</div>';
                        }
                        
                        break;
                    }
                }
            }
            if(skillCount == 1) skillString = '<div class="titanSkillBoxDummy"></div>'+ skillString;
            document.getElementById('skillArea').innerHTML = skillString;

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

            document.getElementById('powerView').innerHTML = Math.floor(power);

            //消費したポーション
            let nextCount = '';
            if(titanLevel < 120) nextCount = "（次+"+ (potionList['TitanLevel'][(titanLevel+1)] - potionList['TitanLevel'][titanLevel]) +"）"
            document.getElementById('costArea').innerHTML = '累計ポーション：'+ Number(potionList['TitanLevel'][titanLevel]).toLocaleString() + nextCount +"<br />累計消費ゴールド："+ costGold.toLocaleString();


            //ステータスタブ
            if(nowCustomTab == "status"){
                document.getElementById('statusDisplay').style.display = 'block';
                document.getElementById('skinDisplay').style.display = 'none';
            }
            //スキンタブ
            else if(nowCustomTab == "skin"){
                document.getElementById('skinDisplay').style.display = 'block';
                document.getElementById('statusDisplay').style.display = 'none';
               

                for(skinIndex = 0; skinIndex < skinNumbers.length; skinIndex++){
                    let skin_img = document.getElementById("skin"+ skinIndex +"img");
                    skin_img.src = "../titanSkin/img/titanSkin_"+ skinNumbers[skinIndex] +".png";

                    if(!myData[nowActive +"_titan"][titanIndex]['skin'+ skinIndex]) myData[nowActive +"_titan"][titanIndex]['skin'+ skinIndex] = 0;
                    let skinLevel = myData[nowActive +"_titan"][titanIndex]['skin'+ skinIndex];
                    
                    document.getElementById('skin'+ skinIndex +'status').innerHTML = skinStatus[skinIndex];

                    document.getElementById('skin'+ skinIndex +'lv').innerHTML = skinLevel +'/60';
                }
                if(skinNumbers.length > 1){
                    document.getElementById('championSkinBlock').style.display = 'block';
                }
                else{
                    document.getElementById('championSkinBlock').style.display = 'none';
                }
            }

            break;
        }
    }
    
}

function lvBtnHandler(dir){
    if(!nowCustom) return;

    let targetTitanType = nowActive +"_titan";
    let targetTitanIndex;
    let nowLevel;

    let getTitanData = myData[targetTitanType];
    for(let t = 0; t < getTitanData.length; t++){
        if(getTitanData[t]['id'] == nowCustom){
            targetTitanIndex = t;
            nowLevel = Number(getTitanData[targetTitanIndex]['lv']);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 120) nowLevel += updownRange;
        if(nowLevel > 120) nowLevel = 120;
    }
    else if(dir == "down"){
        if(nowLevel > 1) nowLevel -= updownRange;
        if(nowLevel < 1) nowLevel = 1;
    }

    getTitanData[targetTitanIndex]['lv'] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

function starBtnHandler(dir){
    if(!nowCustom) return;
    
    let targetTitanType = nowActive +"_titan";
    let targetTitanIndex;
    let nowLevel;

    let getTitanData = myData[targetTitanType];
    for(let t = 0; t < getTitanData.length; t++){
        if(getTitanData[t]['id'] == nowCustom){
            targetTitanIndex = t;
            nowLevel = Number(getTitanData[targetTitanIndex]['star']);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 6) nowLevel++;
    }
    else if(dir == "down"){
        if(nowCustom == "4003" || nowCustom == "4013" || nowCustom == "4023"){
            if(nowLevel > 3) nowLevel--;
        }
        else{
            if(nowLevel > 1) nowLevel--;
        }
    }

    getTitanData[targetTitanIndex]['star'] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

function artStarBtnHandler(index,dir){
    if(!nowCustom) return;

    let targetTitanType = nowActive +"_titan";
    let targetTitanIndex;
    let nowLevel;

    let getTitanData = myData[targetTitanType];
    for(let t = 0; t < getTitanData.length; t++){
        if(getTitanData[t]['id'] == nowCustom){
            targetTitanIndex = t;
            nowLevel = Number(getTitanData[targetTitanIndex]['art'+ index +'star']);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 6) nowLevel++;
    }
    else if(dir == "down"){
        if(nowLevel > 1) nowLevel--;
    }

    getTitanData[targetTitanIndex]['art'+ index +'star'] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

function artLvBtnHandler(index,dir){
    if(!nowCustom) return;

    let targetTitanType = nowActive +"_titan";
    let targetTitanIndex;
    let nowLevel;

    let getTitanData = myData[targetTitanType];
    for(let t = 0; t < getTitanData.length; t++){
        if(getTitanData[t]['id'] == nowCustom){
            targetTitanIndex = t;
            nowLevel = Number(getTitanData[targetTitanIndex]['art'+ index +'lv']);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 120) nowLevel += updownRange;
        if(nowLevel > 120) nowLevel = 120;
    }
    else if(dir == "down"){
        if(nowLevel > 0) nowLevel -= updownRange;
        if(nowLevel < 0) nowLevel = 0;
    }

    getTitanData[targetTitanIndex]['art'+ index +'lv'] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//スキンレベル調整
function skinLvHandler(dir, index){

    if(!nowCustom) return;

    let targetTitanType = nowActive +"_titan";
    let targetTitanIndex;
    let nowLevel;

    let getTitanData = myData[targetTitanType];
    for(let t = 0; t < getTitanData.length; t++){
        if(getTitanData[t]['id'] == nowCustom){
            targetTitanIndex = t;
            if(!getTitanData[targetTitanIndex]['skin'+ index]) getTitanData[targetTitanIndex]['skin'+ index] = 0;
            nowLevel = Number(getTitanData[targetTitanIndex]['skin'+ index]);
            break;
        }
    }
    
    if(dir == "up"){
        if(nowLevel < 60) nowLevel += updownRange;
        if(nowLevel > 60) nowLevel = 60;

        // if(nowLevel == 0) nowLevel = 1;
        // else nowLevel = 60;
    }
    else if(dir == "down"){
        if(nowLevel > 0) nowLevel -= updownRange;
        if(nowLevel < 0) nowLevel = 0;
        // if(nowLevel > 1) nowLevel = 1;
        // else if(nowLevel == 1) nowLevel = 0;
    }

    myData[targetTitanType][targetTitanIndex]['skin'+ index] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}


function closeCustom(id){
    if(nowActive == "own"){
        for(let i = 0; i < own_team_array.length; i++){
            if(own_team_array[i]['id'] == id){
                own_team_array[i]['status'] = statusCalc("own", id);
                break;
            }
        }
    }
    else{
        for(let i = 0; i < enemy_team_array.length; i++){
            if(enemy_team_array[i]['id'] == id){
                enemy_team_array[i]['status'] = statusCalc("enemy", id);
                break;;
            }
        }
    }
}

function pageMove(dir){

    let targetID = -1;

    for(let i = 0; i < heroList['titan'].length; i++){
        if(nowCustom == heroList['titan'][i]['id']){
            if(dir == 1){
                if(i == heroList['titan'].length-1){
                    return;
                }
                else{
                    targetID = heroList['titan'][(i+1)]['id'];
                }
            }
            else if(dir == -1){
                if(i == 0){
                    return;
                }
                else{
                    targetID = heroList['titan'][(i-1)]['id'];
                }
            }
            break;
        }
    }
    characterCustom(targetID, nowActive);
}

function resourceView(){
    document.getElementById('resource_modal').style.display = 'block';

    let titanLevel;
    let titanStar;
    let titanIndex;

    let titanType;

    let skinNumbers = [];

    let getTitanData = myData[nowActive +"_titan"];

    //出力するテキストリソース
    let resourceText = "";

    //設定目標レベル
    let aimLevel = Number(document.getElementById('aimLevelInput').value);
    if(aimLevel > 120) aimLevel = 120;

    //ユーザ設定のタイタン情報
    for(let t = 0; t < getTitanData.length; t++){
        //編集中のタイタンIDと照合
        if(getTitanData[t]['id'] == nowCustom){

            //インデックス番号
            titanIndex = t;

            //タイタンレベル
            titanLevel = Number(getTitanData[titanIndex]['lv']);

            //タイタンスター
            titanStar = getTitanData[titanIndex]['star'];

            //必要なタイタンポーション数            
            let maxPotion = (Number(potionList["TitanLevel"][String(aimLevel)]) - Number(potionList["TitanLevel"][String(titanLevel)]));

            document.getElementById('aimLevelInput').min = titanLevel;
            document.getElementById('resourcePotionNumber').innerHTML = "タイタンポーション：" + maxPotion.toLocaleString() +"個";
            document.getElementById('resourceEmeraldNumber').innerHTML = "エメラルド：" + (maxPotion / 5).toLocaleString() +"個";

            break;
        }
    }

    

    for(let i = 0; i < heroList['titan'].length; i++){

        let heroInfo = heroList['titan'][i];

        

        if(heroInfo['id'] == nowCustom){

            //タイタン名と現在レベル表示
            document.getElementById('titanResourceName').innerHTML = heroInfo['name'] + "&nbsp;Lv"+ titanLevel;


            //アーティファクト情報
            let artifactTypeArray = ["armor", "amulet", "weapon"];
            for(let a = 0; a < heroInfo['Artifacts'].length; a++){

                let artLevel = Number(getTitanData[titanIndex]['art'+ a +'lv']);

                
                let maxGold = 0;
                let maxPowder = 0;
                let maxEmerald = 0;

                //設定目標レベル
                aimLevel = Number(document.getElementById('aimA'+ a +'Input').value);
                if(aimLevel > 120) aimLevel = 120;
                
                let _g = (aimLevel+1);
                
                for(let lv = (artLevel+1); lv < _g; lv++){
                    maxGold += Number(artifactList["Artifact"][0]["Type"][artifactTypeArray[a]]["Levels"][String(lv)][2]);
                    maxPowder += Number(artifactList["Artifact"][0]["Type"][artifactTypeArray[a]]["Levels"][String(lv)][3]);
                    maxEmerald += Number(artifactList["Artifact"][0]["Type"][artifactTypeArray[a]]["Levels"][String(lv)][6]);
                }

                //アーティファクトレベル
                document.getElementById('resourceArtifact'+ a +'Level').innerHTML = "Lv"+ artLevel;

                //必要ゴールド
                document.getElementById('resourceArtifact'+ a +'Gold').innerHTML = maxGold.toLocaleString() +"ゴールド";

                //必要な妖精の粉
                document.getElementById('resourceArtifact'+ a +'Powder').innerHTML = maxPowder.toLocaleString() +"個";

                //必要なエメラルド
                document.getElementById('resourceArtifact'+ a +'Emerald').innerHTML = maxEmerald.toLocaleString() +"個";


                let nowGold = 0;
                let nowPowder = 0;
                //現状までのリソース
                for(lv = 1; lv < (artLevel+1); lv++){
                    nowGold += Number(artifactList["Artifact"][0]["Type"][artifactTypeArray[a]]["Levels"][String(lv)][2]);
                    nowPowder += Number(artifactList["Artifact"][0]["Type"][artifactTypeArray[a]]["Levels"][String(lv)][3]);
                    //maxEmerald += Number(artifactList["Artifact"][0]["Type"][artifactTypeArray[a]]["Levels"][String(lv)][6]);
                }

                //消費したゴールド
                document.getElementById('resourceNowArtifact'+ a +'Gold').innerHTML = nowGold.toLocaleString() +"ゴールド";

                //消費した妖精の粉
                document.getElementById('resourceNowArtifact'+ a +'Powder').innerHTML = nowPowder.toLocaleString() +"個";
            }

            //スキン情報
            skinNumbers = heroInfo['Skin'];

            let skinName = ['デフォルトスキン', '原始スキン'];

            //表示リセット
            document.getElementById('resourceSkin1Name').innerHTML = "";
            document.getElementById('resourceSkin1Level').innerHTML = "";
            document.getElementById('resourceSkin1NowResource').innerHTML = "";
            document.getElementById('resourceSkin1Resource').innerHTML = "";

            for(skinIndex = 0; skinIndex < skinNumbers.length; skinIndex++){

                //スキンID
                let skinID = skinNumbers[skinIndex];

                //スキンレベル
                let skinLevel = Number(myData[nowActive +"_titan"][titanIndex]['skin'+ skinIndex]);

                //必要なスキンストーン数
                let skinStoneNumber = 0;

                //消費したスキンストーン数
                let skinStoneUseNumber = 0;

                //設定目標レベル
                aimLevel = Number(document.getElementById('aimS'+ skinIndex +'Input').value);

                //スキン情報
                for(let k = 0; k < skinList["titanSkin"].length; k++){
                    //該当スキン
                    if(skinList["titanSkin"][k]["Id"] == skinID){
                        let statData = skinList["titanSkin"][k]["StatData"];
                        if(skinLevel < 60){
                            if(aimLevel > 60) aimLevel = 60;
                            for(let v = (skinLevel+1); v < (aimLevel+1); v++){
                                skinStoneNumber += Number(statData[String(v)][2]);
                            }
                        }
                        for(let u = 0; u < (skinLevel+1); u++){
                            skinStoneUseNumber += Number(statData[String(u)][2]);
                        }
                    }
                }

                //出力
                //スキン名
                document.getElementById('resourceSkin'+ skinIndex +'Name').innerHTML = skinName[skinIndex];
                //現在レベル
                document.getElementById('resourceSkin'+ skinIndex +'Level').innerHTML = skinLevel;
                //現在までのリソース
                document.getElementById('resourceSkin'+ skinIndex +'NowResource').innerHTML = '<img src="../titan/img/item_skinStone.png" width="20" height="20">'+ skinStoneUseNumber.toLocaleString() +"個";

                //目標までのリソース
                document.getElementById('resourceSkin'+ skinIndex +'Resource').innerHTML = '<img src="../titan/img/item_skinStone.png" width="20" height="20">'+ skinStoneNumber.toLocaleString() +"個";
            }
        }

    }
    
}
