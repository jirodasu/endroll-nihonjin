/* =========================================================
   データ：名前・ジャンル・クレジットの役職・作品名の部品
   すべて架空の組み合わせ。日本人に見える外国名（Kai, Mika 等）や東アジア名は西洋名リストに入れない（ひっかけ無しの方針）
   ========================================================= */
const $=id=>document.getElementById(id);
const R=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---------- 名前データ（すべて架空の組み合わせ） ---------- */
const JS=["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato","Yoshida","Yamada","Sasaki","Yamaguchi","Matsumoto","Inoue","Kimura","Hayashi","Shimizu","Yamazaki","Mori","Ikeda","Hashimoto","Ishikawa","Ogawa","Fujita","Okada","Goto","Hasegawa","Murakami","Kondo","Ishii","Sakamoto","Endo","Aoki","Fujii","Nishimura","Fukuda","Miura","Fujiwara","Okamoto","Matsuda","Nakajima","Harada","Tamura","Takeuchi","Kaneko","Wada","Nakano","Hirano","Kudo","Kawaguchi","Sugiyama","Noguchi","Ichikawa","Uchida","Morita","Shibata","Sakai","Kikuchi"];
const JG=["Hiroshi","Takeshi","Kenji","Daisuke","Yuta","Shota","Kazuki","Takumi","Ryota","Haruto","Sota","Kenta","Naoki","Masato","Tetsuya","Shinji","Koji","Akira","Satoshi","Makoto","Yusuke","Kohei","Ryo","Taro","Hayato","Tomoya","Junichi","Yuko","Akiko","Keiko","Haruka","Ayaka","Misaki","Sakura","Yui","Rina","Kana","Nanami","Aoi","Megumi","Tomoko","Chihiro","Asuka","Miho","Saori","Natsuki","Kaori","Hitomi","Mayu","Yoshiko"];
const WG=["Michael","Sarah","David","Jennifer","Christopher","Emily","Matthew","Jessica","Daniel","Laura","Andrew","Rachel","Thomas","Olivia","Benjamin","Hannah","Patrick","Megan","Gregory","Amanda","Jonathan","Catherine","Samuel","Rebecca","Nathan","Victoria","Oliver","Charlotte","Lucas","Sophie","Henrik","Ingrid","Marco","Giulia","Pierre","Camille","Javier","Lucia","Stefan","Anke","Liam","Siobhan","William","Grace","Edward","Fiona","Robert","Claire","Joseph","Abigail","Natalie","Brian","Heather","Scott","Lauren","Douglas","Eleanor","Frederick","Margaret","Conor"];
const WS=["Smith","Johnson","Williams","Brown","Miller","Davis","Wilson","Anderson","Taylor","Moore","Martin","Thompson","Harris","Clark","Lewis","Robinson","Walker","Hall","Allen","Young","Wright","Hill","Green","Adams","Baker","Nelson","Carter","Mitchell","Roberts","Turner","Phillips","Campbell","Parker","Evans","Edwards","Collins","Stewart","Morris","Murphy","Cook","Rogers","Reed","Bailey","Bell","Cooper","Richardson","Howard","Ward","Peterson","Hughes","Fischer","Becker","Rossi","Moreau","Lindqvist","O'Brien","McAllister","Novak","Kowalski","Fernandez","Delgado","Harrington","Whitfield","Pemberton","Ashford","Blackwood","Sinclair","Gallagher","Brennan","Dubois"];
const INI="ABCDEFGHJKLMNPRSTW".split("");
const westName=()=>R(WG)+(Math.random()<.22?" "+R(INI)+".":"")+" "+R(WS);
const jpName=()=>R(JG)+" "+R(JS);
const KS=Object.fromEntries("Sato:佐藤,Suzuki:鈴木,Takahashi:高橋,Tanaka:田中,Watanabe:渡辺,Ito:伊藤,Yamamoto:山本,Nakamura:中村,Kobayashi:小林,Kato:加藤,Yoshida:吉田,Yamada:山田,Sasaki:佐々木,Yamaguchi:山口,Matsumoto:松本,Inoue:井上,Kimura:木村,Hayashi:林,Shimizu:清水,Yamazaki:山崎,Mori:森,Ikeda:池田,Hashimoto:橋本,Ishikawa:石川,Ogawa:小川,Fujita:藤田,Okada:岡田,Goto:後藤,Hasegawa:長谷川,Murakami:村上,Kondo:近藤,Ishii:石井,Sakamoto:坂本,Endo:遠藤,Aoki:青木,Fujii:藤井,Nishimura:西村,Fukuda:福田,Miura:三浦,Fujiwara:藤原,Okamoto:岡本,Matsuda:松田,Nakajima:中島,Harada:原田,Tamura:田村,Takeuchi:竹内,Kaneko:金子,Wada:和田,Nakano:中野,Hirano:平野,Kudo:工藤,Kawaguchi:川口,Sugiyama:杉山,Noguchi:野口,Ichikawa:市川,Uchida:内田,Morita:森田,Shibata:柴田,Sakai:酒井,Kikuchi:菊地".split(",").map(x=>x.split(":")));
const KG=Object.fromEntries("Hiroshi:浩,Takeshi:武,Kenji:健二,Daisuke:大輔,Yuta:悠太,Shota:翔太,Kazuki:和樹,Takumi:拓海,Ryota:涼太,Haruto:陽翔,Sota:蒼太,Kenta:健太,Naoki:直樹,Masato:雅人,Tetsuya:哲也,Shinji:慎二,Koji:浩二,Akira:明,Satoshi:聡,Makoto:誠,Yusuke:雄介,Kohei:康平,Ryo:亮,Taro:太郎,Hayato:隼人,Tomoya:智也,Junichi:純一,Yuko:裕子,Akiko:明子,Keiko:恵子,Haruka:遥,Ayaka:彩花,Misaki:美咲,Sakura:さくら,Yui:結衣,Rina:里奈,Kana:佳奈,Nanami:七海,Aoi:葵,Megumi:恵,Tomoko:智子,Chihiro:千尋,Asuka:明日香,Miho:美穂,Saori:沙織,Natsuki:夏希,Kaori:香織,Hitomi:瞳,Mayu:真由,Yoshiko:良子".split(",").map(x=>x.split(":")));
const toKanji=n=>{const [g,f]=n.split(" ");return (KS[f]||f)+" "+(KG[g]||g);};

