//指定ヒーローのステータス計算
function statusCalc(pos, id){

    //設定情報を取得
    let getHeroData = myData[pos +"_hero"];

    //出力用配列
    let _status = {"inte":0, "agil":0, "stre":0, "hp":0, "phatk":0, "mgatk":0, "armor":0, "mgdef":0, "dodge":0, "crit":0, "phpen":0, "mgpen":0, "drain":0, "regen":0};

    //ヒーローデータを走査
    for(let i = 0; i < heroList.length; i++){

        //ヒーロー基本情報
        let heroInfo = heroList[i];

        let heroLv;
        let heroStar;
        let heroColor;

        let heroIndex;

        //計算対象ヒーローのID
        if(heroInfo['id'] == id){

            //設定データからヒーロー情報取得
            for(let t = 0; t < getHeroData.length; t++){

                //設定ヒーローと基本ヒーローとID照合
                if(getHeroData[t]['id'] == id){

                    heroIndex = t;
                    heroLv = Number(getHeroData[heroIndex]['lv']);
                    heroStar = getHeroData[heroIndex]['star'];

                    heroColor = getHeroData[heroIndex]['color'];
                    if(heroColor == 0) heroColor = 1;

                    let colorCode = heroColor;

                    let elementLv = getHeroData[heroIndex]["elementGift"];

                    let equipArray = getHeroData[heroIndex]["equip"];

                    let skinLvArray = getHeroData[heroIndex]["skinLevel"];

                    let artStarArray = getHeroData[heroIndex]["artStar"];
                    let artLvArray = getHeroData[heroIndex]["artLv"];

                    let glyphLvArray = getHeroData[heroIndex]["glyph"];
                    

                    //装備ステータスの加算
                    for(let e = 0; e < equipArray.length; e++){
                        if(equipArray[e] == 1){
                            let equipID = heroInfo['Colors'][heroColor]['Items'][e];

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
                    }


                    //知力
                    _status["inte"] += Number(heroInfo['BaseStats']['Intelligence']);

                    if(colorCode > 1){
                        _status["inte"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Intelligence"]);
                    }
                    _status["inte"] += Number(heroInfo['Stars'][String(heroStar)]["Intelligence"]) * heroLv;

                    //エレメントギフト知力
                    if(Number(elementLv) > 0) _status["inte"] += Number(elementGiftList["elementGift"][0][String(elementLv)][heroInfo['MainStat']]["Intelligence"]);

                    //素早さ
                    _status["agil"] += Number(heroInfo['BaseStats']['Agility']);

                    if(colorCode > 1){
                        _status["agil"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Agility"]);
                    }
                    _status["agil"] += Number(heroInfo['Stars'][String(heroStar)]["Agility"]) * heroLv;

                    //エレメントギフト素早さ
                    if(Number(elementLv) > 0) _status["agil"] += Number(elementGiftList["elementGift"][0][String(elementLv)][heroInfo['MainStat']]["Agility"]);

                    //力
                    _status["stre"] += Number(heroInfo['BaseStats']['Strength']);
                    
                    if(colorCode > 1){
                        _status["stre"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Strength"]);
                    }
                    _status["stre"] += Number(heroInfo['Stars'][String(heroStar)]["Strength"]) * heroLv;
                    
                    //エレメントギフト力
                    if(Number(elementLv) > 0) _status["stre"] += Number(elementGiftList["elementGift"][0][String(elementLv)][heroInfo['MainStat']]["Strength"]);

                    //グリフ追加
                    for(let _glyph = 0; _glyph < 5; _glyph++){
                        let glyphLv = glyphLvArray[_glyph];

                        let runeNum = Number(heroInfo["Runes"][_glyph]);
                        let glyphStatus = skinStatusNameConvert[glyphList["rune"][0]["Type"][(runeNum-1)][runeNum]];
                        _status[glyphStatus] += Number(glyphList["rune"][0]["Type"][(runeNum-1)]["level"][glyphLv]);
                    }

                    //スキン追加
                    if(Array.isArray(heroInfo["Skin"])){
                        //スキンが複数ある場合
                        for(let _skin = 0; _skin < heroInfo["Skin"].length; _skin++){
                            let skinLv = skinLvArray[_skin];
                            let skinNum = Number(heroInfo["Skin"][_skin]);
                            let skinStatus = skinStatusNameConvert[skinList[skinNum]["StatData"][0][6]];

                            //レベル情報がないスキンはスキップ
                            if(!skinList[skinNum]["StatData"][skinLv]) continue;

                            _status[skinStatus] += Number(skinList[skinNum]["StatData"][skinLv][7]);
                        }
                    }
                    else{
                        //スキンがデフォルト１点の場合
                        let skinLv = skinLvArray[0];
                        let skinNum = Number(heroInfo["Skin"]);
                        let skinStatus = skinStatusNameConvert[skinList[skinNum]["StatData"][0][6]];
                        _status[skinStatus] += Number(skinList[skinNum]["StatData"][skinLv][7]);
                    }

                    

                    //アーティファクト武器加算ステータス（仮想変数領域）
                    let weaponValue = 0;
                    let weaponStatus = "";

                    //アーティファクト追加
                    for(let _art = 0; _art < 3; _art++){

                        let artifactLv = artLvArray[_art];
                        let artStar = artStarArray[_art];

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
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Hp"]){
                            _status["hp"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Hp"]);
                        }
                    }

                    //物理攻撃
                    _status["phatk"] += Number(heroInfo['BaseStats']['PhysicalAttack']);
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["PhysicalAttack"]){
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
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["MagicPower"]){
                            _status["mgatk"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["MagicPower"]);
                        }
                    }

                    //アーマー
                    _status["armor"] += _status["agil"];
                    if(heroInfo['BaseStats']['Armor']) _status["armor"] += Number(heroInfo['BaseStats']['Armor']);
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Armor"]){
                            _status["armor"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Armor"]);
                        }
                    }

                    //魔法防御
                    _status["mgdef"] += _status["inte"];
                    if(heroInfo['BaseStats']['MagicResist']) _status["mgdef"] += Number(heroInfo['BaseStats']['MagicResist']);
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["MagicResist"]){
                            _status["mgdef"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["MagicResist"]);
                        }
                    }

                    //回避率
                    if(heroInfo['BaseStats']['Dodge']) _status["dodge"] += Number(heroInfo['BaseStats']['Dodge']);
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Dodge"]){
                            _status["dodge"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Dodge"]);
                        }
                    }

                    //クリティカルヒット率
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["PhysicalCritChance"]){
                            _status["crit"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["PhysicalCritChance"]);
                        }
                    }

                    //アーマー貫通
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["ArmorPenetration"]){
                            _status["phpen"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["ArmorPenetration"]);
                        }
                    }

                    //魔法貫通
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["MagicPenetration"]){
                            _status["mgpen"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["MagicPenetration"]);
                        }
                    }

                    //吸血
                    if(colorCode > 1){
                        if(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Lifesteal"]){
                            _status["drain"] += Number(heroInfo['Colors'][String(colorCode)]["BattleStatData"]["Lifesteal"]);
                        }
                    }

                    //HP自動回復
                    //let regen = 0;

                    
                    //パワー算出用に一時的にアーティファクト武器ステータスを加算
                    weaponValue *= 0.5;
                    _status[weaponStatus] += weaponValue;

                    //パワー算出
                    let power = (_status["inte"] + _status["agil"] + _status["stre"]) * 2.75;
                    power += _status["crit"] * 1.8;
                    power += (_status["phatk"] - statBonus) * 0.75;

                    power += (_status["hp"] - (_status["stre"] * 40)) * 0.05;

                    //power += regen * 0.06;

                    power += _status["drain"] * 14.5;

                    power += _status["phpen"] * 0.5;

                    power += (_status["armor"] - _status["agil"]) * 0.5;

                    power += _status["dodge"] * 1.8;

                    power += (_status["mgdef"] - _status["inte"]) * 0.5;

                    power += (_status["mgatk"] - (_status["inte"] * 3)) * 0.5;

                    power += _status["mgpen"] * 0.5;

                    for(let s = 0; s < getHeroData[t]["skillLevel"].length; s++){
                
                        power += Number(getHeroData[t]["skillLevel"][s]) * 20;

                        if(Number(getHeroData[t]["skillLevel"][s]) > 0){
                            if(s == 2) power += 20*20;
                            else if(s == 3) power += 20*40;
                        }
                    }

                    //一時的アーティファクト武器ステータスを減算
                    _status[weaponStatus] -= weaponValue;

                    _status["name"] = heroInfo['name'];
                    _status["power"] = Math.floor(power);

                    break;                    
                }
            }
            break;                       
        }
    }

    return _status;
}