/* Route UI. The route definitions in routes.json are the single map-data source. */
(async function () {
  'use strict';
  const host = document.createElement('section');
  host.id = 'maps';
  host.setAttribute('aria-labelledby', 'maps-heading');
  host.innerHTML = '<h2 id="maps-heading">Googleマップで経路を見る</h2><p role="status">経路データを読み込んでいます。</p>';
  document.getElementById('detail').before(host);
  const navLink = document.createElement('a');
  navLink.href = '#maps';
  navLink.textContent = '経路マップ';
  const itineraryLink = document.querySelector('header nav a[href="#detail"]');
  itineraryLink.before(navLink);
  const style = document.createElement('style');
  style.textContent = `
#maps{scroll-margin-top:18px}#maps button,#maps a,#maps select{touch-action:manipulation}
.map-intro{max-width:880px}.map-pickers{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.map-pickers button{min-height:44px;font-size:14px}.map-pickers button[aria-pressed="true"]{background:var(--accent);color:#fff;border-color:var(--accent)}
.map-phase button{background:#eef3ef}.map-panel{display:grid;grid-template-columns:minmax(225px,1fr) minmax(0,2.35fr);border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--paper)}
.map-sidebar{padding:16px;border-right:1px solid var(--line);background:#f8faf7}.map-sidebar-label{font-size:13px;font-weight:700;margin:0 0 12px}
.map-legs{list-style:none;padding:0;margin:0;display:grid;gap:8px}.map-leg{display:block;text-align:left;width:100%;padding:12px;font-size:14px;line-height:1.55;background:var(--paper)}
.map-leg strong,.map-leg small{display:block}.map-leg small{color:var(--muted);margin-top:3px;font-size:12px}.map-leg[aria-pressed="true"]{border:2px solid var(--accent);padding:11px;background:var(--soft)}
.map-mobile-label{display:none}.map-select{width:100%;font:inherit;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink)}
.map-main{min-width:0}.map-summary{padding:18px 20px 14px}.map-summary h3{font-size:19px;line-height:1.55}.map-summary .pill{margin-bottom:6px}.map-summary p{font-size:14px;margin:8px 0}
.map-open{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:9px 16px;border-radius:9px;background:var(--accent);color:#fff;text-decoration:none;font-weight:650;font-size:14px}
.map-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:12px}.map-toolbar small{font-size:12px;color:var(--muted)}
.map-framebox{position:relative;height:420px;background:#edf1ec;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.map-framebox iframe{display:block;width:100%;height:100%;border:0}
.map-framebox>p{padding:25px;color:var(--muted);font-size:14px}.map-controls{display:flex;gap:10px;align-items:center;padding:12px 20px}.map-controls button{font-size:13px;min-height:40px}.map-controls button:disabled{opacity:.4;cursor:default}.map-controls span{font-size:13px;color:var(--muted)}
.map-fallback{padding:0 20px 16px;font-size:12px;color:var(--muted)}.map-fallback p{margin:5px 0}.map-note{padding:14px 16px;background:var(--warnbg);border-radius:10px;font-size:13px;margin-top:14px}.map-note p{margin:6px 0}
.map-resources{display:flex;flex-wrap:wrap;gap:10px 20px;font-size:13px;margin-top:12px}.map-chain{font-size:14px;color:var(--muted);margin:10px 0 14px;overflow-wrap:anywhere}
@media(max-width:760px){.map-panel{grid-template-columns:1fr}.map-sidebar{border-right:0;border-bottom:1px solid var(--line);padding:12px 14px}.map-legs,.map-sidebar-label{display:none}.map-mobile-label{display:block;font-size:13px;font-weight:650}.map-mobile-label select{margin-top:5px;font-weight:400;font-size:14px}.map-summary{padding:16px}.map-summary h3{font-size:18px}.map-framebox{height:350px}.map-open{width:100%}.map-toolbar{gap:6px}.map-pickers{gap:6px}.map-pickers button{padding:8px 10px;flex:1}.map-controls{padding:10px 16px}.map-fallback{padding:0 16px 14px}}
@media print{.map-pickers,.map-sidebar,.map-framebox,.map-controls,.map-fallback{display:none}.map-panel{display:block}.map-open{color:var(--ink);background:none;padding:0}.map-note{background:none}#maps{break-inside:avoid}}
`;
  document.head.append(style);
  try {
    const response = await fetch('./routes.json?v=20260927-rail-only1', {cache: 'no-cache'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const routes = await response.json();
    const origin = routes.places[routes.origin_id];
    if (!origin || !routes.plan_stages || !routes.legs) throw new Error('経路データの形式を確認してください。');
    // Include exactly the same route definitions in the existing JSON export/reset.
    original.map_routes = routes;
    data.map_routes = structuredClone(routes);
    document.getElementById('semantic-data').textContent = JSON.stringify(original);
    const e = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    function place(id) {
      const p = routes.places[id];
      if (!p) throw new Error('Unknown place: ' + id);
      if (p.source === 'hotel') return {...p, query: data.assumptions.hotel_name.replace(/（.*?）/g, '') + ' ' + data.assumptions.hotel_location};
      if (p.source === 'venue') return {...p, query: data.trip.venue + ' 東京都江東区有明'};
      return p;
    }
    function label(leg) {
      if (leg.mode === 'walking') return '徒歩';
      return leg.line || '公共交通';
    }
    function directionsUrl(leg) {
      const params = new URLSearchParams({api:'1', origin:place(leg.from).query, destination:place(leg.to).query, travelmode:leg.mode});
      return 'https://www.google.com/maps/dir/?' + params;
    }
    function embedUrl(leg) {
      // Keyless Google Maps directions preview. The supported Maps URL above is
      // always available separately because embedded results can vary by client.
      const mode = leg.mode === 'transit' ? 'r' : 'w';
      const params = new URLSearchParams({f:'d', saddr:place(leg.from).query, daddr:place(leg.to).query, dirflg:mode, hl:'ja', output:'embed'});
      return 'https://maps.google.com/maps?' + params;
    }
    host.innerHTML = `
<h2 id="maps-heading">Googleマップで経路を見る</h2>
<p class="map-intro"><strong>${e(origin.label)}発着の電車・徒歩ルートです。</strong>日程と区間を選ぶと、地図を切り替えられます。</p>
<div class="map-pickers map-phase" id="map-phases" role="group" aria-label="移動日程"></div>
<p class="map-chain" id="map-chain"></p>
<div class="map-panel">
<aside class="map-sidebar"><p class="map-sidebar-label">地図を見る区間を選択</p><ol class="map-legs" id="map-legs"></ol><label class="map-mobile-label">地図を見る区間<select id="map-leg-select" class="map-select"></select></label></aside>
<div class="map-main">
<div class="map-summary"><span class="pill" id="map-mode"></span><h3 id="map-route-heading"></h3><p id="map-leg-note"></p><div class="map-toolbar"><a class="map-open" id="map-open" target="_blank" rel="noopener noreferrer">この区間をGoogleマップで開く ↗</a><small>距離・所要時間・経路候補はこちら</small></div></div>
<p id="map-view-label" class="note" style="padding:0 20px;margin:0 0 10px">選択した区間の経路プレビュー</p>
<div class="map-framebox" id="map-framebox"><p>Googleマップの地図表示を読み込みます。表示されない場合も、上のボタンから経路を確認できます。</p></div>
<div class="map-controls"><button id="map-prev" type="button">前の区間</button><span id="map-counter" aria-live="polite"></span><button id="map-next" type="button">次の区間</button></div>
<div class="map-fallback"><p>埋め込み表示で経路が出ない場合は、上のGoogleマップボタンを利用してください。<button id="map-place-only" type="button">目的地の地図だけ表示</button> <button id="map-route-again" type="button">経路表示に戻す</button></p><p>地図の読み込み時にGoogleへ接続します。ページ内の予算入力は送信しません。</p></div>
</div></div>
<details><summary>地図を使うときの注意</summary><div class="detailbody map-note"><p>旅行日と出発時刻を設定して乗り継ぎを確認してください。会場の入口・待機列は主催者の当日案内に従ってください。</p></div></details>
<div class="map-resources"><a href="https://www.bigsight.jp/visitor/access/" target="_blank" rel="noopener noreferrer">東京ビッグサイトのアクセス案内</a><a href="${e(data.sources.find(s => s.id === 'hotel').url)}" target="_blank" rel="noopener noreferrer">ホテルのアクセス</a></div>
`;
    const $ = id => document.getElementById(id);
    const selectedPlan = routes.default_plan_id;
    let selectedStage = routes.default_stage_id;
    let selectedLeg = 0;
    let mapRequested = false;
    let latestSrc = '';
    let currentLeg = null;
    let frame = null;
    function loadFrame(src) {
      latestSrc = src;
      if (!mapRequested) return;
      if (!frame) {
        frame = document.createElement('iframe');
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allowFullscreen = true;
        frame.title = '選択した区間のGoogleマップ';
        frame.setAttribute('loading', 'eager');
        $('map-framebox').replaceChildren(frame);
      }
      frame.title = $('map-route-heading').textContent + ' — Googleマップ';
      if (frame.getAttribute('src') !== src) frame.src = src;
    }
    function ids() {return routes.plan_stages[selectedPlan][selectedStage];}
    function renderSelectedLeg() {
      const routeIds = ids();
      currentLeg = routes.legs[routeIds[selectedLeg]];
      $('map-mode').textContent = label(currentLeg);
      $('map-route-heading').textContent = place(currentLeg.from).label + ' → ' + place(currentLeg.to).label;
      $('map-leg-note').textContent = currentLeg.note;
      $('map-open').href = directionsUrl(currentLeg);
      $('map-leg-select').value = String(selectedLeg);
      $('map-counter').textContent = (selectedLeg + 1) + ' / ' + routeIds.length;
      $('map-prev').disabled = selectedLeg === 0;
      $('map-next').disabled = selectedLeg === routeIds.length - 1;
      host.querySelectorAll('[data-leg]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.leg) === selectedLeg)));
      $('map-view-label').textContent = '選択した区間の経路プレビュー（経路が表示されない場合はGoogleマップで開く）';
      loadFrame(embedUrl(currentLeg));
    }
    function renderRoutes() {
      $('map-phases').innerHTML = Object.entries(routes.stages).map(([id, s]) => `<button type="button" data-stage="${e(id)}" aria-pressed="${id === selectedStage}">${e(s.label)}</button>`).join('');
      const routeIds = ids();
      selectedLeg = Math.min(selectedLeg, routeIds.length - 1);
      const chain = [place(routes.legs[routeIds[0]].from).label, ...routeIds.map(id => place(routes.legs[id].to).label)];
      $('map-chain').textContent = chain.join(' → ');
      $('map-legs').innerHTML = routeIds.map((id, i) => {const leg=routes.legs[id];return `<li><button type="button" class="map-leg" data-leg="${i}" aria-pressed="${i === selectedLeg}"><strong>${i+1}. ${e(place(leg.from).label)} → ${e(place(leg.to).label)}</strong><small>${e(label(leg))}</small></button></li>`;}).join('');
      $('map-leg-select').innerHTML = routeIds.map((id, i) => {const leg=routes.legs[id];return `<option value="${i}">${i+1}. ${e(place(leg.from).label)} → ${e(place(leg.to).label)}（${e(label(leg))}）</option>`;}).join('');
      renderSelectedLeg();
    }
    host.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.stage) {selectedStage=button.dataset.stage;selectedLeg=0;renderRoutes();}
      else if (button.dataset.leg !== undefined) {selectedLeg=Number(button.dataset.leg);renderSelectedLeg();}
    });
    $('map-leg-select').addEventListener('change', event => {selectedLeg=Number(event.target.value);renderSelectedLeg();});
    $('map-prev').addEventListener('click', () => {if(selectedLeg>0){selectedLeg--;renderSelectedLeg();}});
    $('map-next').addEventListener('click', () => {if(selectedLeg<ids().length-1){selectedLeg++;renderSelectedLeg();}});
    $('map-place-only').addEventListener('click', () => {$('map-view-label').textContent='目的地周辺の地図（経路線ではありません）';mapRequested=true;loadFrame('https://maps.google.com/maps?' + new URLSearchParams({q:place(currentLeg.to).query,hl:'ja',z:'15',output:'embed'}));});
    $('map-route-again').addEventListener('click', () => {mapRequested=true;renderSelectedLeg();});
    renderRoutes();
    // Load only one map and only when the section is near the viewport.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {if(entries.some(entry=>entry.isIntersecting)){mapRequested=true;loadFrame(latestSrc);observer.disconnect();}}, {rootMargin:'200px'});
      observer.observe(host);
    } else {mapRequested=true;loadFrame(latestSrc);}
    if (location.hash === '#maps') host.scrollIntoView({block:'start'});
  } catch (error) {
    console.error('Route map setup:', error);
    host.innerHTML = '<h2 id="maps-heading">Googleマップで経路を見る</h2><div class="notice">経路データを読み込めませんでした。ページを再読み込みしてください。予算・行程は引き続き利用できます。</div>';
  }
}());

