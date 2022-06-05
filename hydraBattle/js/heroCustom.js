//カスタムウィンドウ
function characterCustom(id, nowActive){
    modal.style.display = 'block';

    //編集中ヒーローID
    nowCustom = id;

    //ヒーローリスト
    for(let i = 0; i < heroList.length; i++){

        let heroInfo = heroList[i];

        let heroLevel;
        let heroStar;
        let heroColor;

        let heroIndex;

        //該当ヒーロー
        if(heroInfo['id'] == nowCustom){

            if(i == 0){
                document.getElementById('customLeftArrow').src = "";
            }
            else{
                document.getElementById('customLeftArrow').src = "../common/img/pageArrow_L";
            }
            if(i == (heroList.length-1)){
                document.getElementById('customRightArrow').src = "";
            }
            else{
                document.getElementById('customRightArrow').src = "../common/img/pageArrow_R";
            }

            //ヒーロー画像
            let imgPath = heroImgFolder + heroInfo['id'] +'_custom.png';
            document.getElementById('heroImage').style.backgroundImage = 'url("'+ imgPath +'")';
            if(nowActive == "enemy") document.getElementById('heroImage').style.transform = 'scale(-1, 1)';
            else document.getElementById('heroImage').style.transform = 'scale(1, 1)';

            //ユーザー情報データ
            let getHeroData = myData[nowActive +"_hero"];

            // 未登録の新ヒーローだった場合は初期値を代入
            if(getHeroData.findIndex((v) => v.id === nowCustom) < 0){
                let newHeroInfo = heroList.find((v) => v.id === nowCustom);

                let _newHero = '{"id":"'+ newHeroInfo["id"] +'", "lv":"1", "star":"'+ newHeroInfo["Other"]["MinStar"] +'", "color":"1", "equip":["0","0","0","0","0","0"], "skillLevel":["1","0","0","0"],';
                    
                _newHero += '"skinLevel":["0"';
                for(let i = 0; i < newHeroInfo["Skin"].length; i++){
                    _newHero += ',"0"';
                }
                _newHero += '],';
    
                _newHero += '"artStar":["1", "1", "1"], "artLv":["0", "0", "0"],';
                _newHero += '"glyph":["0", "0", "0", "0", "0"],';
                _newHero += '"elementGift":"0", "target":"false", "targetColor":"15"}';
                let newJSON = JSON.parse(_newHero);
                getHeroData.push(newJSON);
            }
            
            for(let t = 0; t < getHeroData.length; t++){
                if(getHeroData[t]['id'] == nowCustom){

                    //データ配列インデックス
                    heroIndex = t;

                    heroLevel = Number(getHeroData[heroIndex]['lv']);
                    heroStar = getHeroData[heroIndex]['star'];
                    heroColor = Number(getHeroData[heroIndex]["color"]);

                    //ヒーロー名
                    document.getElementById('nameArea').innerHTML = heroInfo['name'] + colorSuffix[heroColor];
                    if(nowActive == "enemy") document.getElementById('nameArea').innerHTML = heroInfo['name'] + colorSuffix +"(敵陣)";
                        

                    //ヒーローレベル表記
                    document.getElementById('lvDisp').innerHTML = heroLevel;

                    //☆ランク
                    if(heroStar > 5) document.getElementById('starDisp').innerHTML = "MAX";
                    else document.getElementById('starDisp').innerHTML = heroStar;

                    //☆画像
                    document.getElementById('starRank').src = "../common/img/star_"+ heroStar +".png";

                    //ラベルカラー
                    document.getElementById('nameLabelBox').className = "nameLabel "+ colorLabels[heroColor];


                    //装備アイテム
                    for(let e = 0; e < 6; e++){

                        if(heroColor == 0) heroColor = 1;
                        let equipID = heroInfo['Colors'][heroColor]['Items'][e];

                        //アイテムリストを走査
                        for(let d = 0; d < itemList['item'].length; d++){

                            let itemInfo = itemList['item'][d];

                            let frameName = itemInfo['grade'];
                            
                            //該当アイテム
                            if( equipID == itemInfo['id'] ){

                                let item_img = "";
                                item_img += '<div class="avatarBox">';
                                item_img += '<div class="avatar">';
                                item_img += '<img';

                                let itemStatusInfo = itemInfo['name'];
                                for(let _s in itemInfo['status']){
                                    itemStatusInfo += "&#013;";
                                    itemStatusInfo += itemList["statusConvert"][_s] +"+"+ itemInfo['status'][_s];
                                }                                

                                if(Number(getHeroData[t]['equip'][e]) == 0) item_img += ' class="greyDown"';

                                item_img += ' src="../item/img/'+ "gear_"+ equipID +'.png" alt="'+ itemStatusInfo +'" title="'+ itemStatusInfo +'" width="72" height="72"></div>';

                                if(Number(getHeroData[t]['equip'][e]) == 0){
                                    item_img += '<div class="avatarFrame">';
                                    item_img += '<img src="../item/img/equipBtn.png" width="80" height="80">';
                                    item_img += '</div>';
                                }

                                item_img += '<div class="avatarFrame">';
                                item_img += '<img src="../common/img/Border_item_heroes_'+ frameName +'.png" alt="'+ itemStatusInfo +'" title="'+ itemStatusInfo +'" width="80" height="80" onclick="window.equipSwitch('+ e +')">';
                                item_img += '</div>';

                                item_img += '</div>';

                                //document.getElementById('item_'+ e).innerHTML = '<img src="../item/img/gear_'+ heroInfo['equip'][heroColor]['equip'][e] +'.png" height="70">';


                                document.getElementById('item_'+ e).innerHTML = item_img;

                                break;
                            }
                        }
                        
                    }   //装備表示ここまで

                    // ステータス計算の前にスキン情報の整理
                    let _skinDefIndex = 0;
                    for(let sk in skinList){                                
                        if(skinList[sk]["Id"] == heroInfo['Skin'][_skinDefIndex] || skinList[sk]["Id"] == heroInfo['Skin']){
                            //指定インデックスのスキンがデフォルトでなければ次を検索        
                            if(skinList[sk]["Name"] != "デフォルト"){
                                _skinDefIndex++;
                                continue;
                            }
                            
                            if(_skinDefIndex > 0){
                                let _el = heroInfo['Skin'].splice(_skinDefIndex, 1);
                                heroInfo['Skin'].unshift(_el);
                            }
                            break;
                        }
                    }

                    //ステータス計算
                    let statusArray = statusCalc(nowActive, id);

                    //各タブページ表示切り替え
                    let detailSource = "";

                    //ステータスは常に計算
                    let maxStatusArray = getMaxStatus(id);
                    let statusViewTable = '<table class="heroStatusTable">';
                    statusViewTable += '<tr><td class="heroStatusIndexColor">ステータス</td><td class="heroStatusIndexColor">現在値</td><td class="heroStatusIndexColor">カンスト値</td></tr>';
                    statusViewTable += '<tr><th>知力：</th><td>'+ statusArray['inte'] +'</td><td>'+ maxStatusArray['inte'] +'</td></tr>';
                    statusViewTable += '<tr><th>素早さ：</th><td>'+ statusArray['agil'] +'</td><td>'+ maxStatusArray['agil'] +'</td></tr>';
                    statusViewTable += '<tr><th>力：</th><td>'+ statusArray['stre'] +'</td><td>'+ maxStatusArray['stre'] +'</td></tr>';
                    statusViewTable += '<tr><th>HP：</th><td>'+ Math.floor(statusArray['hp']) +'</td><td>'+ maxStatusArray['hp'] +'</td></tr>';
                    statusViewTable += '<tr><th>物理攻撃：</th><td>'+ numFloor(statusArray['phatk']) +'</td><td>'+ maxStatusArray['phatk'] +'</td></tr>';
                    statusViewTable += '<tr><th>魔法攻撃：</th><td>'+ numFloor(statusArray['mgatk']) +'</td><td>'+ maxStatusArray['mgatk'] +'</td></tr>';
                    statusViewTable += '<tr><th>アーマー：</th><td>'+ numFloor(statusArray['armor']) +'</td><td>'+ maxStatusArray['armor'] +'</td></tr>';
                    statusViewTable += '<tr><th>魔法防御：</th><td>'+ numFloor(statusArray['mgdef']) +'</td><td>'+ maxStatusArray['mgdef'] +'</td></tr>';

                    if(statusArray['dodge'] > 0) statusViewTable += '<tr><th>回避率：</th><td>'+ statusArray['dodge'] +'</td><td>'+ maxStatusArray['dodge'] +'</td></tr>';

                    if(statusArray['phpen'] > 0) statusViewTable += '<tr><th>アーマー貫通：</th><td>'+ statusArray['phpen'] +'</td><td>'+ maxStatusArray['phpen'] +'</td></tr>';
                    if(statusArray['mgpen'] > 0) statusViewTable += '<tr><th>魔法貫通：</th><td>'+ statusArray['mgpen'] +'</td><td>'+ maxStatusArray['mgpen'] +'</td></tr>';

                    if(statusArray['crit'] > 0) statusViewTable += '<tr><th>クリティカル率：</th><td>'+ statusArray['crit'] +'</td><td>'+ maxStatusArray['crit'] +'</td></tr>';

                    statusViewTable += '</table>';

                    
                    

                    //ステータスタブ
                    if(nowCustomTab == "status"){
                        detailSource += statusViewTable;
                        detailSource += '<div class="floatWinButtonArea">';
                        detailSource += '<div class="targetSetArea">';
                        let _targetCheck = "";
                        let _selectable = " disabled";
                        if(getHeroData[heroIndex]["target"] == "true"){
                            _targetCheck = " checked";
                            _selectable = "";
                        }
                        detailSource += '<input type="checkbox" id="isTarget_'+ nowCustom +'" onchange="targetSwitch(this);"'+ _targetCheck +'>育成対象&nbsp;';

                        detailSource += '<select id="targetColor_'+ nowCustom +'" onchange="targetColorSelect(this);"'+ _selectable +'>';
                        for(let _c = 2; _c < colorView.length; _c++){
                            let _selected = "";
                            if(!getHeroData[heroIndex]["targetColor"] && _c == 15) _selected = " selected";
                            else if(getHeroData[heroIndex]["targetColor"] == _c) _selected = " selected";
                            detailSource += '<option value="'+ _c +'"'+ _selected +'>'+ colorView[_c] +'</option>';
                        }
                        detailSource += '</select>';
                        detailSource += '</div>';
                        detailSource += '<div style="float:left;">';
                        detailSource += '<button onclick="floatStatusWindowView();">ウィンドウ化</button>';
                        detailSource += '</div>';
                        detailSource += '<div class="BoxClear"></div>';
                        detailSource += '</div>';
                    }
                    //スキルタブ
                    else if(nowCustomTab == "skill"){

                        detailSource += '<div id="heroSkillArea">';

                        let skillFrameColor = ["white", "green", "blue", "violet"];
                        for(let skillnum = 0; skillnum < 4; skillnum++){

                            let skillName = "スキル名";

                            let isActive = true;
                            let skillHighLight = "";
                            if(Number(getHeroData[heroIndex]['skillLevel'][skillnum]) == 0){
                                isActive = false;
                                skillHighLight = ' greyScale';
                            }

                            detailSource += '<div class="heroSkillBoxFrame">';
                            detailSource += '<div class="heroSkillBox">';

                                detailSource += '<div class="skillIconCol">';

                                    detailSource += '<div class="avatarBox">';
                                        detailSource += '<div class="skillAvatar">';
                                            detailSource += '<img class="heroAvatorPos_team'+ skillHighLight +'" src="../skill/img/'+ id +'_skill_'+ (skillnum+1) +'" width="68" height="68">';
                                        detailSource += '</div>';

                                        detailSource += '<div class="avatarFrame">';
                                            detailSource += '<img src="../common/img/Border_item_heroes_'+ skillFrameColor[skillnum] +'.png" alt="'+ skillName +'" title="'+ skillName +'" width="80" height="80" onclick="">';
                                        detailSource += '</div>';

                                    detailSource += '</div>';

                                detailSource += '</div>';
                                

                                detailSource += '<div class="skillDetailCol">';
                                    detailSource += '<div class="skillNameIndex">'+ heroInfo['skillName'][skillnum] +'</div>';
                                    detailSource += '<div class="skillLevelCustomArea">';
                                    
                                    if(isActive == true){
                                        detailSource += '<span class="indexColor">レベル：</span><img src="../common/img/downbtn_s.png" class="btnPos" onclick="window.skillLvBtnHandler('+"'down',"+ skillnum +","+ t +');"><span class="skillLevelDisp">'+ getHeroData[t]['skillLevel'][skillnum] +'</span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="window.skillLvBtnHandler('+ "'up',"+ skillnum +","+ t +');">';
                                    }
                                    else{
                                        detailSource += '<img src="../common/img/lock_icon.png" class="skillLockIcon"><span class="indexColor">ランクで開放</span>';
                                    }
                                    
                                    detailSource += '</div>';
                                detailSource += '</div>';

                                detailSource += '<div class="BoxClear"></div>';

                            detailSource += '</div>';
                            detailSource += '</div>';
                        }

                        detailSource += '<div>';

                    }
                    //スキンタブ
                    else if(nowCustomTab == "skin"){
                        detailSource += '<div id="heroSkillArea">';

                            let targetStatus = "";
                            let targetStatusName = "";
                            let skinStatData;

                            //スキン情報
                            let _skinDefIndex = 0;
                            for(let sk in skinList){                                
                                if(skinList[sk]["Id"] == heroInfo['Skin'][_skinDefIndex] || skinList[sk]["Id"] == heroInfo['Skin']){
                                    //指定インデックスのスキンがデフォルトでなければ次を検索        
                                    if(skinList[sk]["Name"] != "デフォルト"){
                                        _skinDefIndex++;
                                        continue;
                                    }         
                                    skinStatData = skinList[sk]["StatData"];
                                    targetStatus = skinStatData["1"][6];
                                    targetStatusName = skinStatusName[targetStatus];          
                                    
                                    if(_skinDefIndex > 0){
                                        let _el = heroInfo['Skin'].splice(_skinDefIndex, 1);
                                        heroInfo['Skin'].unshift(_el);
                                    }
                                    break;
                                }
                            }

                            //デフォルトスキン
                            detailSource += '<div class="heroSkinBoxFrame">';
                            detailSource += '<div class="heroSkinBox">';

                                detailSource += '<div class="heroSkinIconCol">';

                                    detailSource += '<div class="avatarBox">';
                                        detailSource += '<div class="skillAvatar">';
                                            detailSource += '<img class="heroAvatorPos_team" src="'+ heroImgFolder + heroInfo['IconAssetTexture'] +'.png" width="68" height="68">';
                                        detailSource += '</div>';

                                        detailSource += '<div class="avatarFrame">';
                                            detailSource += '<img src="../skin/img/skin_frame.png" alt="デフォルトスキン" title="デフォルトスキン" width="80" height="80" onclick="">';
                                        detailSource += '</div>';

                                    detailSource += '</div>';

                                detailSource += '</div>';
                                
                                detailSource += '<div class="heroSkinDetailCol">';
                                    detailSource += '<div class="heroSkinNameIndex">デフォルトスキン</div>';
                                    detailSource += '<div class="heroSkinStatusNameIndex">'+ targetStatusName +'&nbsp;<span class="skinStatusAdd">+'+ skinStatData[getHeroData[t]['skinLevel'][0]][7] +'</span></div>';
                                    detailSource += '<div class="heroSkinLevelCustomArea">';
                                    
                                    detailSource += '<img src="../common/img/downbtn_s.png" class="btnPos" onclick="skinLvHandler('+"'down',"+ t +",0"+ ')"><span class="skinLevelDisp">'+ getHeroData[t]['skinLevel'][0] +'/60</span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="skinLvHandler('+"'up',"+ t +",0"+ ')">';

                                    detailSource += '</div>';
                                detailSource += '</div>';

                                detailSource += '<div class="BoxClear"></div>';

                            detailSource += '</div>';
                            detailSource += '</div>';

                            if(Array.isArray(heroInfo["Skin"])){
                                for(let skinnum = 1; skinnum < heroInfo['Skin'].length; skinnum++){

                                    let targetStatus = "";
                                    let skinName = "";
                                    let skinImage = "";

                                    let skinFind = false;

                                    //スキン情報
                                    for(let sk in skinList){
                                        if(skinList[sk]["Id"] == heroInfo['Skin'][skinnum]){

                                            skinStatData = skinList[sk]["StatData"];
                                           
                                            if(!skinStatData["1"]){
                                                skinFind = false;
                                            }
                                            else{
                                                skinName = skinList[sk]['Name'];
                                                skinImage = skinList[sk]['IconAsset'];
                                                
                                                targetStatus = skinStatData["1"][6];
                                                targetStatusName = skinStatusName[targetStatus];  
                                                skinFind = true; 
                                            }
                                                  
                                            break;
                                        }
                                    }

                                    //各種スキン
                                    if(skinFind == true){
                                        detailSource += '<div class="heroSkinBoxFrame">';
                                        detailSource += '<div class="heroSkinBox">';

                                            detailSource += '<div class="heroSkinIconCol">';

                                                detailSource += '<div class="avatarBox">';
                                                    detailSource += '<div class="skillAvatar">';

                                                        let skinID = ( '0000' + Number(heroInfo['Skin'][skinnum]) ).slice( -4 );

                                                        detailSource += '<img class="heroAvatorPos_team" src="../skin/img/'+ skinImage +'.png" width="68" height="68">';
                                                    detailSource += '</div>';

                                                    detailSource += '<div class="avatarFrame">';
                                                        detailSource += '<img src="../skin/img/skin_frame.png" alt="'+ skinName +'スキン" title="'+skinName+'スキン" width="80" height="80" onclick="">';
                                                    detailSource += '</div>';

                                                detailSource += '</div>';

                                            detailSource += '</div>';
                                            

                                            detailSource += '<div class="heroSkinDetailCol">';

                                                

                                                detailSource += '<div class="heroSkinNameIndex">'+ skinName +'スキン</div>';
                                                detailSource += '<div class="heroSkinStatusNameIndex">'+ targetStatusName +'&nbsp;<span class="skinStatusAdd">+'+ skinStatData[getHeroData[t]['skinLevel'][skinnum]][7] +'</span></div>';
                                                detailSource += '<div class="heroSkinLevelCustomArea">';
                                                
                                                detailSource += '<img src="../common/img/downbtn_s.png" class="btnPos" onclick="skinLvHandler('+"'down',"+ t +","+ skinnum +')"><span class="skinLevelDisp">'+ getHeroData[t]['skinLevel'][skinnum] +'/60</span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="skinLvHandler('+"'up',"+ t +","+ skinnum +')">';

                                                detailSource += '</div>';
                                            detailSource += '</div>';

                                            detailSource += '<div class="BoxClear"></div>';

                                        detailSource += '</div>';
                                        detailSource += '</div>';
                                    }
                                }
                            }


                        detailSource += '<div>';
                    }
                    //アーティファクトタブ
                    else if(nowCustomTab == "artifact"){
                        detailSource += '<div id="heroSkillArea">';

                        //アーティファクト情報
                        for(let af = 0; af < 3; af++){

                            let afTypeID = heroInfo['Artifacts'][af];
                            
                            let afTypeInfo = artifactList['Id'][afTypeID];

                            //アーティファクトの種類
                            let artType = artifactList["Id"][afTypeID]["Type"];
                            
                            //let type = afTypeInfo["Type"];
                            let afImage = afTypeInfo["AssetTexture"];
                            let BattleEffect = afTypeInfo["BattleEffect"];

                            let artLevel = Number(getHeroData[t]["artLv"][af]);
                            let artStar = Number(getHeroData[t]["artStar"][af]);
                            let afStats = [];
                            let afValue = [];

                            //指定★レベルの倍率
                            let _valueRate = Number(artifactList["Type"][artType]["Evolution"][artStar][0]);
                            //console.log(_valueRate);
                          
                            for(let _bfIDindex = 0; _bfIDindex < BattleEffect.length; _bfIDindex++){
                                for(let _aIndex in artifactList["Battle Effect"]){
                                    if(artifactList["Battle Effect"][_aIndex][BattleEffect[_bfIDindex]]){
                                        afStats.push(skinStatusName[artifactList["Battle Effect"][_aIndex][BattleEffect[_bfIDindex]]]);

                                        let _artValue = Number(artifactList["Battle Effect"][_aIndex]["level"][getHeroData[t]["artLv"][af]]);
                                        
                                        afValue.push(Math.floor(_artValue * _valueRate));
                                        break;
                                    }
                                }
                            }

                            if(artStar == 0) artStar = 1;
                            let star_img = "../common/img/star_"+ artStar +".png";

                            let colorName = "";
                            if(artLevel < 25) colorName = "white";
                            else if(artLevel < 50) colorName = "green";
                            else if(artLevel < 70) colorName = "blue";
                            else if(artLevel < 85) colorName = "purple";
                            else if(artLevel > 84) colorName = "orange";

                            let frame_img = "../common/img/artifact_big_"+ colorName +".png";
                            //document.getElementsByClassName('titanArtifactLevelDisp')[a].style.backgroundImage = 'url("../common/img/level_'+ colorName +'.png")';

                            let onclickText = "";

                            //アイコン表示
                            detailSource += '<div class="heroArtifactBoxArea">';
                                detailSource += '<div class="heroArtifactBox">';
                                    detailSource += '<div class="avatar-box">';
                                        detailSource += '<div class="hero-avatar-image">';
                                        detailSource += '<img id="artImage_'+ af +'" src="../artifact/img/'+ afImage +'.png" alt="" title="" width="70" height="70">';
                                        detailSource += '</div>';
                                        detailSource += '<div class="heroArtifactFrame">';
                                        detailSource += '<img id="artFrame_'+ af +'" src="'+ frame_img +'" width="75" height="75" '+ onclickText +'>';
                                        detailSource += '</div>';
                                        detailSource += '<div id="artLevel_'+ af +'" class="heroArtifactLevelDisp" style="background-image:url('+ "'../common/img/level_"+ colorName +".png'"+');">'+ artLevel +'</div>';
                                        detailSource += '<div class="heroArtifactStarDisp">';
                                        detailSource += '<img id="artStar_'+ af +'" src="'+ star_img +'" width="75" height="20">';
                                        detailSource += '</div>';
                                    detailSource += '</div>';
                                detailSource += '</div>';

                                //ステータスおよびコントローラ表示部
                                detailSource += '<div class="heroArtifactOverview">';

                                    detailSource += '<div class="heroArtifactStatusArea">';

                                    afStats.forEach(function(element, index){
                                        detailSource += '<p>'+ element +"："+ afValue[index] +"</p>";
                                    });

                                    detailSource += '</div>';

                                    detailSource += '<div class="heroArtifactButtonArea">';
                                        detailSource += '<div class="heroArtifactController">';
                                        detailSource += '<img src="../common/img/downbtn_s.png" class="btnPos" onclick="window.artStarBtnHandler('+ af +','+"'down'"+');"><span id="art'+ af +'star" class="valueDisp">★'+ artStar +'</span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="window.artStarBtnHandler('+ af +','+"'up'"+');">';
                                        detailSource += '</div>';

                                        detailSource += '<div class="heroArtifactController">';
                                        detailSource += '<img src="../common/img/downbtn_s.png" class="btnPos" onclick="window.artLvBtnHandler('+ af +','+"'down'"+');"><span id="art'+ af +'lv" class="valueDisp">レベル'+ artLevel +'</span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="window.artLvBtnHandler('+ af +','+"'up'"+');">';
                                        detailSource += '</div>';
                                        detailSource += '<div class="BoxClear"></div>';
                                    detailSource += '</div>';
                                detailSource += '</div>';
                                detailSource += '<div class="BoxClear"></div>';

                            detailSource += '</div>';
                        }

                        detailSource += '<div>';
                    }
                    //グリフタブ
                    else if(nowCustomTab == "glyph"){
                        detailSource += '<div id="heroSkillArea">';

                        let glyphSource = Array();

                        //グリフ情報
                        for(let gf = 0; gf < 5; gf++){

                            let gIndex = Number(heroInfo['Runes'][gf])-1;
                            let gData = glyphList["rune"][0]["Type"][gIndex];

                            let gStat = skinStatusName[gData[Number(heroInfo['Runes'][gf])]];
                            let gValue = gData["level"][getHeroData[t]["glyph"][gf]];

                            let _source = "";

                            _source += '<div class="heroGlyphBox">';
                                _source += '<div class="heroGlyphImage">';
                                _source += '<img id="artImage_'+ gf +'" src="../status/img/'+ gData[Number(heroInfo['Runes'][gf])] +'.png" alt="" title="" width="50">';
                                _source += '</div>';
                                
                                _source += '<div class="heroGlyphController">';
                                _source += '<img src="../common/img/downbtn_s.png" class="btnPos" onclick="window.glyphLvBtnHandler('+ gf +','+"'down'"+');"><span id="elementLevel" class="valueDisp">Lv'+ getHeroData[t]["glyph"][gf] +'/40</span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="window.glyphLvBtnHandler('+ gf +','+"'up'"+');">';
                                _source += '</div>';

                                _source += '<div class="heroGlyphStatus">';
                                _source += gStat +"＋"+ gValue;
                                _source += '</div>';

                            _source += '</div>';

                            glyphSource.push(_source);
                        }

                        detailSource += '<div class="glyph0pos">';
                        detailSource += glyphSource[0];
                        detailSource += '</div>';
                        detailSource += '<div class="glyph4pos">';
                        detailSource += glyphSource[4];
                        detailSource += '</div>';
                        detailSource += '<div class="glyph1pos">';
                        detailSource += glyphSource[1];
                        detailSource += '</div>';
                        detailSource += '<div class="BoxClear"></div>';
                        detailSource += '<div class="glyph3pos">';
                        detailSource += glyphSource[3];
                        detailSource += '</div>';
                        detailSource += '<div class="glyph2pos">';
                        detailSource += glyphSource[2];
                        detailSource += '</div>';
                        detailSource += '<div class="BoxClear"></div>';


                        detailSource += '</div>';
                    }
                    //エレメントギフトタブ
                    else if(nowCustomTab == "elementGift"){
                        detailSource += '<div id="heroSkillArea">';

                        detailSource += '<div class="elementLevel">';
                        detailSource += '<img src="../common/img/downbtn_s.png" class="btnPos" onclick="window.elementLvBtnHandler('+"'down'"+');"><span id="elementLevel" class="valueDisp">Lv'+ getHeroData[t]["elementGift"] +'/30</span><img src="../common/img/upbtn_s.png" class="btnPos" onclick="window.elementLvBtnHandler('+"'up'"+');">';
                        detailSource += '</div>';


                        detailSource += '<div class="elementIconArea">';

                        let eLv = getHeroData[t]["elementGift"];

                        if(Number(getHeroData[t]["elementGift"]) > 0){
                            //指定レベルのメインスタッツの上昇ステータス情報
                            let statInfo = elementGiftList["elementGift"][0][eLv][heroInfo['MainStat']];

                            for(let _stat in statInfo){

                                let statName = skinStatusName[_stat.toLowerCase()];

                                detailSource += '<div class="elementIconBox">';
                                detailSource += '<div class="elementStatusName">' + statName;
                                detailSource += '</div>';
                                detailSource += '<div class="elementIcon">';
                                detailSource += '<img id="element_'+ _stat +'" src="../status/img/'+ _stat.toLowerCase() +'.png" alt="" title="" width="50">';
                                detailSource += '</div>';
                                detailSource += '<div class="elementStatus">';
                                detailSource += "＋"+ statInfo[_stat];
                                detailSource += '</div>';
                                detailSource += '</div>';
                            }
                        }
                        else{
                            let statInfo = elementGiftList["elementGift"][0][1][heroInfo['MainStat']];

                            for(let _stat in statInfo){

                                let statName = skinStatusName[_stat.toLowerCase()];

                                detailSource += '<div class="elementIconBox">';
                                detailSource += '<div class="elementStatusName">' + statName;
                                detailSource += '</div>';
                                detailSource += '<div class="elementIcon">';
                                detailSource += '<img id="element_'+ _stat +'" src="../status/img/'+ _stat.toLowerCase() +'.png" alt="" title="" width="50">';
                                detailSource += '</div>';
                                detailSource += '<div class="elementStatus">';
                                detailSource += "＋0";
                                detailSource += '</div>';
                                detailSource += '</div>';
                            }
                        }

                        detailSource += '<div class="BoxClear"></div>';
                        detailSource += '</div>';

                        detailSource += '<div>';
                    }
                    else{
                        detailSource += '<div>開発中</div>';
                    }

                    //コンテンツ表示
                    document.getElementById('detailContent').innerHTML = detailSource;

                    //パワー値
                    document.getElementById('powerView').innerHTML = Math.floor(statusArray['power']);

                    break;
                }
            }

            break;
        }
    }


    if(nowActive == "own"){
        let teamIndex = own_team_array.findIndex((v) => v.id === id);
        if(teamIndex > -1) own_team_array[teamIndex]['status'] = statusCalc("own", id);
    }
    //scrollArea.scrollTop = positionTop;
    app.$refs.result.update();
}