/* ---------- ジャンル ---------- */
const GENRES={
 sf:{ja:"SF",t1:["STELLAR","ORBITAL","DEEP","QUANTUM","DISTANT","SILENT"],t2:["HORIZON","DRIFT","COLONY","ECLIPSE","VECTOR","SIGNAL"],
   chars:["Commander Voss","Ship's Computer (voice)","Flight Engineer","Colonist"],
   dept:{h:"Miniatures & Spacecraft",rows:[["Miniature Effects Supervisor","ミニチュア特撮監修"],["Model Maker","模型製作"],["Spacecraft Designer","宇宙船デザイン"]]}},
 horror:{ja:"ホラー",t1:["THE HOLLOW","THE PALE","SILENT","BLACK","THE LAST"],t2:["HOUSE","CELLAR","WOODS","CHAPEL","DOLL","ORCHARD"],
   chars:["The Caretaker","Girl in the Mirror","Night Watchman","Grieving Mother"],
   dept:{h:"Creature Effects",rows:[["Creature Designer","クリーチャーデザイン"],["Prosthetics Supervisor","特殊造形監修"],["Puppeteer","パペティア（操演）"]]}},
 western:{ja:"西部劇",t1:["THE LAST","DUST","IRON","HIGH","LONG"],t2:["RIDER","MESA","CANYON","FRONTIER","TRAIL","SADDLE"],
   chars:["Sheriff Cole","Saloon Owner","Stagecoach Driver","Deputy"],
   dept:{h:"Livestock",rows:[["Head Wrangler","馬匹担当（ヘッド）"],["Horse Trainer","馬の調教"],["Livestock Coordinator","動物コーディネーター"]]}},
 romance:{ja:"ロマンス",t1:["A Summer in","Letters to","After the","The Season of","Under the"],t2:["Lisbon","Verona","Rain","Autumn","Lanterns","Orchard"],
   chars:["Clara","Thomas","The Florist","Clara's Sister"],
   dept:{h:"Overseas Unit",rows:[["Overseas Unit Coordinator","海外班コーディネーター"],["Florist","フローリスト"],["Dialect Coach","方言指導"]]}},
 action:{ja:"アクション",t1:["CODE","IRON","ZERO","RED","FINAL"],t2:["PROTOCOL","STRIKE","VELOCITY","EXTRACTION","HOUR","BREACH"],
   chars:["Agent Ward","Henchman #1","Henchman #2","Helicopter Pilot"],
   dept:{h:"Weapons & Vehicles",rows:[["Armorer","銃器担当（アーマラー）"],["Precision Driver","カースタント・ドライバー"],["Pyrotechnician","火薬担当"]]}},
 noir:{ja:"ノワール",t1:["SMOKE OVER","THE CROOKED","MIDNIGHT IN","THE VELVET","RAIN ON"],t2:["HARBOR","MILE","LOUNGE","AVENUE","STAIRCASE"],
   chars:["Private Eye","Torch Singer","Police Lieutenant","Nightclub Owner"],
   dept:{h:"Period Consultants",rows:[["Historical Consultant","時代考証"],["Jazz Advisor","ジャズ監修"],["Vintage Car Coordinator","クラシックカー手配"]]}}
};
const GKEYS=Object.keys(GENRES);
function makeLineup(){
  const a=shuffle(GKEYS);
  while(a.length<CONFIG.TOTAL_FILMS){let g;do{g=R(GKEYS);}while(g===a[a.length-1]);a.push(g);}
  return a;
}

