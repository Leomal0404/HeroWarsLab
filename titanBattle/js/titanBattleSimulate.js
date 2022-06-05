//シミュレートボタン
function simulate(){

    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth();
    let nowDay = nowDate.getDate();
    if(myUtility['year'] == nowYear && myUtility['month'] == nowMonth && myUtility['day'] == nowDay){
        let useTimes = Number(myUtility['useTimes']) + 1;
        myUtility['useTimes'] = useTimes;
    }
    else{
        myUtility['year'] = nowYear;
        myUtility['month'] = nowMonth;
        myUtility['day'] = nowDay;
        myUtility['useTimes'] = 1;
    }
    utilityUpdate();

    if(cert == "FREE" && myUtility['useTimes'] > 5){
        alert('１日のシミュレーション回数制限を超えました。また明日ご利用ください。');
        return;
    }

    document.getElementById("simulateButton").value = "計算処理中";
    document.getElementById("simulateButton").onclick = "";
    document.getElementById("simulateButton").disabled = true;

    document.getElementById('reesultAnalysis').innerHTML = "";
    document.getElementById('logJournalMain').innerHTML = "";
    document.getElementById('battleResultWinRate').innerHTML = "計算中...";

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            simulateHandle();
            resolve();
        }, 100);
        })
        .then(() => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
            document.getElementById("simulateButton").value = "対戦シミュレート";
            document.getElementById("simulateButton").addEventListener('click', simulate);
            document.getElementById("simulateButton").disabled = false;
            resolve();
            }, 10);
        })
        })
}

let logTarget = "all";

