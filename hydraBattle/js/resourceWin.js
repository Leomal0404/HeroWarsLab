let needleList = [];
let needleEquipList = [];

let getStageInfo = {};

let heroNeedleList = [];
let heroNeedleEquipList = [];

let stuffEnergyRateList = {};
let equipEnergyRateList = {};

let hasList = {};

let itemType = "equip";
let viewType = "this";
let sortType = "rank";

let energy_value = 0;

let nowPageID = undefined;

//装備アイテム情報
function resourceInfoOpen(){
    document.getElementById('resource_modal').style.display = 'block';

    nowPageID = undefined;

    cookieUpdate();
    if(!cookieData["resourceItem"]){
        document.cookie = "resourceItem="+ itemType;
        document.cookie = "resourceView="+ viewType;
        document.cookie = "resourceSort="+ sortType;
        cookieUpdate();
    }
    
    itemType = cookieData["resourceItem"];
    viewType = cookieData["resourceView"];
    sortType = cookieData["resourceSort"];

    costCalc();

    let _content = "";
    needleList = [];
    needleEquipList = [];
    hasList = {};
    getStageInfo = {};


    let _heroInfo = heroList.find((v) => v.id === nowCustom);

    _content += '<div>';
    _content += '<select id="resourceTarget" onchange="resourceItemSelect(this);">';

    let _selected = "";
    if(itemType == "material") _selected = " selected"; 
    _content += '<option value="material"'+ _selected +'>収集が必要な素材一覧：</option>';

    _selected = "";
    if(itemType == "equip") _selected = " selected"; 
    _content += '<option value="equip"'+ _selected +'>完成品現物一覧：</option>';

    _content += '</select>';


    _content += '&nbsp;<select id="resourceTarget" onchange="resourceTargetSelect(this);">';
    
    _selected = "";
    if(viewType == "this") _selected = " selected"; 
    _content += '<option value="this"'+ _selected +'>'+ _heroInfo['name'] +'</option>';

    _selected = "";
    if(viewType == "only") _selected = " selected"; 
    _content += '<option value="only"'+ _selected +'>育成対象ヒーローのみ</option>';

    _selected = "";
    if(viewType == "all") _selected = " selected"; 
    _content += '<option value="all"'+ _selected +'>すべてのヒーロー</option>';

    _content += '</select>';

    _content += '&nbsp;&nbsp;&nbsp;■ソート順：';
    _content += '<select id="resourceTargetSort" onchange="resourceSortSelect(this);">';

    _selected = "";
    if(sortType == "rank") _selected = " selected"; 
    _content += '<option value="rank"'+ _selected +'>ランク順</option>';

    _selected = "";
    if(sortType == "count") _selected = " selected"; 
    _content += '<option value="count"'+ _selected +'>必要個数順</option>';

    _selected = "";
    if(sortType == "kana") _selected = " selected"; 
    _content += '<option value="kana"'+ _selected +'>かな五十音順</option>';

    _content += '</select>';

    _content += '<div class="customButtonArea"><img src="../common/img/customButton.png" width="20" onclick="openEnergyCustomWindow();"></div>';
    
    _content += '</div>';
    _content += '<hr>';
    _content += '<div id="resourceListArea"><ul id="resourceList">';

    //ユーザー情報データ
    let getHeroData = myData[nowActive +"_hero"];

    //所持アイテムを計算用配列に格納
    for(let _h in myData["equipHas"]){
        hasList[_h] = Number(myData["equipHas"][_h]);
    }


    //ヒーローリストから該当ヒーローの情報取得
    for(let heroInfo of heroList){

        //let heroInfo = heroList.find((v) => v.id === nowCustom);

        //該当ヒーローの設定情報
        let myHeroInfo = getHeroData.find((v) => v.id === heroInfo["id"]);

        if(viewType == "this"){
            if(heroInfo["id"] != nowCustom) continue;
        }
        else if(viewType == "only"){
            if(myHeroInfo["target"] != "true") continue;
        }

        //ヒーロー別の必要素材配列
        heroNeedleList[heroInfo["id"]] = [];
        heroNeedleEquipList[heroInfo["id"]] = [];


        let heroColor;

        heroLevel = Number(myHeroInfo['lv']);
        heroColor = Number(myHeroInfo["color"]);
        if(heroColor == 0) heroColor = 1;

        //装備アイテム
        let targetColor = 16;
        if(viewType == "this" || viewType == "only") targetColor = Number(myHeroInfo["targetColor"]) + 1;
        if(!targetColor) targetColor = 16;

        for(let c = heroColor; c < targetColor; c++){
            for(let e = 0; e < 6; e++){
                if(Number(myHeroInfo["equip"][e]) == 1 && c == heroColor) continue;

                let equipID = heroInfo['Colors'][c]['Items'][e];

                //装備IDから情報取得
                let itemInfo = itemList['item'].find((v) => v.id === equipID);

                //_content += "<br />"+ itemInfo['name'];

                //所持数
                let needCount = 1;
                if(hasList[equipID]){
                    needCount = 0;
                    hasList[equipID]--;
                }

                //材料がない場合は採集対象
                if(itemInfo['stuff'] == undefined){

                    let _stuffInfo = needleList.find((v) => v.id === equipID);
                    let _stuffIndex = needleList.findIndex((v) => v.id === equipID);

                    let _hStuffInfo = heroNeedleList[heroInfo["id"]].find((v) => v.id === equipID);
                    let _hStuffIndex = heroNeedleList[heroInfo["id"]].findIndex((v) => v.id === equipID);

                    let _sInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name'], "drop":itemInfo['drop']};

                    let _hInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name']};

                    if(!_stuffInfo) needleList.push(_sInfo);
                    else needleList[_stuffIndex]["count"] += needCount;

                    if(!_hStuffInfo) heroNeedleList[heroInfo["id"]].push(_hInfo);
                    else heroNeedleList[heroInfo["id"]][_hStuffIndex]["count"]++;
                }
                //材料走査
                else{
                    let _stuffInfo = needleEquipList.find((v) => v.id === equipID);
                    let _stuffIndex = needleEquipList.findIndex((v) => v.id === equipID);

                    let _hStuffInfo = heroNeedleEquipList[heroInfo["id"]].find((v) => v.id === equipID);
                    let _hStuffIndex = heroNeedleEquipList[heroInfo["id"]].findIndex((v) => v.id === equipID);

                    let _sInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name'], "stuff":itemInfo['stuff']};

                    let _hInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name']};


                    if(!_stuffInfo) needleEquipList.push(_sInfo);
                    else needleEquipList[_stuffIndex]["count"] += needCount;


                    if(!_hStuffInfo) heroNeedleEquipList[heroInfo["id"]].push(_hInfo);
                    else heroNeedleEquipList[heroInfo["id"]][_hStuffIndex]["count"]++;

                    stuffResearch(itemInfo['stuff'], needCount, heroInfo["id"], 1);
                }
            }
        }
    }

    
    //収集ステージを模索
    needleList.sort(function(a,b){
        if(a.count < b.count) return 1;
        if(a.count > b.count) return -1;
        return 0;
    });
    //必要装備リスト(ディープコピー)
    let stageNeedleList = [];
    for(let _nObj of needleList){
        stageNeedleList.push(Object.assign({}, _nObj));
    }
    //必要装備収集ステージ情報構築
    for(let i = 0; i < stageNeedleList.length; i++){
        let dropItem = stageNeedleList[i];

        let mainGrade = dropItem["grade"];
        let mainGetRate = itemList['rateIndex'][mainGrade];

        //必要数取得
        let _nCount = dropItem["count"];
        if(_nCount == 0) continue;

        //キャンペーンステージ番号を走査してエネルギーと重複獲得できるアイテムを取得
        for(let _c = dropItem["drop"].length - 1; _c >= 0; _c--){
            let _cp = dropItem["drop"][_c];
            let _stageNum = Number(_cp.split("-")[0]);

            if(_stageNum > 13) continue;

            let _stageItem = [dropItem["id"]];

            //ステージ情報
            let _cpData = campaignList["campaign"].find((v) => v.id === _cp);
            //消費エネルギー
            let _enr = Number(_cpData["enr"]);

            if(_enr > 10){
                if(_c == 0){
                    let _back = _c;
                    while(1){
                        _back++;
                        _cp = dropItem["drop"][_back];
                        _stageNum = Number(_cp.split("-")[0]);
                        _cpData = campaignList["campaign"].find((v) => v.id === _cp);
                        _enr = Number(_cpData["enr"]);

                        if(_enr < 11) break;
                    }
                }
                else continue;
            }
         

            //同じステージで獲得できるアイテムを捜索
            for(let j = (i+1); j < stageNeedleList.length; j++){

                //必要数が０であれば無視
                if(stageNeedleList[j]["count"] == 0) continue;

                //白装備も無視
                if(stageNeedleList[j]["grade"] == 0) continue;

                //同じステージの必要アイテムIDを取得
                if(stageNeedleList[j]["drop"].includes(_cp)){
                    _stageItem.push(stageNeedleList[j]["id"]);
                }
                else{
                    continue;
                }
            }

            //2番目に必要数の多いアイテムの個数分このステージで収集すると想定
            if(_stageItem.length > 1){
                let _subIndex = stageNeedleList.findIndex((v) => v.id === _stageItem[1]);
                let getCount = stageNeedleList[_subIndex]["count"];
                let getGrade = stageNeedleList[_subIndex]["grade"];
                let _rate = itemList['rateIndex'][getGrade];
                                
                //３番目収集可能アイテムが存在する場合
                let _sIndex;
                let _sCount;
                let _sGrade;
                let _sTimes = 0;
                let _sItem = undefined;
                if(_stageItem.length > 2){
                    _sIndex = stageNeedleList.findIndex((v) => v.id === _stageItem[2]);
                    _sCount = stageNeedleList[_sIndex]["count"];
                    _sGrade = stageNeedleList[_sIndex]["grade"];

                    stageNeedleList[_sIndex]["count"] = 0;

                    let _sRate = itemList['rateIndex'][_sGrade];
                    _sTimes = Math.ceil(_sCount / _sRate);

                    let setItem = [];
                    for(let _sI = 0; _sI < 2; _sI++){
                        setItem.push(_stageItem[_sI]);
                    }
                    _sItem = _stageItem[2];

                    let EnergyRate = Math.floor((_sTimes * _enr / 3) / _sCount * 100) / 100;
                    getStageInfo[_stageItem[2]] = [];
                    let _triItemStageInfo = {"id":_stageItem[2], "enr":_enr * _sTimes, "energyRate":EnergyRate, "times":_sTimes,"stageID":_cp, "items":dropItem["name"], "getCounts":_sCount, "setItem":setItem};
                    getStageInfo[_stageItem[2]].push(_triItemStageInfo);

                    stuffEnergyRateList[_stageItem[2]] = EnergyRate;

                    _stageItem.splice(2,1);
                }


                //２番目とメインアイテムのステージ情報
                if(!getStageInfo[_stageItem[1]]) getStageInfo[_stageItem[1]] = [];
                if(!getStageInfo[dropItem["id"]]) getStageInfo[dropItem["id"]] = [];


                let _sTimeGet = 0;
                let _sTimeMainGet = 0;
                if(_sTimes > 0){

                    let _setSubItem = [_stageItem[0], _sItem];
                    let _setMainItem = [_stageItem[1], _sItem];

                    _sTimeGet = Math.floor(_sTimes * _rate);
                    let _energyRate = Math.floor((_enr * _sTimes / 3) / _sTimeGet * 100) / 100;
                    let _subItemStageInfo = {"id":_stageItem[1], "enr":_enr * _sTimes, "energyRate":_energyRate, "times":_sTimes,"stageID":_cp, "getCounts":_sTimeGet, "setItem":_setSubItem};
                    getStageInfo[_stageItem[1]].push(_subItemStageInfo);

                    _sTimeMainGet = Math.floor(_sTimes * mainGetRate);
                    let _energyMainRate = Math.floor((_enr * _sTimes / 3) / _sTimeMainGet * 100) / 100;

                    let _mainItemStageInfo = {"id":dropItem["id"], "enr":_enr * _sTimes, "energyRate":_energyMainRate, "times":_sTimes,"stageID":_cp, "getCounts":_sTimeMainGet, "setItem":_setMainItem};
                    getStageInfo[dropItem["id"]].push(_mainItemStageInfo);

                    stageNeedleList[i]["count"] -= _sTimeMainGet;
                }


                let _setSubItem = [_stageItem[0]];
                let _setMainItem = [_stageItem[1]];

                let subCount = getCount - _sTimeGet;
                let roundCount = Math.ceil(subCount / _rate);
                let needEnergy = _enr * roundCount;

                //２番目アイテムは全回収
                stageNeedleList[_subIndex]["count"] = 0;

                //アイテム１個あたりのエネルギー
                let subEnergyRate = Math.floor((roundCount * _enr / 2) / subCount * 100) / 100;

                let _subInfo = {"id":_stageItem[1], "enr":needEnergy, "energyRate":subEnergyRate, "times":roundCount, "stageID":_cp, "getCounts":subCount, "setItem":_setSubItem};
                getStageInfo[_stageItem[1]].push(_subInfo);


                let _secondEnergy = 0;
                let _secondGetCount = 0;
                for(let _sub of getStageInfo[_stageItem[1]]){
                    _secondEnergy += _sub["energyRate"] * _sub["getCounts"];
                    _secondGetCount += _sub["getCounts"];
                }
                let _secondEnergyRate = Math.floor(_secondEnergy / _secondGetCount * 100) / 100;
                stuffEnergyRateList[_stageItem[1]] = _secondEnergyRate;


                //メインアイテムの計算
                let mainCount = Math.floor(roundCount * mainGetRate);

                //アイテム１個あたりのエネルギー
                let EnergyRate = Math.floor((roundCount * _enr / 2) / mainCount * 100) / 100;

                //メインアイテムのステージ情報
                let _stageInfo = {"id":dropItem["id"], "enr":needEnergy, "energyRate":EnergyRate, "times":roundCount,　"stageID":_cp, "getCounts":mainCount, "setItem":_setMainItem};
                getStageInfo[dropItem["id"]].push(_stageInfo);

                
                stageNeedleList[i]["count"] -= mainCount;
                if(stageNeedleList[i]["count"] < 0) stageNeedleList[i]["count"] = 0;

            }

            if(_c == 0 && stageNeedleList[i]["count"] > 0){
                //消費エネルギー
                let _rate = itemList['rateIndex'][stageNeedleList[i]["grade"]];
                let _times = Math.ceil(stageNeedleList[i]["count"] / _rate);
                let needEnergy = _enr * _times;

                let EnergyRate = Math.floor((needEnergy / stageNeedleList[i]["count"]) * 100) / 100;

                let _stageInfo = {"id":dropItem["id"], "enr":needEnergy, "energyRate":EnergyRate, "times":_times,　"stageID":_cp, "getCounts":stageNeedleList[i]["count"], "setItem":[]};

                
                if(!getStageInfo[dropItem["id"]]) getStageInfo[dropItem["id"]] = [];
                getStageInfo[dropItem["id"]].push(_stageInfo);

                stageNeedleList[i]["count"] = 0;
            }

            if(stageNeedleList[i]["count"] == 0){
                let _Energy = 0;
                let _GetCount = 0;
                for(let _main of getStageInfo[dropItem["id"]]){
                    _Energy += _main["energyRate"] * _main["getCounts"];
                    _GetCount += _main["getCounts"];
                }
                let _mainEnergyRate = Math.floor(_Energy / _GetCount * 100) / 100;
                stuffEnergyRateList[dropItem["id"]] = _mainEnergyRate;
                break;
            }       
        }
    }

    //console.log(stuffEnergyRateList);


    //完成品の１個あたりのエネルギーも算出取得
    for(let _eqInfo of needleEquipList){
        if(!equipEnergyRateList[_eqInfo["id"]]){
            equipEnergyRateList[_eqInfo["id"]] = getEquipEnergy(_eqInfo["id"]);            
        }
    }

    let targetList = [];
    if(itemType == "equip"){
        targetList = needleEquipList.concat();
    }
    else if(itemType == "material"){
        targetList = needleList.concat();
    }

    //素材一覧をソート
    if(sortType == "rank"){
        targetList.sort(function(a,b){
            if(a.grade < b.grade) return 1;
            if(a.grade > b.grade) return -1;
            return 0;
        });
    }
    else if(sortType == "count"){
        targetList.sort(function(a,b){
            if(a.count < b.count) return 1;
            if(a.count > b.count) return -1;
            return 0;
        });
    }
    else if(sortType == "kana"){
        targetList.sort((a,b) => a.name.localeCompare(b.name, "ja", { numeric: true }));
        targetList.sort((a,b) => a.nameIndex.localeCompare(b.nameIndex, "ja", { numeric: true }));
        // targetList.sort(function(a,b){
        //     if(a.name < b.name) return -1;
        //     if(a.name > b.name) return 1;
        //     return 0;
        // });
        // targetList.sort(function(a,b){
        //     if(a.nameIndex < b.nameIndex) return -1;
        //     if(a.nameIndex > b.nameIndex) return 1;
        //     return 0;
        // });
    }

    let nowIndex = "_";
    for(let _n of targetList){        
        let itemInfo = itemList['item'].find((v) => v.id === _n['id']);
        let itemID = _n['id'].split("_")[0];

        if(sortType == "kana" && nowIndex != itemInfo['nameIndex']){
            nowIndex = itemInfo['nameIndex'];
            _content += '<li class="black_bg">【'+ nowIndex +'】</li>';
        }

        let needleCount = Number(_n['count']);

        _content += '<li class="'+ itemInfo['grade'] +'_bg" onclick="equipDetailView('+"'"+ _n['id'] +"'"+');"><img src="../item/img/'+ "gear_"+ itemID +'.png" alt="'+ itemInfo['name'] +'" title="'+ itemInfo['name'] +'" width="36" height="36"><br />x'+ needleCount +'</li>';
    }
   

    _content += '</ul></div>';

    document.getElementById("resourceInfo").innerHTML = _content;
}