/* ---------- クレジット構成（実際のエンドロールの並び順） ---------- */
const MAIN=[["Directed by","監督"],["Screenplay by","脚本"],["Produced by","製作"],["Director of Photography","撮影監督"],["Production Designer","美術監督"],["Edited by","編集"],["Music by","音楽"],["Costume Designer","衣装デザイン"],["Visual Effects Supervisor","VFXスーパーバイザー"]];
const CHARS=["Ellen Marsh","Captain Reyes","Dr. Lindqvist","Young Eleanor","Taxi Driver","Bartender","Night Nurse","Radio Announcer","Man on Train","Woman at Bus Stop","Officer Briggs","Dockworker","Professor Lang","Night Clerk","Reporter","Mechanic","Waitress","Archivist"];
const DEPTS=[
 {h:"Camera Department",rows:[["Camera Operator","カメラオペレーター"],["First Assistant Camera","撮影助手（チーフ）"],["Second Assistant Camera","撮影助手（セカンド）"],["Steadicam Operator","ステディカム・オペレーター"],["Digital Imaging Technician","DIT（デジタル撮影技術）"]]},
 {h:"Grip & Electric",rows:[["Gaffer","照明技師"],["Best Boy Electric","照明チーフ助手"],["Key Grip","キーグリップ（特機主任）"],["Best Boy Grip","特機チーフ助手"],["Dolly Grip","ドリー・グリップ"],["Rigging Gaffer","リギング照明"]]},
 {h:"Art Department",rows:[["Art Director","アートディレクター"],["Set Decorator","装飾"],["Property Master","小道具主任"],["Concept Artist","コンセプトアーティスト"],["Storyboard Artist","絵コンテ"],["Graphic Designer","グラフィックデザイナー"]]},
 {h:"Sound Department",rows:[["Production Sound Mixer","録音技師"],["Boom Operator","ブームオペレーター"],["Supervising Sound Editor","音響編集監修"],["Foley Artist","フォーリー（効果音）"],["Re-recording Mixer","リレコーディング・ミキサー"]]},
 {h:"Editorial",rows:[["First Assistant Editor","編集助手（チーフ）"],["Assistant Editor","編集助手"],["Colorist","カラリスト"],["Post Production Supervisor","ポスプロ監修"]]},
 {h:"Music",rows:[["Orchestrator","オーケストレーター"],["Music Editor","音楽編集"],["Score Mixer","スコア・ミキサー"],["Music Supervisor","音楽監修"]]},
 {h:"Costume, Hair & Makeup",rows:[["Assistant Costume Designer","衣装デザイン助手"],["Key Makeup Artist","メイク主任"],["Key Hair Stylist","ヘア主任"],["Special Makeup Effects","特殊メイク"],["Wardrobe Supervisor","衣装管理"]]},
 {h:"Production",rows:[["Unit Production Manager","制作担当"],["First Assistant Director","助監督（チーフ）"],["Second Assistant Director","助監督（セカンド）"],["Script Supervisor","記録（スクリプター）"],["Location Manager","ロケーション・マネージャー"],["Production Coordinator","制作コーディネーター"],["Production Accountant","制作経理"]]},
 {h:"Stunts",rows:[["Stunt Coordinator","スタントコーディネーター"],["Fight Choreographer","アクション振付"]]},
 {h:"Catering",rows:[["Caterer","ケータリング"],["Craft Service","クラフトサービス（軽食）"]]}
];
const LISTS=[["Compositors","コンポジター"],["Animators","アニメーター"],["Lighting Artists","ライティングアーティスト"],["FX Artists","エフェクトアーティスト"],["Matte Painters","マットペインター"],["Production Assistants","制作アシスタント"],["Stunt Performers","スタントパフォーマー"]];
const STUDIOS=["Northgate Pictures","Silver Pine Films","Halcyon Road Entertainment","Bluewater Studios","Ashgrove Pictures","Lantern Hill Films"];
const VENDORS=["Northlight Digital","Foundry Lane VFX","Kestrel Visual","Arcwell Studios","Greyfriar Pixel"];
const LOCS=["Vancouver, British Columbia","Budapest, Hungary","Atlanta, Georgia","Wellington, New Zealand","Prague, Czech Republic","Glasgow, Scotland"];