/* Dinner candidates: one semantic object drives the view and JSON export. */
(function addDinnerCandidates() {
  'use strict';
  if (document.getElementById('dinner')) return;
  const dinner = {
    schema_version: '1.0', date: '2026-10-03', checked_date: '2026-09-27',
    status: '候補比較・店は未決定・未予約', selected_restaurant_id: null,
    budget_jpy_per_person: 7000,
    budget_scope: '料理・飲み物・席料を含む仮置き。確定予算や店のコース料金ではありません。',
    availability: '10/3・3名の空席と当日の営業・提供料理は未確認です。掲載価格は予約時に再確認してください。',
    integration: '交通・宿泊予算に10/3夕食代を加算。その他の食費・入場券等は別です。',
    timing: {
      rail: '19:30〜20:00開始 → 21:30〜22:00終了を目安'
    },
    safety_plan: '夕食はホテルから徒歩で往復します。',
    candidates: [
      {
        id: 'sante', name: 'Deli & Vino Maru-shu Sante', short_name: 'マルシュ サンテ', genre: 'ビストロ・ワイン',
        fit: '肉料理だけでなく、前菜や煮込みも楽しみたいときの候補。',
        address: '東京都江戸川区西葛西6-11-1', phone: '03-6808-8186',
        hours: '掲載ディナー時間 17:00〜23:00／不定休',
        menu_samples: '合鴨のコンフィー 1,980円、ラムチョップのロースト 2,500円、パテ・ド・カンパーニュ 980円。いずれも掲載税込価格。',
        order_idea: 'メインを2種類と前菜を3人でシェアし、追加料理・飲み物を予算に合わせる。日替わり肉料理は当日確認。',
        caution: '席料500円の掲載があります。7,000円の中に席料も含めて考えます。ステーキなど特定の日替わり料理があるとは限りません。',
        seats: '掲載22席・全席禁煙。3名席は未確保。',
        url: 'https://tabelog.com/tokyo/A1313/A131305/13305502/',
        source_url: 'https://tabelog.com/tokyo/A1313/A131305/13305502/dtlmenu/',
        source_title: '店舗掲載メニュー・営業時間（食べログ）'
      },
      {
        id: 'chelsea', name: 'Chelsea Tokyo', short_name: 'チェルシー トウキョウ', genre: 'イタリアン・ワイン',
        fit: '肉の煮込みとパスタを組み合わせて楽しみたいときの候補。',
        address: '東京都江戸川区西葛西5-1-9 5F', phone: '03-6822-0372',
        hours: '掲載 17:00〜23:00（料理L.O.22:00、飲み物22:30）／火曜休',
        menu_samples: '牛ホホ肉の赤ワイン煮込み、粗びきミンチのボロネーゼを店舗が紹介しています。おまかせコースは6,500円の掲載。',
        order_idea: '飲み物込み7,000円を目指すなら単品注文を軸に、煮込み・パスタ・前菜の量を相談する。',
        caution: 'カウンター7席のみ。3人が横並びで座れるか確認が必要です。6,500円コースの飲み物・追加料金込み総額は未確認のため、7,000円に収まるとは扱いません。',
        seats: '3名横並びの空席は未確認。テーブル席のある店としては掲載しません。',
        url: 'https://tabelog.com/tokyo/A1313/A131305/13314760/',
        source_url: 'https://tabelog.com/tokyo/A1313/A131305/13314760/',
        source_title: '店舗案内・料理紹介・席数（食べログ）'
      },
      {
        id: 'amigo', name: 'EL-AMIGO 西葛西店', short_name: 'エル・アミーゴ', genre: 'ステーキ・メキシカン',
        fit: '前菜よりも、ヒレステーキそのものに予算を使いたいときの候補。',
        address: '東京都江戸川区西葛西6-14 メトロセンター1番街', phone: '03-3675-2340',
        hours: '公式掲載 17:00〜22:30（L.O.21:45）／火曜・第2第4月曜休',
        menu_samples: '公式ページ掲載の特上ヒレステーキは150g 4,890円／220g 6,890円（税込）。価格改定の可能性があるため、来店時価格は要確認。',
        order_idea: '150gのヒレを中心に、サイドをシェアして飲み物を追加。220gでは仮置きの7,000円まで残り110円なので、飲み物やサイドを追加するなら予算の調整が必要。',
        caution: '掲載価格と当日価格は同一と保証されません。クーポン利用を前提にせず、7,000円前後で頼める内容を確認します。',
        seats: 'テーブル席のある店舗。10/3の3名席は未確保。',
        url: 'https://amigo1979nishikasai.com/',
        source_url: 'https://amigo1979nishikasai.com/',
        source_title: '西葛西店公式・メニュー／営業時間'
      },
      {
        id: 'taisho', name: '炭火焼肉 大将', short_name: '大将（西葛西）', genre: '焼肉・焼鳥',
        fit: '焼きながら、タン・カルビ・ハラミを食べ比べたいときの候補。',
        address: '東京都江戸川区西葛西3-14-1', phone: '03-3688-8066',
        hours: '公式掲載 土曜11:00〜24:00（L.O.23:00）／早仕舞いの場合あり',
        menu_samples: '上タン塩 2,480円、上カルビ 2,680円、特上ハラミ 2,880円。いずれも掲載税込価格。',
        order_idea: '肉を数種類シェアし、追加肉・ご飯物・飲み物を3人の合計予算に合わせて注文する。',
        caution: 'コースの条件は未確認のため、単品注文で検討しています。',
        seats: '公式案内は店内禁煙。店外に喫煙スペースあり。3名席は未確保。',
        url: 'https://yakiniku-taishou.owst.jp/',
        source_url: 'https://yakiniku-taishou.owst.jp/',
        source_title: '公式メニュー・営業時間・席の案内'
      }
    ]
  };
  original.dinner = structuredClone(dinner);
  data.dinner = structuredClone(dinner);
  const host = document.createElement('section');
  host.id = 'dinner';
  host.setAttribute('aria-labelledby', 'dinner-heading');
  document.getElementById('edit').before(host);
  const nav = document.createElement('a');
  nav.href = '#dinner'; nav.textContent = '10/3の夕食';
  const navBefore = document.querySelector('header nav a[href="#edit"]');
  navBefore.before(nav);
  const css = document.createElement('style');
  css.textContent = `
#dinner{scroll-margin-top:20px}#dinner h3{font-size:20px;overflow-wrap:anywhere}.dinner-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.dinner-card{padding:22px;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius)}.dinner-card p{font-size:14px}.dinner-card details{margin:14px 0}.dinner-card summary{font-size:14px;padding:10px 12px}.dinner-card .detailbody{padding:0 12px 12px}.dinner-card .dinner-address{font-size:13px;color:var(--muted)}.dinner-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.dinner-links a{font-size:13px;padding:8px 11px;min-height:42px;border:1px solid var(--line);border-radius:8px;text-decoration:none;display:inline-flex;align-items:center}.dinner-links a:first-child{background:var(--soft)}.dinner-source{font-size:12px!important;color:var(--muted)}.dinner-budget{margin:18px 0;background:var(--paper);padding:18px;border:1px solid var(--line);border-radius:12px}.dinner-budget label{font-size:14px;display:block}.dinner-budget input{width:160px;font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;margin:6px 8px 6px 0}.dinner-totals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px}.dinner-total{padding:12px;background:var(--soft);border-radius:10px}.dinner-total strong,.dinner-total small{display:block}.dinner-total strong{font-size:23px}.dinner-total small{font-size:12px;color:var(--muted)}.dinner-timing{padding-left:20px;font-size:14px}.dinner-timing li{margin:8px 0}
@media(max-width:760px){.dinner-grid,.dinner-totals{grid-template-columns:1fr}.dinner-card{padding:18px}.dinner-total{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px}.dinner-total small{grid-column:1/-1}.dinner-links a{flex-grow:1;justify-content:center}}
@media print{.dinner-grid{grid-template-columns:1fr 1fr}.dinner-card{break-inside:avoid}.dinner-budget input{border:0}.dinner-links{display:none}}
`;
  document.head.append(css);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (url, text) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(text)}</a>`;
  const hotel = data.assumptions.hotel_name.replace(/（.*?）/g, '') + ' ' + data.assumptions.hotel_location;
  const walk = (from,to) => 'https://www.google.com/maps/dir/?' + new URLSearchParams({api:'1',origin:from,destination:to,travelmode:'walking'});
  host.innerHTML = `
<h2 id="dinner-heading">10/3（土）の夕食候補</h2>
<p><strong>肉料理を楽しむ4店。夕食7,000円／人は仮置きです。</strong><br><span class="note">${escape(dinner.status)}。${escape(dinner.budget_scope)}</span></p>
<div class="notice">${escape(dinner.availability)}</div>
<div class="dinner-grid">${dinner.candidates.map(r => {
 const query=r.name+' '+r.address;
 return `<article class="dinner-card" id="dinner-${escape(r.id)}"><span class="pill">${escape(r.genre)}・未予約</span><h3>${escape(r.name)}</h3><p>${escape(r.fit)}</p><p class="dinner-address">${escape(r.address)}<br>${escape(r.hours)}</p><p><strong>注文の組み方（提案）</strong><br>${escape(r.order_idea)}</p><details><summary>料理の掲載価格・予算と席の注意</summary><div class="detailbody"><p>${escape(r.menu_samples)}</p><p><strong>注意：</strong>${escape(r.caution)}</p><p>${escape(r.seats)}</p></div></details><div class="dinner-links">${link(r.url,'店舗・予約案内 ↗')}${link(walk(hotel,query),'宿 → 店（徒歩） ↗')}${link(walk(query,hotel),'店 → 宿（徒歩） ↗')}<a href="tel:${escape(r.phone)}">電話 ${escape(r.phone)}</a></div><p class="dinner-source">確認元：${link(r.source_url,r.source_title)}／${escape(dinner.checked_date)}参照。掲載内容と当日の提供内容は異なる場合があります。</p></article>`;
 }).join('')}</div>
<div class="dinner-budget"><h3>10/3の夕食代を加えると</h3><p class="note">${escape(dinner.integration)}</p><label for="dinner-budget-input">夕食の予算／1人（円）</label><input type="number" id="dinner-budget-input" min="0" step="100" inputmode="numeric"><span id="dinner-group-total"></span><p id="dinner-budget-error" class="error" role="status"></p><div id="dinner-totals" class="dinner-totals" aria-live="polite"></div><p class="note">宿代・都内交通費は仮予算です。入力値の変更はこの画面だけに反映されます。</p></div>
<details><summary>夕食開始時間の目安</summary><div class="detailbody"><ul class="dinner-timing">${data.plans.map(p=>`<li><strong>${escape(p.name)}</strong>：${escape(dinner.timing[p.id])}</li>`).join('')}</ul><p class="note">開始時刻は提案で、予約時刻ではありません。移動の遅れ・チェックイン・徒歩時間を見込んで決めてください。</p><p>${escape(dinner.safety_plan)}</p></div></details>
`;
  function renderDinnerTotals() {
    const meal = data.dinner.budget_jpy_per_person;
    const input = document.getElementById('dinner-budget-input');
    if (document.activeElement !== input) input.value = String(meal);
    document.getElementById('dinner-group-total').textContent = data.trip.adults + '人で ' + yen(meal*data.trip.adults,1);
    document.getElementById('dinner-totals').innerHTML = data.plans.map(p => {
      const total = calc(p).total + meal;
      return `<div class="dinner-total"><span>${escape(p.name)}</span><strong>約${yen(total)}／人</strong><small>交通・宿泊＋10/3夕食</small></div>`;
    }).join('');
  }
  document.getElementById('dinner-budget-input').addEventListener('input',event=>{
    const value = Number(event.target.value);
    if (event.target.value === '' || !Number.isFinite(value) || value < 0) {
      document.getElementById('dinner-budget-error').textContent='0以上の金額を入力してください。'; return;
    }
    document.getElementById('dinner-budget-error').textContent='';
    data.dinner.budget_jpy_per_person=value;renderDinnerTotals();
  });
  // Reuse the existing calculator, rather than duplicating its cost logic.
  const baseRender = render;
  render = function renderWithDinner() {baseRender();renderDinnerTotals();};
  document.getElementById('reset').addEventListener('click',()=>{
    document.getElementById('dinner-budget-input').value=String(data.dinner.budget_jpy_per_person);
    document.getElementById('dinner-budget-error').textContent='';
  });
  renderDinnerTotals();
  if (location.hash === '#dinner') host.scrollIntoView({block:'start'});
}());
