//---------------------------------------------
// 定数定義
//---------------------------------------------
// 保存を行うプログラムがあるURL
const SAVE_URL = 'https://aille.net/HeroWars/hydraAssign/receive.php';

// 画像が保存されているURL
const IMAGE_URL = 'https://aille.net/HeroWars/hydraAssign/img';

let s_img = new Image();
s_img.src = './img/common/sphere.png';
let p_img = new Image();
p_img.src = './img/common/powder.png';

let viewMode = "PLAN";

let cellWidth = 80;
let cellHeight = 20;

let borderColor = "black";
let headerCellColor = "rgba(55, 55, 55, 1)";

let typeArray = ["header", "dark", "water", "earth", "light", "wind", "fire"];

let rankList = ["common","elder","ancient","dreadful","legend"];
let rankName = ["コモン", "エルダー", "エンシェント", "ドレッドフル", "レジェンド"];

let typeList = ["dark", "water", "earth", "light", "wind", "fire"];
let typeNameList = ["闇", "水", "土", "光", "風", "炎"];

let hydraCode = {"コモン":"common","エルダー":"elder", "エンシェント":"ancient", "ドレッドフル":"dreadful", "レジェンド":"legend"};
let hydraRankName = {"common":"コモン","elder":"エルダー", "ancient":"エンシェント", "dreadful":"ドレッドフル", "legend":"レジェンド"};


let typeNameArray = {
  "dark":"闇",
  "water":"水", 
  "earth":"土", 
  "light":"光", 
  "wind":"風", 
  "fire":"炎"
}
let typeCellColorArray = {
  "header":headerCellColor,
  "dark":"rgba(109, 0, 172, 1)",
  "water":"rgba(77, 215, 255, 1)", 
  "earth":"rgba(18, 119, 7, 1)", 
  "light":"rgba(245, 255, 128, 1)", 
  "wind":"rgba(125, 225, 189, 1)", 
  "fire":"rgba(168, 0, 0, 1)"
};
let typeFontColorArray = {
  "dark":"rgba(255, 255, 255, 1)",
  "water":"rgba(0, 0, 0, 1)", 
  "earth":"rgba(255, 255, 255, 1)",
  "light":"rgba(0, 0, 0, 1)", 
  "wind":"rgba(0, 0, 0, 1)", 
  "fire":"rgba(255, 255, 255, 1)"
};

let hydraHealth = {
  "common":5946906,
  "elder":17699730,
  "ancient":54533157,
  "dreadful":106981939,
  "legend":220606896
}

let powderList = {
  "common":[25, 35, 45, 50, 65, 80],
  "elder":[40, 50, 65, 85, 100, 130],
  "ancient":[70, 85, 110, 145, 170, 210],
  "dreadful":[150, 190, 240, 300, 370, 470],
  "legend":[360, 450, 570, 710, 890, 1110]
}
let sphereList = {
  "common":[0, 0, 0, 0, 0, 1],
  "elder":[0, 0, 0, 0, 1, 2],
  "ancient":[0, 0, 0, 1, 1, 2],
  "dreadful":[0, 0, 1, 1, 2, 3],
  "legend":[0, 1, 2, 3, 4, 6]
}



let headerFontColor = "rgba(255, 255, 255, 1)";

let completeColor = "#eab6ff";

let damageRank = 'common';

//---------------------------------------------
// オブジェクト
//---------------------------------------------
const Banner = {
  bgcolor: "#FFFFFF",  // 背景色
  font: "12px sans-serif",  // フォント
  fontcolor: "Black",   // 文字色
  text: "Hello World", // テキスト
  textBaseline : "top",
  // Canvas情報
  canvas: {
    width: null,   // 横幅
    height: null,  // 高さ
    ctx: null      // context
  }
}

let modal;
let buttonClose;
addEventListener('click', outsideClose);