//装備の着脱
function equipSwitch(index){

    let getHeroData = myData[nowActive +"_hero"];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){

            let nowValue = getHeroData[t]['equip'][index];

            if(nowValue == 0) getHeroData[t]['equip'][index] = 1;
            else getHeroData[t]['equip'][index] = 0;
            
            break;
        }
    }

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//カラーランク昇降
function colorBtnHandler(dir){
    if(!nowCustom) return;

    let targetHeroType = nowActive +"_hero";
    let targetHeroIndex;
    let nowColor;

    let getHeroData = myData[targetHeroType];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){
            targetHeroIndex = t;
            nowColor = Number(getHeroData[targetHeroIndex]['color']);
            break;
        }
    }

    if(dir == "up"){
        if(nowColor < 15){
            if(nowColor == 0) nowColor = 1;
            nowColor++;            
            if(nowColor > 1 && Number(getHeroData[targetHeroIndex]['skillLevel'][1]) < 1) getHeroData[targetHeroIndex]['skillLevel'][1] = 1;
            if(nowColor > 3 && Number(getHeroData[targetHeroIndex]['skillLevel'][2]) < 1) getHeroData[targetHeroIndex]['skillLevel'][2] = 1;
            if(nowColor > 6 && Number(getHeroData[targetHeroIndex]['skillLevel'][3]) < 1) getHeroData[targetHeroIndex]['skillLevel'][3] = 1;
        }
    }
    else if(dir == "down"){
        if(nowColor > 1){
            nowColor--;
            if(nowColor < 2 && Number(getHeroData[targetHeroIndex]['skillLevel'][1]) > 0) getHeroData[targetHeroIndex]['skillLevel'][1] = 0;
            if(nowColor < 4 && Number(getHeroData[targetHeroIndex]['skillLevel'][2]) > 0) getHeroData[targetHeroIndex]['skillLevel'][2] = 0;
            if(nowColor < 7 && Number(getHeroData[targetHeroIndex]['skillLevel'][3]) > 0) getHeroData[targetHeroIndex]['skillLevel'][3] = 0;
        }
    }

    getHeroData[targetHeroIndex]['color'] = nowColor;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