//完成品の１個あたりのエネルギー取得関数
function getEquipEnergy(equipID){
    //装備IDから情報取得
    let itemInfo = itemList['item'].find((v) => v.id === equipID);

    let needleEnergy = 0;

    for(let stuffID in itemInfo["stuff"]){
        if(stuffID == "gold") continue;

        let _count = itemInfo["stuff"][stuffID];
        let _energy = 0;

        if(stuffEnergyRateList[stuffID]) _energy += stuffEnergyRateList[stuffID];
        else{
            if(equipEnergyRateList[stuffID]) _energy += equipEnergyRateList[stuffID];
            else _energy += getEquipEnergy(stuffID);
        }

        needleEnergy += _count * _energy;
    }

    return needleEnergy;
}

function stuffResearch(stuffList, needle, heroID, heroNeedle){
    for(let equipID in stuffList){
        //ゴールド額は材料とみなさない
        if(equipID == "gold") continue;

        let itemInfo = itemList['item'].find((v) => v.id === equipID);

        //所持数
        let needCount = Number(stuffList[equipID]) * needle;
        let heroNeedCount = Number(stuffList[equipID]) * heroNeedle;
        if(hasList[equipID]){            
            if(needCount > hasList[equipID]){
                needCount -= hasList[equipID];
                hasList[equipID] = 0;
            }
            else{
                hasList[equipID] -= needCount;
                needCount = 0;
            }
        }

        if(itemInfo['stuff'] == undefined){
            //console.log(itemInfo['name'] +"：x"+ stuffList[equipID] +"採集");

            let _stuffInfo = needleList.find((v) => v.id === equipID);
            let _stuffIndex = needleList.findIndex((v) => v.id === equipID);

            let _hStuffInfo = heroNeedleList[heroID].find((v) => v.id === equipID);
            let _hStuffIndex = heroNeedleList[heroID].findIndex((v) => v.id === equipID);

            let _sInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name'], "drop":itemInfo['drop']};

            let _hInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name']};
    
            if(!_stuffInfo) needleList.push(_sInfo);
            else needleList[_stuffIndex]["count"] += needCount;

            if(!_hStuffInfo) heroNeedleList[heroID].push(_hInfo);
            else heroNeedleList[heroID][_hStuffIndex]["count"] += Number(stuffList[equipID]) * heroNeedle;
        }
        else{
            let _stuffInfo = needleEquipList.find((v) => v.id === equipID);
            let _stuffIndex = needleEquipList.findIndex((v) => v.id === equipID);

            let _hStuffInfo = heroNeedleEquipList[heroID].find((v) => v.id === equipID);
            let _hStuffIndex = heroNeedleEquipList[heroID].findIndex((v) => v.id === equipID);

            let _sInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name'], "stuff":itemInfo['stuff']};

            let _hInfo = {"id":equipID, "count":needCount, "num":Number(equipID.split("_")[0]), "grade":itemList['gradeNum'][itemInfo["grade"]], "nameIndex":itemInfo['nameIndex'], "name":itemInfo['name']};


            if(!_stuffInfo) needleEquipList.push(_sInfo);
            else needleEquipList[_stuffIndex]["count"] += needCount;

            if(!_hStuffInfo) heroNeedleEquipList[heroID].push(_hInfo);
            else heroNeedleEquipList[heroID][_hStuffIndex]["count"] += Number(stuffList[equipID]) * heroNeedle;

            //console.log(itemInfo['name'] +"：x"+ stuffList[equipID]);
            stuffResearch(itemInfo['stuff'], needCount, heroID, heroNeedCount);
        }
    }
}

