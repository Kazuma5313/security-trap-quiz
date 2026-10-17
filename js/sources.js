'use strict';
// ---------- 解説の参照元（問題と同じ順番） ----------
// t: ページ名  by: 発行元  u: URL  en: 英語のページなら true
// hl: リンク先で強調する文（ページ本文と1文字も違わないこと。短く、1つの段落の中から選ぶ）
// note: その箇所に書いてあることの要約
// URLと hl は2026年10月17日にページ本文と照合済み。PDFは強調できないので note だけ。
const SRC = {
  ipa10:   {t:'情報セキュリティ10大脅威 2026', by:'IPA', u:'https://www.ipa.go.jp/security/10threats/10threats2026.html'},
  scan10:  {t:'AI 利用めぐるサイバーリスク初選出、IPA「情報セキュリティ10大脅威 2026」', by:'ScanNetSecurity', u:'https://scan.netsecurity.ne.jp/article/2026/02/19/54657.html'},
  soumu:   {t:'フィッシング詐欺に注意', by:'総務省 国民のためのサイバーセキュリティサイト', u:'https://www.soumu.go.jp/main_sosiki/cybersecurity/kokumin/basic/risk/04/'},
  fsa:     {t:'フィッシングにご注意ください', by:'金融庁', u:'https://www.fsa.go.jp/ordinary/chuui/chuui_phishing.html'},
  anti:    {t:'フィッシング対策協議会（緊急情報の一覧）', by:'フィッシング対策協議会', u:'https://www.antiphishing.jp/'},
  fido:    {t:'Passkeys', by:'FIDO Alliance', u:'https://fidoalliance.org/passkeys/', en:true},
  wikise:  {t:'ソーシャル・エンジニアリング', by:'Wikipedia', u:'https://ja.wikipedia.org/wiki/%E3%82%BD%E3%83%BC%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%BB%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2%E3%83%AA%E3%83%B3%E3%82%B0'},
  saitamaSE:{t:'ソーシャルエンジニアリングに注意（PDF）', by:'埼玉県警察', u:'https://www.police.pref.saitama.lg.jp/documents/33461/social-engineering.pdf'},
};
const at = (key, extra) => Object.assign({}, SRC[key], extra);