function lvBtnHandler(dir){
    if(!nowCustom) return;

    let targetHeroType = nowActive +"_hero";
    let targetHeroIndex;
    let nowLevel;

    let getHeroData = myData[targetHeroType];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){
            targetHeroIndex = t;
            nowLevel = Number(getHeroData[targetHeroIndex]['lv']);
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

    getHeroData[targetHeroIndex]['lv'] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

function starBtnHandler(dir){
    if(!nowCustom) return;
    
    let targetHeroType = nowActive +"_hero";
    let targetHeroIndex;
    let nowLevel;

    let getHeroData = myData[targetHeroType];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){
            targetHeroIndex = t;
            nowLevel = Number(getHeroData[targetHeroIndex]['star']);
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

    getHeroData[targetHeroIndex]['star'] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//スキルレベル調整
function skillLvBtnHandler(dir, s_index, h_index){
                
    //ヒーローの設定情報を取得
    let nowLevel = Number(myData[nowActive +"_hero"][h_index]['skillLevel'][s_index]);

    let heroLevel = Number(myData[nowActive +"_hero"][h_index]['lv']);

    if(dir == "up"){
        if(s_index == 2){
            if(nowLevel < ( heroLevel - 20)){
                if(nowLevel < 100) nowLevel += updownRange;
                if(nowLevel > 100) nowLevel = 100;

                if(nowLevel > ( heroLevel - 20)) nowLevel = ( heroLevel - 20);
            }
        }
        else if(s_index == 3){
            if(nowLevel < ( heroLevel - 40)){
                if(nowLevel < 80) nowLevel += updownRange;
                if(nowLevel > 80) nowLevel = 80;

                if(nowLevel > ( heroLevel - 40)) nowLevel = ( heroLevel - 40);
            }
        }
        else{
            if(nowLevel < heroLevel){
                if(nowLevel < 120) nowLevel += updownRange;
                if(nowLevel > 120) nowLevel = 120;

                if(nowLevel > heroLevel) nowLevel = heroLevel;
            }
        }
    }
    else if(dir == "down"){
        if(nowLevel > 1) nowLevel -= updownRange;
        if(nowLevel < 1) nowLevel = 1;
    }

    myData[nowActive +"_hero"][h_index]['skillLevel'][s_index] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//スキンレベル調整
function skinLvHandler(dir, h_index, s_index){

    //ヒーローの設定情報を取得
    let nowLevel = Number(myData[nowActive +"_hero"][h_index]['skinLevel'][s_index]);

    if(dir == "up"){
        if(nowLevel < 60) nowLevel += updownRange;
        if(nowLevel > 60) nowLevel = 60;
    }
    else if(dir == "down"){
        if(nowLevel > 0) nowLevel -= updownRange;
        if(nowLevel < 0) nowLevel = 0;
    }

    myData[nowActive +"_hero"][h_index]['skinLevel'][s_index] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);

}

//アーティファクト★調整
function artStarBtnHandler(index,dir){
    if(!nowCustom) return;

    let targetHeroType = nowActive +"_hero";
    let targetHeroIndex;
    let nowLevel;

    let getHeroData = myData[targetHeroType];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){
            targetHeroIndex = t;
            nowLevel = Number(getHeroData[targetHeroIndex]['artStar'][index]);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 6) nowLevel++;
    }
    else if(dir == "down"){
        if(nowLevel > 1) nowLevel--;
    }

    getHeroData[targetHeroIndex]['artStar'][index] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//アーティファクトレベル調整
function artLvBtnHandler(index,dir){
    if(!nowCustom) return;

    let targetHeroType = nowActive +"_hero";
    let targetHeroIndex;
    let nowLevel;

    let getHeroData = myData[targetHeroType];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){
            targetHeroIndex = t;
            nowLevel = Number(getHeroData[targetHeroIndex]['artLv'][index]);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 100) nowLevel += updownRange;
        if(nowLevel > 100) nowLevel = 100;
    }
    else if(dir == "down"){
        if(nowLevel > 0) nowLevel -= updownRange;
        if(nowLevel < 0) nowLevel = 0;
    }

    getHeroData[targetHeroIndex]['artLv'][index] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//グリフレベル調整