//シミュレート実行
function simulateHandle(){
    //タイタン初期位置
    let startOwnPos = [-320, -405, -485, -500, -540];
    let startEnemyPos = [320, 405, 485, 500, 540];

    //勝利回数
    WinTimes = 0;

    //エデンログのリセット
    winEdenLog = [];
    loseEdenLog = [];

    //スキルキャンセルログのリセット
    skillCancelWinList = [];
    skillCancelLoseList = [];

    //勝敗ログ
    winData = [];
    loseData = [];

    winOwnLog = [];
    winEnemyLog = [];

    let t_index;
    //チームデータを更新
    for(t_index = 0; t_index < own_team_array.length; t_index++){
        characterUpdate("own", t_index);
    }
    //チーム配列をバトルオーダー順でソート
    own_team_array.sort(function(a,b){
        if(a.order<b.order) return -1;
        if(a.order > b.order) return 1;
        return 0;
    });

    for(t_index = 0; t_index < enemy_team_array.length; t_index++){
        characterUpdate("enemy", t_index);
    }
    //チーム配列をバトルオーダー順でソート
    enemy_team_array.sort(function(a,b){
        if(a.order<b.order) return -1;
        if(a.order > b.order) return 1;
        return 0;
    });

    //試行回数を設定から取得
    trialTimes = Number(document.getElementById("trialTimes").value);

    //バトルを試行回数おこなう
    for(let trial = 0; trial < trialTimes; trial++){

        //チーム情報を取得
        let ownBattleTeam;
        let enemyBattleTeam;
        if(myData['own_dir'] == "atk"){
            ownBattleTeam = Array.from(own_team_array);
            enemyBattleTeam = Array.from(enemy_team_array);
        }
        else{
            ownBattleTeam = Array.from(enemy_team_array);
            enemyBattleTeam = Array.from(own_team_array);
        }

        //神隠し状態をリセット
        ownHideMember = [];
        enemyHideMember = [];

        let EdenTarget = [];

        let stunList = {"own":{},"enemy":{}};

        //ログのリセット
        let logData = [];

        //勝利フラグ
        let winFlag = false;
        
        //タイタンの変動ステータスを初期化
        for(let i = 0; i < ownBattleTeam.length; i++){
            ownBattleTeam[i]['startFrame'] = 0;
            ownBattleTeam[i]['offsetFrame'] = -1;
            ownBattleTeam[i]['pos'] = startOwnPos[i];
            ownBattleTeam[i]['energy'] = 0;
            ownBattleTeam[i]['lastAttack'] = -10000;
            ownBattleTeam[i]['animStart'] = 0;
            ownBattleTeam[i]['skillStart'] = 0;
            ownBattleTeam[i]['animWait'] = 0;
            ownBattleTeam[i]['atk'] = Number(ownBattleTeam[i]['status']['atk']);
            ownBattleTeam[i]['hp'] = Number(ownBattleTeam[i]['status']['hp']);

            ownBattleTeam[i]['artCondition'] = [0, 0, 0, "", ""];

            ownBattleTeam[i]['damageOnTime'] = -1;
            ownBattleTeam[i]['stunTime'] = -1;
            ownBattleTeam[i]['manyShotTarget'] = -1;
            ownBattleTeam[i]['manyShotTimes'] = 0;
            ownBattleTeam[i]['manyShotSpan'] = 0;
            ownBattleTeam[i]['manyShotNextFrame'] = -1;
            ownBattleTeam[i]['manyShotValue'] = 0;
            //時間制のシールド
            ownBattleTeam[i]['shieldTime'] = 0;
            //耐久型のシールド
            ownBattleTeam[i]['shieldLife'] = [];
            ownBattleTeam[i]['teamShield'] = [];
            //ステータス効果
            ownBattleTeam[i]['atkUp'] = [0, -1];
            ownBattleTeam[i]['atkDown'] = [0, -1];
            ownBattleTeam[i]['autoSkillStart'] = 0;
            ownBattleTeam[i]['autoSkillTime'] = -10000;
            ownBattleTeam[i]['speedRateInfo'] = [0, -1];
            ownBattleTeam[i]['inJail'] = -1;
            //固有インデックス
            ownBattleTeam[i]['fixIndex'] = i;
        }

        for( i = 0; i < enemyBattleTeam.length; i++){
            enemyBattleTeam[i]['startFrame'] = 0;
            enemyBattleTeam[i]['offsetFrame'] = -1;
            enemyBattleTeam[i]['pos'] = startEnemyPos[i];
            enemyBattleTeam[i]['energy'] = 0;
            enemyBattleTeam[i]['lastAttack'] = -10000;
            enemyBattleTeam[i]['animStart'] = 0;
            enemyBattleTeam[i]['skillStart'] = 0;
            enemyBattleTeam[i]['animWait'] = 0;
            enemyBattleTeam[i]['atk'] = Number(enemyBattleTeam[i]['status']['atk']);
            enemyBattleTeam[i]['hp'] = Number(enemyBattleTeam[i]['status']['hp']);

            enemyBattleTeam[i]['artCondition'] = [0, 0, 0, "", ""];
            
            enemyBattleTeam[i]['damageOnTime'] = -1;
            enemyBattleTeam[i]['stunTime'] = -1;
            enemyBattleTeam[i]['manyShotTarget'] = -1;
            enemyBattleTeam[i]['manyShotTimes'] = 0;
            enemyBattleTeam[i]['manyShotSpan'] = 0;
            enemyBattleTeam[i]['manyShotNextFrame'] = -1;
            enemyBattleTeam[i]['manyShotValue'] = 0;
            //時間制のシールド
            enemyBattleTeam[i]['shieldTime'] = 0;
            //耐久型のシールド
            enemyBattleTeam[i]['shieldLife'] = [];
            enemyBattleTeam[i]['teamShield'] = [];
            //ステータス効果
            enemyBattleTeam[i]['atkUp'] = [0, -1];
            enemyBattleTeam[i]['atkDown'] = [0, -1];
            enemyBattleTeam[i]['autoSkillStart'] = 0;
            enemyBattleTeam[i]['autoSkillTime'] = -10000;
            enemyBattleTeam[i]['speedRateInfo'] = [0, -1];
            enemyBattleTeam[i]['inJail'] = -1;
            //固有インデックス
            enemyBattleTeam[i]['fixIndex'] = i;
        }

        let isBattle = true;
        let nowFrame = 0;
        let TimeCountable = false;
        let TimeCount = 0;

        let PostTime = "";

        //バトル処理
        while(isBattle){
            let log = "";
            let TimeView = "";

            //時間カウント
            if(TimeCountable){
                let time = 7200 - TimeCount;
                
                if(time < 0) time = 0;
                let min = Math.floor(time / (60*60));
                let sec = Math.floor(time / 60) % 60;

                let pMin = Math.floor(nowFrame / (60*60));
                let pSec = Math.floor(nowFrame / 60) % 60;
                let pFr = nowFrame % 60;

                TimeView = min +":"+ ("00"+ sec).slice( -2 );
                PostTime = pMin +":"+ ("00"+ pSec).slice( -2 ) +":"+ ("00"+ pFr).slice( -2 ) +"f";
                TimeCount++;
            }
            else{
                if(nowFrame > 100){
                    TimeCountable = true;
                    
                    let _log = Object.assign({}, defLog);
                    _log['TimeView'] = '2:00';
                    _log['Content'] = 'バトル開始';
                    
                    logData.push(_log);
                }
            }


            

            //チームメンバー移動処理
            for(let i = 0; i < 5; i++){
                //自陣メンバー移動
                if(ownBattleTeam[i]){                                
                    //敵との距離を確認
                    let myAttackRange = Number(ownBattleTeam[i]['skill'][0]['Behavior']['Range']);
                    let mySkillRange = Number(ownBattleTeam[i]['skill'][1]['Behavior']['Range']);
                    if(mySkillRange == undefined) mySkillRange = 1000000;
                    let myDistance = Math.abs(ownBattleTeam[i]['pos'] - enemyBattleTeam[0]['pos']);

                    //攻撃レンジ外の場合は接近
                    if(ownBattleTeam[i]['energy'] >= 100 && myDistance > mySkillRange){
                        ownBattleTeam[i]['pos'] += Number(ownBattleTeam[i]['walkSpeed']);
                    }
                    else if( myDistance > myAttackRange){
                        ownBattleTeam[i]['pos'] += Number(ownBattleTeam[i]['walkSpeed']);
                    }
                }
                //敵陣メンバー移動
                if(enemyBattleTeam[i]){
                    //自キャラとの距離を確認(敵側)
                    let attackRange = Number(enemyBattleTeam[i]['skill'][0]['Behavior']['Range']);
                    let skillRange = Number(enemyBattleTeam[i]['skill'][1]['Behavior']['Range']);
                    if(skillRange == undefined) skillRange = 1000000;
                    let distance = Math.abs(enemyBattleTeam[i]['pos'] - ownBattleTeam[0]['pos']);

                    //攻撃レンジ外の場合は接近
                    if(enemyBattleTeam[i]['energy'] >= 100 && distance > skillRange){
                        enemyBattleTeam[i]['pos'] -= Number(enemyBattleTeam[i]['walkSpeed']);
                    }
                    else if( distance > attackRange){
                        enemyBattleTeam[i]['pos'] -= Number(enemyBattleTeam[i]['walkSpeed']);
                    }
                }
            }


            //チームメンバー動作
            for(let i = 0; i < 5; i++){

                if(ownBattleTeam[i]){
                    
                    //敵との距離を確認
                    let myAttackRange = Number(ownBattleTeam[i]['skill'][0]['Behavior']['Range']);
                    let mySkillRange = Number(ownBattleTeam[i]['skill'][1]['Behavior']['Range']);
                    if(mySkillRange == undefined || isNaN(mySkillRange)) mySkillRange = 1000000;
                    let myDistance = Math.abs(ownBattleTeam[i]['pos'] - enemyBattleTeam[0]['pos']);

                    //攻撃レンジ内の場合は攻撃、もしくはレンジ不要のスキルは実行
                    // if(PostTime == "0:21:28f" && ownBattleTeam[i]['name'] == "ノヴァ") console.log(PostTime, ownBattleTeam[i]['energy'], (ownBattleTeam[i]['energy'] >= 1000 && myDistance <= mySkillRange));
                    // if(PostTime == "0:21:29f" && ownBattleTeam[i]['name'] == "ノヴァ") console.log(PostTime, ownBattleTeam[i]['energy'], myDistance, mySkillRange, (ownBattleTeam[i]['energy'] >= 1000 && myDistance <= mySkillRange));

                    if( myDistance <= myAttackRange || (ownBattleTeam[i]['energy'] >= 1000 && myDistance <= mySkillRange)){

                        //行動開始オフセットを設定
                        if( i == 0 && ownBattleTeam[i]['offsetFrame'] == -1){
                            for(let j = 0; j < 5; j++){
                                //先頭タイタンはタンク型なら即時、それ以外の敵タイタンは５ｆオフセット
                                if(j == 0){
                                    //自陣先頭タイタンは即時
                                    ownBattleTeam[j]['offsetFrame'] = 0;
                                    ownBattleTeam[j]['startFrame'] = nowFrame;
                                    //if(developMode) console.log("【"+ ownBattleTeam[i]['name'] +"】 startFrameSet : "+ TimeView +"("+ ownBattleTeam[i]['startFrame'] +"ｆ)");

                                    //敵陣タンクも即時
                                    if(enemyBattleTeam[j]['titanType'] == "melee"){
                                        enemyBattleTeam[j]['offsetFrame'] = 0;
                                    }
                                    //敵陣のタンク以外の先頭は５ｆ(2/3倍)オフセット
                                    else{
                                        enemyBattleTeam[j]['offsetFrame'] = 8;
                                    }
                                }
                                //2番目以降
                                else{
                                    if(ownBattleTeam[j]){
                                        //自陣タンクは先頭と同時に即時
                                        if(ownBattleTeam[j]['titanType'] == "melee"){
                                            ownBattleTeam[j]['offsetFrame'] = 0;
                                        }
                                        //タンク以外は前方タイタンより30ｆ(2/3倍)オフセット
                                        else{
                                            ownBattleTeam[j]['offsetFrame'] = ownBattleTeam[(j-1)]['offsetFrame'] + 30;
                                        }
                                    }
                                    if(enemyBattleTeam[j]){
                                        //敵陣タンクも先頭と同時に即時
                                        if(enemyBattleTeam[j]['titanType'] == "melee"){
                                            enemyBattleTeam[j]['offsetFrame'] = 0;
                                        }
                                        //タンク以外は前方タイタンより30ｆオフセット
                                        else{
                                            if(enemyBattleTeam[(j-1)]['titanType'] == "melee") enemyBattleTeam[j]['offsetFrame'] = enemyBattleTeam[(j-1)]['offsetFrame'] + 40;
                                            else enemyBattleTeam[j]['offsetFrame'] = enemyBattleTeam[(j-1)]['offsetFrame'] + 45;
                                        }
                                    }
                                }
                            }
                        }
                        

                        if(!TimeCountable){
                            TimeCountable = true;
                            let _log = Object.assign({}, defLog);
                            _log['TimeView'] = '2:00';
                            _log['Content'] = 'バトル開始';
                            logData.push(_log);
                        }

                        if(ownBattleTeam[i]['startFrame'] == 0 && ownBattleTeam[i]['offsetFrame'] > -1){
                            ownBattleTeam[i]['startFrame'] = nowFrame + ownBattleTeam[i]['offsetFrame'];
                            //if(developMode) console.log("【"+ ownBattleTeam[i]['name'] +"】 startFrameSet : "+ TimeView +"("+ ownBattleTeam[i]['startFrame'] +"ｆ)");
                        }

                        //オフセット待ち
                        if(ownBattleTeam[i]['startFrame'] > 0 && ownBattleTeam[i]['startFrame'] <= nowFrame){
                            //自タイタンアクション処理
                            let actionData = TitanAction(nowFrame, TimeView, PostTime, ownBattleTeam, enemyBattleTeam, "own", i, 0, EdenTarget, stunList);

                            logData = logData.concat(actionData[1]);

                            if(!actionData[0]){
                                isBattle = false;
                                winFlag = true;
                                WinTimes++;
                                break;
                            }
                        }
                    }
                }

                if(enemyBattleTeam[i]){
                    
                    //自キャラとの距離を確認(敵側)
                    let attackRange = Number(enemyBattleTeam[i]['skill'][0]['Behavior']['Range']);
                    let skillRange = Number(enemyBattleTeam[i]['skill'][1]['Behavior']['Range']);
                    if(skillRange == undefined || isNaN(skillRange)) skillRange = 1000000;
                    let distance = Math.abs(enemyBattleTeam[i]['pos'] - ownBattleTeam[0]['pos']);

                    //攻撃レンジ内の場合は攻撃、もしくはレンジ不要のスキルは実行
                    if( distance <= attackRange || (enemyBattleTeam[i]['energy'] >= 1000 && distance <= skillRange)){
                        
                        //行動開始オフセットを設定
                        if( i == 0 && enemyBattleTeam[i]['offsetFrame'] == -1){
                            for(let j = 0; j < 5; j++){
                                //先頭タイタンはタンク型なら即時、それ以外の敵タイタンは５ｆオフセット
                                if(j == 0){
                                    //自陣先頭タイタンは即時
                                    ownBattleTeam[j]['offsetFrame'] = 0;

                                    //自陣タンクも即時
                                    if(enemyBattleTeam[j]['titanType'] == "melee"){
                                        enemyBattleTeam[j]['offsetFrame'] = 0;
                                        enemyBattleTeam[j]['startFrame'] = nowFrame;
                                    }
                                    //敵陣のタンク以外の先頭は５ｆオフセット
                                    else{
                                        enemyBattleTeam[j]['offsetFrame'] = 8;
                                    }
                                }
                                //2番目以降
                                else{
                                    if(ownBattleTeam[j]){
                                        //自陣タンクは先頭と同時に即時
                                        if(ownBattleTeam[j]['titanType'] == "melee"){
                                            ownBattleTeam[j]['offsetFrame'] = 0;
                                        }
                                        //タンク以外は前方タイタンより30ｆオフセット
                                        else{
                                            ownBattleTeam[j]['offsetFrame'] = ownBattleTeam[(j-1)]['offsetFrame'] + 30;
                                        }
                                    }
                                    if(enemyBattleTeam[j]){
                                        //敵陣タンクも先頭と同時に即時
                                        if(enemyBattleTeam[j]['titanType'] == "melee"){
                                            enemyBattleTeam[j]['offsetFrame'] = 0;
                                        }
                                        //タンク以外は前方タイタンより30ｆオフセット
                                        else{
                                            if(enemyBattleTeam[(j-1)]['titanType'] == "melee") enemyBattleTeam[j]['offsetFrame'] = enemyBattleTeam[(j-1)]['offsetFrame'] + 40;
                                            else enemyBattleTeam[j]['offsetFrame'] = enemyBattleTeam[(j-1)]['offsetFrame'] + 45;
                                        }
                                    }
                                }
                            }

                            // let _startTimes = "";
                            // let _eStartTimes = "";
                            // for(j = 0; j < 5; j++){
                            //     _startTimes = ownBattleTeam[j]['offsetFrame'] +"=>"+ _startTimes;
                            //     _eStartTimes += "<="+ enemyBattleTeam[j]['offsetFrame'];
                            // }
                            //console.log("ENEMY:"+_startTimes +"|"+ _eStartTimes);
                        }

                        if(!TimeCountable){
                            TimeCountable = true;
                            let _log = Object.assign({}, defLog);
                            _log['TimeView'] = '2:00';
                            _log['Content'] = 'バトル開始';
                            logData.push(_log);
                        }

                        if(enemyBattleTeam[i]['startFrame'] == 0 && enemyBattleTeam[i]['offsetFrame'] > -1){
                            enemyBattleTeam[i]['startFrame'] = nowFrame + enemyBattleTeam[i]['offsetFrame'];
                        }

                        //オフセット待ち
                        if(enemyBattleTeam[i]['startFrame'] > 0 && enemyBattleTeam[i]['startFrame'] <= nowFrame){

                            //if(enemyBattleTeam[i]['name'] == "ノヴァ") console.log(enemyBattleTeam[i]['startFrame']);

                            //敵タイタンアクション処理
                            let actionData = TitanAction(nowFrame, TimeView, PostTime, ownBattleTeam, enemyBattleTeam, "enemy", i, 0, EdenTarget, stunList);

                            logData = logData.concat(actionData[1]);

                            if(!actionData[0]){
                                isBattle = false;
                                break;
                            }
                        }
                    }
                }
            }
            


            //神隠しメンバー
            if(ownHideMember.length > 0){
                for(let i = 0; i < ownHideMember.length; i++){
                    //神隠しアクション処理
                    let actionData = HideAction(nowFrame, TimeView, PostTime, ownBattleTeam, enemyBattleTeam, ownHideMember, i, "own");

                    logData = logData.concat(actionData[1]);
                }
            }
            if(enemyHideMember.length > 0){
                for(let i = 0; i < enemyHideMember.length; i++){
                    //神隠しアクション処理
                    let actionData = HideAction(nowFrame, TimeView, PostTime, ownBattleTeam, enemyBattleTeam, enemyHideMember, i, "enemy");

                    logData = logData.concat(actionData[1]);
                }
            }


            if(TimeCount > 7200){
                isBattle = false;

                loseEdenLog.push(EdenTarget);
                skillCancelLoseList.push(stunList);

                let _log = Object.assign({}, defLog);
                _log['TimeView'] = '0:00';
                _log['Content'] = '時間切れ';
                _log['PostTime'] = PostTime;
                logData.push(_log);

                break;
            }
            nowFrame++;
        }

        let _log = Object.assign({}, defLog);
        _log['Content'] = 'バトル終了';
        _log['PostTime'] = PostTime;
        logData.push(_log);

        //勝敗によってログ保存分岐
        if(winFlag){
            //攻撃時の勝利は勝利ログへ
            if(myData['own_dir'] == "atk"){
                winData = Array.from(logData);
                winOwnTeam = {};
                for(let i = 0; i < ownBattleTeam.length; i++){
                    let _n = ownBattleTeam[i]['name'];
                    winOwnTeam[_n] = {'hp':ownBattleTeam[i]['hp'], 'energy':ownBattleTeam[i]['energy']};
                }

                winOwnLog.push(winOwnTeam);
            }
            //防衛時の勝利は敵の勝利ログへ
            else{
                loseData = Array.from(logData);
                winEnemyTeam = {};
                for(let i = 0; i < ownBattleTeam.length; i++){
                    let _n = ownBattleTeam[i]['name'];
                    winEnemyTeam[_n] = {'hp':ownBattleTeam[i]['hp'], 'energy':ownBattleTeam[i]['energy']};
                }

                winEnemyLog.push(winEnemyTeam);
            }
        }
        else{
            //攻撃時の敗北は敵の勝利ログへ
            if(myData['own_dir'] == "atk"){
                loseData = Array.from(logData);
                winEnemyTeam = {};
                for(let i = 0; i < enemyBattleTeam.length; i++){
                    let _n = enemyBattleTeam[i]['name'];
                    winEnemyTeam[_n] = {'hp':enemyBattleTeam[i]['hp'], 'energy':enemyBattleTeam[i]['energy']};
                }

                winEnemyLog.push(winEnemyTeam);
            }
            //防衛時の敗北は勝利ログへ
            else{
                winData = Array.from(logData);
                winOwnTeam = {};
                for(let i = 0; i < enemyBattleTeam.length; i++){
                    let _n = enemyBattleTeam[i]['name'];
                    winOwnTeam[_n] = {'hp':enemyBattleTeam[i]['hp'], 'energy':enemyBattleTeam[i]['energy']};
                }

                winOwnLog.push(winOwnTeam);
            }
        }

        
    }

    if(myData['own_dir'] == "def") WinTimes = trialTimes - WinTimes;

    let winRate = String(Math.floor((WinTimes/trialTimes)*10000));
    winRate = Math.floor((WinTimes/trialTimes)*100) +"."+ winRate.substr(-2, 2);

    //ログの表示
    let logTableHead = '<table class="battleResultTable">';
    logTableHead += '<tr>';
    logTableHead += '<th width="40">時間</th>';
    logTableHead += '<th width="38"></th>';
    logTableHead += '<th width="100">キャラクター</th>';
    logTableHead += '<th width="75">残HP</th>';
    logTableHead += '<th width="75">エネルギー</th>';
    logTableHead += '<th width="240">動作内容</th>';
    logTableHead += '<th width="38"></th>';
    logTableHead += '<th width="100">被対象</th>';
    logTableHead += '<th width="75">残HP</th>';
    logTableHead += '<th width="75">エネルギー</th>';
    logTableHead += '<th width="70">内部時間</th>';
    if(developMode) logTableHead += '<th width="285">ポジション</th>';
    logTableHead += '</tr>';
    logTableHead += '</table>';

    //ログ対象セレクトメニュー
    let sl = document.getElementById('logTargetSelect');
	while(sl.lastChild){
		sl.removeChild(sl.lastChild);
	}
    // optionタグを作成する
    let option = document.createElement("option");
    // optionタグのテキストを4に設定する
    option.text = "すべて";
    // optionタグのvalueを4に設定する
    option.value = "all";
    // selectタグの子要素にoptionタグを追加する
    sl.appendChild(option);
    
    //自陣チームタイタンリスト
    for(let _titan of own_team_array){
        // optionタグを作成する
        let option = document.createElement("option");
        // optionタグのテキストを4に設定する
        option.text = _titan['name'];
        // optionタグのvalueを4に設定する
        option.value = _titan['name'];
        // selectタグの子要素にoptionタグを追加する
        sl.appendChild(option);
    }



    //ジャーナルテーブルの形成
    buildJournalTable();

    if(WinTimes == 0){
        logViewSwitch('lose', Number(winRate), WinTimes, trialTimes);
    }
    else if(WinTimes < trialTimes){
        logViewSwitch(setPattern, Number(winRate), WinTimes, trialTimes);
    }
    else{
        logViewSwitch('win', Number(winRate), WinTimes, trialTimes);
    }

    document.getElementById('battleResultHeader').style = "display:block";

    document.getElementById('battleResultWinRate').innerHTML = '勝率：'+ winRate +'%';

    document.getElementById('logJournalHeader').innerHTML = logTableHead;
}