//---------------------------------------------
// [event] ページ読み込み完了
//---------------------------------------------
function onload(){

  damageListBuild();

  //プラン配列の整理
  for(let _r in guildData["guild"]["plan"]){
    for(let _t in guildData["guild"]["plan"][_r]){
      squeeze(guildData["guild"]["plan"][_r][_t]);
    }
  }

  //設定日付用のセレクトオプション作成
  let date = new Date();
  if( date.getHours() < 11) date.setDate(date.getDate() - 1);
  
  let _select = document.getElementById("planDate");

  for(let i = 0; i < 15; i++){
    let _date = new Date();
    _date.setDate(date.getDate() - ( i - 1) );

    let _y = _date.getFullYear();
    let _m = (_date.getMonth() + 1);
    let _d = _date.getDate();

    let _value = String(_y) + ("0" + _m).slice(-2) + ("0" + _d).slice(-2);
    
    let _text = _y +"/"+ ("0" + _m).slice(-2) +"/"+ ("0" + _d).slice(-2);
    if(i == 1){
      _text = "現在日：" + _text;
      nowTargetDate = _text +"_"+ _value;
    }

    let option = document.createElement("option");
    option.text = _text;
    option.value = _value; 
    _select.appendChild(option);
  }

  _select.selectedIndex = 1;

  const message   = document.querySelector("#txt-message");  // テキストボックス
  const colorText = document.querySelector("#color-text");   // 文字色
  const colorBg   = document.querySelector("#color-bg");     // 背景色
  
  // Canvasの情報を代入
  const board = document.querySelector("#board");

  // const board = document.createElement("canvas");
  // board.width = 1140;
  // board.height = 640;

  Banner.canvas.ctx    = board.getContext("2d");
  Banner.canvas.width  = board.width;   // 横幅
  Banner.canvas.height = board.height;  // 高さ

  //一定時間ごとに最新データを確認する
  setInterval(checkUpdate, 2000);

  tableBuild();

  //Canvasに最初の文字を描画
  drawCanvas();

  //---------------------------------------------
  // ユーザーの入力があればCanvasを更新する
  //---------------------------------------------
  // 文字入力
  // message.addEventListener("keyup", ()=>{
  //   Banner.text = message.value;
  //   drawCanvas();
  // });

  // 文字色の変更
  // colorText.addEventListener("change", ()=>{
  //   Banner.fontcolor = colorText.value;
  //   drawCanvas();
  // });

  // 背景色の変更
  // colorBg.addEventListener("change", ()=>{
  //   Banner.bgcolor = colorBg.value;
  //   drawCanvas();
  // })

  // submitイベントが発生したらキャンセル
  document.querySelector("#frm").addEventListener("submit", (e)=>{
    e.preventDefault();
  });

  //---------------------------------------------
  // プラン反映ボタンが押されたらサーバへ送信する
  //---------------------------------------------
  document.querySelector("#btn-send").addEventListener("click", ()=>{

    tableBuild();
    drawCanvas();

    //設定日付
    let _idx = _select.selectedIndex;
    let _value = _select.options[_idx].value;
    let _text = _select.options[_idx].text;
  
    let _settingDate = _text +"_"+ _value;

    let _dateText = _settingDate.split("_")[0];
    let _dateCode = _settingDate.split("_")[1];
    let _new = "true";
    if(_dateText.indexOf("現在日：") != 0) _new = "false";

    nowTargetDate = _settingDate;

    // Canvasのデータを取得
    const canvas = board.toDataURL("image/png");  // DataURI Schemaが返却される

    // 送信情報の設定
    const param  = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({data:canvas, id:certName, dateCode:_dateCode, new:_new})
    };

    // サーバへ送信
    sendServer(SAVE_URL, param);
    ajaxBackup(JSON.stringify(guildData));
    
    modalClose();
  });

  //---------------------------------------------
  // リセットボタン
  //---------------------------------------------
  document.querySelector("#btn-clear").addEventListener("click", ()=>{
    guildData["guild"]["complete"] = {"common_dark":"false", "common_water":"false"};
    guildData["guild"]["plan"] = {"common":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"elder":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"ancient":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"dreadful":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]},"legend":{"dark":[],"water":[],"earth":[],"light":[],"wind":[],"fire":[]}};

    tableBuild();
    drawCanvas();
  });

  //---------------------------------------------
  // 履歴ボタン
  //---------------------------------------------
  document.querySelector("#btn-log").addEventListener("click", ()=>{
    if(viewMode == "PLAN"){
      viewMode = "LOG";
      document.querySelector("#btn-log").textContent = '入力に戻る';

      getLogList();
    }
    else if(viewMode == "LOG"){
      viewMode = "PLAN";
      document.querySelector("#btn-log").textContent = '履歴一覧';

      tableBuild();
    }
  });

  //モーダルウィンドウ関連
  modal = document.getElementById('planModalBox');
  buttonClose = document.getElementsByClassName('plan_modalClose')[0];
  buttonClose.addEventListener('click', modalClose);
}

//設定日の変更
function settingDateChange(_select){
  let _idx = _select.selectedIndex;
  let _value = _select.options[_idx].value;
  let _text = _select.options[_idx].text;
  
  //nowTargetDate = _text +"_"+ _value;
}