function glyphLvBtnHandler(index,dir){
    if(!nowCustom) return;

    let targetHeroType = nowActive +"_hero";
    let targetHeroIndex;
    let nowLevel;

    let getHeroData = myData[targetHeroType];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){
            targetHeroIndex = t;
            nowLevel = Number(getHeroData[targetHeroIndex]['glyph'][index]);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 40) nowLevel += updownRange;
        if(nowLevel > 40) nowLevel = 40;
    }
    else if(dir == "down"){
        if(nowLevel > 0) nowLevel -= updownRange;
        if(nowLevel < 0) nowLevel = 0;
    }

    getHeroData[targetHeroIndex]['glyph'][index] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//エレメントギフトレベル調整
function elementLvBtnHandler(dir){
    if(!nowCustom) return;

    let targetHeroType = nowActive +"_hero";
    let targetHeroIndex;
    let nowLevel;

    let getHeroData = myData[targetHeroType];
    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == nowCustom){
            targetHeroIndex = t;
            nowLevel = Number(getHeroData[targetHeroIndex]['elementGift']);
            break;
        }
    }

    if(dir == "up"){
        if(nowLevel < 30) nowLevel += updownRange;
        if(nowLevel > 30) nowLevel = 30;
    }
    else if(dir == "down"){
        if(nowLevel > 0) nowLevel -= updownRange;
        if(nowLevel < 0) nowLevel = 0;
    }

    getHeroData[targetHeroIndex]['elementGift'] = nowLevel;

    storageUpdate();

    characterCustom(nowCustom, nowActive);
}