//ジャーナルテーブルの形成
function buildJournalTable(){
    winText = '<table class="battleResultTable">';

    winData.forEach(function(element){
        
        if(logTarget == "all" || logTarget == element['mainName'] || logTarget == element['targetName']){
            winText += '<tr>';
            winText += '<td width="40">'+ element['TimeView'] +'</td>';
            winText += '<td width="38">'+ element['mainThum'] +'</td>';
            winText += '<td width="100">'+ element['mainName'] +'</td>';
            winText += '<td width="75">'+ element['mainHP'] +'</td>';
            winText += '<td width="75">'+ element['mainEnergy'] +'</td>';

            let w_content = element['Content'].replace('HEALCOLOR', 'class="healColor"');

            winText += '<td width="240" >'+ w_content +'</td>';
            winText += '<td width="38">'+ element['targetThum'] +'</td>';
            winText += '<td width="100">'+ element['targetName'] +'</td>';
            winText += '<td width="75">'+ element['targetHP'] +'</td>';
            winText += '<td width="75">'+ element['targetEnergy'] +'</td>';
            winText += '<td width="70">'+ element['PostTime'] +'</td>';

            if(developMode) winText += '<td width="285">'+ element['develop'] +'</td>';
            winText += '</tr>';
        }
    });

    winText += '</table>';

    loseText = '<table class="battleResultTable">';

    loseData.forEach(function(element){   
        if(logTarget == "all" || logTarget == element['mainName'] || logTarget == element['targetName']){         
            loseText += '<tr>';
            loseText += '<td width="40">'+ element['TimeView'] +'</td>';
            loseText += '<td width="38">'+ element['mainThum'] +'</td>';
            loseText += '<td width="100">'+ element['mainName'] +'</td>';
            loseText += '<td width="75">'+ element['mainHP'] +'</td>';
            loseText += '<td width="75">'+ element['mainEnergy'] +'</td>';

            let l_content = element['Content'].replace('HEALCOLOR', 'class="healColor"');

            loseText += '<td width="240" >'+ l_content +'</td>';
            loseText += '<td width="38">'+ element['targetThum'] +'</td>';
            loseText += '<td width="100">'+ element['targetName'] +'</td>';
            loseText += '<td width="75">'+ element['targetHP'] +'</td>';
            loseText += '<td width="75">'+ element['targetEnergy'] +'</td>';
            loseText += '<td width="70">'+ element['PostTime'] +'</td>';

            if(developMode) loseText += '<td width="285">'+ element['develop'] +'</td>';
            loseText += '</tr>';
        }
    });

    loseText += '</table>';
}

//セレクトメニューでログ対象を切り替え
function logTargetChange(e){
    let _idx = e.selectedIndex;
    let _value = e.options[_idx].value;
    logTarget = _value;

    buildJournalTable();

    if(myData['own_dir'] == "def") WinTimes = trialTimes - WinTimes;

    let winRate = String(Math.floor((WinTimes/trialTimes)*10000));
    winRate = Math.floor((WinTimes/trialTimes)*100) +"."+ winRate.substr(-2, 2);

    if(WinTimes == 0){
        logViewSwitch('lose', Number(winRate), WinTimes, trialTimes);
    }
    else if(WinTimes < trialTimes){
        logViewSwitch(setPattern, Number(winRate), WinTimes, trialTimes);
    }
    else{
        logViewSwitch('win', Number(winRate), WinTimes, trialTimes);
    }
}

//勝ち・負けの表示パターン切り替え
function logViewSwitch(pattern, winRate, WinTimes, trialTimes){

    setPattern = pattern;

    if(winRate == 0){
        document.getElementById('battleResultLeftButton').className = "defCursor resultButton battleLoseResultViewButton_active";

        document.getElementById('battleResultLeftButton').innerHTML = "負けパターン";
        document.getElementById('battleResultLeftButton').style = "display:flex";
        document.getElementById('battleResultRightButton').style = "display:none";

        document.getElementById('battleResultLeftButton').onclick = "";
        document.getElementById('battleResultRightButton').onclick = "";
    }
    else if(winRate < 100 && pattern == "win"){
        document.getElementById('battleResultLeftButton').className = "defCursor resultButton battleWinResultViewButton_active";
        document.getElementById('battleResultRightButton').className = "defCursor resultButton battleLoseResultViewButton_off";

        document.getElementById('battleResultLeftButton').innerHTML = "勝ちパターン";
        document.getElementById('battleResultLeftButton').style = "display:flex";
        document.getElementById('battleResultRightButton').innerHTML = "負けパターン";
        document.getElementById('battleResultRightButton').style = "display:flex";

        document.getElementById('battleResultLeftButton').onclick = "";
        document.getElementById('battleResultRightButton').onclick =
        function(){
            logViewSwitch("lose", winRate, WinTimes, trialTimes);
        };

    }
    else if(winRate < 100 && pattern == "lose"){
        document.getElementById('battleResultLeftButton').className = "defCursor resultButton battleWinResultViewButton_off";
        document.getElementById('battleResultRightButton').className = "defCursor resultButton battleLoseResultViewButton_active";

        document.getElementById('battleResultLeftButton').innerHTML = "勝ちパターン";
        document.getElementById('battleResultLeftButton').style = "display:flex";
        document.getElementById('battleResultRightButton').innerHTML = "負けパターン";
        document.getElementById('battleResultRightButton').style = "display:flex";


        document.getElementById('battleResultLeftButton').onclick =
        function(){
            logViewSwitch("win", winRate, WinTimes, trialTimes);
        };
        document.getElementById('battleResultRightButton').onclick = "";
    }
    else{
        document.getElementById('battleResultLeftButton').className = "defCursor resultButton battleLoseResultViewButton_active";

        document.getElementById('battleResultLeftButton').innerHTML = "勝ちパターン";
        document.getElementById('battleResultLeftButton').style = "display:flex";
        document.getElementById('battleResultRightButton').style = "display:none";

        document.getElementById('battleResultLeftButton').onclick = "";
        document.getElementById('battleResultRightButton').onclick = "";
    }

    let analysisTable = '<table id="simulateAnalyseTable">';
    let tl;
    let i;

    //HP情報の収集
    let nowHP = [0,0,0,0,0];
    let maxHP = [];
    let nowHPsum = 0;
    let maxHPsum = 0;


    analysisTable += '<tr><th width="120" class="analyseTableOwnHead">&nbsp;</th><th width="120" class="analyseTableOwnHead">自チーム全体</th>';

    for(tl = 0; tl < 5; tl++){
        if(tl > (own_team_array.length-1)){
            analysisTable += '<th width="120" class="analyseTableOwnHead">-</th>';
        }
        else{
            analysisTable += '<th width="120" class="analyseTableOwnHead">'+ own_team_array[tl]['name'] +'</th>';
        }
    }
        
    analysisTable += '</tr>';

    //生存率集計
    let own_alive_rate = [];

    //自陣集計
    for(tl = 0; tl < own_team_array.length; tl++){

        //対象タイタン名
        let _n = own_team_array[tl]['name'];

        //各タイタンの最大HP
        maxHP.push(Math.floor(own_team_array[tl]['status']['hp']));
        //全タイタンの最大HP合計
        maxHPsum += Math.floor(own_team_array[tl]['status']['hp']);

        
        //ログからHPおよび生存可否を取得
        if(pattern == "win"){
            //生存回数
            let aliveCount = 0;

            //バトル結果ログを走査
            for(i = 0; i < winOwnLog.length; i++){
                //存在しない枠の場合はスキップ
                if(!winOwnLog[i][_n]) continue;
                else if( Math.floor(winOwnLog[i][_n]['hp']) > 0 ){
                    aliveCount++;

                    //残りHPを加算
                    nowHP[tl] += Math.floor(winOwnLog[i][_n]['hp']);
                    
                    //残りHP合計にも加算
                    nowHPsum += Math.floor(winOwnLog[i][_n]['hp']);
                }
            }
            let aliveRate = String(Math.floor((aliveCount / winOwnLog.length)*10000));
            aliveRate = Math.floor((aliveCount / winOwnLog.length)*100) +"."+ aliveRate.substr(-2, 2);

            own_alive_rate.push(aliveRate);

            //残りHPの平均と％を算出
            let hpRate = Math.floor(nowHP[tl] / aliveCount);
            let hpPercent = Math.floor((hpRate / maxHP[tl])*100);
            //if(isNaN(hpRate)) console.log(nowHP[tl], aliveCount);
            if(aliveCount == 0) nowHP[tl] = "-";
            else nowHP[tl] = hpRate +"("+ hpPercent +"%)";
        }
        else{
            own_alive_rate.push(0);
        }

    }
    if(pattern == "win"){
        let nowHPsumRate = Math.floor(nowHPsum / winOwnLog.length);
        let nowHPsumPercent = Math.floor((nowHPsumRate / maxHPsum)*100);

        nowHPsum = nowHPsumRate +"("+ nowHPsumPercent +"%)";
    }

    if(nowHPsum == 0) analysisTable += '<tr><td>生存率</td><td>-</td>';
    else analysisTable += '<tr><td>生存率</td><td>-</td>';

    for(tl = 0; tl < 5; tl++){
        if(tl > (own_alive_rate.length-1)){
            analysisTable += '<td>-</td>';
        }
        else{
            analysisTable += '<td>'+ own_alive_rate[tl] +'%</td>';
        }
    }
    analysisTable += '</tr>';


    if(nowHPsum == 0) analysisTable += '<tr><td>生存時HP平均</td><td>全滅</td>';
    else analysisTable += '<tr><td>生存時HP平均</td><td>'+ nowHPsum +'</td>';
    
    for(tl = 0; tl < 5; tl++){
        if(tl > (own_team_array.length-1)){
            analysisTable += '<td>-</td>';
        }
        else{
            let _n = own_team_array[tl]['name'];

            if(nowHP[tl] == 0){
                analysisTable += '<td>-</td>';
            }
            else{
                analysisTable += '<td>'+ nowHP[tl] +'</td>';
            }
        }
    }
    analysisTable += '</tr>';



    nowHP = [0,0,0,0,0];
    maxHP = [];
    nowHPsum = 0;
    maxHPsum = 0;



    analysisTable += '<tr><th width="120" class="analyseTableEnemyHead">&nbsp;</th><th width="120" class="analyseTableEnemyHead">敵チーム全体</th>';

    for(tl = 0; tl < 5; tl++){
        if(tl > (enemy_team_array.length-1)){
            analysisTable += '<th width="120" class="analyseTableEnemyHead">-</th>';
        }
        else{
            analysisTable += '<th width="120" class="analyseTableEnemyHead">敵'+ enemy_team_array[tl]['name'] +'</th>';
        }
    }
        
    analysisTable += '</tr>';

    //生存率集計
    let enemy_alive_rate = [];


    //敵陣集計
    for(tl = 0; tl < enemy_team_array.length; tl++){

        //タイタン名
        let _n = enemy_team_array[tl]['name'];

        //各タイタンの最大HP
        maxHP.push(Math.floor(enemy_team_array[tl]['status']['hp']));
        //全タイタンの最大HP合計
        maxHPsum += Math.floor(enemy_team_array[tl]['status']['hp']);

        //ログからHPおよび生存可否を取得
        if(pattern == "lose"){
            //生存回数
            let aliveCount = 0;

            //バトル結果ログを走査
            for(i = 0; i < winEnemyLog.length; i++){
                //存在しない枠の場合はスキップ
                if(!winEnemyLog[i][_n]) continue;
                else if( Math.floor(winEnemyLog[i][_n]['hp']) > 0 ){
                    aliveCount++;

                    //残りHPを加算
                    nowHP[tl] += Math.floor(winEnemyLog[i][_n]['hp']);
                    //残りHP合計にも加算
                    nowHPsum += Math.floor(winEnemyLog[i][_n]['hp']);
                }
            }
            let aliveRate = String(Math.floor((aliveCount / winEnemyLog.length)*10000));
            aliveRate = Math.floor((aliveCount / winEnemyLog.length)*100) +"."+ aliveRate.substr(-2, 2);

            enemy_alive_rate.push(aliveRate);

            //残りHPの平均と％を算出
            let hpRate = Math.floor(nowHP[tl] / aliveCount);
            let hpPercent = Math.floor((hpRate / maxHP[tl])*100);

            if(aliveCount == 0) nowHP[tl] = "-";
            else nowHP[tl] = hpRate +"("+ hpPercent +"%)";
        }
        else{
            enemy_alive_rate.push(0);
        }
    }
    if(pattern == "lose"){
        let nowHPsumRate = Math.floor(nowHPsum / winEnemyLog.length);
        let nowHPsumPercent = Math.floor((nowHPsumRate / maxHPsum)*100);

        nowHPsum = nowHPsumRate +"("+ nowHPsumPercent +"%)";
    }

    if(nowHPsum == 0) analysisTable += '<tr><td>生存率</td><td>-</td>';
    else analysisTable += '<tr><td>生存率</td><td>-</td>';

    for(tl = 0; tl < 5; tl++){
        if(tl > (enemy_team_array.length-1)){
            analysisTable += '<td>-</td>';
        }
        else{
            analysisTable += '<td>'+ enemy_alive_rate[tl] +'%</td>';
        }
    }
    analysisTable += '</tr>';

    if(nowHPsum == 0) analysisTable += '<tr><td>残りHP平均</td><td>殲滅</td>';
    else analysisTable += '<tr><td>残りHP平均</td><td>'+ nowHPsum +'</td>';

    for(tl = 0; tl < 5; tl++){
        if(tl > (enemy_team_array.length-1)){
            analysisTable += '<td>-</td>';
        }
        else{
            let _n = enemy_team_array[tl]['name'];

            if(nowHP[tl] == 0){
                analysisTable += '<td>-</td>';
            }
            else{
                analysisTable += '<td>'+ nowHP[tl] +'</td>';
            }
        }
    }
    analysisTable += '</tr>';
    analysisTable += '</table>';


    //エデンパターンおよびスキルキャンセル率の集計
    // let EdenSkillPattern = "";
    // let skillCancelRate = "";
    // if(pattern == "win"){
    //     EdenSkillPattern = edenAnalyze(winEdenLog);
    //     skillCancelRate = skillCancelAnalyze(skillCancelWinList, WinTimes, trialTimes, pattern);
    // }
    // else if(pattern == "lose"){
    //     EdenSkillPattern = edenAnalyze(loseEdenLog);
    //     skillCancelRate = skillCancelAnalyze(skillCancelLoseList, WinTimes, trialTimes, pattern);
    // }

    // if(EdenSkillPattern.length > 0){
    //     analysisTable += '<table id="simulateAnalyseTable" style="margin:16px 0px 0px 0px;"><tr><th width="300" class="analyseTableEdenHead">スキルキャンセル率</th><th width="540" class="analyseTableEdenHead">エデン第２スキル「地下刑務所」発動対象パターン</th></tr>';
    //     analysisTable += '<tr><td height="150"><div class="AnalyzeScrollArea">'+ skillCancelRate +'</div></td><td height="150"><div class="AnalyzeScrollArea">'+ EdenSkillPattern +'</div></td></tr>';
    //     analysisTable += '</table>';
    // }

    document.getElementById('reesultAnalysis').innerHTML = analysisTable;

    if(pattern == "win"){
        document.getElementById('logJournalMain').innerHTML = winText;
    }
    else{
        document.getElementById('logJournalMain').innerHTML = loseText;
    }
}