const SOURCES = {
  l1: [
    // 1 ホモグラフ
    [ {t:'IDNホモグラフ攻撃', by:'Wikipedia', u:'https://ja.wikipedia.org/wiki/IDN%E3%83%9B%E3%83%A2%E3%82%B0%E3%83%A9%E3%83%95%E6%94%BB%E6%92%83',
        hl:'字形が酷似した以下のものなどが悪用される', note:'ラテン文字とそっくりなキリル文字などが悪用される、として文字の一覧が載っています。'},
      {t:'IDN in Google Chrome', by:'Chromium', u:'https://chromium.googlesource.com/chromium/src/+/main/docs/idn.md', en:true,
        note:'Chromeが、紛らわしい文字の混ざったドメインを「xn--」の表示に切り替える条件の説明です。'} ],
    // 2 サブドメイン偽装
    [ at('soumu', {hl:'表示されているURLを本物のURLに見せかけてアクセスさせる手口', note:'本物に見間違えるURLで偽サイトに誘導する手口と、正しいURLや正規のアプリでアクセスする対策。'}),
      at('anti', {note:'実在の組織をかたるフィッシングの、最新の「緊急情報」が並んでいます。'}) ],
    // 3 鍵マーク
    [ {t:'Latest APWG Phishing Statistics Show Evolving Attack Techniques', by:'Proofpoint', u:'https://www.proofpoint.com/us/blog/security-awareness-training/latest-apwg-phishing-statistics-show-evolving-attack-techniques', en:true,
        hl:'Malicious Use of HTTPS Increased Dramatically', note:'HTTPSを使うフィッシングサイトが急増し、利用者には本物らしく見えてしまう、というAPWGの統計の解説。'},
      at('soumu', {hl:'ひと目ではフィッシング詐欺であると判別できないケースが増えています', note:'偽サイトは本物と区別がつかないほど巧妙で、見た目では判別できないことが増えている、という解説。'}) ],
    // 4 タイポスクワッティング
    [ at('fsa', {hl:'メッセージに掲載されたリンクを開かない', note:'見覚えのある送信者からのメールやSMSでもリンクは開かず、ブックマークからアクセスするよう呼びかけています。'}),
      at('anti', {note:'実在の組織をかたるフィッシングメールの実例が、緊急情報として毎月載っています。'}) ],
    // 5 検索広告
    [ {t:'検索結果に表示される偽サイトへの注意（PDF）', by:'小樽商科大学', u:'https://www.otaru-uc.ac.jp/center/docs/fakepage.pdf',
        note:'2026年4月、検索結果に大学の偽サイトが表示された事例。「広告や不自然なリンクが含まれている」ものに注意、と書かれています。'},
      {t:'「検索連動型広告」関連の記事まとめ', by:'ITmedia', u:'https://www.itmedia.co.jp/keywords/p4p.html',
        hl:'検索連動広告が掲載されていたことを確認', note:'正規サイトを装ったフィッシングサイトが検索広告に出ていた事例など。'} ],
    // 6 不在通知SMS
    [ {t:'宅配便業者を装った「不在通知」の偽SMSに注意しましょう', by:'国民生活センター', u:'https://www.kokusen.go.jp/news/data/n-20201126_2.html',
        hl:'宅配便業者を装った「不在通知」の偽SMSに関する相談が寄せられています', note:'URLにアクセスしない、ID・パスワードを入力しない、という注意喚起と、不正アプリや不正請求の被害例。'},
      {t:'宅配便業者を装った「不在通知」の偽SMSにご注意ください', by:'目黒区', u:'https://www.city.meguro.tokyo.jp/sangyoukeizai/kurashi/shouhiseikatsu/takuhaisms.html',
        hl:'記載されているURLには安易にアクセスしないでください', note:'URLを開くと偽サイトに誘導されたり、不正なアプリを入れられたりする流れと対策。'} ],
    // 7 ニセ警察
    [ {t:'特殊詐欺根絶イベントのレポート', by:'警察庁 SOS47', u:'https://www.npa.go.jp/bureau/safetylife/sos47/eventreport/260606/index.html',
        hl:'ビデオ通話で取調べを行うことも', note:'特別防犯支援官が「本物の警察官が金銭を要求することも、ビデオ通話で取調べを行うことも絶対にない」と呼びかけています。'},
      {t:'ニセ警察官からの電話に注意', by:'新潟県警察', u:'https://www.pref.niigata.lg.jp/site/kenkei/nisekeikann-tyuui.html',
        hl:'ビデオ通話をすることはありません', note:'SNSで警察手帳や逮捕状の画像を送ったりビデオ通話をしたりしない。犯人は「＋」から始まる国際電話番号を使うことがある、とも書かれています。'},
      {t:'国際電話不取扱受付センター', by:'国際電話不取扱受付センター', u:'https://www.kokusai-teishi.com/',
        note:'固定電話で国際電話の発着信を止める手続き（無料）の窓口です。'} ],
    // 8 ディープフェイク
    [ {t:'Finance worker pays out $25 million after video call with deepfake ‘chief financial officer’', by:'CNN', u:'https://edition.cnn.com/2024/02/04/asia/deepfake-cfo-scam-hong-kong-intl-hnk/index.html', en:true,
        hl:'duped into attending a video call', note:'ビデオ会議の参加者が全員ディープフェイクで、2,500万ドル（約2億香港ドル）が送金された事件の記事。'},
      {t:'ビジネスメール詐欺（BEC）対策', by:'IPA', u:'https://www.ipa.go.jp/security/bec/index.html',
        note:'経営者や取引先になりすまして送金させる手口の事例と、対策資料の一覧です。'} ],
    // 9 認証コード
    [ at('fsa', {hl:'メッセージに掲載されたリンクを開かない', note:'リンクから偽サイトに誘導して認証情報を盗む手口への注意と、ブックマークからアクセスする対策。'}),
      at('soumu', {hl:'正しいURLや正規のアプリケーションを用いてアクセスする', note:'連絡を受けたら、届いたリンクではなく正しいURLや正規アプリから確認する、という対策。'}) ],
    // 10 MFA疲労
    [ {t:'How number matching works in MFA push notifications', by:'Microsoft Learn', u:'https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-mfa-number-match', en:true,
        hl:'Number matching is a key security upgrade', note:'承認通知で画面に出た番号を入力させ、うっかり承認を防ぐ「番号照合」の説明。'},
      at('fido', {hl:'phishing-resistant authentication', note:'パスキー（FIDO）は公開鍵暗号を使った、フィッシングに強い認証だという説明。'}) ],
    // 11 ClickFix
    [ {t:'ClickFix（クリックフィックス）とは？', by:'トレンドマイクロ', u:'https://www.trendmicro.com/ja_jp/jp-security/25/i/securitytrend-20250905-01.html',
        hl:'クリップボードに自動でコピーされています', note:'画面を開いた時点で不正なスクリプトがクリップボードにコピーされ、Win+R → 貼り付け → Enter の手順で自分に実行させる仕組みの解説。'},
      {t:'警視庁、偽のCAPTCHA画面でマルウェアをインストールさせる手口に注意喚起', by:'INTERNET Watch', u:'https://internet.watch.impress.co.jp/docs/news/2046298.html',
        hl:'指示されたコマンドを安易に実行しないよう注意してください', note:'警視庁の注意喚起。怪しいリンク先で急に出た確認画面はクリックせずに閉じる、と呼びかけています。'} ],
    // 12 サポート詐欺
    [ {t:'偽セキュリティ警告（サポート詐欺）対策特集ページ', by:'IPA', u:'https://www.ipa.go.jp/security/anshin/measures/fakealert.html',
        hl:'閉じるだけで問題ありません', note:'画面が出ただけならウイルスには感染しておらず、閉じれば問題ない。閉じ方を練習できる体験サイトもあります。'},
      at('ipa10', {hl:'サポート詐欺（偽警告）による金銭被害', note:'個人向けの10大脅威の1つに選ばれています。'}),
      at('scan10', {hl:'サポート詐欺（偽警告）による金銭被害（7年連続7回目）', note:'サポート詐欺は7年連続で10大脅威に選ばれています。'}) ],
    // 13 QRコード
    [ {t:'QRコードを利用する時の注意点', by:'警視庁', u:'https://www.keishicho.metro.tokyo.lg.jp/kurashi/cyber/notes/qrcord.html',
        hl:'偽物のQRコードのシールを貼るなどして', note:'正規のQRの上に偽のシールを貼り、偽の決済画面でカード情報を盗む手口と、読み込んだ後の表示を確認する対策。'},
      {t:'クイッシング（QR コード詐欺）とは何か', by:'McAfee', u:'https://www.mcafee.com/blogs/ja-jp/tips-tricks/what-is-quishing-how-qr-code-scams-work-and-how-to-avoid-them/',
        note:'QRコード詐欺の仕組みと、見分け方・防ぎ方の解説です。'} ],
    // 14 なりすましWi-Fi
    [ {t:'Wi-Fi利用者向け 簡易マニュアル', by:'総務省', u:'https://www.soumu.go.jp/main_sosiki/cybersecurity/wi-fi/',
        hl:'接続するアクセスポイントをよく確認しよう', note:'利用者向けの「ポイント1」。正しいURLでHTTPS通信しているか確認する、というポイントも並んでいます。'} ],
    // 15 同意フィッシング
    [ {t:'Protect against consent phishing', by:'Microsoft Learn', u:'https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/protect-against-consent-phishing', en:true,
        hl:'What is consent phishing?', note:'アプリに権限を許可させてアカウントにアクセスする「同意フィッシング」の説明と対策。'},
      {t:'サードパーティのアプリとのアカウント連携を管理する', by:'Google アカウント ヘルプ', u:'https://support.google.com/accounts/answer/13533235',
        note:'連携しているアプリを確認し、使っていないものを外す手順です。'} ],
  ],
  l2: [
    // 1 BitB
    [ {t:'Browser In The Browser (BITB) Attack', by:'mr.d0x', u:'https://mrd0x.com/browser-in-the-browser-phishing-attack/', en:true,
        hl:'simulates a browser window within the browser', note:'ブラウザの中にウィンドウの絵を描いて、本物のドメインを装う手口を最初に公表した記事。デモ画像があります。'} ],
    // 2 AiTM
    [ {t:'From cookie theft to BEC: Attackers use AiTM phishing sites', by:'Microsoft Security Blog', u:'https://www.microsoft.com/en-us/security/blog/2022/07/12/from-cookie-theft-to-bec-attackers-use-aitm-phishing-sites-as-entry-point-to-further-financial-fraud/', en:true,
        hl:'deploy a proxy server between a target user and the website', note:'偽サイトが利用者と本物のサイトの間で中継し、パスワードとログイン状態（セッション）を盗んで2段階認証を飛ばした攻撃の分析。'},
      at('fido', {hl:'phishing-resistant authentication', note:'パスキーはフィッシングに強い認証だという説明。偽サイトでは使えない理由がこれです。'}) ],
    // 3 正規サービスの悪用
    [ {t:'フィッシングサイト構築にクラウドサービスを利用する手口を連続して確認', by:'トレンドマイクロ', u:'https://trendmicro.com/ja_jp/research/20/e/repeated-cases-confirmed-regarding-the-use-of-cloud-services-to-build-phishing-sites.html',
        hl:'様々なクラウドサービスのプラットフォームを悪用する活動を確認しました', note:'フィッシングページの置き場所として、ノートやデザイン作成などのクラウドサービスが悪用された事例。'},
      {t:'「OneDrive」悪用したフィッシング、アプリのためURLでは判断できず', by:'ScanNetSecurity', u:'https://scan.netsecurity.ne.jp/article/2019/06/28/42544.html',
        hl:'を悪用したフィッシングの報告が続いている', note:'フィッシング対策協議会の注意喚起。正規サービスを使うので、URLだけでは判断できません。'} ],
    // 4 RLO
    [ {t:'ファイル名は「左から右に読む」とは限らない?!', by:'@IT', u:'https://atmarkit.itmedia.co.jp/ait/articles/0909/28/news088_2.html',
        hl:'RLOを利用したファイルの拡張子偽装', note:'実際にRLOを挿入して、実行ファイルを別の拡張子に見せる手順を画像付きで検証しています。'},
      {t:'Unicodeの制御文字を使いファイル名偽装、ウイルス「RLTrap」検出報告5万件', by:'INTERNET Watch', u:'https://internet.watch.impress.co.jp/docs/news/489024.html',
        hl:'ファイル名を偽装する手口を紹介し', note:'IPAが、RLOでファイル名を偽装するウイルスの検出報告が約5万件あったとして注意を呼びかけた記事（2011年）。'} ],
    // 5 偽のブラウザ更新
    [ {t:'偽のブラウザアップデートがあなたを襲う', by:'Proofpoint', u:'https://www.proofpoint.com/jp/blog/threat-insight/are-you-sure-your-browser-date-current-landscape-fake-browser-updates',
        hl:'侵害されたWebサイトに対するエンドユーザーの信用につけ込み', note:'改ざんされた正規サイトへの信用を利用し、正規の更新に見せかけてクリックさせる手口の解説。'},
      {t:'偽アップデートの代表的マルウェア配信フレームワーク「SocGholish」を独自分析', by:'デジタルアーツ', u:'https://digitalpr.jp/r/79253',
        hl:'日本国内でも観測が増える偽アップデート', note:'国内で観測された偽アップデートのURL件数が、月ごとに増えているという分析。'} ],
    // 6 メール爆撃＋ヘルプデスク偽装
    [ {t:'Threat actors misusing Quick Assist in social engineering attacks leading to ransomware', by:'Microsoft Security Blog', u:'https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/', en:true,
        hl:'email bombing attack', note:'大量のメール登録で受信箱をあふれさせた後、ITサポートを装ってTeamsや電話で連絡し、遠隔操作ツールを許可させる手口。'} ],
    // 7 返信メールの乗っ取り
    [ {t:'マルウエア Emotet への対応FAQ', by:'JPCERT/CC', u:'https://blogs.jpcert.or.jp/ja/2019/12/emotetfaq.html',
        hl:'実際にやりとりしたメールを引用したなりすましメール', note:'過去の本物のやり取りを引用したメールが届いたら、送信者として表示されている人の端末が感染している可能性がある、という解説。'},
      {t:'マルウェア Emotet の感染再拡大に関する注意喚起', by:'JPCERT/CC', u:'https://www.jpcert.or.jp/at/2022/at220006.html',
        hl:'パスワード付きZipファイルとしてメールに添付する形式', note:'マクロ付きのOfficeファイルやパスワード付きZIPで届き、マクロを有効にすると感染する、という説明。'} ],
    // 8 振込口座の変更
    [ {t:'ビジネスメール詐欺（BEC）対策', by:'IPA', u:'https://www.ipa.go.jp/security/bec/index.html',
        note:'取引先になりすまして振込先を変えさせる手口の事例と、対策資料の一覧です。'},
      at('saitamaSE', {note:'「送金先変更等の重要な内容であっても」メール以外の手段で相手に確認する、という対策が載っています。'}) ],
    // 9 共連れ
    [ at('wikise', {hl:'関係者のような顔をして密着し、そのまま建物内に侵入する手法', note:'「ピギーバック」の説明。関係者のふりをして、人の後ろについて建物に入る手口です。'}) ],
    // 10 プリテキスティング
    [ at('saitamaSE', {note:'利用者や管理者になりすまして電話をかけ、社員情報やパスワードを聞き出す手口と、電話対応のルールを決めておく対策。'}),
      at('wikise', {hl:'口実を作り、嘘のシナリオを演じて情報を引き出す手法', note:'プリテキスティングの説明。IT担当者を装って電話をかける例が載っています。'}) ],
    // 11 パスワード
    [ {t:'証券口座の不正アクセスが急増 金融庁が注意喚起', by:'Impress Watch', u:'https://www.watch.impress.co.jp/docs/news/2008088.html',
        hl:'フィッシングサイトなどから窃取した顧客情報', note:'盗んだIDとパスワードで証券口座にログインし、勝手に株を売買する被害の注意喚起。'},
      {t:'多要素認証の必須化後も減っていない「証券口座乗っ取り」の現状', by:'トレンドマイクロ', u:'https://www.trendmicro.com/ja_jp/research/25/f/mfa-securities-hacks.html',
        hl:'日本の証券口座の認証情報を狙った', note:'証券会社を装ったメールやSMSから偽サイトに誘導し、IDとパスワードを盗む手口が続いている、という分析。'} ],
    // 12 充電ポート
    [ {t:'Juice jacking warnings are back, with a new twist', by:'Malwarebytes', u:'https://www.malwarebytes.com/ja/blog/news/2025/06/juice-jacking-warnings-are-back-with-a-new-twist', en:true,
        hl:'researchers have found a way past these mechanisms', note:'「信頼しますか」の確認をすり抜ける新しい手法（ChoiceJacking）の紹介と、自分の充電器を使うなどの対策。'},
      {t:'Artifacts for ChoiceJacking（グラーツ工科大学の研究）', by:'Zenodo', u:'https://zenodo.org/records/14726532', en:true,
        hl:'the first to bypass existing JuiceJacking mitigations', note:'細工した充電器で、既存の対策をすり抜けてスマホのデータにアクセスできると示した研究。'} ],
    // 13 ユーザー補助の権限
    [ {t:'Google cracks down on Android apps abusing accessibility', by:'Malwarebytes', u:'https://www.malwarebytes.com/blog/mobile/2026/03/google-cracks-down-on-android-apps-abusing-accessibility', en:true,
        hl:'It stops certain kinds of apps from using the accessibility', note:'アクセシビリティ機能を悪用して端末を遠隔操作するマルウェアへの対策として、Googleが利用を制限した話。'},
      at('ipa10', {hl:'不正アプリによるスマートフォン利用者への被害', note:'個人向けの10大脅威の1つに選ばれています。'}) ],
    // 14 写真からの特定
    [ {t:'SNSの危険性と対策（PDF）', by:'京都府警察', u:'https://www.pref.kyoto.jp/fukei/anzen/seiki_h/cyber/documents/7sns.pdf',
        note:'顔写真・自宅写真・GPS位置情報の公開が危ない例と、個人を特定できる写真を載せない対策。'},
      {t:'子どもを取り巻くネットトラブルの現状（PDF）', by:'埼玉県警察', u:'https://www.police.pref.saitama.lg.jp/documents/663/torimakugenjyo_.pdf',
        note:'位置情報をオフにして撮った写真でも、背景から場所が特定された例が載っています。'} ],
    // 15 プロンプトインジェクション
    [ {t:'LLM01: Prompt Injection', by:'OWASP GenAI Security Project', u:'https://genai.owasp.org/llmrisk/llm01-prompt-injection/', en:true,
        hl:'Indirect prompt injections occur when an LLM accepts input from external sources', note:'Webページやファイルなど外部の文章に仕込んだ命令でAIを操る「間接型」の説明。隠れた指示を含むページを要約させる例もあります。'},
      at('ipa10', {hl:'AIの利用をめぐるサイバーリスク', note:'組織向けの10大脅威に初めて選ばれました。'}),
      at('scan10', {hl:'3：AIの利用をめぐるサイバーリスク（初選出）', note:'組織向けで3位に初選出。個人向けの10件の一覧も載っています。'}) ],
  ],
};

// 強調リンク（Text Fragment）を付けたURLを作る
function srcHref(s){ return s.hl ? `${s.u}#:~:text=${encodeURIComponent(s.hl).replace(/-/g,'%2D')}` : s.u; }
LEVELS.forEach(lv => lv.questions.forEach((q, i) => { q.src = (SOURCES[lv.id] || [])[i] || []; }));