//素材詳細表示
function equipDetailView(equipID){
    let _content = "";

    nowPageID = equipID;

    //装備IDから情報取得
    let itemInfo = itemList['item'].find((v) => v.id === equipID);

    //収集必要数
    let targetList = [];
    if(itemInfo['stuff']){
        targetList = needleEquipList.concat();
    }
    else{
        targetList = needleList.concat();
    }
    let targetInfo = targetList.find((v) => v.id === equipID);


    _content += '<div>';
    _content += '<button onclick="resourceInfoOpen();">一覧に戻る</button>&nbsp;';

    _content += itemInfo["name"];

    let hasCount = 0;
    if(myData["equipHas"][equipID]) hasCount = myData["equipHas"][equipID];

    _content += '&nbsp;&nbsp;■所持数：<input type="number" maxlength="5" step="1" id="hasNumber" style="width:60px;" max="999999" onChange="equipHasCount(this,'+ "'"+ equipID + "')" +'" value="'+ hasCount +'">&nbsp;個';

    _content += '<div class="customButtonArea"><img src="../common/img/customButton.png" width="20" onclick="openEnergyCustomWindow();"></div>';


    let em = '<img src="../common/img/emerald_ss.png">'+ itemInfo["buy"]["em"];
    if(itemType == "material" || !itemInfo["buy"]["em"]) em = "-";
    

    let coin = itemInfo["buy"]["coin"];
    if(!coin) coin = "-";

    _content += '</div>';
    _content += '<hr>';
    _content += '<div class="resourceLeftBox">';
    _content += '<table class="resourceInfoTable">';
    _content += '<tr><th rowspan="2"><img src="../item/img/gear_'+ equipID.split("_")[0] +'.png" width="48"></th><th>必要数</th><th>馬車値</th><th>コイン値</th><th>生成コスト</th></tr>';
    _content += '<tr><td>'+ targetInfo['count'] +'</td><td>'+ em +'</td><td><img src="../common/img/coins_s.png">'+ coin +'</td><td><img src="../common/img/energy_ss.png">';

    //１個あたり生成のためのエネルギー
    let energyPerGet = 0;
    let emeraldPerGet = 0;
    if(itemInfo['stuff']){
        if(equipEnergyRateList[equipID]){
            energyPerGet += Math.floor(equipEnergyRateList[equipID] * 100) / 100;
            emeraldPerGet = Math.floor(energyPerGet * energy_value * 100) / 100;
        }
        else energyPerGet = "-";
    }
    else{
        if(stuffEnergyRateList[equipID]){
            energyPerGet += Math.floor(stuffEnergyRateList[equipID] * 100) / 100;
            emeraldPerGet = Math.floor(energyPerGet * energy_value * 100) / 100;
        }
        else energyPerGet = "-";
    }

    _content += String(energyPerGet);
    if(emeraldPerGet > 0){
        _content += '<br />(<img src="../common/img/emerald_ss.png">'+ emeraldPerGet +')';
    }
    
    _content += '</td></tr>';
    _content += '</table>';
    _content += '<div class="resourceTitleHeader">';
    _content += '必要としているヒーロー';
    _content += '</div>';
    _content += '<div>';

    //ユーザー情報データ
    let getHeroData = myData[nowActive +"_hero"];

    //ヒーローリストから該当ヒーローの情報取得
    for(let heroInfo of heroList){

        //let heroInfo = heroList.find((v) => v.id === nowCustom);

        //該当ヒーローの設定情報
        let myHeroInfo = getHeroData.find((v) => v.id === heroInfo["id"]);

        if(viewType == "this"){
            if(heroInfo["id"] != nowCustom) continue;
        }
        else if(viewType == "only"){
            if(myHeroInfo["target"] != "true") continue;
        }

        let _stuffInfo;
        if(itemInfo['stuff']){
            _stuffInfo = heroNeedleEquipList[heroInfo["id"]].find((v) => v.id === equipID);
        }
        else{
            _stuffInfo = heroNeedleList[heroInfo["id"]].find((v) => v.id === equipID);
        }

        if(_stuffInfo) _content += '<img src="'+ heroImgFolder + heroInfo['IconAssetTexture'] +'.png" alt="'+ heroInfo['name'] +'" title="'+ heroInfo['name'] +'" width="36" height="36">';

    }    

    _content += '</div>';
    _content += '</div>';
    _content += '<div class="resourceRightBox">';

    if(!itemInfo['stuff']){
        _content += '<div class="resourceStageHeader">推奨収集ステージ</div>';

        _content += '<div class="resourceStageListArea">';
        if(!getStageInfo[equipID]){
            _content += '<table class="resourceInfoTable">';
            _content += "<tr><td>収集不要 あるいは 収集可能ステージなし</td></tr>";
            _content += '</table>';
        }
        else{
            for(let stageInfo of getStageInfo[equipID]){
                _content += '<table class="resourceInfoTable">';
                _content += '<tr><th>ステージ</th><th>エネルギー</th><th>周回数</th><th>総エネルギー</th></tr>';
                _content += '<tr><td>'+ stageInfo["stageID"] + '</td><td><img src="../common/img/energy_ss.png">'+ stageInfo["enr"]/stageInfo["times"] + '</td><td>'+ stageInfo["times"] + '</td><td><img src="../common/img/energy_ss.png">'+ stageInfo["enr"] + '</td></tr>';
                _content += '<tr><th>１個あたり</th><th>獲得数</th><th colspan="2">その他の同時収集アイテム</th></tr>';
                _content += '<tr><td><img src="../common/img/energy_ss.png">'+ stageInfo["energyRate"] + '</td><td>'+ stageInfo["getCounts"] + '</td><td colspan="2">';

                if(!stageInfo["setItem"].length){
                    _content += 'なし';
                }
                else{
                    for(let alongGet of stageInfo["setItem"]){
                        let _stuffInfo;
                        if(itemInfo['stuff']){
                            _stuffInfo = needleEquipList.find((v) => v.id === alongGet);
                        }
                        else{
                            _stuffInfo = needleList.find((v) => v.id === alongGet);
                        }
                        _content += '<img onclick="equipDetailView('+"'"+ alongGet +"'"+')" src="../item/img/gear_'+ alongGet.split("_")[0] +'.png" width="24" title="'+ _stuffInfo["name"] +'" alt="'+ _stuffInfo["name"] +'">';
                    }
                }
                
                _content += '</td></tr>';
                _content += '</table>';
            }
        }
        _content += '</div>';
    }
    else{
        _content += '<div class="resourceStageHeader">生成素材</div>';

        _content += '<div class="resourceStageListArea">';

        let stuffList = getStuffList(equipID);
        for(let _stuffData of stuffList){
            _content += '<div class="stuffBox">'+ outStuffList(_stuffData) +'</div>';
        }
        _content += '</div>';
    }

    _content += '</div>';
    _content += '<div class="BoxClear"></div>';


    document.getElementById("resourceInfo").innerHTML = _content;
}

