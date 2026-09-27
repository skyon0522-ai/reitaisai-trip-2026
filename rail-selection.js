/* Apply the user's transport decision. The existing comparison is retained as reference. */
(function applyRailDecision() {
  'use strict';
  if (document.getElementById('selected-plan')) return;
  const decision = {
    selected_plan_id: 'rail',
    status: 'user_selected',
    selected_date: '2026-09-27',
    source: 'この会話でユーザーが新幹線案を選択',
    scope: '移動手段の決定。列車・座席・宿・夕食店の予約成立を意味しない。',
    recommendation_plan_id: null,
    previous_recommendation_plan_id: 'highway',
    booking_status: '未確認・この更新で予約や取消は実行していない'
  };
  function updateSemantic(target) {
    target.schema_version = '2.3';
    target.title = '新潟駅発・秋季例大祭｜新幹線プラン';
    target.decision = structuredClone(decision);
    target.last_update = '2026-09-27: 新幹線選択＋10/3出発期限＋夕食7,000円仮置きを反映';
    target.trip.transport = 'shinkansen';
    target.trip.selected_plan_id = decision.selected_plan_id;
    target.trip.outbound_departure_rule = {
      date: '2026-10-03',
      origin: '新潟駅',
      departure_time: '任意',
      latest_departure: '16:22',
      meaning: '10/3は任意の新幹線を選べるが、現在の旅程では遅くとも16:22までに新潟駅を出発する。16:22発とき76号は出発期限の基準として残す。'
    };
    target.plans.forEach(p => {
      p.selection_status = p.id === decision.selected_plan_id ? 'selected' : 'reference_only';
      p.assessment = p.id === decision.selected_plan_id
        ? '移動手段として選択済み。列車・座席・購入価格の確定ではありません。'
        : '選択していない車案。比較用の参考資料として保持しています。';
    });
    const railPlan = target.plans.find(p => p.id === 'rail');
    if (railPlan && railPlan.schedule && railPlan.schedule[0]) {
      railPlan.schedule[0].time = '任意（遅くとも16:22までに新潟駅を出発）';
      railPlan.schedule[0].action = '新潟駅から東京へ。16:22発「とき76号」は出発期限の基準。より早い便を選んでよい。';
      railPlan.schedule[0].status = 'ユーザー指定：出発時刻は任意／16:22まで';
    }
    if (target.parking) target.parking.applicability = 'not_used_in_selected_plan';
    target.assumptions.selected_plan_parking_status = '新幹線案では宿・有明の駐車場は利用対象外。予約や取消は実行していない。';
    if (target.dinner) {
      target.dinner.active_plan_id = decision.selected_plan_id;
      target.dinner.integration = '新幹線の交通・宿泊予算に10/3夕食7,000円／人を仮置きで加算。店・注文・実支払額は未確定です。その他の食費・入場券等は別です。';
      target.dinner.budget_status = '7,000円／人は比較用の仮置き。店・注文内容・実支払額は未確定。';
      target.dinner.budget_scope = '料理・飲み物・席料を含む夕食代として7,000円／人を仮置き。確定予算ではない。';
      if (target.dinner.timing) target.dinner.timing.rail = '到着時刻に応じて任意。遅くとも16:22新潟発なら19:30〜20:00開始を目安';
      target.dinner.safety_plan = '夕食はホテルから徒歩で往復します。翌朝は電車で会場へ向かう計画です。';
    }
    const change = '移動手段はユーザー指定で新幹線に決定。車・駐車計画は参考資料へ移動し、予約状態とは区別。';
    const departureChange = '10/3の新潟駅出発時刻は任意。ただし現在の旅程では遅くとも16:22までに出発する。';
    const dinnerChange = '10/3夕食7,000円／人は確定予算ではなく、旅行総額比較のための仮置き。';
    if (!target.changes_from_previous.includes(change)) target.changes_from_previous.push(change);
    if (!target.changes_from_previous.includes(departureChange)) target.changes_from_previous.push(departureChange);
    if (!target.changes_from_previous.includes(dinnerChange)) target.changes_from_previous.push(dinnerChange);
  }
  updateSemantic(original);
  updateSemantic(data);
  const $ = id => document.getElementById(id);
  const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const selected = () => data.plans.find(p => p.id === data.decision.selected_plan_id);
  const summary = document.createElement('section');
  summary.id = 'selected-plan';
  summary.setAttribute('aria-labelledby', 'selected-heading');
  $('compare').before(summary);
  const archive = document.createElement('details');
  archive.id = 'alternatives';
  archive.innerHTML = '<summary>参考資料：選択しなかった車案・駐車計画・3案比較</summary><div class="detailbody" id="alternative-content"><p class="note">今回は新幹線を利用します。この中の車・駐車計画は予約対象ではありません。比較時の仮予算・候補を参考として残しています。</p></div>';
  $('evidence').before(archive);
  ['compare','time','parking'].forEach(id => {const node=$(id);if(node)$('alternative-content').append(node);});
  const css = document.createElement('style');
  css.textContent = `
[hidden]{display:none!important}#selected-plan,#detail,#dinner,#alternatives{scroll-margin-top:20px}.selected-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:16px}.selected-price{font-size:clamp(28px,5vw,40px);font-weight:750;line-height:1.4;margin:10px 0}.selected-price small{font-size:14px;font-weight:400}.selected-costs{list-style:none;margin:14px 0;padding:0}.selected-costs li{display:flex;justify-content:space-between;gap:14px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}.selected-status{margin-top:12px}.selected-todo{margin:10px 0;padding-left:22px}.selected-todo li{padding:5px 0}.rail-only-total{display:block!important}.rail-only-total .dinner-total{display:block}.rail-only-total .dinner-total strong{font-size:28px}.reference-note{padding:10px 14px;background:var(--warnbg);border-radius:8px;font-size:14px}#alternatives>summary{font-size:16px}#alternatives section{margin:20px 0}#alternatives .cards{grid-template-columns:repeat(3,minmax(0,1fr))}#alternatives h2{font-size:20px}#selected-plan .selected-fare-note{font-size:13px;color:var(--muted)}
@media(max-width:760px){.selected-grid{grid-template-columns:1fr}#alternatives .cards{grid-template-columns:1fr}#alternatives>.detailbody{padding:0 12px 16px}.selected-price{font-size:32px}}
@media print{#alternatives{display:none}.selected-grid{grid-template-columns:1fr 1fr}}
`;
  document.head.append(css);
  // Preserve IDs and existing input listeners; only the active presentation changes.
  document.querySelector('header nav').innerHTML = '<a href="#selected-plan">決定したプラン</a><a href="#detail">新幹線の行程</a><a href="#maps">経路マップ</a><a href="#dinner">10/3の夕食</a><a href="#edit">予算を変更</a><a href="#alternatives">過去の比較</a><a href="#evidence">確認元</a>';
  function renderSelection() {
    const p = selected();
    const a = data.assumptions;
    const n = data.trip.adults;
    const meal = data.dinner ? data.dinner.budget_jpy_per_person : 0;
    const cost = calc(p);
    const total = cost.total + meal;
    const regularTotal = 2*a.shinkansen_regular_one_way_jpy + a.local_rail_budget_jpy_per_person + a.hotel_room_total_jpy/n + meal;
    document.title = data.title;
    document.querySelector('header h1').innerHTML = '新潟駅発・秋季例大祭<br>新幹線で行く1泊2日';
    document.querySelector('header .intro').innerHTML = '<strong>移動手段は新幹線に決定。10/3の新潟駅出発は任意ですが、遅くとも16:22までに出発します。</strong>早い便で東京入りしても構いません。都内は電車と徒歩で移動します。';
    const notice = document.querySelector('header .notice');
    notice.innerHTML = '<strong>新幹線案：選択済み／予約状況：未確認</strong><br><span id="hotelwarning"></span>';
    $('hotelwarning').textContent = '宿は比較用候補・1室'+yen(a.hotel_room_total_jpy,1)+'の仮予算です。乗車券・宿・夕食店の予約成立は確認できていません。この更新で予約・購入・取消は行っていません。';
    summary.innerHTML = `<h2 id="selected-heading">決定したプラン：新幹線</h2><div class="selected-grid"><div class="pane"><span class="pill">移動手段は選択済み</span><h3>交通・1泊・10/3夕食の予算</h3><div class="selected-price">約${yen(total)}<small>／人</small></div><p class="note">${n}人合計 約${yen(total*n)}。往復ともトクだ値1が取れた場合。</p><ul class="selected-costs"><li><span>新幹線往復（割引想定）</span><strong>${yen(cost.train,1)}</strong></li><li><span>都内交通（仮予算）</span><strong>${yen(cost.local,1)}</strong></li><li><span>宿泊（仮予算・${n}人割り）</span><strong>${yen(cost.hotel,1)}</strong></li><li><span>10/3夕食（仮置き）</span><strong>${yen(meal,1)}</strong></li></ul><p>通常期eチケットの参考価格なら<strong>約${yen(regularTotal)}／人</strong>です。</p><p class="selected-fare-note">割引席・選んだ列車での適用は未確認です。通常価格は通常期の価格例で、購入日の確定総額ではありません。<a href="${e(data.sources.find(s=>s.id==='rail_fare').url)}" target="_blank" rel="noopener noreferrer">えきねっとの価格例</a></p><p class="note">入場券・その他の食費・買い物・佐渡航路・新潟駅までの個別移動は別。駐車場代は新幹線案に含めず、追加請求の前提にもしていません。</p></div><div class="pane"><h3>次に確定すること</h3><ol class="selected-todo"><li>10/3は16:22までに新潟駅を出る便から選び、10/4の復路と合わせて3人分の座席・支払総額を確認する。</li><li>10/3の宿を大人3人・1泊で確保する。現在の宿は候補のまま。</li><li>10/3の夕食店を決める。${yen(meal,1)}／人は比較用の仮置きで、実際の上限・注文額は店を決める際に調整する。</li></ol><div class="selected-status"><span class="pill">駐車予約は今回不要</span><p class="note">宿・会場付近とも車を停める計画から外しました。外部で行った予約の有無は確認しておらず、取消手続きも行っていません。</p></div><p><a href="#detail">行程を見る</a> ／ <a href="#dinner">夕食候補を見る</a></p></div></div>`;
    document.querySelector('#detail h2').textContent = '新幹線プランの行程（時刻は購入前の候補）';
    $('itineraries').innerHTML = `<p class="note"><strong>10/3の新潟駅出発は任意ですが、遅くとも16:22までに出発します。</strong>16:22発「とき76号」は固定便ではなく出発期限の基準です。より早い便を選んで構いません。復路を含め、購入時に運転日・時刻・乗り継ぎ・座席を確認してください。</p><div class="pane steps">${p.schedule.map(s=>`<div class="step"><time>${e(s.date.slice(5).replace('-','/'))}<br>${e(s.time)}</time><div>${e(s.action)}<small>${s.source_id?(s.source_id.startsWith('train_')?'以前の時刻候補・予約未確認 · ':e(s.status)+' · ')+sourceLink(s.source_id):'計画上の目安'}</small></div></div>`).join('')}</div>`;
    const hotelDetails = $('hotelconditions').closest('details');
    hotelDetails.querySelector('summary').textContent = '宿泊候補・予約前の確認';
    $('hotelconditions').innerHTML = `<p><strong>${e(a.hotel_name)}</strong><br>${e(a.hotel_location)} ${sourceLink('hotel')}</p><p>10/3チェックイン・10/4チェックアウト、大人${n}人1室。${yen(a.hotel_room_total_jpy,1)}／室は仮予算です。指定日の販売価格・空室・予約成立は未確認です。</p><p>新幹線案ではホテル駐車場も有明の予約駐車場も利用しません。</p>`;
    const visibleKeys = ['hotel_room_total_jpy','local_rail_budget_jpy_per_person'];
    $('fields').querySelectorAll('input[data-key]').forEach(input=>{input.closest('label').hidden=!visibleKeys.includes(input.dataset.key);});
    document.querySelector('#edit h2').textContent = '新幹線案の宿・都内交通予算を変更';
    const dinnerBudget = $('dinner-totals');
    if (dinnerBudget) {
      dinnerBudget.classList.add('rail-only-total');
      dinnerBudget.innerHTML = `<div class="dinner-total"><span>新幹線・選択済み</span><strong>約${yen(total)}／人</strong><small>交通・宿泊＋10/3夕食。往復割引席を購入できた場合の仮予算。</small></div>`;
      const box = document.querySelector('#dinner .dinner-budget');
      box.querySelector('p.note').textContent = data.dinner.integration;
      box.querySelector('p.note:last-child').textContent = '宿代・都内交通費は仮予算で、割引席も未確保です。その他の食費・入場券等は別です。入力値の変更はこの画面だけに反映されます。';
      const timing = document.querySelector('#dinner .dinner-timing');
      if (timing) {
        timing.innerHTML = `<li><strong>新幹線案</strong>：${e(data.dinner.timing.rail)}</li>`;
        timing.closest('details').querySelector('summary').textContent = '新幹線で到着する場合の夕食開始時間';
        timing.parentElement.querySelector('p:last-child').textContent = data.dinner.safety_plan;
      }
    }
    const extra = [`移動手段は新幹線に決定。列車・座席・宿・夕食の予約成立は未確認。`,`10/3の新潟駅出発は任意。ただし現在の旅程では遅くとも16:22までに出発する。`,`10/3夕食${yen(meal,1)}／人は旅行総額比較のための仮置きで、確定予算ではない。`,`宿泊は${yen(a.hotel_room_total_jpy,1)}／室、都内交通は${yen(a.local_rail_budget_jpy_per_person,1)}／人の仮予算。`,`新幹線は往復トクだ値1の設定・空きがある場合を想定。通常価格の試算も価格例であり、購入総額ではない。`,`新潟駅発着の計画です。10/4中に佐渡へ戻れることを保証する行程ではありません。`];
    $('assumptions').innerHTML = extra.map(s=>`<li>${e(s)}</li>`).join('');
    document.querySelectorAll('#cards .card').forEach((card,i)=>{
      const chosen = data.plans[i].id === data.decision.selected_plan_id;
      card.classList.toggle('recommended',chosen);
      card.querySelector('.pill').textContent = chosen?'選択済み':'不採用・参考';
    });
    $('decision').textContent = '選択済みは③新幹線です。ここは移動手段を決める前の費用比較を残した参考資料です。';
    const parkingTitle = document.querySelector('#parking h2');
    if (parkingTitle) parkingTitle.textContent = '参考：新幹線案では利用しない駐車計画';
    document.getElementById('semantic-data').textContent = JSON.stringify(original);
  }
  const previousRender = render;
  render = function renderSelectedRailPlan(){previousRender();renderSelection();};
  // Dinner updates use their own renderer, so reapply the selected view afterwards.
  const mealInput = $('dinner-budget-input');
  if (mealInput) mealInput.addEventListener('input',renderSelection);
  render();
  // The map loads asynchronously. Select once, without overriding subsequent choices.
  function setInitialRailMap() {
    const railButton = document.querySelector('#map-plans [data-plan="'+data.decision.selected_plan_id+'"]');
    const outboundButton = document.querySelector('#map-phases [data-stage="outbound"]');
    if (!railButton || !outboundButton) return false;
    if (railButton.getAttribute('aria-pressed') !== 'true') railButton.click();
    const outbound = document.querySelector('#map-phases [data-stage="outbound"]');
    if (outbound.getAttribute('aria-pressed') !== 'true') outbound.click();
    [original,data].forEach(state=>{
      if(state.map_routes){state.map_routes.default_plan_id=state.decision.selected_plan_id;state.map_routes.default_stage_id='outbound';state.map_routes.selection_status='新幹線選択済み。車の経路は参考。';}
    });
    const intro = document.querySelector('#maps .map-intro');
    if(intro) intro.innerHTML='<strong>選択済みの新幹線ルートを最初に表示します。</strong>新潟駅発着で、電車・徒歩の各区間を確認できます。車2案の経路は参考として残しています。';
    document.getElementById('semantic-data').textContent=JSON.stringify(original);
    return true;
  }
  if (!setInitialRailMap()) {
    const mapHost=$('maps');
    if(mapHost){const observer=new MutationObserver(()=>{if(document.querySelector('#map-plans [data-plan="rail"]')){observer.disconnect();setInitialRailMap();}});observer.observe(mapHost,{childList:true,subtree:true});}
  }
  function revealTarget(){
    const id=location.hash.slice(1);
    if(['compare','parking','time','alternatives'].includes(id)) archive.open=true;
    const node=id?$(id):null;
    if(node)node.scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange',revealTarget);
  revealTarget();
}());
