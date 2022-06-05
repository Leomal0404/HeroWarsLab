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

            for(let j = 0; j < heroList.length; j++){
                if(heroList[j]['id'] == id){

                    let heroInfo = heroList[j];

                    member_info.textureID = heroInfo['IconAssetTexture'];

                    //member_info.element = heroInfo['Other']['Element'];
                    //member_info.titanType = heroInfo['Other']['TitanType'];

                    //member_info.walkSpeed = heroInfo['walkPointPerFrame'];

                    //スキルデータ
                    member_info.skill = [];

                    /*
                    for(let s = 0; s < heroInfo['Skill'].length; s++){
                        for(let k = 0; k < skillList['skill'].length; k++){
                            if(skillList['skill'][k]['Id'] == heroInfo['Skill'][s]){
                                member_info.skill.push(skillList['skill'][k]);
                                break;
                            }
                        }
                    }
                    */

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

            for(let j = 0; j < heroList.length; j++){
                if(heroList[j]['id'] == id){

                    let heroInfo = heroList[j];

                    member_info.textureID = heroInfo['IconAssetTexture'];

                    //member_info.element = heroInfo['Other']['Element'];
                    //member_info.titanType = heroInfo['Other']['TitanType'];

                    //member_info.walkSpeed = heroInfo['walkPointPerFrame'];

                    //スキルデータ
                    member_info.skill = [];

                    /*
                    for(let s = 0; s < heroInfo['Skill'].length; s++){
                        for(let k = 0; k < skillList['skill'].length; k++){
                            if(skillList['skill'][k]['Id'] == heroInfo['Skill'][s]){
                                member_info.skill.push(skillList['skill'][k]);
                                break;
                            }
                        }
                    }
                    */

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


    for(let j = 0; j < heroList.length; j++){
        if(heroList[j]['id'] == _id){

            let heroInfo = heroList[j];

            member_info.order = Number(heroInfo["BattleOrder"]);
            member_info.name = heroInfo["name"];

            //member_info.element = heroInfo['Other']['Element'];
            //member_info.titanType = heroInfo['Other']['TitanType'];

            //member_info.walkSpeed = heroInfo['walkPointPerFrame'];

            //スキルデータ
            member_info.skill = [];

            /*
            for(let s = 0; s < heroInfo['Skill'].length; s++){
                for(let k = 0; k < skillList['skill'].length; k++){
                    if(skillList['skill'][k]['Id'] == heroInfo['Skill'][s]){
                        member_info.skill.push(skillList['skill'][k]);
                        break;
                    }
                }
            }
            */

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
    }

    //ストレージに保存
    let OTD = JSON.stringify(own_team_array);

    localStorage.setItem("ownHeroTeamData", OTD);

    ajaxSave("ownHeroTeamData", OTD);

    //パワー値
    let ownPower = 0;


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

        ownHTML += '<img id="own_'+ m_info.id +'" class="heroAvatorPos_team" src="'+ heroImgFolder + m_info.textureID +'.png" alt="'+ m_info.name +"-"+ m_info.order +'" title="'+ m_info.name +"-"+ m_info.order +'" width="55" height="55">';

        //パワー値
        ownPower += Math.floor(Number(m_info['status']['power']));

        let t_level = 1;
        let t_star = 1;
        let t_color = 0;

        for(let t = 0; t < myData[nowActive +"_hero"].length; t++){
            if(myData[nowActive +"_hero"][t]['id'] == m_info.id){
                t_level = myData["own_hero"][t]['lv'];
                t_star = myData["own_hero"][t]['star'];
                t_color = myData["own_hero"][t]['color'];
                break;
            }
        }


        //アバターフレーム
        ownHTML += '<div class="hero-frame2">';

        ownHTML += '<img src="'+ heroImgFolder +'heroFrame_'+ colorNames[t_color] +'.png" width="68" height="68" '+ onclickText +'>';

        ownHTML += '</div>';

        //レベル表示
        ownHTML += '<div class="level-disp2">';

        
        ownHTML += t_level;

        ownHTML += '</div>';

        //★ランク表示
        ownHTML += '<div class="star-disp2">';
        ownHTML += '<img src="../common/img/star_'+ t_star +'.png" width="70" height="17">';
        ownHTML += '</div>';

        ownHTML += '</div>';
        ownHTML += '</div>';

        box.innerHTML = ownHTML;

        //チームに選択した場合、リストのアイコンはグレーダウン
        if(nowActive == "own"){
            let own_img = document.getElementById('ownList_'+ m_info.id);
            own_img.className = "greyDown";
        }
    }
    
    app.$refs.result.update();
    document.getElementById('own-team-power').innerHTML = ownPower;
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
function targetSwitch(){
    if(nowActive == "own"){
        nowActive = "enemy";
    }
    else{
        nowActive = "own";
    }
    formBuild();
}