//メンバー追加ボタン
function addMember(){
  let mName = document.getElementById('addNameBox').value;

  //重複確認
  for(let i in guildData["guild"]["members"]){
    if(guildData["guild"]["members"][i]['name'] == mName){
      alert("その名前はすでに登録されています。");
      return;
    }
  }

  let memberInfo = {"name":mName,"rank":""};
  guildData["guild"]["members"].push(memberInfo);

  guildData["guild"]["members"].sort(function(a,b){
    if(a.name<b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
  });

  ajaxSave(JSON.stringify(guildData));

  tableBuild();

  drawCanvas();
}

//メンバー除去ボタン
function removeMember(e){
  let removeName = e.id;
  if (window.confirm(removeName +'をメンバーから削除してもよろしいですか？')) {    

    //メンバーリストから除去
    for(let i in guildData["guild"]["members"]){
      if(guildData["guild"]["members"][i]['name'] == removeName){
        guildData["guild"]["members"].splice(i, 1);
        break;
      }
    }

    //プランリストから除去
    for(let rank in guildData["guild"]["plan"]){
      for(let type in guildData["guild"]["plan"][rank]){
        let count = guildData["guild"]["plan"][rank][type].length;
        for(let m = (count-1); m >= 0; m--){
          
          if(guildData["guild"]["plan"][rank][type][m] == removeName){
            
            guildData["guild"]["plan"][rank][type].splice(m, 1);
          }
        }
      }
    }

    ajaxSave(JSON.stringify(guildData));

    tableBuild();

    drawCanvas();
  }
}

//メンバー任命プルダウン
function assignMember(e){
  //メンバー名
  let idx = e.selectedIndex;
  let member = e.options[idx].value;

  //担当ヒドラ名＆順序
  let value = e.id;
  
  let part = value.split("_");

  let hydraRank = part[0];
  let hydraType = part[1];
  let battleOrder = (Number(part[2]) - 1);

  if(member == "none") guildData["guild"]["plan"][hydraRank][hydraType][Number(battleOrder)] = null;
  else guildData["guild"]["plan"][hydraRank][hydraType][Number(battleOrder)] = member;

  squeeze(guildData["guild"]["plan"][hydraRank][hydraType]);

  ajaxSave(JSON.stringify(guildData));

  tableBuild();

  drawCanvas();
}

//討伐完了チェック
function checkComplete(e){
  if(e.checked) guildData["guild"]['complete'][e.name] = "true";
  else guildData["guild"]['complete'][e.name] = "false";

  ajaxSave(JSON.stringify(guildData));

  tableBuild();

  drawCanvas();
}

//テーブル構築
function tableBuild(){

  document.getElementById("nowEditDate").innerHTML = nowTargetDate.split("_")[0] + "（編集中）";
  

  let memNameCellWidth = 150;
  let assignCellWidth = 110;
  let tableWidth = assignCellWidth * 6 + memNameCellWidth + 80;

  //メンバーリスト生成
  let memberTable = '<div><table class="memberListTable" width="'+ tableWidth +'">';
  memberTable += '<tr><th rowspan="2" width="'+ memNameCellWidth +'">メンバー名</th><th width="80" rowspan="2">操作</th>';
  memberTable += '<th colspan="6">';
  memberTable += '<select onchange="damageRankChange(this);">';
  for(let _rn = 0; _rn < rankName.length; _rn++){
    let _selected = "";
    if(rankList[_rn] == damageRank) _selected = ' selected';
    memberTable += '<option value="'+ rankList[_rn] +'"'+ _selected +'>'+ rankName[_rn] +'</option>';
  }
  memberTable += '</select></th></tr>';

  memberTable += '<tr>';
  for(let _ht = 0; _ht < typeNameList.length; _ht++){
      memberTable += '<th width="'+ assignCellWidth +'">'+ typeNameList[_ht] +'</th>';
  } 
  memberTable += '</tr></table></div>';
  
  memberTable += '<div class="memberListTableBox"><table class="memberListTable" width="'+ tableWidth +'">';
  memberTable += '<tr><td width="'+ memNameCellWidth +'" class="assignBaseCell"><input id="addNameBox" type="text" name="mName" style="width:90px;"></td><td width="80" class="assignBaseCell"><button type="button" id="btn-member-add" onclick="addMember();">追加</button></td>';
  memberTable += '<td colspan="6" class="assignBaseCell">';
  
  memberTable += hydraRankName[damageRank] +"ヒドラHP：<b>"+ Math.ceil(hydraHealth[damageRank]/1000).toLocaleString() +"</b>";

  memberTable += '&nbsp;K ※ダメージは1K(1,000)単位で入力</td></tr>';

  //メンバーのダメージ値をいったん集計
  let damageList = [];
  guildData["guild"]["members"].forEach(function(element, index){
    if(!element['damages']) damageListBuild();

    let _name = element['name'];
    let _values = 0;
    let valueArray = {};

    for(let _ht = 0; _ht < typeList.length; _ht++){
      valueArray[typeList[_ht]] = 0;
      if(element['damages'][damageRank +"_"+ typeList[_ht]]){
        _values += Number(element['damages'][damageRank +"_"+ typeList[_ht]]);
        valueArray[typeList[_ht]] = element['damages'][damageRank +"_"+ typeList[_ht]];
      }
    }
    let _info = {"name":_name, "value":_values, "damages":valueArray};
    
    damageList.push(_info);
  });

  //ダメージ値でソート
  damageList.sort(function(a, b) {
    if (a["value"] < b["value"]) {
        return 1;                                
      } else {
        return -1;
      }
  });

  //メンバー一覧
  let memberCount = 0;
  damageList.forEach(function(element, index){

    let cellStyle = "assignBaseCell";
    if(memberCount % 2 == 0) cellStyle = "assignSubCell";

      memberTable += '<tr><td class="'+ cellStyle +'">'+ element["name"] +'</td><td class="'+ cellStyle +'"><button type="button" onclick="removeMember(this);" id="'+ element["name"] +'">削除</button></td>';
      
      for(let _ht = 0; _ht < typeList.length; _ht++){

        let _damageValue = 0;
        if(element['damages'][typeList[_ht]]) _damageValue = element['damages'][typeList[_ht]];

        memberTable += '<td class="'+ cellStyle +'">';
        let boxName = element["name"] +"_"+ damageRank +"_"+ typeList[_ht];
        memberTable += '<input id="'+ boxName +'" name="'+ boxName +'" type="text" style="width:90px;" value="'+
        _damageValue +'" onchange="damageInput(this);">';
        memberTable += '</td>';
      } 

      memberTable += '</tr>';

      memberCount++;
  });
  memberTable += '</table></div>';

  document.getElementById('memberArea').innerHTML = memberTable;



  let planTable = "";

  //プラン入力テーブル
  if(viewMode == "PLAN"){

    let nowRank = 0;
    let nowCode = "common";
    let nowTurn = 1;

    for(let i = 0; i < 4; i++){
      planTable += '<div class="assignTableContainer">';
      planTable += '<table class="assignTable" style="width:1350px;">';
      for(let j = 0; j < 7; j++){
        
        planTable += '<tr>';

        let _text = "";
        for(let k = 0; k < 15; k++){
          //テーブル１行目
          if(j == 0){
            if(k == 0 || (k == 7 && i == 0)){
              _text = rankName[nowRank];
              nowRank++;
            }
            else if(i == 0 && k > 7){
              _text = k - 7;
            }
            else if(k > 0){
              _text = k;
            }
            else{
              _text = "";
            }
            planTable += '<th style="width:90px;background-color:'+ headerCellColor +';">'+ _text +'</th>';
          }
          //テーブル２行目以降
          else{
            let bgColor = "#ffffff";
            let fontColor = "#000000";

            if(i == 0 && k < 7) nowCode = hydraCode[rankName[nowRank-2]];
            else nowCode = hydraCode[rankName[nowRank-1]];

            if(k == 0 || (i == 0 && k == 7)){

              //ヒドラ属性討伐チェックボックス
              let checked = "";
              if(guildData["guild"]['complete'][nowCode +"_"+ typeArray[j]] == "true") checked = " checked";
              _text = '<input onchange="checkComplete(this);" type="checkbox" name="'+ nowCode +"_"+ typeArray[j] +'"'+ checked +'>'+ typeNameArray[typeArray[j]];

              //ヒドラ属性見出し
              bgColor = typeCellColorArray[typeArray[j]];
              fontColor = typeFontColorArray[typeArray[j]];

              planTable += '<td style="width:90px;padding:0px 0px 0px 16px;text-align:left;color:'+ fontColor +';background-color:'+ bgColor +';">'+ _text +'</td>';
            }
            else{
              //メンバープルダウン
              if(i == 0 && k > 7){
                nowTurn = k - 7;
              }
              else if(k > 0){
                nowTurn = k;
              }
              _text = '<select onchange="assignMember(this);" name="'+ nowCode +"_"+ typeArray[j] +"_"+ nowTurn +'" id="'+ nowCode +"_"+ typeArray[j] +"_"+ nowTurn +'">';
              _text += '<option value="none"></option>';
              guildData["guild"]["members"].forEach(function(element, index){
                let selected = "";
                if(guildData["guild"]["plan"][nowCode][typeArray[j]][(nowTurn-1)] == element["name"]) selected = " selected";
                _text += '<option value="'+ element["name"] +'"'+ selected +'>'+ element["name"] +'</option>';
              });
              
              _text += "</select>";

              if(guildData["guild"]['complete'][nowCode +"_"+ typeArray[j]] == "true") bgColor = completeColor;

              planTable += '<td width="85" style="color:'+ fontColor +';background-color:'+ bgColor +';">'+ _text +'</td>';
            }
            
          }        
        }

        planTable += '</tr>';
      }    
      planTable += '</table>';
      planTable += '</div>';
    }

  }
  // 履歴一覧
  else if(viewMode == "LOG"){
    planTable += '<table class="logTable">';

    planTable += '<tr><th rowspan="2">日付</th><th rowspan="2">編集</th><th rowspan="2">プラン</th><th rowspan="2">メンバー人数</th><th rowspan="2">攻撃参加人数</th><th rowspan="2">召喚ホーン総使用数</th><th rowspan="2">ゴールドホーン</th><th rowspan="2">スフィア獲得</th><th rowspan="2">妖精の粉獲得</th><th colspan="7">コモン</th><th colspan="7">エルダー</th><th colspan="7">エンシェント</th><th colspan="7">ドレッドフル</th><th colspan="7">レジェンド</th></tr>';

    planTable += '<tr>';
    for(let _r = 0; _r < 5; _r++){
      for(let _t of typeNameList){
        planTable += '<th>'+ _t +'</th>';
      }
      planTable += '<th>計</th>';
    }
    planTable += '</tr>';
    

    //logDataList.forEach(function(element, index){
    for(let index = 0; index < 10; index++){
      let element = logDataList[index];
      planTable += '<tr>';

      let dayWeek = getDayWeek(Number(element["year"]), Number(element["month"]), Number(element["day"]));
      planTable += '<td>'+ element["year"] +"/"+ element["month"] +"/"+ element["day"] +'('+ dayWeek[0] +')</td>';
      planTable += '<td><button type="button" onclick="editTable('+ "'"+ element["year"] +"/"+ element["month"] +"/"+ element["day"] +"','"+ element["year"] + element["month"] + element["day"] +"'"+ ');">編集</button></td>';
      //planTable += '<td><a href="https://aille.net/HeroWars/hydraAssign/img/'+ certName +"/"+ certName +"_"+ element["year"] + element["month"] + element["day"] +'.png?'+ Date.now() +"0"+'" target="_blank">情報</a></td>';
      planTable += '<td><a href="https://aille.net/HeroWars/hydraAssign/?mode=info&query='+ certName +"_"+ element["year"] +"_"+ element["month"] +"_"+ element["day"] +'" target="_blank">情報</a></td>';
      planTable += '<td>'+ element["memberNum"] +'</td>';
      planTable += '<td>'+ element["attackMemberCount"] +'</td>';
      planTable += '<td>'+ element["attack_count"] +'</td>';
      planTable += '<td>'+ element["horn_count"] +'</td>';

      let _index = 0;
      //エレメントスフィア獲得数
      let sphereCount = 0;
      //妖精の粉獲得数
      let powderCount = 0;

      for(let _r of rankList){

        let defCount = 0;

        for(let _t of typeList){
          let _info = element["turns"][_index];
          let _infoArray = _info.split("_");

          if(_infoArray[3] == "true"){
            //エレメントスフィア獲得数
            powderCount += powderList[_infoArray[0]][defCount];
            
            //妖精の粉獲得数
            sphereCount += sphereList[_infoArray[0]][defCount];

            defCount++;
          }

          _index++;
        }
      }

      planTable += '<td>'+ sphereCount +'</td>';
      planTable += '<td>'+ powderCount +'</td>';

      _index = 0;
      for(let _r of rankList){

        let turnSum = 0;

        for(let _t of typeList){
          let _info = element["turns"][_index];

          let _infoArray = _info.split("_");

          let _bold = "";
          let _boldE = "";
          let _color = "";

          let _c = _infoArray[1];
          if(_infoArray[3] == "true"){
            _bold = "<b>";
            _boldE = "</b>";

            if(_c == "dark" || _c == "earth" || _c == "fire") _color = " style='color:white;background-color:"+ typeCellColorArray[_infoArray[1]] +"'"; 
            else _color = " style='background-color:"+ typeCellColorArray[_infoArray[1]] +"'";
          }

          turnSum += Number(_infoArray[2]);
          planTable += '<td'+ _color +'>'+ _bold + _infoArray[2] + _boldE +'</td>';

          _index++;
        }

        planTable += '<td class="assignSumCell">'+ turnSum +'</td>';
      }

      planTable += '</tr>';
    }

    planTable += '</table>';
  }

  document.getElementById('planArea').innerHTML = planTable;
}

// Canvasテーブル描画
function drawCanvas(){
  ctx    = Banner.canvas.ctx;
  width  = Banner.canvas.width;
  height = Banner.canvas.height;

  // Canvasをお掃除
  ctx.clearRect(0, 0, width, height);

  // 背景を指定色で塗りつぶす
  ctx.fillStyle = Banner.bgcolor;
  ctx.fillRect(0, 0, width, height);

  let topMargin = 10;
  let leftMargin = 10;

  let nowRank = 0;
  let nowCode = "common";
  let nowTurn = 1;

  let memberAssign = {};
  let hornCount = 0;
  let turnCount = 0;

  let topPos = 0;

  let defCountList = {"common":0, "elder":0, "ancient":0, "dreadful":0, "legend":0};

  //4テーブル作成
  for(let i = 0; i < 4; i++){
    //ヘッダ+６属性の７行
    for(let j = 0; j < 7; j++){
      
      topPos = (topMargin * (i+1)) + (cellHeight * 7 * i) + (cellHeight * j);

      let _text = "";
      //１４列
      for(let k = 0; k < 15; k++){

        let leftPos = leftMargin + (cellWidth * k);

        //テーブル１行目ヘッダ
        if(j == 0){
          if(k == 0 || (k == 7 && i == 0)){
            _text = rankName[nowRank];
            nowRank++;
          }
          //エルダーおよびコモンのターン数ヘッダ
          else if(i == 0 && k > 7) _text = k - 7;
          //ターン数ヘッダ
          else if(k > 0) _text = k;
          else _text = "";

          //ヘッダセル描画
          DrawCell(ctx, leftPos, topPos, cellWidth, cellHeight, borderColor, headerCellColor, _text, "white");
        }
        //テーブル２行目以降
        else{
          let bgColor = "#ffffff";
          let fontColor = "#000000";

          let hydraType = typeArray[j];

          //担当メンバー
          if(i == 0 && k < 7) nowCode = hydraCode[rankName[nowRank-2]];
          else nowCode = hydraCode[rankName[nowRank-1]];

          if(k == 0 || (i == 0 && k == 7)){
            _text = typeNameArray[typeArray[j]];

            bgColor = typeCellColorArray[typeArray[j]];
            fontColor = typeFontColorArray[typeArray[j]];

            if(guildData["guild"]['complete'][nowCode +"_"+ hydraType] == "true") defCountList[nowCode]++;
          }
          else{
            if(i == 0 && k > 7) nowTurn = k - 8;
            else if(k > 0) nowTurn = k - 1;

            if(guildData["guild"]["plan"][nowCode][hydraType][nowTurn]){
              //アサインされているメンバー
              _text = guildData["guild"]["plan"][nowCode][hydraType][nowTurn];

              if(!memberAssign[_text]) memberAssign[_text] = 1;
              else memberAssign[_text]++;

              turnCount++;

              if(memberAssign[_text] > 3){
                fontColor = "#aa0000";
                _text += "("+ (memberAssign[_text] - 3) +")";
                hornCount++;
              }
            }
            else _text = "";

            //討伐したかどうか
            if(guildData["guild"]['complete'][nowCode +"_"+ hydraType] == "true") bgColor = completeColor;
          }

          //セル描画
          DrawCell(ctx, leftPos, topPos, cellWidth, cellHeight, borderColor, bgColor, _text, fontColor);
        }
      }
    }
  }

  //戦利品カウント
  let sphereCount = 0;
  let powderCount = 0;
  for(let key in defCountList){
    
    for(let _d = 0; _d < defCountList[key]; _d++){
      powderCount += powderList[key][_d];
      sphereCount += sphereList[key][_d];
    }
  }

  DrawText(ctx, leftMargin, topPos + 30, width, cellHeight, "■参加人数："+ Object.keys(memberAssign).length +"/"+ guildData["guild"]["members"].length +"人　　■召喚ホーン総使用数："+ turnCount +"　　■ゴールドホーン使用数："+ hornCount);

  ctx.drawImage(s_img, leftMargin + 515, topPos + 30);
  ctx.drawImage(p_img, leftMargin + 675, topPos + 30);
  DrawText(ctx, leftMargin + 540, topPos + 30, width, cellHeight, "スフィア獲得数："+ sphereCount);
  DrawText(ctx, leftMargin + 700, topPos + 30, width, cellHeight, "妖精の粉獲得数："+ powderCount);


  //設定日付の刻印
  let _dateText = nowTargetDate.split("_")[0];
  if(_dateText.indexOf("現在日：") == 0) _dateText = _dateText.replace( "現在日：", "" );

  DrawDateText(ctx, width - 20, 610, width, cellHeight, _dateText);

}

function DrawCell(target, _x, _y, _w, _h, lColor, bColor, text=null, tColor=null){
  target.beginPath();
  target.rect(_x, _y, _w, _h);
  target.strokeStyle = lColor;
  target.stroke();

  target.fillStyle = bColor;

  target.fill();
  target.closePath();

  // 文字を描画
  if(text && tColor){
    target.textBaseline = "top";
    target.textAlign = "center";
    target.font = Banner.font;
    target.fillStyle = tColor;
    target.fillText(text, _x + (_w/2), _y + 2, (_w-10));
  }
}

function DrawText(target, _x, _y, _w, _h, text, _align="left"){
  target.textBaseline = "top";
  target.textAlign = _align;
  target.font = "bold 12px sans-serif";
  target.fillStyle = "#000000";
  target.fillText(text, _x, _y + 2, (_w-10));
}

function DrawDateText(target, _x, _y, _w, _h, text){
  let dateArray = text.split("/");
  let weekInfo = getDayWeek(dateArray[0], dateArray[1], dateArray[2]);

  let weekDay = weekInfo[0];
  let weekColor = weekInfo[1];

  target.beginPath();
  target.rect(_x - 150, _y - 3, 160, _h + 6);

  target.strokeStyle = "#000000";
  target.stroke();

  target.fillStyle = weekColor;

  target.fill();
  target.closePath();


  target.textBaseline = "top";
  target.textAlign = "right";
  target.font = "bold 16px sans-serif";

  let _dateText = text +" ("+ weekDay +")";

  let def_lineWidth = target.lineWidth
  let def_lineJoin = target.lineJoin
  let def_miterLimit = target.miterLimit
  target.lineWidth = "4";
  target.lineJoin = "miter";
  target.miterLimit = "5";
  target.strokeStyle = "#1a1a1a";
  target.strokeText(_dateText, _x + 3, _y + 2, (_w-10));

  target.fillStyle = "#ffffff";
  target.fillText(_dateText, _x + 3, _y + 2, (_w-10));

  target.lineWidth = def_lineWidth;
  target.lineJoin = def_lineJoin;
  target.miterLimit = def_miterLimit;
}

function getDayWeek(_y, _m, _d){
  //曜日カラー
  let weekColor = ['#ff3a3a','#dc4eff','#ffb74f','#4ff9ff','#60f72c','#ebff44','#4fa2ff'];
  // Dateオブジェクトには実際の月-1の値を指定
  let jsMonth = _m - 1 ;
  // Dateオブジェクトは曜日情報を0から6の数値で保持
  let dayOfWeekStrJP = [ "日", "月", "火", "水", "木", "金", "土" ] ;
  // 指定日付で初期化したDateオブジェクトのインスタンスを生成
  let date = new Date( _y, jsMonth , _d );
  // 出力
  return [dayOfWeekStrJP[date.getDay()], weekColor[date.getDay()]];
}

//ダメージ登録関連
function damageRankChange(_select){
  let _idx = _select.selectedIndex;
  let _value = _select.options[_idx].value;

  damageRank = _value;
  tableBuild();
}

function damageInput(input){
  let _target = input.name;
  let _value = input.value;

  let _targetInfo = _target.split("_");

  let _name = _targetInfo[0];
  let _hydra = _targetInfo[1] +"_"+ _targetInfo[2];


  for(let _m in guildData["guild"]["members"]){
    if(guildData["guild"]["members"][_m]["name"] == _name){

      if(Array.isArray(guildData["guild"]["members"][_m]['damages'])) guildData["guild"]["members"][_m]['damages'] = {};
      guildData["guild"]["members"][_m]['damages'][_hydra] = _value;
      break;
    }
  }
  ajaxSave(JSON.stringify(guildData));
}

//ダメージリストの空白を埋める
function damageListBuild(){
  //メンバーのダメージ値配列
  for(let _m in guildData["guild"]["members"]){
    if(!guildData["guild"]["members"][_m]["damages"]){
      guildData["guild"]["members"][_m]["damages"] = {};
      for(let _hr in rankList){
        for(let _ht in typeList){
          guildData["guild"]["members"][_m]["damages"][rankList[_hr]+"_"+typeList[_ht]] = undefined;
        }
      }
    }
  }
}

//履歴編集
function editTable(dateText, dateCode){
  if(certName != "NULL"){
    $.ajax({
      type: "POST",
      data: {'name':certName, 'timestamp':timeStamp, 'mode':"targetDateEdit", 'target':dateCode, 'dateText':dateText},
      scriptCharset: 'utf-8',
      url: "updateCheck.php",
      dataType : "json"
    })
    .then(
      function(param){
          if(param.data != ""){
            console.log("EXTERNAL UPDATE");
            //console.log("元："+guildData);
            guildData = JSON.parse(param.data);
            timeStamp = param.timestamp;
            nowTargetDate = param.dateText +"_"+ param.dateCode;
            //console.log(guildData);

            viewMode = "PLAN";
            document.querySelector("#btn-log").textContent = '履歴一覧';

            tableBuild();
            drawCanvas();
          }
      },
      function(XMLHttpRequest, textStatus, errorThrown){
          console.log(XMLHttpRequest);
    });
  }
}

/**
 * サーバへJSON送信
 *
 * @param url   {string} 送信先URL
 * @param param {object} fetchオプション
 */
function sendServer(url, param){
  fetch(url, param)
    .then((response)=>{
      return response.json();
    })
    .then((json)=>{
      if(json.status){
        let link = "https://aille.net/HeroWars/hydraAssign/img/"+ certName +"/"+ certName +"_"+ json.dateCode +".png?"+ Date.now() +"0";
        document.getElementById('imageURL').innerHTML = '<a href="'+ link +'" target="_blank">'+ link +'</a>';
        alert("プラン更新しました");
        //setImage(json.result);    //json.resultにはファイル名が入っている
      }
      else{
        alert("送信に『失敗』しました");
        console.log(`[error1] ${json.result}`);
      }
    })
    .catch((error)=>{
      alert("送信に『失敗』しました");
      console.log(`[error2] ${error}`);
    });
}

/**
 * サーバ上の画像を表示する
 *
 * @param path {string} 画像のURL
 * @return void
 */
function setImage(path){
  const url = `${IMAGE_URL}/${path}`;
  const result = document.querySelector("#result");
  const li = document.createElement("li");
  li.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer"><img src="${url}" class="saveimage"></a>`;
  result.insertBefore(li, result.firstChild);
}


function ajaxSave(data){
  if(certName != "NULL"){
      //設定日付の取得
      //let _dateText = nowTargetDate.split("_")[0];
      let _dateCode = nowTargetDate.split("_")[1];

      $.ajax({
          type: "POST",
          url: "ajaxSave.php",
          data: { 'sendData':data, 'name':certName, 'dateCode':_dateCode },
          dataType : "json",
          scriptCharset: 'utf-8'
      })
      .then(
          function(param){
            timeStamp = param.timestamp;
          },
          function(XMLHttpRequest, textStatus, errorThrown){
              console.log(XMLHttpRequest);
      });
  }
}

function ajaxBackup(data){
  if(certName != "NULL"){

    let _dateCode = nowTargetDate.split("_")[1];
    
    $.ajax({
        type: "POST",
        url: "ajaxBackup.php",
        data: { 'sendData': data, 'name': certName, 'dateCode':_dateCode},
        dataType : "json",
        scriptCharset: 'utf-8'
    })
    .then(
        function(param){
          timeStamp = param.timestamp;
        },
        function(XMLHttpRequest, textStatus, errorThrown){
            console.log(XMLHttpRequest);
    });
  }
}


function squeeze(array, centerIndex, emptyElement){
  if (!Array.isArray(array)) 
      return false;
  if (centerIndex == null || !Object.isNumber(centerIndex)) 
      centerIndex = 0;
  if (emptyElement == undefined) 
      emptyElement = null;
  
  /*
   * 配列の隙間を詰めるアルゴリズム
   * 参考 https://www.geocities.jp/oldbig_ancient/KodaiHP3.htm
   *
   * 基準点を中心として、正の方向と負の方向のチェックをする
   */
  //正の方向に対するチェック
  var pointer = centerIndex; //配列要素の移動先
  for (var i = centerIndex; i < array.length; i++) {
      var currentCell = array[i];
      if (i != pointer && currentCell != emptyElement) {
          array[pointer] = currentCell;
          array[i] = emptyElement;
      }
      if (array[pointer] != emptyElement) { //空っぽじゃなくなったら次に進む
          pointer++;
      }
  }
  //負の方向に対するチェック
  var pointer = centerIndex; //配列要素の移動先
  for (var i = centerIndex; 0 <= i; i--) {
      var currentCell = array[i];
      if (i != pointer && currentCell != emptyElement) {
          array[pointer] = currentCell;
          array[i] = emptyElement;
      }
      if (array[pointer] != emptyElement) { //空っぽじゃなくなったら次に進む
          pointer--;
      }
  }

  for (var i = (array.length-1); 0 <= i; i--) {
    var currentCell = array[i];
    if (currentCell == null) {
        array.splice(i, 1);
    }
  }
  return true;
}

function checkUpdate(){
  if(certName != "NULL"){

    let _dateCode = nowTargetDate.split("_")[1];

    $.ajax({
      type: "POST",
      data: {'name': certName, 'timestamp': timeStamp, 'mode':"checkUpdate", 'dateCode':_dateCode},
      scriptCharset: 'utf-8',
      url: "updateCheck.php",
      dataType : "json"
    })
    .then(
      function(param){
          if(param.data != ""){
            console.log("EXTERNAL UPDATE");
            //console.log("元："+guildData);
            guildData = JSON.parse(param.data);
            timeStamp = param.timestamp;
            //console.log(guildData);
            tableBuild();
            drawCanvas();
          }
      },
      function(XMLHttpRequest, textStatus, errorThrown){
          console.log(XMLHttpRequest);
    });
  }
}

function getLogList(){
  if(certName != "NULL"){
    $.ajax({
      type: "POST",
      data: {'name': certName, 'timestamp': timeStamp, 'mode':"getLogList"},
      scriptCharset: 'utf-8',
      url: "updateCheck.php",
      dataType : "json"
    })
    .then(
      function(param){
          if(param.data != ""){
            //console.log(param.data);
            logDataList = JSON.parse(param.data);
            tableBuild();
          }
      },
      function(XMLHttpRequest, textStatus, errorThrown){
          console.log(XMLHttpRequest);
    });
  }
}

function modalOpen() {
  modal.style.display = 'block';
};

function modalClose() {
  modal.style.display = 'none';
};
function outsideClose(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  };
};