//タイタン個別動作の処理
function TitanAction(nowFrame, TimeView, PostTime, ownBattleTeam, enemyBattleTeam, dir, mainIndex, targetIndex, EdenTarget, stunList){

    let mainTeam;
    let targetTeam;

    let isBattle = true;

    let logData = [];

    let mainHeadStr = "";
    let targetHeadStr = "";

    let mainImg = "";
    let targetImg = "";

    let targetImgEmpty = "";

    if(dir == "own"){
        mainTeam = ownBattleTeam;
        targetTeam = enemyBattleTeam;
        if(posType['own'] == "atk") targetHeadStr = "敵";
        else mainHeadStr = "敵";

        mainImg = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img src="../titan/img/titan_'+ mainTeam[mainIndex]['id'] +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/own_frame.png" width="35" height="35"></div></div>';
        targetImg = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img class="flipHorizon" src="../titan/img/titan_'+ targetTeam[targetIndex]['id'] +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/enemy_frame.png" width="35" height="35"></div></div>';

        mainImgEmpty = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img src="../titan/img/titan_'+ "<?=IMG=>" +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/own_frame.png" width="35" height="35"></div></div>';
        targetImgEmpty = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img class="flipHorizon" src="../titan/img/titan_'+ "<?=IMG=>" +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/enemy_frame.png" width="35" height="35"></div></div>';
    }
    else{
        mainTeam = enemyBattleTeam;
        targetTeam = ownBattleTeam;
        if(posType['own'] == "atk") mainHeadStr = "敵";
        else targetHeadStr = "敵";

        mainImg = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img class="flipHorizon" src="../titan/img/titan_'+ mainTeam[mainIndex]['id'] +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/enemy_frame.png" width="35" height="35"></div></div>';
        targetImg = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img src="../titan/img/titan_'+ targetTeam[targetIndex]['id'] +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/own_frame.png" width="35" height="35"></div></div>';

        mainImgEmpty = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img class="flipHorizon" src="../titan/img/titan_'+ "<?=IMG=>" +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/enemy_frame.png" width="35" height="35"></div></div>';
        targetImgEmpty = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img src="../titan/img/titan_'+ "<?=IMG=>" +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/own_frame.png" width="35" height="35"></div></div>';
    }

    // if(PostTime == "0:21:27f" && mainTeam[mainIndex]['name'] == "ノヴァ" && dir == "own") console.log(PostTime, mainTeam[mainIndex]['energy']);
    // if(PostTime == "0:21:29f" && mainTeam[mainIndex]['name'] == "ノヴァ" && dir == "own") console.log(PostTime, mainTeam[mainIndex]['energy']);
    // if(PostTime == "0:21:30f" && mainTeam[mainIndex]['name'] == "ノヴァ" && dir == "own") console.log(PostTime, mainTeam[mainIndex]['energy']);

    //アーティファクト発動中の場合は処理
    if(nowFrame < mainTeam[mainIndex]['artCondition'][1]){
        if(mainTeam[mainIndex]['artCondition'][3] == "HP自動回復" && (nowFrame - mainTeam[mainIndex]['artCondition'][0]) % 60 == 0){

            //HP自動回復は仲間全員を回復
            for(let tm = 0; tm < mainTeam.length; tm++){

                let healValue = Math.floor(mainTeam[mainIndex]['artCondition'][2]);

                if(mainTeam[tm]['status']['hp'] < (mainTeam[tm]['hp'] + healValue)){
                    healValue = mainTeam[tm]['status']['hp'] - mainTeam[tm]['hp'];
                }
                
                mainTeam[tm]['hp'] += healValue;

                let _log = Object.assign({}, defLog);
                _log['TimeView'] = TimeView;
                _log['mainThum'] = mainImg;
                _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                _log['Content'] = mainTeam[mainIndex]['artCondition'][3] +'：<span HEALCOLOR>'+ healValue +'</span>';
                _log['PostTime'] = PostTime;

                _log['targetThum'] = mainImgEmpty.replace("<?=IMG=>", mainTeam[tm]['id']);
                _log['targetName'] = mainHeadStr + mainTeam[tm]['name'];
                _log['targetHP'] = Math.floor(mainTeam[tm]['hp']);

                if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                logData.push(_log);
            }
        }
    }
    //アーティファクトの効果終了処理
    else if(nowFrame >= mainTeam[mainIndex]['artCondition'][1] && mainTeam[mainIndex]['artCondition'][1] > 0){

        if(mainTeam[mainIndex]['artCondition'][3] == "物理攻撃"){
            //仲間全員の物理攻撃を戻す
            for(let _tA = 0; _tA < mainTeam.length; _tA++){
                mainTeam[_tA]['atk'] -= mainTeam[mainIndex]['artCondition'][2];
            }
        }

        //artCondition:開始時間、終了時間、効果値、効果内容
        mainTeam[mainIndex]['artCondition'] = [0, 0, 0, "", ""];
    }


    //ステータス効果時間判定
    if(mainTeam[mainIndex]['atkDown'][1] > 0 && nowFrame >= mainTeam[mainIndex]['atkDown'][1]){

        mainTeam[mainIndex]['atk'] += mainTeam[mainIndex]['atkDown'][0];

        mainTeam[mainIndex]['atkDown'] = [0, -1];

        _log = Object.assign({}, defLog);
        _log['TimeView'] = TimeView;
        _log['mainThum'] = mainImg;
        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
        _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
        _log['Content'] = '攻撃力減少効果がなくなった';

        _log['PostTime'] = PostTime;
        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
        logData.push(_log);
    }

    if(mainTeam[mainIndex]['atkUp'][1] > 0 && nowFrame >= mainTeam[mainIndex]['atkUp'][1]){

        mainTeam[mainIndex]['atk'] -= mainTeam[mainIndex]['atkUp'][0];

        mainTeam[mainIndex]['atkUp'] = [0, -1];

        _log = Object.assign({}, defLog);
        _log['TimeView'] = TimeView;
        _log['mainThum'] = mainImg;
        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
        _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
        _log['Content'] = '攻撃力増加効果がなくなった';

        _log['PostTime'] = PostTime;
        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
        logData.push(_log);
    }

    if(mainTeam[mainIndex]['speedRateInfo'][1] > 0 && nowFrame >= mainTeam[mainIndex]['speedRateInfo'][1]){

        mainTeam[mainIndex]['speedRateInfo'] = [0, -1];

        _log = Object.assign({}, defLog);
        _log['TimeView'] = TimeView;
        _log['mainThum'] = mainImg;
        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
        _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
        _log['Content'] = '攻撃速度上昇効果がなくなった';

        _log['PostTime'] = PostTime;
        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
        logData.push(_log);

    }



    //スタンしていたら行動停止
    if(nowFrame < mainTeam[mainIndex]['stunTime']){

        if(mainTeam[mainIndex]['skillStart'] > 0){
            if(!stunList[dir][mainTeam[mainIndex]['name']]) stunList[dir][mainTeam[mainIndex]['name']] = 1;
            else stunList[dir][mainTeam[mainIndex]['name']]++;
        }
        if(mainTeam[mainIndex]['autoSkillStart'] > 0){
            if(!stunList[dir][mainTeam[mainIndex]['name']+"第２"]) stunList[dir][mainTeam[mainIndex]['name']+"第２"] = 1;
            else stunList[dir][mainTeam[mainIndex]['name']+"第２"]++;
        }

        mainTeam[mainIndex]['damageOnTime'] = -1;
        mainTeam[mainIndex]['animWait'] = 0;
        mainTeam[mainIndex]['animStart'] = 0;
        mainTeam[mainIndex]['skillStart'] = 0;
        mainTeam[mainIndex]['manyShotTimes'] = 0;
        mainTeam[mainIndex]['autoSkillStart'] = 0;

        return [isBattle, logData];
    }
    else if(mainTeam[mainIndex]['stunTime'] > 0){
        //スタン復帰
        mainTeam[mainIndex]['stunTime'] = -1;

        //クールタイムの処理をどうするのか要検証
        //mainTeam[mainIndex]['lastAttack'] = nowFrame;
        //mainTeam[mainIndex]['autoSkillTime'] = nowFrame;

        _log = Object.assign({}, defLog);
        _log['TimeView'] = TimeView;
        _log['mainThum'] = mainImg;
        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
        _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
        _log['Content'] = 'スタン効果解消';

        _log['PostTime'] = PostTime;
        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
        logData.push(_log);

        return [isBattle, logData];
    }

    //DOTスキルが発動中の場合は処理
    if(nowFrame < mainTeam[mainIndex]['damageOnTime'] && (nowFrame - mainTeam[mainIndex]['damageOnTime']) % 60 == 0){

        let dmg = Number(mainTeam[mainIndex]['damageOnTimeValue']);

        //敵全体に攻撃
        for(let tg = 0; tg < targetTeam.length; tg++){

            _log = Object.assign({}, defLog);
            _log['TimeView'] = TimeView;
            _log['mainThum'] = mainImg;
            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
            _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
            _log['PostTime'] = PostTime;
            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

            //ダメージ計算
            damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[tg], dmg, nowFrame, mainTeam, targetTeam);

            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[tg]['id']);
            _log['targetName'] = targetHeadStr + targetTeam[tg]['name'];
            _log['targetHP'] = Math.floor(damageInfo['hp']);
            _log['targetEnergy'] = damageInfo['energy'] +'%';

            _log['Content'] = '持続ダメージ('+ damageInfo['dmgMessage'] +')';

            logData.push(_log);
        }

    }
    //連撃処理
    else if(nowFrame == mainTeam[mainIndex]['manyShotNextFrame']){

        //ランダム対象に連撃（６ｆに分けてDOT的に連撃）
        _log = Object.assign({}, defLog);
        _log['TimeView'] = TimeView;
        _log['mainThum'] = mainImg;
        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
        _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
        _log['PostTime'] = PostTime;
        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

        let _r;
        if(mainTeam[mainIndex]['manyShotTarget'] > -1) _r = mainTeam[mainIndex]['manyShotTarget'];
        else _r = Math.floor(Math.random() * targetTeam.length);

        //ダメージ計算
        damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[_r], mainTeam[mainIndex]['manyShotValue'], nowFrame, mainTeam, targetTeam);

        _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[_r]['id']);
        _log['targetName'] = targetHeadStr + targetTeam[_r]['name'];
        _log['targetHP'] = Math.floor(damageInfo['hp']);
        _log['targetEnergy'] = damageInfo['energy'] +'%';

        _log['Content'] = '連撃ダメージ('+ damageInfo['dmgMessage'] +')';

        logData.push(_log);


        //連撃ダメージと時間を登録
        mainTeam[mainIndex]['manyShotTimes']--;

        if(mainTeam[mainIndex]['manyShotTimes'] == 0) mainTeam[mainIndex]['manyShotNextFrame'] = -1;
        else mainTeam[mainIndex]['manyShotNextFrame'] = nowFrame + mainTeam[mainIndex]['manyShotSpan'];

    }
    //DOTスキルの効果終了処理
    else if(mainTeam[mainIndex]['damageOnTime'] > 0 && nowFrame >= mainTeam[mainIndex]['damageOnTime']){

        mainTeam[mainIndex]['damageOnTime'] = -1;

    }

    //攻撃速度処理
    mainTeam[mainIndex]['autoSkillTime'] -= mainTeam[mainIndex]['speedRateInfo'][0];


    //持続ダメージや連撃攻撃中でなければ行動開始
    if(mainTeam[mainIndex]['manyShotTimes'] < 1 && mainTeam[mainIndex]['damageOnTime'] == -1){

        //自動スキル発動
        if(mainTeam[mainIndex]['skill'].length > 2 && mainTeam[mainIndex]['skillStart'] == 0 && mainTeam[mainIndex]['startFrame'] > 0){

            //if(mainTeam[mainIndex]['name'] == "ヒュペリオン") console.log(TimeView, mainTeam[mainIndex]['autoSkillTime'] + Number(mainTeam[mainIndex]['skill'][2]['Behavior']["Cooldown"])*60 <= nowFrame, mainTeam[mainIndex]['autoSkillStart'] > mainTeam[mainIndex]['startFrame'] ,mainTeam[mainIndex]['autoSkillStart'], mainTeam[mainIndex]['startFrame']);

        
            //発動クールタイムを満たしていた場合
            if((mainTeam[mainIndex]['startFrame'] + Number(mainTeam[mainIndex]['skill'][2]['Behavior']["InitialCooldown"])*60 <= nowFrame && mainTeam[mainIndex]['autoSkillTime'] < -1) || (mainTeam[mainIndex]['autoSkillTime'] + Number(mainTeam[mainIndex]['skill'][2]['Behavior']["Cooldown"])*60 <= nowFrame && mainTeam[mainIndex]['autoSkillTime'] > mainTeam[mainIndex]['startFrame'])){

                if(mainTeam[mainIndex]['autoSkillStart'] == 0){
                    mainTeam[mainIndex]['autoSkillStart'] = nowFrame;
                    mainTeam[mainIndex]['animWait'] = 0;
                }

                //自動スキルアニメーション開始
                mainTeam[mainIndex]['animWait'] += 1 + mainTeam[mainIndex]['speedRateInfo'][0];
                
                //アニメーションが完了したらスキル実行
                if(mainTeam[mainIndex]['animWait'] >= Number(mainTeam[mainIndex]['skill'][2]['Behavior']['AnimationDelay']) * 60){
                    mainTeam[mainIndex]['animWait'] = 0;
                    mainTeam[mainIndex]['animStart'] = 0;
                    mainTeam[mainIndex]['autoSkillStart'] = 0;

                    mainTeam[mainIndex]['autoSkillTime'] = nowFrame;

                    //スキル名
                    let skillName = mainTeam[mainIndex]['skill'][2]['name'];

                    let _target;

                    switch(mainTeam[mainIndex]['skill'][2]['memo']){
                        case 'ヒュペリオン第２':
                            //if(developMode) console.log("【"+ mainTeam[mainIndex]['name'] +"】 nowFrame : "+ TimeView +"("+ nowFrame +"ｆ)");

                            let healValue = Number(mainTeam[mainIndex]['skill'][2]['Behavior']['Prime'][2]) * Number(mainTeam[mainIndex]['atk']);

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';

                            //if(mainTeam[mainIndex]['name'] == "ヒュペリオン") console.log(TimeView, skillName+"test", mainTeam[mainIndex]['name']);
                            //console.log(TimeView, skillName+"発動", mainTeam[mainIndex]['name']);

                            //HP率がもっとも低い味方を回復
                            let hpRate = 1;
                            let healTarget = 0;
                            for(_target = mainTeam.length - 1; _target >= 0; _target--){
                                let _hpRate = mainTeam[_target]['hp'] / mainTeam[_target]['status']['hp'];

                                if(hpRate >= _hpRate) healTarget = _target;
                            }

                            if(mainTeam[healTarget]['status']['hp'] < (mainTeam[healTarget]['hp'] + healValue)){
                                healValue = mainTeam[healTarget]['status']['hp'] - mainTeam[healTarget]['hp'];
                            }
                            mainTeam[healTarget]['hp'] += healValue;


                            _log['Content'] = skillName +'を発動(<span HEALCOLOR>'+ Math.floor(healValue) +'</span>回復)';

                            _log['targetThum'] = mainImgEmpty.replace("<?=IMG=>", mainTeam[healTarget]['id']);
                            _log['targetName'] = mainHeadStr +mainTeam[healTarget]['name'];
                            _log['targetHP'] = Math.floor(mainTeam[healTarget]['hp']);

                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            logData.push(_log);

                            break;
                        case 'アラジ第２':
                            let speedValue = Number(mainTeam[mainIndex]['skill'][2]['Behavior']['Prime'][4]) / 100;

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
                            _log['Content'] = skillName +'を発動(攻撃速度'+ mainTeam[mainIndex]['skill'][2]['Behavior']['Prime'][4] +"%上昇)";

                            for(_target = 0; _target < mainTeam.length; _target++){
                                mainTeam[_target]['speedRateInfo'] = [speedValue, nowFrame + (Number(mainTeam[mainIndex]['skill'][2]['Behavior']['Duration']) * 60)];
                            }

                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            logData.push(_log);

                            break;
                        case 'エデン第２':

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100) +'%';
                            

                            //ランダム対象
                            _target = Math.floor(Math.random() * targetTeam.length);

                            //対象のIDと名前
                            let _tName = targetTeam[_target]['name'];
                            let _tID = targetTeam[_target]['id'];

                            //エデンログに記録
                            EdenTarget.push([dir, _tName]);

                            //敵チームが２体以上いる場合は神隠し発動
                            if(targetTeam.length > 1){
                                _log['Content'] = skillName +'を発動し地中に束縛';
                                
                                //終了時間
                                targetTeam[_target]['inJail'] = nowFrame + (Number(mainTeam[mainIndex]['skill'][2]['Behavior']['Duration']) * 60);

                                //バトルチームから除外して隠しチームに追加
                                let _targetTitan = targetTeam.splice(_target, 1);

                                if(dir == "own"){
                                    enemyHideMember.push(_targetTitan[0]);
                                }
                                else{
                                    ownHideMember.push(_targetTitan[0]);
                                }
                            }
                            else{
                                //スタン効果付与
                                targetTeam[_target]['stunTime'] = nowFrame + (Number(mainTeam[mainIndex]['skill'][2]['Behavior']['StunDuration']) * 60);

                                //スタン効果ログ出力
                                _log['Content'] = skillName +'のスタン発動('+ mainTeam[mainIndex]['skill'][2]['Behavior']['StunDuration'] +"秒)";
                            }                                   
                            
                            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", _tID);
                            _log['targetName'] = targetHeadStr + _tName;

                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            logData.push(_log);

                            break;
                    }
                }
            }
        }

        //エネルギーが貯まっていたらスキル発動
        if((mainTeam[mainIndex]['energy'] >= 1000 || mainTeam[mainIndex]['skillStart'] > 0) && mainTeam[mainIndex]['autoSkillStart'] == 0){
            
            if(mainTeam[mainIndex]['skillStart'] == 0){
                mainTeam[mainIndex]['energy'] = 0;
                mainTeam[mainIndex]['skillStart'] = nowFrame;
                mainTeam[mainIndex]['animWait'] = 0;

                let _log = Object.assign({}, defLog);
                _log['TimeView'] = TimeView;
                _log['mainThum'] = mainImg;
                _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                _log['mainEnergy'] = '0%';
                //if(posType[dir] == "atk") _log['Content'] = 'スキルモーションなし';
                if(dir == "own") _log['Content'] = 'スキルモーションなし';
                else _log['Content'] = 'スキルモーション開始';
                _log['PostTime'] = PostTime;
                logData.push(_log);
            }
            
            //スキル発動したらアニメーション開始
            mainTeam[mainIndex]['animWait'] += 1 + mainTeam[mainIndex]['speedRateInfo'][0];

            let skillAnimationDelay = Number(mainTeam[mainIndex]['skill'][1]['Behavior']['AnimationDelay']) * 60;
            //if(posType[dir] == "atk") skillAnimationDelay = 0;
            if(dir == "own") skillAnimationDelay = 0;
            
            //アニメーションが完了したらスキル実行
            if(mainTeam[mainIndex]['animWait'] >= skillAnimationDelay){
                mainTeam[mainIndex]['animWait'] = 0;
                mainTeam[mainIndex]['animStart'] = 0;
                mainTeam[mainIndex]['skillStart'] = 0;

                //アーティファクト発動判定
                let artRate = Number(mainTeam[mainIndex]['status']['weaponRate']);
                let _rate = Math.floor(Math.random() * 100);

                //確率発動
                if(_rate < artRate){
                    let artValue;
                    let artName = mainTeam[mainIndex]['status']['weaponType'];
                    let artType = "";

                    let _log = Object.assign({}, defLog);
                    _log['TimeView'] = TimeView;
                    _log['mainThum'] = mainImg;
                    _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                    
                    if(artName == "HP自動回復"){
                        artValue = Math.ceil(Number(mainTeam[mainIndex]['status']['HPregen']));

                        //味方全員回復
                        for(let _mem = 0; _mem < mainTeam.length; _mem++){
                            healValue = artValue;
                            if(mainTeam[_mem]['status']['hp'] < (mainTeam[_mem]['hp'] + healValue)){
                                healValue = mainTeam[_mem]['status']['hp'] - mainTeam[_mem]['hp'];
                            }
                            
                            mainTeam[_mem]['hp'] += healValue;
                        }

                        _log['mainHP'] = Math.ceil(mainTeam[mainIndex]['hp']);
                        _log['Content'] = '(AF)'+ artName +'発動：<span HEALCOLOR>'+ artValue +'</span>';
                    }
                    else if(artName == "物理攻撃"){
                        artValue = Math.ceil(Number(mainTeam[mainIndex]['status']['extraWeapon']));

                        //仲間全員の物理攻撃上昇
                        for(let _tA = 0; _tA < mainTeam.length; _tA++){
                            mainTeam[_tA]['atk'] = Number(mainTeam[_tA]['atk']) + artValue;
                        }

                        _log['Content'] = '(AF)'+ artName +'増加：'+ artValue;
                    }
                    else if(artName.indexOf('追加') > 0){
                        artValue = Math.ceil(Number(mainTeam[mainIndex]['status']['weaponDamageToX']));
                        artType = mainTeam[mainIndex]['status']['weaponType'];

                        _log['Content'] = '(AF)'+ artName +'：'+ artValue;
                        artName = "追加"; 
                
                    }
                    else if(artName.indexOf('減少') > 0){
                        artValue = Math.ceil(Number(mainTeam[mainIndex]['status']['weaponDamageFromX']));
                        artType = mainTeam[mainIndex]['status']['weaponType'];

                        _log['Content'] = '(AF)'+ artName +'：'+ artValue;
                        artName = "減少"; 
                    }

                    mainTeam[mainIndex]['artCondition'] = [nowFrame, (nowFrame + 540), artValue, artName, artType];
                    
                    _log['PostTime'] = PostTime;
                    if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                    logData.push(_log);
                }


                //スキル名
                let skillName = mainTeam[mainIndex]['skill'][1]['name'];

                let _log;
                let dmg = 0;
                let damageInfo = {};
                let spotPos;

                //獲得エネルギー
                mainTeam[mainIndex]['energy'] += 200;

                let EnergyRate = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100);
                if(EnergyRate > 100) EnergyRate = 100;

                switch(mainTeam[mainIndex]['skill'][1]['memo']){
                    case 'シグルドスキル':
                        mainTeam[mainIndex]['shieldTime'] = nowFrame + (Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Duration']) * 60);

                        _log = Object.assign({}, defLog);
                        _log['TimeView'] = TimeView;
                        _log['mainThum'] = mainImg;
                        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                        _log['mainEnergy'] = EnergyRate +'%';
                        _log['Content'] = skillName +'を発動';

                        _log['PostTime'] = PostTime;
                        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                        logData.push(_log);

                        break;
                    case 'アンガススキル':
                        dmg = Number(mainTeam[mainIndex]['atk']);

                        //スキル係数
                        dmg = Math.floor(dmg * Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]));

                        //敵全体に攻撃
                        for(let tg = 0; tg < targetTeam.length; tg++){

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = EnergyRate +'%';
                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                
                            //ダメージ計算
                            damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[tg], dmg, nowFrame, mainTeam, targetTeam);

                            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[tg]['id']);
                            _log['targetName'] = targetHeadStr + targetTeam[tg]['name'];
                            _log['targetHP'] = Math.floor(damageInfo['hp']);
                            _log['targetEnergy'] = damageInfo['energy'] +'%';

                            _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                            logData.push(_log);
                        }

                        //DOTダメージと時間を登録
                        mainTeam[mainIndex]['damageOnTime'] = nowFrame + (Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Duration']) * 60);
                        mainTeam[mainIndex]['damageOnTimeValue'] = dmg;
                        break;
                    case 'モロクスキル':
                        dmg = Number(mainTeam[mainIndex]['atk']);

                        //スキル係数
                        dmg = Math.floor(dmg * Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]));

                        _log = Object.assign({}, defLog);
                        _log['TimeView'] = TimeView;
                        _log['mainThum'] = mainImg;
                        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                        _log['mainEnergy'] = EnergyRate +'%';
                        _log['PostTime'] = PostTime;
                        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

                        //ダメージ計算
                        damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[targetIndex], dmg, nowFrame, mainTeam, targetTeam);

                        _log['targetThum'] = targetImg;
                        _log['targetName'] = targetHeadStr +targetTeam[targetIndex]['name'];
                        _log['targetHP'] = Math.floor(damageInfo['hp']);
                        _log['targetEnergy'] = damageInfo['energy'] +'%';

                        _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                        logData.push(_log);
                        
                        //シールド状態でなければスタン効果付与
                        
                        if(targetTeam[targetIndex]['shieldTime'] > nowFrame){
                            //スタン無効ログ出力
                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = targetImg;
                            _log['mainName'] = targetHeadStr + targetTeam[targetIndex]['name'];
                            _log['mainHP'] = Math.floor(targetTeam[targetIndex]['hp']);
                            _log['mainEnergy'] = Math.floor((targetTeam[targetIndex]['energy'] / 1000) * 100)　+'%';
                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            _log['Content'] = "スタン耐性";
                            logData.push(_log);
                        }
                        else{
                            targetTeam[targetIndex]['stunTime'] = nowFrame + (Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Duration']) * 60);

                            //スタン効果ログ出力
                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = targetImg;
                            _log['mainName'] = targetHeadStr + targetTeam[targetIndex]['name'];
                            _log['mainHP'] = Math.floor(targetTeam[targetIndex]['hp']);
                            _log['mainEnergy'] = Math.floor((targetTeam[targetIndex]['energy'] / 1000) * 100)　+'%';
                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            _log['Content'] = "スタン状態("+ mainTeam[mainIndex]['skill'][1]['Behavior']['Duration'] +"秒)";
                            logData.push(_log);
                        }

                        break;
                    case 'ノヴァスキル':
                        dmg = Number(mainTeam[mainIndex]['atk']);

                        //スキル係数
                        dmg = Math.floor(dmg * Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]));

                        //敵の最後尾を起点にレンジ範囲内を攻撃
                        let rTime = 0;
                        let nowArea = 0;
                        let nowAreaTimes = 0;
                        
                        //対象チームの最後尾からヒット
                        for(let tg = (targetTeam.length-1); tg >= 0; tg--){

                            //回数
                            rTime++;

                            //最後尾のタイタンの情報取得
                            if(tg == targetTeam.length-1){
                                //初期衝突位置
                                spotPos = Math.floor(targetTeam[tg]['pos']);
                                //タイタンの種類（タンク・攻撃・援助）
                                startType = targetTeam[tg]['titanType'];
                                
                            }

                            //最後尾から後衛型まで。（スタートがタンク型であればすべてヒット）
                            if(startType != "melee" && targetTeam[tg]['titanType'] == "melee") break;
                            
                            //ターゲットの位置と現在のヒット位置確認
                            //console.log(targetTeam[tg]['name'], nowArea, targetTeam[tg]['pos'], nowAreaTimes);
                            if(nowArea != Math.floor(targetTeam[tg]['pos']) && nowAreaTimes >= 2){
                                break;
                            }
                            else if(nowArea != Math.floor(targetTeam[tg]['pos'])){
                                nowAreaTimes = 0;
                            }

                            nowArea = Math.floor(targetTeam[tg]['pos']);
                            nowAreaTimes++;

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = EnergyRate +'%';
                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

                            //ダメージ計算
                            damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[tg], dmg, nowFrame, mainTeam, targetTeam);

                            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[tg]['id']);
                            _log['targetName'] = targetHeadStr + targetTeam[tg]['name'];
                            _log['targetHP'] = Math.floor(damageInfo['hp']);
                            _log['targetEnergy'] = damageInfo['energy'] +'%';

                            _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                            logData.push(_log);

                            //スタン効果付与
                            targetTeam[tg]['stunTime'] = nowFrame + (Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Duration']) * 60);

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[tg]['id']);
                            _log['mainName'] = targetHeadStr +targetTeam[tg]['name'];
                            _log['Content'] = "スタン状態("+ mainTeam[mainIndex]['skill'][1]['Behavior']['Duration'] +"秒)";
                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            logData.push(_log);

                            if(rTime == 3) break;
                        }

                        break;
                    case 'シルバスキル':
                        dmg = Number(mainTeam[mainIndex]['atk']);

                        //スキル係数
                        dmg = Math.floor(dmg * Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]));

                        //ランダム対象に６連攻撃（６ｆに分けてDOT的に連撃）
                        _log = Object.assign({}, defLog);
                        _log['TimeView'] = TimeView;
                        _log['mainThum'] = mainImg;
                        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                        _log['mainEnergy'] = EnergyRate +'%';
                        _log['PostTime'] = PostTime;
                        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

                        let _r = Math.floor(Math.random() * targetTeam.length);

                        //ダメージ計算
                        damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[_r], dmg, nowFrame, mainTeam, targetTeam);

                        _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[_r]['id']);
                        _log['targetName'] = targetHeadStr + targetTeam[_r]['name'];
                        _log['targetHP'] = Math.floor(damageInfo['hp']);
                        _log['targetEnergy'] = damageInfo['energy'] +'%';

                        _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                        logData.push(_log);


                        //連撃ダメージと時間を登録
                        mainTeam[mainIndex]['manyShotTimes'] = 5;
                        mainTeam[mainIndex]['manyShotSpan'] = 6;
                        mainTeam[mainIndex]['manyShotNextFrame'] = nowFrame + mainTeam[mainIndex]['manyShotSpan'];
                        mainTeam[mainIndex]['manyShotValue'] = dmg;

                        break;
                    case 'バルカンスキル':
                        dmg = Number(mainTeam[mainIndex]['atk']);

                        //スキル係数
                        dmg = Math.floor(dmg * Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]));

                        _log = Object.assign({}, defLog);
                        _log['TimeView'] = TimeView;
                        _log['mainThum'] = mainImg;
                        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                        _log['mainEnergy'] = EnergyRate +'%';
                        _log['PostTime'] = PostTime;
                        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

                        //ダメージ計算
                        damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[targetIndex], dmg, nowFrame, mainTeam, targetTeam);

                        _log['targetThum'] = targetImg;
                        _log['targetName'] = targetHeadStr +targetTeam[targetIndex]['name'];
                        _log['targetHP'] = Math.floor(damageInfo['hp']);
                        _log['targetEnergy'] = damageInfo['energy'] +'%';

                        _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                        logData.push(_log);

                        break;
                    case 'アバロンスキル':
                        let sieldLife = Math.floor(Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]) * Number(mainTeam[mainIndex]['status']['atk']));
                        mainTeam[mainIndex]['shieldLife'].push(sieldLife);

                        //メンバー全員にシールド配列を参照してもらう
                        for(let ts = 0; ts < mainTeam.length; ts++){
                            mainTeam[ts]['teamShield'] = mainTeam[mainIndex]['shieldLife'];
                        }

                        _log = Object.assign({}, defLog);
                        _log['TimeView'] = TimeView;
                        _log['mainThum'] = mainImg;
                        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                        _log['mainEnergy'] = EnergyRate +'%';
                        _log['Content'] = skillName +'(シールド：'+ sieldLife +')';

                        _log['PostTime'] = PostTime;
                        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                        logData.push(_log);

                        break;
                    case 'マイリスキル':
                        let atkDown = Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][4]) / 100;

                        //敵全員の攻撃力を下げる
                        for(let ad = 0; ad < targetTeam.length; ad++){
                            let downValue = Math.floor(Number(targetTeam[ad]['status']['atk']) * atkDown);

                            targetTeam[ad]['atk'] -= downValue;
                            targetTeam[ad]['atkDown'] = [downValue, nowFrame + Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Duration'])*60];

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = EnergyRate +'%';
                            _log['Content'] = skillName +'(攻撃力'+ downValue +'減少)';

                            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[ad]['id']);
                            _log['targetName'] = targetHeadStr +targetTeam[ad]['name'];

                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            logData.push(_log);
                        }

                        break;
                    case 'イグニススキル':
                        let atkUp = Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]);

                        //味方全員の攻撃力を上げる
                        for(let au = 0; au < mainTeam.length; au++){
                            let upValue = Math.floor(Number(mainTeam[au]['status']['atk']) * atkUp);

                            mainTeam[au]['atk'] += upValue;
                            mainTeam[au]['atkUp'] = [upValue, nowFrame + Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Duration'])*60];

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = EnergyRate +'%';
                            _log['Content'] = skillName +'(攻撃力'+ upValue +'増加)';

                            _log['targetThum'] = mainImgEmpty.replace("<?=IMG=>", mainTeam[au]['id']);
                            _log['targetName'] = mainHeadStr +mainTeam[au]['name'];

                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            logData.push(_log);
                        }

                        break;
                    case 'アラジスキル':
                        dmg = Number(mainTeam[mainIndex]['atk']);

                        //スキル係数
                        dmg = Math.floor(dmg * Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]));

                        //先頭から順に28連攻撃（15ｆに分けてDOT的に連撃）
                        _log = Object.assign({}, defLog);
                        _log['TimeView'] = TimeView;
                        _log['mainThum'] = mainImg;
                        _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                        _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                        _log['mainEnergy'] = EnergyRate +'%';
                        _log['PostTime'] = PostTime;
                        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

                        //ダメージ計算
                        damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[0], dmg, nowFrame, mainTeam, targetTeam);

                        _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[0]['id']);
                        _log['targetName'] = targetHeadStr + targetTeam[0]['name'];
                        _log['targetHP'] = Math.floor(damageInfo['hp']);
                        _log['targetEnergy'] = damageInfo['energy'] +'%';

                        _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                        logData.push(_log);


                        //連撃ダメージと時間を登録
                        mainTeam[mainIndex]['manyShotTarget'] = 0;
                        mainTeam[mainIndex]['manyShotTimes'] = 27;
                        mainTeam[mainIndex]['manyShotSpan'] = 15;
                        mainTeam[mainIndex]['manyShotNextFrame'] = nowFrame + mainTeam[mainIndex]['manyShotSpan'];
                        mainTeam[mainIndex]['manyShotValue'] = dmg;

                        break;
                    case 'エデンスキル':
                        //スキル係数
                        d_rate = Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]);

                        dmg = Number(mainTeam[mainIndex]['atk']);

                        dmg = Math.floor(dmg * d_rate);

                        //敵の中央を起点にレンジ範囲内を攻撃
                        let centerIndex = Math.floor(targetTeam.length / 2);
                        spotPos = targetTeam[centerIndex]['pos'];

                        for(let _tg = 0; _tg < targetTeam.length; _tg++){

                            //スキルエリア内かどうか、範囲外ならばスキップ
                            if(Math.abs(targetTeam[_tg]['pos'] - spotPos) > Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Area'])/2) continue;

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = EnergyRate +'%';
                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

                            //ダメージ計算
                            damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[_tg], dmg, nowFrame, mainTeam, targetTeam);

                            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[_tg]['id']);
                            _log['targetName'] = targetHeadStr + targetTeam[_tg]['name'];
                            _log['targetHP'] = Math.floor(damageInfo['hp']);
                            _log['targetEnergy'] = damageInfo['energy'] +'%';

                            _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                            logData.push(_log);
                        }

                        break;
                    case 'ヒュペリオンスキル':
                        //スキル係数
                        d_rate = Number(mainTeam[mainIndex]['skill'][1]['Behavior']['Prime'][2]);

                        dmg = Number(mainTeam[mainIndex]['atk']);

                        dmg = Math.floor(dmg * d_rate);

                        spotPos = Math.abs(targetTeam[(targetTeam.length-1)]['pos']);

                        //最後尾を最大に順にダメージ減少
                        for(let __tg = 0; __tg < targetTeam.length; __tg++){

                            let posRate = Math.abs(targetTeam[__tg]['pos']) / spotPos;

                            _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = EnergyRate +'%';
                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);

                            //ダメージ計算
                            damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[__tg], (dmg * posRate), nowFrame, mainTeam, targetTeam);

                            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[__tg]['id']);
                            _log['targetName'] = targetHeadStr + targetTeam[__tg]['name'];
                            _log['targetHP'] = Math.floor(damageInfo['hp']);
                            _log['targetEnergy'] = damageInfo['energy'] +'%';

                            _log['Content'] = skillName +'を発動('+ damageInfo['dmgMessage'] +')';

                            logData.push(_log);
                        }

                        break;
                }

            }
        }
        //前回の攻撃からクールタイムが経過しているかどうか
        else if((nowFrame - mainTeam[mainIndex]['lastAttack']) >= Number(mainTeam[mainIndex]['skill'][0]['Behavior']['Cooldown']) * 60  && mainTeam[mainIndex]['autoSkillStart'] == 0){

            if(mainTeam[mainIndex]['animStart'] == 0){
                mainTeam[mainIndex]['animStart'] = nowFrame;
            }

            //クールタイムが経過していたらアニメーション開始
            mainTeam[mainIndex]['animWait'] += 1 + mainTeam[mainIndex]['speedRateInfo'][0];

            //アニメーションが完了したら攻撃実行
            if(mainTeam[mainIndex]['animWait'] >= Number(mainTeam[mainIndex]['skill'][0]['Behavior']['AnimationDelay']) * 60){

                //獲得エネルギー
                mainTeam[mainIndex]['energy'] += 200;

                let EnergyRate = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100);
                if(EnergyRate > 100) EnergyRate = 100;


                let _log = Object.assign({}, defLog);
                _log['TimeView'] = TimeView;
                _log['mainThum'] = mainImg;
                _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                _log['mainEnergy'] = EnergyRate +'%';
                

                //攻撃力
                let dmg = Math.floor(mainTeam[mainIndex]['atk']);


                //ダメージ計算
                damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[targetIndex], dmg, nowFrame, mainTeam, targetTeam);


                _log['targetThum'] = targetImg;
                _log['targetName'] = targetHeadStr +targetTeam[targetIndex]['name'];
                _log['targetHP'] = Math.floor(damageInfo['hp']);
                _log['targetEnergy'] = damageInfo['energy'] +'%';

                _log['Content'] = '基本攻撃('+ damageInfo['dmgMessage'] +')';


                _log['PostTime'] = PostTime;
                if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                logData.push(_log);


                //タンク型タイタンの基本攻撃は範囲型
                if(mainTeam[mainIndex]['titanType'] == "melee"){
                    
                    let attackPos = targetTeam[targetIndex]['pos'];
                    for(let tr = 1; tr < targetTeam.length; tr++){

                        //攻撃エリア内

                        //if(Math.abs(targetTeam[tr]['pos'] - mainTeam[mainIndex]['pos']) <= (Number(mainTeam[mainIndex]['skill'][0]['Behavior']['Range']) + (Number(mainTeam[mainIndex]['skill'][0]['Behavior']['Area'])/2))){
                        if(Math.abs(targetTeam[tr]['pos'] - mainTeam[mainIndex]['pos']) <= (Number(mainTeam[mainIndex]['skill'][0]['Behavior']['Range']) + 50)){
                            let _log = Object.assign({}, defLog);
                            _log['TimeView'] = TimeView;
                            _log['mainThum'] = mainImg;
                            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
                            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
                            _log['mainEnergy'] = EnergyRate +'%';
                            

                            //攻撃力
                            let dmg = Math.floor(mainTeam[mainIndex]['atk']);


                            //ダメージ計算
                            damageInfo = targetDamage(mainTeam[mainIndex], targetTeam[tr], dmg, nowFrame, mainTeam, targetTeam);


                            _log['targetThum'] = targetImgEmpty.replace("<?=IMG=>", targetTeam[tr]['id']);
                            _log['targetName'] = targetHeadStr +targetTeam[tr]['name'];
                            _log['targetHP'] = damageInfo['hp'];
                            _log['targetEnergy'] = damageInfo['energy'] +'%';

                            _log['Content'] = '基本攻撃範囲('+ damageInfo['dmgMessage'] +')';


                            _log['PostTime'] = PostTime;
                            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
                            logData.push(_log);
                        }
                    }
                }

                mainTeam[mainIndex]['lastAttack'] = mainTeam[mainIndex]['animStart'];
                mainTeam[mainIndex]['animWait'] = 0;
                mainTeam[mainIndex]['animStart'] = 0;
            }
        }
    }


    //攻撃対象の残りHPチェック（討伐確認）
    for(let dc = (targetTeam.length - 1); dc >= 0; dc--){
        if(Math.floor(targetTeam[dc]['hp']) < 1){

            let defeatMsg = "";
            if(dir == "own") defeatMsg = "を倒した";
            else defeatMsg = "が倒された";

            mainTeam[mainIndex]['energy'] += 300;
            if(mainTeam[mainIndex]['energy'] > 1000) mainTeam[mainIndex]['energy'] = 1000;
            EnergyRate = Math.floor((mainTeam[mainIndex]['energy'] / 1000) * 100);
            if(EnergyRate > 100) EnergyRate = 100;
            
            let _content = targetHeadStr + targetTeam[dc]['name'] + defeatMsg;

            let _log = Object.assign({}, defLog);
            _log['TimeView'] = TimeView;
            _log['mainThum'] = mainImg;
            _log['mainName'] = mainHeadStr + mainTeam[mainIndex]['name'];
            _log['mainHP'] = Math.floor(mainTeam[mainIndex]['hp']);
            _log['mainEnergy'] = EnergyRate +'%';
            _log['Content'] = _content;
            _log['PostTime'] = PostTime;

            targetTeam.splice(dc,1);

            if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
            logData.push(_log);


            if(targetTeam.length == 0){
                isBattle = false;

                let _content = "";

                if(dir == "own"){
                    _content = "敵陣が全滅！自陣の勝利";
                    winEdenLog.push(EdenTarget);
                    skillCancelWinList.push(stunList);
                }
                else{
                    _content = "自陣が全滅！バトル敗北";
                    loseEdenLog.push(EdenTarget);
                    skillCancelLoseList.push(stunList);
                }

                let _log = Object.assign({}, defLog);
                _log['TimeView'] = TimeView;
                _log['Content'] = _content;
                _log['PostTime'] = PostTime;
                logData.push(_log);

                break;
            }
        }
    }

    return [isBattle, logData];
}

