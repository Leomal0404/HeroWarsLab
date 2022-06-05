Vue.component('hydra-slot', {
    template: `                
        <div>
            <div id="hydra-slot">
                <div id="hydra-icon-slot">
                    <img :src="iconURL" width="53" height="53" />
                </div>
            </div>
            <div id="hydra-select-slot">
                <p>ヒドラ種類選択：</p>
                <select id="hydraTypeSelect" v-model="selected" @change="onHydraSelect">
                    <option v-for="option in options" v-bind:value="option.name" v-bind:key="option.id">
                        {{ option.name }}
                    </option>
                </select>
            </div>        
            <div class="BoxClear"></div>
        </div>
    `,
    data: function () {
        return {
            childComponent: ``,
            iconID: 'boss_8010_bg',
            iconURL: '',
            selected: 'コモン炎',
            options: [],
            test:''
        }
    },
    mounted : function(){

        cookieUpdate();
        if(!cookieData['selectedHydra']){
            document.cookie = "selectedHydra=コモン炎; path=/HeroWars/hydraBattle;";
            cookieUpdate();
        }

        if(!cookieData['selectedHydra']){
            if(!localStorage.getItem("selectedHydra")){
                localStorage.setItem("selectedHydra", 'コモン炎');
            }
            this.selected = localStorage.getItem("selectedHydra");
        }
        else this.selected = cookieData['selectedHydra'];

        if(!this.selected) this.selected = 'コモン炎';


        for(let r in hydraList['rankList']){
            let _rankName = hydraList['rankName'][r];
            let _rankID = hydraList['rankList'][r];

            for(let t in hydraList['typeList']){
                let _typeName = hydraList['typeNameList'][t];
                let _typeID = hydraList['typeList'][t];

                this.options.push({id:_rankID+"_"+_typeID, name:_rankName+_typeName});
            }
        }

        // アイコン取得
        let _selectedTypeName = '炎';        
        for(let tn of hydraList["typeNameList"]){
            if(this.selected.indexOf(tn) > 0){
                _selectedTypeName = tn;
                break;
            }
        }
        let _selectedType = "fire";
        for(let _type in hydraList["typeNameArray"]){
            if(hydraList["typeNameArray"][_type] == _selectedTypeName){
                _selectedType = _type;
            }
        }

        // ランク取得
        let _rankName = 'コモン';
        for(let rn of hydraList["rankName"]){
            if(this.selected.indexOf(rn) > -1){
                _rankName = rn;
                break;
            }
        }
        

        targetRank = hydraList["hydraCode"][_rankName];
        targetType = _selectedType;

        targetRankName = _rankName;
        targetTypeName = _selectedTypeName;

        this.iconID = hydraList["iconArray"][_selectedType];
        this.iconURL = "../hydra/img/"+ this.iconID +".png";
    },
    computed: {
        
    },
    methods: {
        onHydraSelect: function(e) {
            
            let _rank = this.options[e.target.selectedIndex].id.split("_")[0];
            let _type = this.options[e.target.selectedIndex].id.split("_")[1];
            this.iconID = hydraList["iconArray"][_type];
            this.iconURL = "../hydra/img/"+ this.iconID +".png";

            targetRank = _rank;
            targetType = _type;

            targetRankName = hydraList["hydraRankName"][_rank];
            targetTypeName = hydraList["typeNameArray"][_type];

            document.cookie = "selectedHydra="+ targetRankName + targetTypeName +"; path=/HeroWars/hydraBattle;";
            cookieUpdate();
            if(!cookieData['selectedHydra']) localStorage.setItem("selectedHydra", targetRankName + targetTypeName);
    
            app.$refs.result.update();
        }
    }
});