//育成対象設定
function targetSwitch(e){

    let targetID = e.id.split("_")[1];

    //ユーザー情報データ
    let getHeroData = myData[nowActive +"_hero"];

    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == targetID){

            if(e.checked){
                
                myData[nowActive +"_hero"][t]["target"] = "true";
                console.log(myData);
            }
            else{
                myData[nowActive +"_hero"][t]["target"] = "false";
            }

            break;
        }
    }


    storageUpdate();
    characterCustom(nowCustom, nowActive);
}
function targetColorSelect(e){
    let _idx = e.selectedIndex;
    let _value = e.options[_idx].value;

    let targetID = e.id.split("_")[1];

    //ユーザー情報データ
    let getHeroData = myData[nowActive +"_hero"];

    for(let t = 0; t < getHeroData.length; t++){
        if(getHeroData[t]['id'] == targetID){

            myData[nowActive +"_hero"][t]["targetColor"] = _value;

            break;
        }
    }

    storageUpdate();
    characterCustom(nowCustom, nowActive);
}


function pageMove(dir){

    let targetID = -1;

    for(let i = 0; i < heroList.length; i++){
        if(nowCustom == heroList[i]['id']){
            if(dir == 1){
                if(i == heroList.length-1){
                    return;
                }
                else{
                    targetID = heroList[(i+1)]['id'];
                }
            }
            else if(dir == -1){
                if(i == 0){
                    return;
                }
                else{
                    targetID = heroList[(i-1)]['id'];
                }
            }
            break;
        }
    }
    characterCustom(targetID, nowActive);
}

