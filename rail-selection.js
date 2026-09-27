/* Render the selected rail itinerary and budget. */
(function applyRailDecision() {
  'use strict';
  if (document.getElementById('selected-plan')) return;
  const decision = {
    selected_plan_id: 'rail',
    status: 'user_selected',
    selected_date: '2026-09-27',
    scope: '移動手段の決定。列車・座席・宿・夕食店の予約成立を意味しない。',
    booking_status: '未確認'
  };
  function updateSemantic(target) {
    target.schema_version = '2.3';
    target.title = '新潟駅発・秋季例大祭｜新幹線プラン';
    target.decision = structuredClone(decision);
    target.last_update = '2026-09-28';
    target.trip.transport = 'shinkansen';
    target.trip.selected_plan_id = decision.selected_plan_id;
    target.lodging = {
      id: 'minn_nishikasai', status: '代替候補・未予約', checked_date: '2026-09-27', checked_at: '2026-09-27T23:54:00+09:00',
      access: '西葛西駅北口から徒歩約3〜4分',
      room: 'スタンダードルーム（4ベッド）25㎡・禁煙。シングルベッド2台にバンクベッドとソファを備えた客室です。3人目の寝具は予約時に確認してください。',
      breakfast: '食事なし。朝食は別に用意', check_in: '15:00', check_out: '10:00',
      room_url: 'https://www.jalan.net/uw/uwp3200/uww3201init.do?yadNo=326205&planCd=03485126&roomTypeCd=0471104&stayYear=2026&stayMonth=10&stayDay=3&stayCount=1&roomCount=1&adultNum=3&roomCrack=300000&dateUndecided=0',
      booking_url: 'https://www.jalan.net/yad326205/plan/?stayYear=2026&stayMonth=10&stayDay=3&stayCount=1&roomCount=1&adultNum=3&dateUndecided=0',
      quoted_total_jpy: 25500, quoted_per_person_jpy: 8500, quote_status: '販売を確認・未予約',
      cancellation: '予約時からキャンセル料100%。オンラインカード決済。',
      room_preference: '3人1室に限定せず、2人部屋＋1人部屋も3人分の総額で比較。',
      alternative: {name:'Minn 葛西',total_jpy:28800,per_person_jpy:9600,room:'スタンダード4ベッド25㎡・禁煙・食事なし',booking_url:'https://www.jalan.net/yad373240/plan/?stayYear=2026&stayMonth=10&stayDay=3&stayCount=1&roomCount=1&adultNum=3&dateUndecided=0'},
      dinner_origin: '比較のためMinn 西葛西を起点に表示。宿は未決定。Minn 葛西を選ぶ場合は、葛西駅から西葛西駅へ東西線で1駅移動する。'
    };
    target.trip.outbound_departure_rule = {
      date: '2026-10-03',
      origin: '新潟駅',
      departure_time: '任意',
      latest_departure: '16:22',
      meaning: '10/3は任意の新幹線を選べるが、現在の旅程では遅くとも16:22までに新潟駅を出発する。16:22発とき76号は出発期限の基準として残す。'
    };
    target.trip.return_departure_rule = {
      date: '2026-10-04',
      origin: '東京駅',
      departure_time: '任意',
      latest_departure: '17:32',
      meaning: '10/4は任意の新幹線を選べるが、現在の旅程では遅くとも17:32までに東京駅を出発する。17:32発とき335号は帰路の最終ボーダーとして残す。より早い便を選んでよい。'
    };
    target.plans.forEach(p => {p.selection_status = 'selected';});
    const railPlan = target.plans.find(p => p.id === 'rail');
    if (railPlan && railPlan.schedule && railPlan.schedule[0]) {
      railPlan.schedule[0].time = '任意（遅くとも16:22までに新潟駅を出発）';
      railPlan.schedule[0].action = '新潟駅から東京へ。16:22発「とき76号」は出発期限の基準。より早い便を選んでよい。';
      railPlan.schedule[0].status = 'ユーザー指定：出発時刻は任意／16:22まで';
      const returnStep = railPlan.schedule[railPlan.schedule.length - 1];
      returnStep.time = '任意（遅くとも17:32までに東京駅を出発）';
      returnStep.action = '東京駅から新潟へ。17:32発「とき335号」は帰路の最終ボーダー。より早い便を選んでよい。';
      returnStep.status = 'ユーザー指定：帰路時刻は任意／17:32まで';
    }
    if (target.dinner) {
      target.dinner.active_plan_id = decision.selected_plan_id;
      target.dinner.integration = '新幹線の交通・宿泊予算に10/3夕食7,000円／人を仮置きで加算。店・注文・実支払額は未確定です。その他の食費・入場券等は別です。';
      target.dinner.budget_status = '7,000円／人は仮置き。店・注文内容・実支払額は未確定。';
      target.dinner.budget_scope = '料理・飲み物・席料を含む夕食代として7,000円／人を仮置き。確定予算ではない。';
      if (target.dinner.timing) target.dinner.timing.rail = '到着時刻に応じて任意。遅くとも16:22新潟発なら19:30〜20:00開始を目安';
      target.dinner.safety_plan = '夕食はホテルから徒歩で往復します。翌朝は電車で会場へ向かう計画です。';
    }

  }
  updateSemantic(original);
  updateSemantic(data);
  const $ = id => document.getElementById(id);
  const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const selected = () => data.plans.find(p => p.id === data.decision.selected_plan_id);
  const summary = document.createElement('section');
  summary.id = 'selected-plan';
  summary.setAttribute('aria-labelledby', 'selected-heading');
  document.querySelector('header').after(summary);
  const lodging = document.createElement('section');
  lodging.id = 'lodging';
  lodging.setAttribute('aria-labelledby', 'lodging-heading');
  lodging.innerHTML = '<h2 id="lodging-heading">10/3（土）の宿泊候補</h2><p>部屋数にこだわらず、3人分の総額で選びます。宿を決めてから、夕食店への移動を確認します。</p>';
  const hotelConditions = $('hotelconditions');
  const oldHotelDetails = hotelConditions.closest('details');
  hotelConditions.className = 'pane lodging-grid';
  lodging.append(hotelConditions);
  oldHotelDetails.remove();
  summary.after(lodging);
  lodging.after($('dinner'));
  $('detail').after($('maps'));
  const css = document.createElement('style');
  css.textContent = `
[hidden]{display:none!important}#selected-plan,#detail,#dinner{scroll-margin-top:20px}.selected-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:16px}.selected-price{font-size:clamp(28px,5vw,40px);font-weight:750;line-height:1.4;margin:10px 0}.selected-price small{font-size:14px;font-weight:400}.selected-costs{list-style:none;margin:14px 0;padding:0}.selected-costs li{display:flex;justify-content:space-between;gap:14px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px}.selected-todo{margin:10px 0;padding-left:22px}.selected-todo li{padding:5px 0}.rail-only-total{display:block!important}.rail-only-total .dinner-total{display:block}.rail-only-total .dinner-total strong{font-size:28px}#selected-plan .selected-fare-note{font-size:13px;color:var(--muted)}
@media(max-width:760px){.selected-grid{grid-template-columns:1fr}.selected-price{font-size:32px}}
@media print{.selected-grid{grid-template-columns:1fr 1fr}}
#lodging{scroll-margin-top:20px}.lodging-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.lodging-grid>div{min-width:0}.lodging-grid h3{font-size:20px}.lodging-facts{font-size:14px;padding-left:20px}.lodging-facts li{margin:8px 0}.lodging-next{border-left:1px solid var(--line);padding-left:24px}
@media(max-width:760px){.lodging-grid{grid-template-columns:1fr}.lodging-next{border-left:0;border-top:1px solid var(--line);padding-left:0;padding-top:20px}}
`;
  document.head.append(css);
  // Preserve IDs and existing input listeners; only the active presentation changes.
  document.querySelector('header nav').innerHTML = '<a href="#selected-plan">決定したプラン</a><a href="#lodging">10/3の宿泊</a><a href="#dinner">10/3の夕食</a><a href="#detail">新幹線の行程</a><a href="#maps">経路マップ</a><a href="#edit">予算を変更</a><a href="#evidence">確認元</a>';
  function renderSelection() {
    const p = selected();
    const a = data.assumptions;
    const n = data.trip.adults;
    const meal = data.dinner ? data.dinner.budget_jpy_per_person : 0;
    const cost = calc(p);
    const total = cost.total + meal;
    document.title = data.title;
    document.querySelector('header h1').innerHTML = '新潟駅発・秋季例大祭<br>新幹線で行く1泊2日';
    document.querySelector('header .intro').innerHTML = '<strong>移動手段は新幹線に決定。往路・復路とも時刻は任意ですが、10/3は新潟駅を16:22まで、10/4は東京駅を17:32までに出発します。</strong>どちらも早い便を選んで構いません。都内は電車と徒歩で移動します。';
    const notice = document.querySelector('header .notice');
    notice.innerHTML = '<strong>新幹線案：選択済み／予約状況：未確認</strong><br><span id="hotelwarning"></span>';
    $('hotelwarning').textContent = '宿は未決定です。Minn 西葛西を起点に、宿泊'+yen(a.hotel_room_total_jpy,1)+'／3人で試算しています。乗車券・宿・夕食店は予約成立未確認です。';
    summary.innerHTML = `<h2 id="selected-heading">決定したプラン：新幹線</h2><div class="selected-grid"><div class="pane"><span class="pill">移動手段は選択済み</span><h3>交通・1泊・10/3夕食の予算</h3><div class="selected-price">約${yen(total)}<small>／人</small></div><p class="note">${n}人合計 約${yen(total*n)}。通常期eチケットの参考額で仮計算。</p><ul class="selected-costs"><li><span>新幹線往復（通常期の参考額）</span><strong>${yen(cost.train,1)}</strong></li><li><span>都内交通（仮予算）</span><strong>${yen(cost.local,1)}</strong></li><li><span>宿泊（仮予算・${n}人割り）</span><strong>${yen(cost.hotel,1)}</strong></li><li><span>10/3夕食（仮置き）</span><strong>${yen(meal,1)}</strong></li></ul><p class="selected-fare-note">片道10,780円は通常期の参考額で、10/3・10/4の実売額・座席は未確認です。<a href="${e(data.sources.find(s=>s.id==='rail_fare').url)}" target="_blank" rel="noopener noreferrer">えきねっとの価格例</a></p><p class="note">入場券・その他の食費・買い物・新潟駅までの個別移動は別です。</p></div><div class="pane"><h3>次に確定すること</h3><ol class="selected-todo"><li>10/3は16:22までに新潟駅を出る便、10/4は17:32までに東京駅を出る便から選び、3人分の座席・支払総額を確認する。</li><li>10/3の宿を大人3人・1泊で確保する。現在の宿は候補のまま。</li><li>10/3の夕食店を決める。${yen(meal,1)}／人は仮置きで、実際の上限・注文額は店を決める際に調整する。</li></ol><p><a href="#lodging">宿泊候補を見る</a> ／ <a href="#dinner">夕食候補を見る</a></p></div></div>`;
    document.querySelector('#detail h2').textContent = '新幹線プランの行程（時刻は購入前の候補）';
    $('itineraries').innerHTML = `<p class="note"><strong>往路・復路とも出発時刻は任意です。</strong>10/3は遅くとも16:22までに新潟駅を出発、10/4は遅くとも17:32までに東京駅を出発します。16:22発「とき76号」と17:32発「とき335号」は固定便ではなく、それぞれのボーダーラインです。より早い便を選んで構いません。購入時に運転日・時刻・乗り継ぎ・座席を確認してください。</p><div class="pane steps">${p.schedule.map(s=>`<div class="step"><time>${e(s.date.slice(5).replace('-','/'))}<br>${e(s.time)}</time><div>${e(s.action)}<small>${s.source_id?(s.source_id.startsWith('train_')?'出発期限の基準便・予約未確認 · ':e(s.status)+' · ')+sourceLink(s.source_id):'計画上の目安'}</small></div></div>`).join('')}</div>`;
    const hotel = data.lodging;
    const hotelName = a.hotel_name.replace(/（.*?）/g, '');
    const hotelQuery = hotelName + ' ' + a.hotel_location;
    const stationWalk = 'https://www.google.com/maps/dir/?' + new URLSearchParams({api:'1',origin:'西葛西駅北口 東京都江戸川区',destination:hotelQuery,travelmode:'walking'});
    $('hotelconditions').innerHTML = `<div><span class="pill">${e(hotel.status)}</span><h3>${e(hotelName)}</h3><p class="note">${e(a.hotel_location)}<br>${e(hotel.access)} ${sourceLink('hotel')}</p><p><strong>販売確認額 ${yen(hotel.quoted_total_jpy,1)}／3人・1室</strong><br>1人${yen(hotel.quoted_per_person_jpy,1)}。10/3チェックイン、10/4チェックアウト。税込・サービス料込。</p><p class="note">9/27 23:54確認：指定日・大人3人1室で販売中。空室・料金は変わります。未予約です。ポイント還元は金額から差し引いていません。</p><p class="notice"><strong>${e(hotel.cancellation)}</strong><br>予約前に最終総額・取消条件を確認してください。</p><ul class="lodging-facts"><li>${e(hotel.room)} <a href="${e(hotel.room_url)}" target="_blank" rel="noopener noreferrer">客室・プラン詳細</a></li><li>チェックイン ${e(hotel.check_in)}／チェックアウト ${e(hotel.check_out)}</li><li>${e(hotel.breakfast)}。翌朝は07:45ごろに宿を出る計画です。</li><li>歯ブラシ・部屋着は持参してください。</li></ul><p class="note">画面の宿泊予算：${yen(a.hotel_room_total_jpy,1)}／3人（1人${yen(cost.hotel,1)}）。予算の入力を変えても、販売確認額は変わりません。</p><div class="dinner-links"><a href="${e(hotel.booking_url)}" target="_blank" rel="noopener noreferrer">じゃらんで10/3・3人の空室を見る ↗</a><a href="${e(stationWalk)}" target="_blank" rel="noopener noreferrer">西葛西駅 → 宿（徒歩） ↗</a><a href="#edit">宿泊予算を変更</a></div><details><summary>もう1つの候補：Minn 葛西（3人28,800円）</summary><p>${e(hotel.alternative.room)}。同じ日程・3人1室で1人${yen(hotel.alternative.per_person_jpy,1)}、税込・サービス料込。9/27販売確認、未予約。こちらも予約時からキャンセル料100%・オンラインカード決済です。</p><p>葛西駅から徒歩約3分。今の夕食候補へは東西線で西葛西まで1駅移動します。選ぶ場合は、宿・夕食・翌朝の経路を更新します。</p><a href="${e(hotel.alternative.booking_url)}" target="_blank" rel="noopener noreferrer">Minn 葛西の10/3・3人の空室を見る ↗</a></details></div><div class="lodging-next"><h3>この宿から夕食へ</h3><p>比較のため、Minn 西葛西を起点にしています。チェックイン後は、下の4店へ徒歩で向かう計画です。</p><p class="note">宿はまだ決定していません。各店の「宿 → 店（徒歩）」と経路マップはMinn 西葛西が起点です。別の宿を選ぶ場合は経路も更新します。</p><div class="dinner-links">${data.dinner.candidates.map(r=>`<a href="#dinner-${e(r.id)}">${e(r.short_name)}</a>`).join('')}</div><p><a href="#dinner">夕食候補の料理・予算を見る ↓</a></p></div>`;
    document.querySelector('#dinner > p').innerHTML = `<strong>${e(hotelName)}を仮の起点にした、西葛西の夕食候補4店。</strong><br><span class="note">夕食${yen(meal,1)}／人は仮置きです。店・注文内容・実際の支払額は未確定です。 <a href="#lodging">起点の宿泊候補を見る</a></span>`;
    document.querySelector('#edit h2').textContent = '新幹線案の宿・都内交通予算を変更';
    const dinnerBudget = $('dinner-totals');
    if (dinnerBudget) {
      dinnerBudget.classList.add('rail-only-total');
      dinnerBudget.innerHTML = `<div class="dinner-total"><span>新幹線・選択済み</span><strong>約${yen(total)}／人</strong><small>交通・宿泊＋10/3夕食。通常期eチケットの参考額を使った仮予算。</small></div>`;
      const box = document.querySelector('#dinner .dinner-budget');
      box.querySelector('p.note').textContent = data.dinner.integration;
      box.querySelector('p.note:last-child').textContent = '宿代・都内交通費は仮予算で、新幹線の実売額・座席も未確認です。その他の食費・入場券等は別です。入力値の変更はこの画面だけに反映されます。';
      const timing = document.querySelector('#dinner .dinner-timing');
      if (timing) {
        timing.innerHTML = `<li><strong>新幹線案</strong>：${e(data.dinner.timing.rail)}</li>`;
        timing.closest('details').querySelector('summary').textContent = '新幹線で到着する場合の夕食開始時間';
        timing.parentElement.querySelector('p:last-child').textContent = data.dinner.safety_plan;
      }
    }
    document.querySelector('#edit .note').innerHTML = '宿代・都内交通費の変更はこの画面だけに反映されます。<a href="#dinner-budget-input">夕食代はこちらで変更</a>。予約や外部送信は行いません。再読み込みで初期値に戻ります。';
    document.getElementById('semantic-data').textContent = JSON.stringify(original);
  }
  const previousRender = render;
  render = function renderSelectedRailPlan(){previousRender();renderSelection();};
  // Dinner updates use their own renderer, so reapply the selected view afterwards.
  const mealInput = $('dinner-budget-input');
  if (mealInput) mealInput.addEventListener('input',renderSelection);
  render();
  function revealTarget(){
    const id=location.hash.slice(1);
    const node=id?$(id):null;
    if(node)node.scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange',revealTarget);
  revealTarget();
}());
