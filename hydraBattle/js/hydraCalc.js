function hydraDamageCalc(hydraRank, hydraType, statusArray, heroInfo, buffData = {"armor":0, "magicResist":0}, debuffData = {"physicalAttack":0, "magicPower":0}){
    
    // ヒドラレベル
    let hydraLevel = Number(hydraList['hydraLevel'][hydraRank]);

    // ヒドラステータス
    let hydraData = hydraList['status'][hydraRank][hydraType];
    // ヒドラアーマー貫通
    let hydraAP = Number(hydraData["armorPenetration"]);
    // ヒドラ魔法貫通
    let hydraMP = Number(hydraData["magicPenetration"]);
    // ヒドラスキル
    let hydraSkill = hydraList['skills'][hydraType];

    // ヒーローのステータス
    let _myStatus = {
        "physicalAttack":Number(statusArray['phatk']),
        "magicPower":Number(statusArray['mgatk']),
        "armorPenetration":Number(statusArray['phpen']),
        "magicPenetration":Number(statusArray['mgpen']),
        "armor":Number(statusArray['armor']),
        "magicResist":Number(statusArray['mgdef']),
        "physicalAttackDebuff":debuffData["physicalAttack"],
        "magicPowerDebuff":debuffData["magicPower"],
        "armorDebuff":0,
        "magicResistDebuff":0,
        "armorBuff":buffData["armor"],
        "magicResistBuff":buffData["magicResist"]
    };

    let convertList = {
        "PA":"physicalAttack",
        "MP":"magicPower"
    }

    //ブレスダメージ
    let _debuff;
    if(hydraSkill[1]["Prime"][0] == "PA") _debuff =  _myStatus["physicalAttackDebuff"];
    else if(hydraSkill[1]["Prime"][0] == "MP") _debuff =  _myStatus["magicPowerDebuff"];

    let _guard;
    if(hydraSkill[1]["Prime"][1] == "physical") _guard = _myStatus["armor"] + _myStatus["armorBuff"];
    else if(hydraSkill[1]["Prime"][1] == "magic") _guard = _myStatus["magicResist"] + _myStatus["magicResistBuff"];
    else if(hydraSkill[1]["Prime"][1] == "pure") _guard = 0;

    let _pen;
    if(hydraSkill[1]["Prime"][1] == "physical") _pen = hydraAP;
    else if(hydraSkill[1]["Prime"][1] == "magic") _pen = hydraMP;
    else if(hydraSkill[1]["Prime"][1] == "pure") _pen = 0;

    let baseBreath = Number(hydraData[convertList[hydraSkill[1]["Prime"][0]]]);
    baseBreath -= _debuff;
    if(baseBreath < 0) baseBreath = 0;

    let breathPower = baseBreath * Number(hydraSkill[1]["Prime"][2]) + hydraLevel * Number(hydraSkill[1]["Prime"][3]);

    let breathDamage = getDamage(breathPower, _guard, _pen);


    //基本ダメージ
    if(hydraSkill[0]["Prime"][0] == "PA") _debuff =  _myStatus["physicalAttackDebuff"];
    else if(hydraSkill[0]["Prime"][0] == "MP") _debuff =  _myStatus["magicPowerDebuff"];

    if(hydraSkill[0]["Prime"][1] == "physical") _guard = _myStatus["armor"] + _myStatus["armorBuff"];
    else if(hydraSkill[0]["Prime"][1] == "magic") _guard = _myStatus["magicResist"] + _myStatus["magicResistBuff"];
    else if(hydraSkill[0]["Prime"][1] == "pure") _guard = 0;

    if(hydraSkill[0]["Prime"][1] == "physical") _pen = hydraAP;
    else if(hydraSkill[0]["Prime"][1] == "magic") _pen = hydraMP;
    else if(hydraSkill[0]["Prime"][1] == "pure") _pen = 0;

    let baseAttack = Number(hydraData[convertList[hydraSkill[0]["Prime"][0]]]);
    baseAttack -= _debuff;
    if(baseAttack < 0) baseAttack = 0;
    let basicPower = baseAttack * Number(hydraSkill[0]["Prime"][2]) + hydraLevel * Number(hydraSkill[0]["Prime"][3]); 

    let basicDamage = getDamage(basicPower, _guard, _pen);



    //ヘッドアタックダメージ
    if(hydraSkill[2]["Prime"][0] == "PA") _debuff =  _myStatus["physicalAttackDebuff"];
    else if(hydraSkill[2]["Prime"][0] == "MP") _debuff =  _myStatus["magicPowerDebuff"];

    if(hydraSkill[2]["Prime"][1] == "physical") _guard = _myStatus["armor"] + _myStatus["armorBuff"];
    else if(hydraSkill[2]["Prime"][1] == "magic") _guard = _myStatus["magicResist"] + _myStatus["magicResistBuff"];
    else if(hydraSkill[2]["Prime"][1] == "pure") _guard = 0;

    if(hydraSkill[2]["Prime"][1] == "physical") _pen = hydraAP;
    else if(hydraSkill[2]["Prime"][1] == "magic") _pen = hydraMP;
    else if(hydraSkill[2]["Prime"][1] == "pure") _pen = 0;

    let baseHead = Number(hydraData[convertList[hydraSkill[2]["Prime"][0]]]);
    baseHead -= _debuff;
    if(baseHead < 0) baseHead = 0;
    let headPower = baseHead * Number(hydraSkill[2]["Prime"][2]) + hydraLevel * Number(hydraSkill[2]["Prime"][3]); 

    let headDamage = getDamage(headPower, _guard, _pen);


    let _atkType = skillList[heroInfo['Skill'][0]]['Behavior']["Prime"][1];
    let _atk = 0;
    let _atkPen = 0;
    

    if(_atkType == "physical"){
        if( statusArray['phpen'] > 0) _atkPen = Number(statusArray['phpen']);
        _atk = getDamage(_myStatus["physicalAttack"], Number(hydraData["armor"]) - _myStatus["armorDebuff"], _atkPen);
    }
    else if(_atkType == "magic"){
        if( statusArray['mgpen'] > 0) _atkPen = Number(statusArray['mgpen']);
        _atk = getDamage(_myStatus["magicPower"], Number(hydraData["magicResist"]) - _myStatus["magicResistDebuff"], _atkPen);
    }


    // 必要アーマー
    let needArmor = 0;
    if(hydraAP - _myStatus["armor"] - _myStatus["armorBuff"] > 0) needArmor = hydraAP - _myStatus["armor"] - _myStatus["armorBuff"];
    if(needArmor == 0) needArmor = '-';
    else if(hydraSkill[0]["Prime"][1] != "physical" && hydraSkill[1]["Prime"][1] != "physical" && hydraSkill[2]["Prime"][1] != "physical") needArmor = '-';

    // 必要魔法防御
    let needMagicDef = 0;
    if(hydraMP - _myStatus["magicResist"] - _myStatus["magicResistBuff"] > 0) needMagicDef = hydraMP - _myStatus["magicResist"] - _myStatus["magicResistBuff"];
    if(needMagicDef == 0) needMagicDef = '-';
    else if(hydraSkill[0]["Prime"][1] != "magic" && hydraSkill[1]["Prime"][1] != "magic" && hydraSkill[2]["Prime"][1] != "magic") needMagicDef = '-';

    let infoObj = {
        "atk":_atk,
        "basicDamage":basicDamage,
        "basicClass":hydraSkill[0]["Prime"][1],
        "headDamage":headDamage,
        "headClass":hydraSkill[2]["Prime"][1],
        "breathDamage":breathDamage,
        "breathClass":hydraSkill[1]["Prime"][1],
        "needArmor":needArmor,
        "needMagicDef":needMagicDef
    }

    return infoObj;
}