function resourceView(){
    document.getElementById('resource_modal').style.display = 'block';

    let heroLevel;
    let heroStar;
    let heroIndex;

    let heroType;

    let skinNumbers = [];

    let getHeroData = myData[nowActive +"_hero"];

    //出力するテキストリソース
    let resourceText = "";

    //設定目標レベル
    let aimLevel = Number(document.getElementById('aimLevelInput').value);
    if(aimLevel > 120) aimLevel = 120;

    //ユーザ設定のヒーロー情報
    for(let t = 0; t < getHeroData.length; t++){
        //編集中のヒーローIDと照合
        if(getHeroData[t]['id'] == nowCustom){

            //インデックス番号
            heroIndex = t;

            //ヒーローレベル
            heroLevel = Number(getHeroData[heroIndex]['lv']);

            //ヒーロースター
            heroStar = getHeroData[heroIndex]['star'];

            //必要なヒーローポーション数            
            let maxPotion = (Number(potionList["HeroLevel"][String(aimLevel)]) - Number(potionList["HeroLevel"][String(heroLevel)]));

            document.getElementById('aimLevelInput').min = heroLevel;
            document.getElementById('resourcePotionNumber').innerHTML = "ヒーローポーション：" + maxPotion.toLocaleString() +"個";
            document.getElementById('resourceEmeraldNumber').innerHTML = "エメラルド：" + (maxPotion / 5).toLocaleString() +"個";

            break;
        }
    }

    

    for(let i = 0; i < heroList['hero'].length; i++){

        let heroInfo = heroList['hero'][i];

        

        if(heroInfo['id'] == nowCustom){

            //ヒーロー名と現在レベル表示
            document.getElementById('heroResourceName').innerHTML = heroInfo['name'] + "&nbsp;Lv"+ heroLevel;


            //アーティファクト情報
            let artifactTypeArray = ["armor", "amulet", "weapon"];
            for(let a = 0; a < heroInfo['Artifacts'].length; a++){

                let artLevel = Number(getHeroData[heroIndex]['art'+ a +'lv']);

                
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
                let skinLevel = Number(myData[nowActive +"_hero"][heroIndex]['skin'+ skinIndex]);

                //必要なスキンストーン数
                let skinStoneNumber = 0;

                //消費したスキンストーン数
                let skinStoneUseNumber = 0;

                //設定目標レベル
                aimLevel = Number(document.getElementById('aimS'+ skinIndex +'Input').value);

                //スキン情報
                for(let k = 0; k < skinList["heroSkin"].length; k++){
                    //該当スキン
                    if(skinList["heroSkin"][k]["Id"] == skinID){
                        let statData = skinList["heroSkin"][k]["StatData"];
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
                document.getElementById('resourceSkin'+ skinIndex +'NowResource').innerHTML = '<img src="../hero/img/item_skinStone.png" width="20" height="20">'+ skinStoneUseNumber.toLocaleString() +"個";

                //目標までのリソース
                document.getElementById('resourceSkin'+ skinIndex +'Resource').innerHTML = '<img src="../hero/img/item_skinStone.png" width="20" height="20">'+ skinStoneNumber.toLocaleString() +"個";
            }
        }

    }
    
}

//指定ヒーローのステータス計算
function getMaxStatus(id){

    let heroLv = 120;
    let skinLv = 60;
    let artifactLv = 100;
    let glyphLv = 40;
    let elementLv = 30;
    let starLv = 6;
    let heroStar = starLv;
    let artStar = starLv;
    let colorCode = 15;

    let skillLv = [120,120,100,80];

    let _status = {"inte":0, "agil":0, "stre":0, "hp":0, "phatk":0, "mgatk":0, "armor":0, "mgdef":0, "dodge":0, "crit":0, "phpen":0, "mgpen":0, "drain":0, "regen":0};

    for(let i = 0; i < heroList.length; i++){

        //ヒーロー基本情報
        let heroInfo = heroList[i];

        if(id == heroInfo["id"]){        
        
            //装備６個分のステータス加算
            for(let e = 0; e < 6; e++){

                //ヒーローデータのカラーアップ情報からオレンジ+4の装備番号取得
                let equipID = heroInfo['Colors'][colorCode]['Items'][e];

                //装備情報検索
                for(let d = 0; d < itemList['item'].length; d++){

                    let itemInfo = itemList['item'][d];

                    if( equipID == itemInfo['id'] ){

                        let statusInfo = itemInfo['status'];

                        for (let key in statusInfo) {
                            switch(key){
                                case "intel":
                                    _status["inte"] += Number(statusInfo[key]);
                                    break;
                                case "agil":
                                    _status["agil"] += Number(statusInfo[key]);
                                    break;
                                case "stren":
                                    _status["stre"] += Number(statusInfo[key]);
                                    break;
                                case "hp":
                                    _status["hp"] += Number(statusInfo[key]);
                                    break;
                                case "phy_atk":
                                    _status["phatk"] += Number(statusInfo[key]);
                                    break;
                                case "mgc_atk":
                                    _status["mgatk"] += Number(statusInfo[key]);
                                    break;
                                case "armor":
                                    _status["armor"] += Number(statusInfo[key]);
                                    break;
                                case "mgc_def":
                                    _status["mgdef"] += Number(statusInfo[key]);
                                    break;
                                case "dodge":
                                    _status["dodge"] += Number(statusInfo[key]);
                                    break;
                                case "crit":
                                    _status["crit"] += Number(statusInfo[key]);
                                    break;
                                case "arm_pen":
                                    _status["phpen"] += Number(statusInfo[key]);
                                    break;
                                case "mgc_pen":
                                    _status["mgpen"] += Number(statusInfo[key]);
                                    break;
                                case "drain":
                                    _status["drain"] += Number(statusInfo[key]);
                                    break;
                            }
                        }

                        break;
                    }
                }
            }
            

            //知力
            _status["inte"] += Number(heroInfo['BaseStats']['Intelligence']);

            if(colorCode > 1){
                _status["inte"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["Intelligence"]);
            }
            _status["inte"] += Number(heroInfo['Stars'][String(heroStar)]["Intelligence"]) * heroLv;

            //エレメントギフト知力
            _status["inte"] += Number(elementGiftList["elementGift"][0][String(elementLv)][heroInfo['MainStat']]["Intelligence"]);

            //素早さ
            _status["agil"] += Number(heroInfo['BaseStats']['Agility']);

            if(colorCode > 1){
                _status["agil"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["Agility"]);
            }
            _status["agil"] += Number(heroInfo['Stars'][String(heroStar)]["Agility"]) * heroLv;

            //エレメントギフト素早さ
            _status["agil"] += Number(elementGiftList["elementGift"][0][String(elementLv)][heroInfo['MainStat']]["Agility"]);

            //力
            _status["stre"] += Number(heroInfo['BaseStats']['Strength']);

            if(colorCode > 1){
                _status["stre"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["Strength"]);
            }
            _status["stre"] += Number(heroInfo['Stars'][String(heroStar)]["Strength"]) * heroLv;

            //エレメントギフト力
            _status["stre"] += Number(elementGiftList["elementGift"][0][String(elementLv)][heroInfo['MainStat']]["Strength"]);


            //グリフ追加
            for(let _glyph = 0; _glyph < 5; _glyph++){
                let runeNum = Number(heroInfo["Runes"][_glyph]);
                let glyphStatus = skinStatusNameConvert[glyphList["rune"][0]["Type"][(runeNum-1)][runeNum]];
                _status[glyphStatus] += Number(glyphList["rune"][0]["Type"][(runeNum-1)]["level"][glyphLv]);
            }

            //スキン追加
            if(Array.isArray(heroInfo["Skin"])){
                for(let _skin = 0; _skin < heroInfo["Skin"].length; _skin++){
                    let skinNum = Number(heroInfo["Skin"][_skin]);
                    let skinStatus = skinStatusNameConvert[skinList[skinNum]["StatData"][0][6]];

                    //レベル情報がないスキンはスキップ
                    if(!skinList[skinNum]["StatData"][skinLv]) continue;

                    
                    _status[skinStatus] += Number(skinList[skinNum]["StatData"][skinLv][7]);
                }
            }
            else{
                let skinNum = Number(heroInfo["Skin"]);
                let skinStatus = skinStatusNameConvert[skinList[skinNum]["StatData"][0][6]];
                _status[skinStatus] += Number(skinList[skinNum]["StatData"][skinLv][7]);
            }

            //アーティファクト武器加算ステータス（仮想変数領域）
            let weaponValue = 0;
            let weaponStatus = "";

            //アーティファクト追加
            for(let _art = 0; _art < 3; _art++){
                //ヒーローのアーティファクト番号
                let artNum = Number(heroInfo["Artifacts"][_art]);

                //アーティファクト情報
                let artNumArray = artifactList["Id"][artNum]["BattleEffect"];

                //アーティファクトの種類
                let artType = artifactList["Id"][artNum]["Type"];

                //アーティファクトの上昇ステータス情報を走査
                for(let _aStat = 0; _aStat < artNumArray.length; _aStat++){
                    //ステータスIDから合致するものを走査
                    for(let _b = 0; _b < artifactList["Battle Effect"].length; _b++){
                        //IDが合致
                        if(artifactList["Battle Effect"][_b][artNumArray[_aStat]]){
                            //ステータス名を取得
                            let _artStatus = artifactList["Battle Effect"][_b][artNumArray[_aStat]];

                            //変数名変換
                            let artStatus = skinStatusNameConvert[_artStatus];

                            //指定レベルの上昇ステータス値取得
                            let statusValue = Number(artifactList["Battle Effect"][_b]["level"][artifactLv]);

                            //指定★レベルの倍率
                            let valueRate = Number(artifactList["Type"][artType]["Evolution"][artStar][0]);

                            //ステータスに加算(武器の場合は仮想変数に)
                            if(artType == "weapon"){
                                weaponStatus = artStatus;
                                weaponValue = statusValue * valueRate;
                            }
                            else _status[artStatus] += statusValue * valueRate;

                            break;
                        }
                    }
                }
            }

            //HP
            _status["hp"] += Number(heroInfo['BaseStats']['Hp']) + (_status["stre"] * 40);
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["Hp"]){
                    _status["hp"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Hp"]);
                }
            }

            //物理攻撃
            _status["phatk"] += Number(heroInfo['BaseStats']['PhysicalAttack']);
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["PhysicalAttack"]){
                    _status["phatk"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["PhysicalAttack"]);
                }
            }

            let statBonus = (_status["agil"] * 2);
            if(heroInfo['MainStat'] == "Strength") statBonus += _status["stre"];
            else if(heroInfo['MainStat'] == "Intelligence") statBonus += _status["inte"];
            else if(heroInfo['MainStat'] == "Agility") statBonus += _status["agil"];

            _status["phatk"] += statBonus; 

            //魔法攻撃
            _status["mgatk"] += (_status["inte"] * 3);
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["MagicPower"]){
                    _status["mgatk"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["MagicPower"]);
                }
            }

            //アーマー
            _status["armor"] += _status["agil"];
            if(heroInfo['BaseStats']['Armor']) _status["armor"] += Number(heroInfo['BaseStats']['Armor']);
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["Armor"]){
                    _status["armor"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["Armor"]);
                }
            }

            //魔法防御
            _status["mgdef"] += _status["inte"];
            if(heroInfo['BaseStats']['MagicResist']) _status["mgdef"] += Number(heroInfo['BaseStats']['MagicResist']);
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["MagicResist"]){
                    _status["mgdef"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["MagicResist"]);
                }
            }

            //回避率
            if(heroInfo['BaseStats']['Dodge']) _status["dodge"] += Number(heroInfo['BaseStats']['Dodge']);
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["Dodge"]){
                    _status["dodge"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["Dodge"]);
                }
            }

            //クリティカルヒット率
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["PhysicalCritChance"]){
                    _status["crit"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["PhysicalCritChance"]);
                }
            }

            //アーマー貫通
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["ArmorPenetration"]){
                    _status["phpen"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["ArmorPenetration"]);
                }
            }

            //魔法貫通
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["MagicPenetration"]){
                    _status["mgpen"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["MagicPenetration"]);
                }
            }

            //吸血
            if(colorCode > 1){
                if(heroInfo['Colors'][colorCode]["BattleStatData"]["Lifesteal"]){
                    _status["drain"] += Number(heroInfo['Colors'][colorCode]["BattleStatData"]["Lifesteal"]);
                }
            }

            //パワー算出用に一時的にアーティファクト武器ステータスを加算
            weaponValue *= 0.5;
            _status[weaponStatus] += weaponValue;

            //パワー算出
            let power = (_status["inte"] + _status["agil"] + _status["stre"]) * 2.75;
            power += _status["crit"] * 1.8;
            power += (_status["phatk"] - statBonus) * 0.75;

            power += (_status["hp"] - (_status["stre"] * 40)) * 0.05;

            //power += _status["regen"] * 0.06;

            power += _status["drain"] * 14.5;

            power += _status["phpen"] * 0.5;

            power += (_status["armor"] - _status["agil"]) * 0.5;

            power += _status["dodge"] * 1.8;

            power += (_status["mgdef"] - _status["inte"]) * 0.5;

            power += (_status["mgatk"] - (_status["inte"] * 3)) * 0.5;

            power += _status["mgpen"] * 0.5;

            for(let s = 0; s < skillLv.length; s++){                                
                power += Number(skillLv[s]) * 20;

                if(s == 2) power += 20*20;
                else if(s == 3) power += 20*40;
            }

            //一時的アーティファクト武器ステータスを減算
            _status[weaponStatus] -= weaponValue;

            _status["name"] = heroInfo['name'];
            _status["power"] = Math.floor(power);

            break;
        }
    }

    return _status;
 
}