//地下神隠し状態の待機アクション
function HideAction(nowFrame, TimeView, PostTime, ownBattleTeam, enemyBattleTeam, _hideArray, index, dir){

    let logData = [];

    //神隠し効果時間判定
    if(_hideArray[index]['inJail'] > 0 && nowFrame >= _hideArray[index]['inJail']){
        
        let _target = _hideArray.splice(index, 1);

        let mainHeadStr = "";

        if(dir == "own"){

            mainImg = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img src="../titan/img/titan_'+ _target[0]['id'] +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/own_frame.png" width="35" height="35"></div></div>';

            ownBattleTeam.push(_target[0]);
            //チーム配列をバトルオーダー順でソート
            ownBattleTeam.sort(function(a,b){
                if(a.order<b.order) return -1;
                if(a.order > b.order) return 1;
                return 0;
            });
        }
        else{

            mainHeadStr = "敵";

            mainImg = '<div class="logJournalAvatarBox"><div class="logJournalAvatar"><img class="flipHorizon" src="../titan/img/titan_'+ _target[0]['id'] +'" width="30" height="30"></div><div class="logJournalAvatarFrame"><img src="../titanBattle/img/enemy_frame.png" width="35" height="35"></div></div>';

            enemyBattleTeam.push(_target[0]);
            //チーム配列をバトルオーダー順でソート
            enemyBattleTeam.sort(function(a,b){
                if(a.order<b.order) return -1;
                if(a.order > b.order) return 1;
                return 0;
            });
        }

        _log = Object.assign({}, defLog);
        _log['TimeView'] = TimeView;
        _log['mainThum'] = mainImg;
        _log['mainName'] = mainHeadStr + _target[0]['name'];
        _log['mainHP'] = Math.floor(_target[0]['hp']);
        _log['mainEnergy'] = Math.floor((_target[0]['energy'] / 1000) * 100) +'%';
        _log['Content'] = '神隠しから復帰→スタン2秒';

        _log['PostTime'] = PostTime;
        if(developMode) _log['develop'] = developCheck(ownBattleTeam, enemyBattleTeam);
        logData.push(_log);

        //スタン効果付与
        _target[0]['stunTime'] = nowFrame + (2 * 60);

    }

    return [true, logData];
}