Vue.component('result-table', {
    template: `                
        <div class="dataTableContainer">
            <div>
                <div v-if="reverseTeam.length == 0" id="resultAlert">チームにヒーローをセットしてください</div>
                <table v-if="reverseTeam.length > 0" class="dataTable">
                    <tr>
                        <th style="width:135px;">VS {{ targetRankName }}{{ targetTypeName }}</th>
                        <th v-for="(hero, index) in reverseTeam" v-bind:key="index" style="width:115px;">
                            {{hero.name}}
                        </th>
                    </tr>
                    <tr>
                        <th>ヒーローHP</th>
                        <td v-for="(hero, index) in reverseTeam" class="pure">
                            {{hero.status.hp}}
                        </td>
                    </tr>
                    <tr>
                        <th>ブレス</th>
                        <td v-for="(hero, index) in reverseTeam" :class="hero.breathClass">
                            {{hero.breathDamage}}
                        </td>
                    </tr>
                    <tr>
                        <th>基本連撃(1発あたり)</th>
                        <td v-for="(hero, index) in reverseTeam" :class="hero.basicClass">
                            {{hero.basicDamage}}
                        </td>
                    </tr>
                    <tr>
                        <th>頭突き</th>
                        <td v-for="(hero, index) in reverseTeam" :class="hero.headClass">
                            {{hero.headDamage}}
                        </td>
                    </tr>
                    <tr>
                        <th>必要アーマー</th>
                        <td v-for="(hero, index) in reverseTeam" class="pure">
                            {{hero.needArmor}}
                        </td>
                    </tr>
                    <tr>
                        <th>必要魔法防御</th>
                        <td v-for="(hero, index) in reverseTeam" class="pure">
                            {{hero.needMagicDef}}
                        </td>
                    </tr>
                    <tr>
                        <th>第１アーティファクト</th>
                        <td v-for="(hero, index) in reverseTeam" class="pure">
                            <div v-for="(eff, index) in artCheck[index]">
                                <input type="checkbox" :id="hero.id+'_art'" :value="hero.id+'_art'" v-model="checkedValues" v-on:change="onSkillSwitch" />{{ eff }}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>スキル効果</th>
                        <td v-for="(hero, index) in reverseTeam" class="pure">
                            <div v-for="(eff, index) in skillCheck[index]">
                                <input type="checkbox" :id="hero.id+'_skill_'+eff" :value="hero.id+'_skill_'+eff" v-model="checkedValues" v-on:change="onSkillSwitch" />第{{ eff }}スキル
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    `,
    data: function () {
        return {
            childComponent: ``,
            heroList: [],
            reverseTeam: [],
            checkedValues:[],
            skillCheck:[],
            artCheck:[],
            skillData:{},
            artData:{}
        }
    },
    mounted : function(){
        this.update();
    },
    computed :{

    },
    methods: {
        update: function(){    
            //チーム配列をバトルオーダー順でソート
            own_team_array.sort(function(a,b){
                if(a.order<b.order) return -1;
                if(a.order > b.order) return 1;
                return 0;
            });
            this.reverseTeam = own_team_array.slice().reverse();

            // チームの第１アーティファクトとスキル情報を精査
            for(let i in this.reverseTeam){
                // ヒーローID
                let heroID = this.reverseTeam[i]['id'];

                // ヒーロー情報
                let heroInfo = heroList.find((v) => v.id === heroID);

                // 自ヒーロー情報データ
                let getHeroData = myData["own_hero"].find((v) => v.id === heroID);

                // アーティファクトチェック情報
                this.artCheck[i] = [];

                // スキルチェック情報
                this.skillCheck[i] = [];

                // ヒーローの第１アーティファクトID
                let artifactID = artifactList['Id'][heroInfo.Artifacts[0]]["BattleEffect"];

                // アーティファクト
                let afStatus = "";
                let afValue = 0;
                for(let af of artifactList['Battle Effect']){
                    if(af[artifactID]){                       
                        // アーマーか魔法防御の場合だけ取得
                        if(af[artifactID] == "armor" || af[artifactID] == "magicResist"){
                            // 第１アーティファクトのステータス名
                            afStatus = af[artifactID];                            

                            // アーティファクト上昇値
                            afValue = Number(af["level"][getHeroData['artLv'][0]]);

                            // ★倍率
                            let afRate = Number(artifactList["Type"]["book"]["Evolution"][getHeroData['artStar'][0]][0]);

                            // 倍率加算
                            afValue *= afRate;

                            afValue = Math.floor(afValue);

                            // アーティファクトチェック情報
                            let artName = "アーマー";
                            if(af[artifactID] == "magicResist") artName = "魔法防御";

                            this.artData[heroID +"_art"] = {"stat": af[artifactID], "value":afValue}; 
                            this.artCheck[i].push(artName);
                        }
                        break;
                    }
                }                
                // 有効スキル
                if(usefulHero.indexOf(this.reverseTeam[i]['name']) > -1){
                    for(let _index of usefulSkillIndex[this.reverseTeam[i]['name']]){
                        this.skillCheck[i].push(_index);

                        let skillInfo = skillList[heroInfo.Skill[_index]];
                        let skillCodeName =  skillInfo.Behavior.Behavior;                      

                        // スキル効果ステータス
                        let effStatArray = [];
                        // 計算に使うステータス
                        let useStat = "";
                        // バフかデバフか
                        let skillType = "";
                        switch(skillCodeName){
                            case "AntimageDebuff":
                                effStatArray.push("magicPower");
                                useStat = "mgatk";
                                skillType = "debuff";
                                break;
                            case "AntimageBuff":
                                effStatArray.push("magicResist");
                                useStat = "mgatk";
                                skillType = "buff";
                                break;   
                            case "ChainBolt":
                                effStatArray.push("physicalAttack");
                                useStat = "mgatk";
                                skillType = "debuff";
                                break;
                            case "PassiveAllyTeamBuff":
                                effStatArray.push("magicResist");
                                useStat = "";
                                skillType = "buff";
                                break;
                            case "CustomSkill":
                                effStatArray.push("physicalAttack");
                                effStatArray.push("magicPower");
                                useStat = "mgatk";
                                skillType = "debuff";
                                break;   
                            case "PassiveSelfBuff":
                                effStatArray.push("magicResist");
                                useStat = "phatk";
                                skillType = "selfBuff_"+ heroID;
                                break;
                            case "MorriganBoneArmor":
                                effStatArray.push("armor");
                                effStatArray.push("magicResist");
                                useStat = "mgatk";
                                skillType = "eternalBuff";
                                break;
                        }

                        // スキルレベル
                        let skillLevel = getHeroData['skillLevel'][_index-1];
                        if(skillLevel == 0) continue;

                        if(_index == 3) skillLevel += 20;
                        if(_index == 4) skillLevel += 40;

                        // スキル効果値
                        let targetStatus = 0;
                        if(useStat) targetStatus = this.reverseTeam[i].status[useStat];
                        let skillValue = skillInfo.Behavior.Prime[2] * targetStatus + skillLevel * skillInfo.Behavior.Prime[3] + Number(skillInfo.Behavior.Prime[4]);

                        //console.log(skillValue);
                        //console.log(skillInfo.Behavior);
                        //console.log(this.reverseTeam[i].status);

                        this.skillData[heroID +"_skill_"+ _index] = {"stat": effStatArray, "value":skillValue, "type":skillType}; 
                    }
                }
            }

            for(let i in this.reverseTeam){

                let heroID = this.reverseTeam[i]['id'];

                // バフデータ
                let buffData = {"armor":0, "magicResist":0};
                // デバフデータ
                let debuffData = {"physicalAttack":0, "magicPower":0};
                for(let v of this.checkedValues){
                    // アーティファクトの場合
                    if(v.indexOf("_art") > 0){
                        buffData[this.artData[v]["stat"]] += Number(this.artData[v]["value"]);
                    }
                    // スキルの場合
                    else if(v.indexOf("_skill_") > 0){
                        if(this.skillData[v]['type'] == "buff"){
                            for(let _s of this.skillData[v]['stat']){
                                buffData[_s] += Number(this.skillData[v]["value"]);
                            }                            
                        }
                        else if(this.skillData[v]['type'].indexOf("selfBuff_") > -1){
                            if(heroID == this.skillData[v]['type'].split("_")[1]){
                                for(let _s of this.skillData[v]['stat']){
                                    buffData[_s] += Number(this.skillData[v]["value"]);
                                }
                            }
                        }
                        else if(this.skillData[v]['type'] == "eternalBuff"){
                            // ヒーロー情報
                            let heroInfo = heroList.find((v) => v.id === heroID);
                            if(heroInfo["faction"] == "永遠"){
                                for(let _s of this.skillData[v]['stat']){
                                    buffData[_s] += Number(this.skillData[v]["value"]);
                                }
                            } 
                        }
                        else if(this.skillData[v]['type'] == "debuff"){
                            for(let _s of this.skillData[v]['stat']){
                                debuffData[_s] += Number(this.skillData[v]["value"]);
                            }
                        }                        
                    }
                }
                


                let heroInfo = heroList.find((v) => v.id === heroID);

                let statusArray = this.reverseTeam[i]['status'];

                // ヒドラダメージ情報取得
                let hydraInfo = hydraDamageCalc(targetRank, targetType, statusArray, heroInfo, buffData, debuffData);

                this.reverseTeam[i].atkDamage = hydraInfo["atk"];

                this.reverseTeam[i].basicDamage = hydraInfo["basicDamage"];
                this.reverseTeam[i].basicClass = hydraInfo["basicClass"];

                this.reverseTeam[i].headDamage = hydraInfo["headDamage"];
                this.reverseTeam[i].headClass = hydraInfo["headClass"];

                this.reverseTeam[i].breathDamage = hydraInfo["breathDamage"];
                this.reverseTeam[i].breathClass = hydraInfo["breathClass"];

                this.reverseTeam[i].needArmor = hydraInfo["needArmor"];
                this.reverseTeam[i].needMagicDef = hydraInfo["needMagicDef"];
            }

            if($('.hero_custom_modal')){                
                if($('.hero_custom_modal').css('display') == 'block') app.$refs.personal.update();
            }
        },
        onSkillSwitch: function(e){
            this.update();
        }
    }
});