//生成素材一覧を出力する
function outStuffList(stuffData){
    let output = '<img onclick="equipDetailView('+"'"+ stuffData["id"] +"'"+')" src="../item/img/gear_'+ stuffData["id"].split("_")[0] +'.png" width="16" title="'+ stuffData["name"] +'" alt="'+ stuffData["name"] +'">' + stuffData["name"];
    output += ' x '+ stuffData["count"];

    if(stuffData["stuff"]){
        for(let _stuffData of stuffData["stuff"]){
            output += '<div class="stuffSubBox">'+ outStuffList(_stuffData) +'</div>';
        }
    }
    
    return output;
}

//生成素材一覧を取得する
function getStuffList(equipID){
    //装備IDから情報取得
    let itemInfo = itemList['item'].find((v) => v.id === equipID);

    let stuffArray = [];

    //材料一覧取得
    for(let stuffID in itemInfo["stuff"]){
        if(stuffID == "gold") continue;

        let _count = itemInfo["stuff"][stuffID];

        let stuffInfo = itemList['item'].find((v) => v.id === stuffID);

        let stuffData = {"id":stuffID, "count":_count, "name":stuffInfo["name"], "stuff":[]};

        //さらに材料がある場合は深堀り
        if(stuffInfo["stuff"]){
            stuffData["stuff"] = getStuffList(stuffID);
            //console.log("CHECK : "+ stuffData["stuff"]);
        }

        stuffArray.push(stuffData);
        
    }

    return stuffArray;
}