//ターゲットに対するダメージとその結果の算出
function targetDamage(_main, _target, baseDamage, nowFrame, _mainTeam, _targetTeam){

    let dmg = baseDamage;
    let dmgMessage = "";

    let elementalShield = 0;
    let elementDamage = 0;

    //第2アーティファクトとスキンによるダメージ増減算出
    if(elementConvert[String(_main['status']['typeExp']).charAt(0)] == _target['element']){
        dmg += Number(_main['status']['damageToX']);
        elementDamage += Number(_main['status']['damageToX']);
    }
    if(elementConvert[String(_target['status']['typeExp']).charAt(0)] == _main['element']){
        //dmg -= Number(_target['status']['damageFromX']);
        //if(dmg < 0) dmg = 0;

        elementalShield += Number(_target['status']['damageFromX']);
    }

    for(let i = 0; i < _mainTeam.length; i++){
        //第１アーティファクトによる属性ダメージ増加算出
        if(nowFrame < _mainTeam[i]['artCondition'][1] && _mainTeam[i]['artCondition'][1] > 0 && _mainTeam[i]['artCondition'][3] == "追加"){
            if(elementConvert[String(_mainTeam[i]['status']['weaponType']).charAt(0)] == _target['element']){
                dmg += Number(_mainTeam[i]['artCondition'][2]);
                elementDamage += Number(_mainTeam[i]['artCondition'][2]);
            }
        }
    }

    for(i = 0; i < _targetTeam.length; i++){
        //第１アーティファクトによる属性ダメージ減少算出
        if(nowFrame < _targetTeam[i]['artCondition'][1] && _targetTeam[i]['artCondition'][1] > 0 && _targetTeam[i]['artCondition'][3] == "減少"){
            if(elementConvert[String(_targetTeam[i]['status']['weaponType']).charAt(0)] == _main['element']){
                //dmg -= Number(_main['artCondition'][2]);
                //if(dmg < 0) dmg = 0;

                elementalShield += Number(_targetTeam[i]['artCondition'][2]);
            }
        }
    }

    //属性ダメージ減少
    dmg *= 1 / (1 + (elementalShield / 300000));

    let elementShieldRate = Math.floor( (1 - 1 / (1 + (elementalShield / 300000) ) ) * 100 );

    dmgMessage = Math.floor(dmg) +'ダメージ';

    //アバロンのシールドチェック
    let dmgLost = false;
    let dmgRemain = dmg;
    let sieldBreak = false;
    if(_target['teamShield'].length > 0){
        let sieldRemain = 0;
        for(let sc = _target['teamShield'].length - 1; sc >= 0; sc--){
            if(_target['teamShield'][sc] < dmg){
                if(!dmgLost) dmgRemain = dmg - Math.floor(_target['teamShield'][sc]);
                _target['teamShield'].splice(sc, 1);
            }
            else{
                dmgLost = true;
                dmgRemain = 0;

                _target['teamShield'][sc] -= dmg;
                if(sieldRemain < _target['teamShield'][sc]) sieldRemain = _target['teamShield'][sc];
            }
        }
        if(dmgLost) dmgMessage = 'シールド残り：'+ Math.floor(sieldRemain);
        else dmgMessage = dmgRemain +'ダメージ：シールド破壊';

        if(_target['teamShield'].length == 0) sieldBreak = true;
    }
    dmg = dmgRemain;
    

    //シグルドのシールドによるダメージ耐性
    if( nowFrame < _target['shieldTime'] && dmgLost == false){
        dmg = 0;
        dmgMessage = '耐性';
        if(sieldBreak) dmgMessage = '耐性：シールド破壊';
    }

    //残りHPよりダメージ値が大きい場合はHP値に
    if(dmg > Math.floor(_target['hp'])){
        dmg = Math.floor(_target['hp']);
        dmgMessage = Math.floor(dmg) +'ダメージ';
    }

    //攻撃対象残りHP
    let remainHP = Math.floor(_target['hp']) - dmg;
    if(remainHP < 0) remainHP = 0;
    _target['hp'] = remainHP;

    //攻撃対象エネルギー
    let getEnergy = 1000 * (( dmg / Number(_target['status']['hp'])) / 2);
    _target['energy'] += getEnergy;

    if(_target['energy'] > 1000) _target['energy'] = 1000;
    _target['energy'] = Math.floor(_target['energy']);

    let energyRate = Math.floor((_target['energy'] / 1000) * 100);

    if(elementShieldRate > 0) dmgMessage += '<br />属性減少：'+ elementShieldRate +'%';
    if(Math.floor(elementDamage) > 0) dmgMessage += '<br />属性追加：'+ Math.floor(elementDamage);

    return {"dmg":dmg, "hp":_target['hp'], "energy":energyRate, "dmgMessage":dmgMessage};

}

