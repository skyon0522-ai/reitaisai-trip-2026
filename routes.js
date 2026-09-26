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
    const response = await fetch('./routes.json?v=20260927-1', {cache: 'no-cache'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const routes = await response.json();
    const origin = routes.places[routes.origin_id];
    if (!origin || !routes.plan_stages || !routes.legs) throw new Error('経路データの形式を確認してください。');
    // Include exactly the same route definitions in the existing JSON export/reset.
    original.map_routes = routes;
    data.map_routes = structuredClone(routes);
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
      if (leg.mode === 'transit') return leg.line || '公共交通';
      return leg.road === 'local' ? '一般道・有料／高速回避' : '高速道路を利用';
    }
    function directionsUrl(leg) {
      const params = new URLSearchParams({api:'1', origin:place(leg.from).query, destination:place(leg.to).query, travelmode:leg.mode});
      if (leg.mode === 'driving') params.set('avoid', leg.road === 'local' ? 'highways,tolls,ferries' : 'ferries');
      return 'https://www.google.com/maps/dir/?' + params;
    }
    function embedUrl(leg) {
      // Keyless Google Maps directions preview. The supported Maps URL above is
      // always available separately because embedded results can vary by client.
      const mode = leg.mode === 'transit' ? 'r' : leg.mode === 'walking' ? 'w' : leg.road === 'local' ? 'dht' : 'd';
      const params = new URLSearchParams({f:'d', saddr:place(leg.from).query, daddr:place(leg.to).query, dirflg:mode, hl:'ja', output:'embed'});
      return 'https://maps.google.com/maps?' + params;
    }
    host.innerHTML = `
<h2 id="maps-heading">Googleマップで経路を見る</h2>
<p class="map-intro"><strong>${e(origin.label)}を出発し、同じ駅に戻る3案です。</strong>プラン → 日程 → 区間の順に選ぶと、表示する地図を切り替えられます。</p>
<div class="map-pickers" id="map-plans" role="group" aria-label="移動プラン"></div>
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
<details><summary>経路の道路条件・列車・料金について</summary><div class="detailbody map-note"><p><strong>一般道と高速を混在させるため、車はICごとに分けています。</strong>ページ内地図は経路の参考表示です。道路条件は「Googleマップで開く」で確認し、一般道区間は高速・有料道路を避ける設定、高速区間は回避OFFにしてください。Googleの候補は、この計画の道路を固定したものではありません。</p><p><strong>公共交通は旅行日・時刻をGoogleマップ上で設定してください。</strong>10/3・10/4の列車や接続を自動指定するリンクではありません。ICと会場は代表地点で、実際の出入口・駐車場・待機列の場所は当日の案内に従ってください。</p><p>料金表の800kmは燃料の共通予算枠のままです。地図上の実走距離・所要時間・渋滞を料金表へ自動反映するものではありません。</p></div></details>
<div class="map-resources"><a href="https://www.bigsight.jp/visitor/parking/" target="_blank" rel="noopener noreferrer">会場の駐車場・営業案内</a><a href="${e(data.sources.find(s => s.id === 'hotel').url)}" target="_blank" rel="noopener noreferrer">ホテルのアクセス</a><a href="${e(routes.source_url)}" target="_blank" rel="noopener noreferrer">経路リンクの仕様（Google公式）</a></div>
`;
    const $ = id => document.getElementById(id);
    let selectedPlan = routes.default_plan_id;
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
      const planNames = Object.fromEntries(data.plans.map(p => [p.id, p.name]));
      $('map-plans').innerHTML = Object.keys(routes.plan_stages).map(id => `<button type="button" data-plan="${e(id)}" aria-pressed="${id === selectedPlan}">${e(planNames[id])}</button>`).join('');
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
      if (button.dataset.plan) {selectedPlan=button.dataset.plan;selectedLeg=0;renderRoutes();}
      else if (button.dataset.stage) {selectedStage=button.dataset.stage;selectedLeg=0;renderRoutes();}
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
    host.innerHTML = '<h2 id="maps-heading">Googleマップで経路を見る</h2><div class="notice">経路データを読み込めませんでした。ページを再読み込みしてください。既存の費用比較・行程は引き続き利用できます。</div>';
  }
}());