function equipHasCount(e, equipID){
    //console.log(e.value, equipID, myData["equipHas"]["1"]);
    myData["equipHas"][equipID] = Number(e.value);
    storageUpdate();
    resourceInfoOpen();
    equipDetailView(equipID);
}

function resourceItemSelect(e){
    let _idx = e.selectedIndex;
    let _value = e.options[_idx].value;

    document.cookie = 'resourceItem='+ _value;

    resourceInfoOpen();
}

function resourceTargetSelect(e){
    let _idx = e.selectedIndex;
    let _value = e.options[_idx].value;

    document.cookie = 'resourceView='+ _value;

    resourceInfoOpen();
}

function resourceSortSelect(e){
    let _idx = e.selectedIndex;
    let _value = e.options[_idx].value;

    document.cookie = 'resourceSort='+ _value;

    resourceInfoOpen();
}

//エネルギーコスト設定ウィンドウ
function openEnergyCustomWindow(){
    document.getElementById('general_modal').style.display = 'block';

    if(nowPageID) equipDetailView(nowPageID);
    else resourceInfoOpen();

    let html = "";

    console.log(cookieData['movie_enr']);
    if(cookieData['movie_enr'] == undefined){
        document.cookie = "movie_enr=2; path=/HeroWars;";
        document.cookie = "theater_enr=0; path=/HeroWars;";
        document.cookie = "bottle_num=0; path=/HeroWars;";
        document.cookie = "emerald_enr=4; path=/HeroWars;";
        document.cookie = "free_enr=0; path=/HeroWars;";

        cookieUpdate();
    }

    let calcElement = costCalc();

    let movie_enr = calcElement['movie_enr'];
    let theater_enr = calcElement['theater_enr'];
    let bottle_num = calcElement['bottle_num'];
    let emerald_enr = calcElement['emerald_enr'];
    let free_enr = calcElement['free_enr'];

    let movie_enr_get = calcElement['movie_enr_get'];
    let theater_enr_get = calcElement['theater_enr_get'];
    let bottle_enr_get = calcElement['bottle_enr_get'];
    let emerald_enr_get = calcElement['emerald_enr_get'];
    let free_enr_get = calcElement['free_enr_get'];

    let bottle_enr_emerald = calcElement['bottle_enr_emerald'];

    let emerald_enr_emerald = calcElement['emerald_enr_emerald'];
    let nowAddEmerald = calcElement['nowAddEmerald'];

    let emerald_cost = calcElement['emerald_cost'];
    let enr_sum = calcElement['enr_sum'];


    html += '<div class="energyCustomArea">';
    html += '<div class="caption_press top-margin">';
    html += '設定：<img src="../common/img/emerald_s.png">&nbsp;<span class="txt-green">'+ energy_value +'個</span>';
    html += '&nbsp;/&nbsp;';
    html += '<img src="../common/img/energy_s.png"><span class="txt-blue">１エネルギー</span>あたり</div>';

    html += '<table id="energy-list" class="energy-list-total">';
    html += '<tr><td class="energy-title" width="240">１日のエネルギー消費合計</td><td class="enegy-cell" width="55">'+ enr_sum +'</td><td width="240">エネルギーに使用したエメラルド合計</td><td class="emerald-cell" width="55">'+ emerald_cost +'</td></tr>';
    html += '</table>';
    
    html += '<div class="energyListArea">';

    html += '<table id="energy-list" class="energy-list-each">';


    html += '<tr><td class="energy-title">エメラルドでエネルギー追加</td><td class="enegy-cell">'+ emerald_enr_get +'</td>';
    html += '<td><p>追加：';

    html += '<input name="emerald_enr_form" type="number" maxlength="2" step="1" max="99" style="width:30px;" value="'+ emerald_enr +'" onchange="energyInputChange(this);" oninput="value = onlyNumbers(value)" />';

    html += '回&nbsp;';
    html += '<img src="../common/img/upbtn_s.png" class="btnPos" onclick="energyBtnHandler('+ "'emerald'" +', 1);"><img src="../common/img/downbtn_s.png" class="btnPos" onclick="energyBtnHandler('+ "'emerald'" +', -1);"></p>';
    
    html += '(<img class="btnPos" src="../common/img/emerald_ss.png">+'+ nowAddEmerald +')';
    html += '</td>';
    html += '<td class="emerald-cell">'+ emerald_enr_emerald +'</td></tr>';



    html += '<tr><td class="energy-title">動画視聴（無料の箱）で<br />エネルギー獲得1日２回</td><td class="enegy-cell">'+ movie_enr_get +'</td>';
    
    html += '<td>１回あたりのエネルギー量：';
    html += '<select name="movie_enr" onchange="energySelectSettingChange(this);">';
    html += '<option value="12"';
    if(movie_enr == "0") html += ' selected';
    html += '>12</option>';
    html += '<option value="14"';
    if(movie_enr == "1") html += ' selected';
    html += '>14</option>';
    html += '<option value="16"';
    if(movie_enr == "2") html += ' selected';
    html += '>16</option>';
    html += '<option value="18"';
    if(movie_enr == "3") html += ' selected';
    html += '>18</option>';
    html += '<option value="20"';
    if(movie_enr == "4") html += ' selected';
    html += '>20</option>';
    html += '</select>';
    html += '</td><td class="emerald-cell">0</td></tr>';


    html += '<tr><td class="energy-title">シアターチケットを使用</td><td class="enegy-cell">'+ theater_enr_get +'</td>';
    html += '<td>使用枚数：';

    html += '<input name="theater_enr_form" type="number" maxlength="2" step="1" max="99" style="width:30px;" value="'+ theater_enr +'" onchange="energyInputChange(this);" oninput="value = onlyNumbers(value)" />';

    html += '枚<img src="../common/img/upbtn_s.png" class="btnPos" onclick="energyBtnHandler('+ "'theater'" +', 1);"><img src="../common/img/downbtn_s.png" class="btnPos" onclick="energyBtnHandler('+ "'theater'" +', -1);"></td><td class="emerald-cell">0</td></tr>';


    html += '<tr><td class="energy-title">タウンショップで<br />エネルギーボトル購入使用</td><td class="enegy-cell">'+ bottle_enr_get +'</td>';
    html += '<td>購入使用本数：';
    
    html += '<input name="bottle_enr_form" type="number" maxlength="2" step="1" max="99" style="width:30px;" value="'+ bottle_num +'" onchange="energyInputChange(this);" oninput="value = onlyNumbers(value)" />';

    html += '本<img src="../common/img/upbtn_s.png" class="btnPos" onclick="energyBtnHandler('+ "'bottle'" +', 1);"><img src="../common/img/downbtn_s.png" class="btnPos" onclick="energyBtnHandler('+ "'bottle'" +', -1);"></td><td class="emerald-cell">'+ bottle_enr_emerald +'</td></tr>';


    html += '<tr><td class="energy-title">任意で無料エネルギー追加</td><td class="enegy-cell">'+ free_enr_get +'</td>';
    html += '<td><p>追加(x10単位)：';

    html += '<input name="free_enr_form" type="number" maxlength="2" step="1" max="99" style="width:30px;" value="'+ free_enr +'" onchange="energyInputChange(this);" oninput="value = onlyNumbers(value)" />';

    html += '回<img src="../common/img/upbtn_s.png" class="btnPos" onclick="freeBtnHandler('+ "'free'" +', 1);"><img src="../common/img/downbtn_s.png" class="btnPos" onclick="freeBtnHandler('+ "'free'" +', -1);"></p></td><td class="emerald-cell">0</td></tr>';

    html += '<tr><td class="energy-title" width="240">１日(24時間)のエネルギー自然回復量</td><td class="enegy-cell" width="55">240</td><td width="240">1時間10 x 24</td><td class="emerald-cell" width="55">0</td></tr>';
    html += '<tr><td class="energy-title">１日３回(8:00、13:00、20:00)の<br />クエスト獲得エネルギー</td><td class="enegy-cell">180</td><td>1回60 x 3</td><td class="emerald-cell">0</td></tr>';
    html += '<tr><td class="energy-title">デイリーミッション１日１回<br />ウェンディからのギフト</td><td class="enegy-cell">20</td><td>1回20 x 1</td><td class="emerald-cell">0</td></tr>';

    html += '</table>';
    html += '</div></div>';

    document.getElementById("generalInfo").innerHTML = html;
}