Vue.component('personal-data', {
    template: `                
        <div class="dataTableContainer">
            <div id="personalTableArea">
                <table class="dataTable">
                    <tr>
                        <th style="width:135px;">VS {{ targetRankName }}{{ targetTypeName }}</th>
                        <th style="width:115px;">
                            {{myHeroInfo.name}}
                        </th>
                    </tr>
                    <tr>
                        <th>ヒーローHP</th>
                        <td class="pure">
                            {{myHeroInfo.status.hp}}
                        </td>
                    </tr>
                    <tr>
                        <th>ブレス</th>
                        <td :class="myHeroInfo.breathClass">
                            {{myHeroInfo.breathDamage}}
                        </td>
                    </tr>
                    <tr>
                        <th>基本連撃(1発あたり)</th>
                        <td :class="myHeroInfo.basicClass">
                            {{myHeroInfo.basicDamage}}
                        </td>
                    </tr>
                    <tr>
                        <th>頭突き</th>
                        <td :class="myHeroInfo.headClass">
                            {{myHeroInfo.headDamage}}
                        </td>
                    </tr>
                    <tr>
                        <th>必要アーマー</th>
                        <td class="pure">
                            {{myHeroInfo.needArmor}}
                        </td>
                    </tr>
                    <tr>
                        <th>必要魔法防御</th>
                        <td class="pure">
                            {{myHeroInfo.needMagicDef}}
                        </td>
                    </tr>
                </table>
                <div v-if="isTeamAssign == true" style="margin:16px 0px 0px 0px;">
                    <input id="teamSkillCheck" type="checkbox" v-model="checkedSkill" v-on:change="onSkillSwitch" value="skillCheck" />チームスキル設定反映
                </div>
            </div>
        </div>
        
    `,
    data: function () {
        return {
            myHeroInfo: {"status":{"hp":0}},
            isTeamAssign: false,
            checkedSkill:[]
        }
    },
    mounted : function(){
        this.update();
    },
    computed :{
    },
    methods: {
        update: function(){

            let heroID = nowCustom;

            // チームに組み込まれているかどうか
            if(own_team_array.findIndex((v) => v.id === heroID) > -1) this.isTeamAssign = true;
            else this.isTeamAssign = false;     
            
            //ユーザー情報データ
            let getHeroData = myData["own_hero"];

            if(getHeroData.findIndex((v) => v.id === heroID) < 0) return;

            let heroInfo = heroList.find((v) => v.id === heroID);
            this.myHeroInfo['status'] = statusCalc("own", heroID);
            this.myHeroInfo['name'] = heroInfo['name'];

            // バフデータ
            let buffData = {"armor":0, "magicResist":0};
            // デバフデータ
            let debuffData = {"physicalAttack":0, "magicPower":0};

            if(this.isTeamAssign && this.checkedSkill[0] == "skillCheck"){

                for(let v of app.$refs.result.checkedValues){
                    // アーティファクトの場合
                    if(v.indexOf("_art") > 0){
                        buffData[app.$refs.result.artData[v]["stat"]] += Number(app.$refs.result.artData[v]["value"]);
                    }
                    // スキルの場合
                    else if(v.indexOf("_skill_") > 0){
                        if(app.$refs.result.skillData[v]['type'] == "buff"){
                            for(let _s of app.$refs.result.skillData[v]['stat']){
                                buffData[_s] += Number(app.$refs.result.skillData[v]["value"]);
                            }                            
                        }
                        else if(app.$refs.result.skillData[v]['type'].indexOf("selfBuff_") > -1){
                            if(heroID == app.$refs.result.skillData[v]['type'].split("_")[1]){
                                for(let _s of app.$refs.result.skillData[v]['stat']){
                                    buffData[_s] += Number(app.$refs.result.skillData[v]["value"]);
                                }
                            }
                        }
                        else if(app.$refs.result.skillData[v]['type'] == "eternalBuff"){
                            // ヒーロー情報
                            let heroInfo = heroList.find((v) => v.id === heroID);
                            if(heroInfo["faction"] == "永遠"){
                                for(let _s of app.$refs.result.skillData[v]['stat']){
                                    buffData[_s] += Number(app.$refs.result.skillData[v]["value"]);
                                }
                            } 
                        }
                        else if(app.$refs.result.skillData[v]['type'] == "debuff"){
                            for(let _s of app.$refs.result.skillData[v]['stat']){
                                debuffData[_s] += Number(app.$refs.result.skillData[v]["value"]);
                            }
                        }                        
                    }
                }

            }

            // ヒドラダメージ情報取得
            let hydraInfo = hydraDamageCalc(targetRank, targetType, this.myHeroInfo['status'], heroInfo, buffData, debuffData);

            this.myHeroInfo.atkDamage = hydraInfo["atk"];

            this.myHeroInfo.basicDamage = hydraInfo["basicDamage"];
            this.myHeroInfo.basicClass = hydraInfo["basicClass"];

            this.myHeroInfo.headDamage = hydraInfo["headDamage"];
            this.myHeroInfo.headClass = hydraInfo["headClass"];

            this.myHeroInfo.breathDamage = hydraInfo["breathDamage"];
            this.myHeroInfo.breathClass = hydraInfo["breathClass"];            

            this.myHeroInfo.needArmor = hydraInfo["needArmor"];
            this.myHeroInfo.needMagicDef = hydraInfo["needMagicDef"];

            //this.$set(this.myHeroInfo, "breathClass", hydraInfo["breathClass"]);
            // データ更新
            this.myHeroInfo = Object.assign({}, this.myHeroInfo);
        },
        onSkillSwitch: function(e){
            this.update();
        }
    }
});

let app = new Vue({
    el: '#app'
});


//app.$refs.result.update();