//ダメージ値の計算
function getDamage(atk, def, pen){
    let _def = def - pen;
    if(_def < 0) _def = 0;

    let _d = Math.floor( atk * ( 1 / ( 1 + ( _def / 3000 ))) );
    return _d;
}

function floatStatusWindowView(){
    document.getElementById('floatStatus_content').style.display = 'block';
    characterCustom(nowCustom, nowActive);
}
function floatStatusClose(){
    var drag = document.getElementsByClassName("drag")[0];

    //ムーブベントハンドラの消去
    document.body.removeEventListener("mousemove", mmove, false);
    if(drag) drag.removeEventListener("mouseup", mup, false);
    document.body.removeEventListener("touchmove", mmove, false);
    if(drag) drag.removeEventListener("touchend", mup, false);

    //クラス名 .drag も消す
    if(drag) drag.classList.remove("drag");

    document.getElementById('floatStatus_content').style.display = 'none';
}

//マウスが押された際の関数
function mdown(e) {

    if (e.target.tagName == "INPUT" || e.target.tagName == "SELECT" || e.target.tagName == "BUTTON") return;

    //クラス名に .drag を追加
    this.classList.add("drag");

    //タッチデイベントとマウスのイベントの差異を吸収
    if(e.type === "mousedown") {
        var event = e;
    } else {
        var event = e.changedTouches[0];
    }

    //要素内の相対座標を取得
    x = event.pageX - this.offsetLeft;
    y = event.pageY - this.offsetTop;

    //ムーブイベントにコールバック
    document.body.addEventListener("mousemove", mmove, false);
    document.body.addEventListener("touchmove", mmove, false);
}