function developCheck(ownBattleTeam, enemyBattleTeam){

    let output = '<table class="resultPostionTable"><tr>';
    let ownPos = "";
    for(let i = 0; i < ownBattleTeam.length; i++){
        ownPos = '<td><img class="resultPositionOwn" src="../titan/img/titan_'+ ownBattleTeam[i]['id'] +'.png" width="15" height="15"><br />'+ Math.floor(ownBattleTeam[i]['pos']) +"</td>"+ ownPos;
    }

    let enemyPos = "";
    let alpha = ['A', "B", "C", "D", "E"]
    for(let i = 0; i < enemyBattleTeam.length; i++){
        enemyPos += '<td><img class="resultPositionEnemy" src="../titan/img/titan_'+ enemyBattleTeam[i]['id'] +'.png" width="15" height="15"><br />'+ Math.floor(enemyBattleTeam[i]['pos']) +"</td>";
    }
    output += ownPos + enemyPos;
    output += "</tr></table>";
    return output;

}

function edenAnalyze(edenLog){
    
    let edenPatternArray = [];

    for(let i = 0; i < edenLog.length; i++){

        if(edenLog[i].length < 1) continue;

        let ownEden = "";
        let enemyEden = "";

        for(let j = 0; j < edenLog[i].length; j++){
            if(edenLog[i][j][0] == "own"){
                if(ownEden.length > 0) ownEden += ",";
                if(posType['own'] == "atk") ownEden += "敵"+ edenLog[i][j][1];
                else ownEden += "自"+ edenLog[i][j][1];
            }
            else{
                if(enemyEden.length > 0) enemyEden += ",";
                if(posType['own'] == "atk") enemyEden += "自"+ edenLog[i][j][1];
                else enemyEden += "敵"+ edenLog[i][j][1];
            }
        }

        if(ownEden.length < 1) ownEden = "自陣エデンなし";
        if(enemyEden.length < 1) enemyEden = "敵陣エデンなし";

        let edenPattern = ownEden +" <=> "+ enemyEden;

        let wCheck = false;
        for(let k = 0; k < edenPatternArray.length; k++){
            if(edenPatternArray[k] == edenPattern){
                wCheck = true;
                break;
            }
        }
        if(wCheck == false){
            edenPatternArray.push(edenPattern);
        }
    }

    edenPatternArray.sort();

    let EdenPatternString = "";
    for(let e = 0; e < edenPatternArray.length; e++){
        EdenPatternString += edenPatternArray[e] +"<br />";
    }

    return EdenPatternString;
}

