//ローカルストレージ更新
function storageUpdate(){
    let saveData = JSON.stringify(myData);
    localStorage.setItem("heroData", saveData);
    ajaxSave("heroData", saveData);
}

//Ajax通信
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
    localStorage.setItem("heroUtility", JSON.stringify(myUtility));
}

function saveCustom(slot){

    //let _data = Object.assign({}, myData[nowActive +"_titan"]);
    let _data = Array.from(myData[nowActive +"_hero"]);
    
    localStorage.setItem(slot +"_"+ nowActive +"Hero", JSON.stringify(_data));
    ajaxSave(slot +"_"+ nowActive, JSON.stringify(_data));

    eval(nowActive +'CustomArray')[slot] = JSON.stringify(_data);

    formBuild();
}

function loadCustom(slot){
    myData[nowActive +"_hero"] = JSON.parse(eval(nowActive +'CustomArray')[slot]);
    
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
    
    localStorage.setItem("saveHeroNameData", saveNameData);
    ajaxSave("saveNameData", saveNameData);
}