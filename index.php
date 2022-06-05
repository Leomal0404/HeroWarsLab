<?php

require './common/define.php';

//コンテンツページ
$html = getTempHTML();
echo PageBuild($html);

function PageBuild($html){

    $title = "TOP";

    $query = time();
    $root = ROOT;

    $main = <<<EOM
        <link href="$root/common/css/index.css?$query" rel="stylesheet">
        <script type="text/javascript">
            function onload(){

            }
        </script>
    EOM;

    $main .= <<<EOM
        <div class="logo_box">
            <img class="logo" src="$root/common/img/logo.png" />
        </div>

        <div class="content-box">

            <div class="contentes-menu-category-container">
                <div class="contentes-menu-category-label">システム関連</div>
                <div class="contents-menu-list">
                    <ul>
                        <li><a href="$root/events/">イベント開催履歴</a></li>
                        <li><a href="$root/battlePass/">ヒーローの道計画</a></li>
                        <li><a href="$root/goldRoulette/">ゴールドルーレット</a></li>
                    </ul>
                </div> 
            </div>       

            <div class="contentes-menu-category-container">
                <div class="contentes-menu-category-label">ヒーロー関連</div>
                <div class="contents-menu-list">
                    <ul>
                        <li><a href="$root/hero_dev/heroStatus.php">ヒーローステータス</a></li>
                        <li><a href="$root/hero/">アイテムコスト試算</a></li>
                        <li><a href="$root/skillCost/">スキルコスト表</a></li>
                        <li><a href="$root/skin/">スキン</a></li>
                        <li><a href="$root/artifact/">アーティファクト</a></li>
                        <li><a href="$root/glyph/">グリフ</a></li>
                        <li><a href="$root/elementGift/">エレメントギフト</a></li>
                        <li><a href="$root/heroLevel/">ヒーロー経験値表</a></li>
                        <li><a href="$root/heroBattle/">ヒーローシミュレータ</a></li>
                    </ul>
                </div>
            </div>

            <div class="contentes-menu-category-container">
                <div class="contentes-menu-category-label">ギルド / タイタン / ヒドラ関連</div>
                <div class="contents-menu-list">
                    <ul>
                        <li><a href="$root/hydra/">ヒドラ</a></li>
                        <li><a href="$root/dungeon/">ダンジョン</a></li>
                        <li><a href="$root/titanLevel/">タイタンレベル</a></li>
                        <li class="smallText"><a href="$root/titanArtifact/">タイタンアーティファクト</a></li>
                        <li><a href="$root/titanSkin/">タイタンスキン</a></li>
                        <li><a href="$root/titanBattle/">タイタンシミュレータ</a></li>
                    </ul>
                </div>
            </div>

        </div>
    EOM;

    $html = str_replace("<?=TITLE=>", $title, $html);
    $html = str_replace("<?=MAIN=>", $main, $html);
    return $html;
}


?>