function skillCancelAnalyze(skillCancelLog, WinTimes, trialTimes, pattern){

    let BattleTimes = WinTimes;
    if(pattern == "lose") BattleTimes = trialTimes - WinTimes;

    let stunMemberList = {};

    for(let i = 0; i < skillCancelLog.length; i++){
        for(let j in skillCancelLog[i]){
            for(let t in skillCancelLog[i][j]){
                if(!stunMemberList[j]) stunMemberList[j] = {};
                if(!stunMemberList[j][t]) stunMemberList[j][t] = skillCancelLog[i][j][t];
                else stunMemberList[j][t] += skillCancelLog[i][j][t];
            }
        }
    }


    var pairs = Object.entries(stunMemberList);
    pairs.sort(function(p1, p2){
    var p1Key = p1[0], p2Key = p2[0];
    if(p1Key < p2Key){ return -1; }
    if(p1Key > p2Key){ return 1; }
    return 0;
    })
    stunMemberList = Object.fromEntries(pairs);

    let stunRateOutput = "";
    for(let k in stunMemberList){
        for(let s in stunMemberList[k]){

            let headName = "";
            if(k == "own"){
                if(posType['own'] == "atk") headName = "自";
                else headName = "敵";
            }
            else{
                if(posType['own'] == "atk") headName = "敵";
                else headName = "自";
            }

            let rate = String(Math.floor((stunMemberList[k][s]/BattleTimes)*10000));
            rate = Math.floor((stunMemberList[k][s]/BattleTimes)*100) +"."+ rate.substr(-2, 2);

            stunRateOutput += headName + s +":"+ rate +"%<br />";
        }
    }
    return stunRateOutput;
}
