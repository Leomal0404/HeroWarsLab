function copyToEnemy(){
    myData["enemy_hero"] = JSON.parse(JSON.stringify(myData["own_hero"]));
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

function copyToOwn(){
    myData["own_hero"] = JSON.parse(JSON.stringify(myData["enemy_hero"]));
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

function exportData(){
    document.getElementById('dataJSON_modal').style.display = 'block';

    // RSA鍵
    var PassPhrase = "LeomalSimulator";
    var Bits = 1024;
    var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);

    // 公開鍵
    var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);

    // 暗号化
    var PlainText = JSON.stringify(myData["own_hero"]);

    var EncryptionResult = cryptico.encrypt(PlainText, MattsPublicKeyString);

    document.getElementById('dataCodeIndex').innerHTML = '以下の暗号化文字列を共有すると自分のチーム設定を他の人に共有することができます';
    document.getElementById('dataCodeForm').innerHTML = EncryptionResult.cipher;

    document.getElementById('dataCodeButton').style.display = 'none';
}

function importData(){
    document.getElementById('dataJSON_modal').style.display = 'block';

    document.getElementById('dataCodeIndex').innerHTML = 'チーム設定暗号化文字列を読み込みます';
    document.getElementById('dataCodeForm').innerHTML = '<textarea id="dataCodeInput" name="dataCodeInput" rows="18" cols="99"></textarea>';

    document.getElementById('dataCodeButton').style.display = 'block';
}

function importDataHandle(){
    let inputCode = document.getElementById('dataCodeInput').value;

    // RSA鍵
    var PassPhrase = "LeomalSimulator";
    var Bits = 1024;
    var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);

    // 復号化
    let DecryptionResult = cryptico.decrypt(inputCode, MattsRSAkey);

    //データチェック
    let checkJSON;
    try {
        checkJSON = JSON.parse(DecryptionResult.plaintext);
    }
    catch( e ) {
        alert('チームデータが壊れています')
        return;     
    }


    let flag = true;
    if(checkJSON.length > 0){
        if(checkJSON[0]['id'].length > 0){
            flag = true;
        }
        else flag = false;
    }
    else flag = false;

    if(flag == false){
        alert('チームデータが壊れています')
        return;
    }

    myData["own_titan"] = JSON.parse(DecryptionResult.plaintext);
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

    document.getElementById('dataJSON_modal').style.display = 'none';
}