//マウスカーソルが動いたときに発火
function mmove(e) {

    //ドラッグしている要素を取得
    var drag = document.getElementsByClassName("drag")[0];

    //同様にマウスとタッチの差異を吸収
    if(e.type === "mousemove") {
        var event = e;
    } else {
        var event = e.changedTouches[0];
    }

    //フリックしたときに画面を動かさないようにデフォルト動作を抑制
    e.preventDefault();

    //マウスが動いた場所に要素を動かす
    drag.style.top = event.pageY - y + "px";
    drag.style.left = event.pageX - x + "px";

    //マウスボタンが離されたとき、またはカーソルが外れたとき発火
    drag.addEventListener("mouseup", mup, false);
    document.body.addEventListener("mouseleave", mup, false);
    drag.addEventListener("touchend", mup, false);
    document.body.addEventListener("touchleave", mup, false);

}

//マウスボタンが上がったら発火
function mup(e) {
    var drag = document.getElementsByClassName("drag")[0];

    //ムーブベントハンドラの消去
    document.body.removeEventListener("mousemove", mmove, false);
    if(drag) drag.removeEventListener("mouseup", mup, false);
    document.body.removeEventListener("touchmove", mmove, false);
    if(drag) drag.removeEventListener("touchend", mup, false);

    //クラス名 .drag も消す
    if(drag) drag.classList.remove("drag");
}

//小数点第2位切り捨て
function numFloor(num){
    return Math.floor(num * 10) / 10;
}

//設定初期化
function format(){
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
    if(!myData["own_dir"]) myData["own_dir"] = "atk";
    storageUpdate();


    //フィールド設定
    formBuild();
}

//カンスト設定
function maxBuild(){
    //カンストデータを生成                
    let ownText = '{"own_hero":[';
    let enemyText = '"enemy_hero":[';

    let heroCount = 0;
    heroList.forEach(function(element){

        let heroInfo = "";

        if(heroCount > 0) heroInfo += ",";

        heroInfo += '{"id":"'+ element["id"] +'", "lv":"120", "star":"6", "color":"15", "equip":["1","1","1","1","1","1"], "skillLevel":["120","120","100","80"],';
        
        heroInfo += '"skinLevel":["60"';
        for(let i = 0; i < element["Skin"].length; i++){
            heroInfo += ',"60"';
        }
        heroInfo += '],';

        heroInfo += '"artStar":["6", "6", "6"], "artLv":["100", "100", "100"],';
        heroInfo += '"glyph":["40", "40", "40", "40", "40"],';
        heroInfo += '"elementGift":"30", "target":"false", "targetColor":"15"}';

        ownText += heroInfo;
        enemyText += heroInfo;

        heroCount++;

    });
    let defaultData = ownText +'],'+ enemyText +'],"equipHas":{"1":0}}';

    localStorage.setItem("heroData",defaultData);
    myData = JSON.parse(defaultData);
    if(!myData["own_dir"]) myData["own_dir"] = "atk";
    storageUpdate();

    

    //フィールド設定
    formBuild();
}