function energySelectSettingChange(e){
    document.cookie = e.name +"="+ e.selectedIndex +"; path=/HeroWars;";
    cookieData[e.name] = e.selectedIndex;
    openEnergyCustomWindow();
}

function energyBtnHandler(name, add){
    let count = (Number(document.getElementsByName(name +'_enr_form')[0].value) + add);
    if(count < 0) count = 0;

    document.cookie = name +"_enr="+ count +"; path=/HeroWars;";

    if(name == "bottle") cookieData[name +"_num"] = count;
    else cookieData[name +"_enr"] = count;

    openEnergyCustomWindow();
}

function energyInputChange(e){
    if(e.value.length == 0) e.value = "0";
    document.cookie = e.name +"="+ e.value +"; path=/HeroWars;";
    cookieData[e.name] = e.value;

    openEnergyCustomWindow();
}

function costCalc(){
    if(cookieData['movie_enr'] == undefined){
        document.cookie = "movie_enr=2; path=/HeroWars;";
        document.cookie = "theater_enr=0; path=/HeroWars;";
        document.cookie = "bottle_num=0; path=/HeroWars;";
        document.cookie = "emerald_enr=4; path=/HeroWars;";
        document.cookie = "free_enr=0; path=/HeroWars;";

        cookieUpdate();
    }

    let movie_enr = cookieData['movie_enr'];
    let theater_enr = cookieData['theater_enr'];
    let bottle_num = cookieData['bottle_num'];
    let emerald_enr = cookieData['emerald_enr'];
    let free_enr = cookieData['free_enr'];

    let movie_enr_get = (12 + movie_enr*2) * 2;
    let theater_enr_get = 12 * theater_enr;
    let bottle_enr_get = 200 * bottle_num;
    let emerald_enr_get = 120 * emerald_enr;
    let free_enr_get = 10 * free_enr;

    let bottle_enr_emerald = 0;
    for(let b = 0; b < bottle_num; b++){
        if(b < 4) bottle_enr_emerald += 300;
        else bottle_enr_emerald += 400;
    }

    let emerald_enr_emerald = 0;
    let nowAddEmerald = 0
    for(let e = 0; e < emerald_enr; e++){
        if(e < 2){
            nowAddEmerald = 50;
            emerald_enr_emerald += nowAddEmerald;
        }
        else if(e < 7){
            nowAddEmerald = 100;
            emerald_enr_emerald +=nowAddEmerald;
        }
        else if(e < 13){
            nowAddEmerald = 150;
            emerald_enr_emerald += nowAddEmerald;
        }
        else{
            nowAddEmerald = 200;
            emerald_enr_emerald += nowAddEmerald;
        }
    }

    let emerald_cost = emerald_enr_emerald + bottle_enr_emerald;
    let enr_sum = 440 + Number(movie_enr_get) + Number(theater_enr_get) + Number(bottle_enr_get) + Number(emerald_enr_get) + Number(free_enr_get);


    let calcElement = {'movie_enr':movie_enr, 'theater_enr':theater_enr, 'bottle_num':bottle_num, 'emerald_enr':emerald_enr, 'free_enr':free_enr, 'movie_enr_get':movie_enr_get, 'theater_enr_get':theater_enr_get, 'bottle_enr_get':bottle_enr_get, 'emerald_enr_get':emerald_enr_get, 'free_enr_get':free_enr_get, 'bottle_enr_emerald':bottle_enr_emerald, 'emerald_enr_emerald':emerald_enr_emerald, 'nowAddEmerald':nowAddEmerald,'emerald_cost':emerald_cost, 'enr_sum':enr_sum};

    energy_value = Math.floor(emerald_cost*100 / enr_sum) / 100;

    return calcElement;
}


//クッキーデータ管理
function cookieUpdate(){
    //クッキー読み込み
    cookieArray = document.cookie.split(';');

    cookieData = new Array();
    for(let i = 0; i < cookieArray.length; i++){
        let elements = cookieArray[i].split('=');
        cookieData[elements[0].trim()] = elements[1].trim();
    }
}