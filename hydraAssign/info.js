//---------------------------------------------
// 定数定義
//---------------------------------------------

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
// [event] ページ読み込み完了
//---------------------------------------------
function onload(){

    getLogList();
  
}


//テーブル構築
function tableBuild(){

    logTable = '<table class="forDiscordTable">';
    logTable += '<tr><th>記録</th></tr>';
    logTable += '<tr><td>';

    // 履歴データを走査
    for(let _l = 0; _l < logDataList.length; _l++){

        let element = logDataList[_l];

        //指定の日付でない場合はスキップ
        if(element["year"] != targetYear || element["month"] != targetMonth || element["day"] != targetDay) continue;

        //曜日番号
        let dayWeek = getDayWeek(Number(element["year"]), Number(element["month"]), Number(element["day"]));

        //日付表記
        let dateText = Number(element["month"]) +"/"+ Number(element["day"]) +"("+ dayWeek[0] +")";

        logTable +=  '●'+ dateText +'：アタック結果●●<br /><br />';


        logTable +=  '使用したホーンの数<br />';

        let _index = 0;
        //各ランクごと
        for(let _r of rankList){

            let turnSum = 0;
            let rankName = hydraRankName[_r];

            let turnArray = [];

            for(let _t of typeList){
                let _info = element["turns"][_index];
                let _infoArray = _info.split("_");

                let _turn = Number(_infoArray[2]);

                turnSum += _turn;

                if(_turn > 0){
                    let turnInfo = {"type":typeNameArray[_t], "turn":_turn};
                    turnArray.push(turnInfo);
                }

                _index++;
            }            

            if(rankName == "レジェンド"){
                for(let _l = 0; _l < turnArray.length; _l++){
                    if(_l == 0) logTable += "◆"+ rankName +"－"+ turnArray[_l]["type"] +"："+ turnArray[_l]["turn"] +"<br />";
                    else logTable += "　　　　　　－"+ turnArray[_l]["type"] +"："+ turnArray[_l]["turn"] +"<br />";
                }                
            }
            else logTable += "◆"+ rankName +"："+ turnSum +"<br />";
        }

        logTable +=  'ｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰ<br />';
        logTable +=  '合計：'+ element["attack_count"] +'本<br />';
        logTable +=  '　　⇒使用したゴールドホーンは'+ element["horn_count"] +'本';

        break;
    }

    logTable += '</td></tr>';
    logTable += '<tr><th>画像URL</th></tr>';
    logTable += '<tr><td>https://aille.net/HeroWars/hydraAssign/img/'+ certName +"/"+ certName +"_"+ targetYear + ( '00' + targetMonth ).slice( -2 ) + ( '00' + targetDay ).slice( -2 ) +'.png?'+ Date.now() +'0</td></tr>';
    logTable += '<tr><th>サンプル画像</th></tr>';
    logTable += '<tr><td><img src="https://aille.net/HeroWars/hydraAssign/img/'+ certName +"/"+ certName +"_"+ targetYear + ( '00' + targetMonth ).slice( -2 ) + ( '00' + targetDay ).slice( -2 ) +'.png?'+ Date.now() +'0" width="640"></td></tr>';
    logTable += '</table>';

    document.getElementById('infoArea').innerHTML = logTable;    
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

function getLogList(){
    if(certName != "NULL"){
      $.ajax({
        type: "POST",
        data: {'name': certName, 'timestamp': 0, 'mode':"getLogList"},
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

