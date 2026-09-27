/* Load the existing route/dinner UI, then apply the user's selected transport plan. */
(async function loadTripView() {
  'use strict';
  const status = document.createElement('p');
  status.className = 'notice';
  status.setAttribute('role', 'status');
  status.textContent = '新幹線の選択内容を読み込んでいます。';
  document.querySelector('header').after(status);
  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.append(script);
    });
  }
  try {
    await load('./trip-ui.js?v=20260927-rail1');
    await load('./rail-selection.js?v=20260927-rail1');
    if (!document.getElementById('selected-plan')) throw new Error('Selected plan view did not initialize');
    status.remove();
  } catch (error) {
    console.error('Trip view loading:', error);
    status.textContent = '移動手段は新幹線に決定しています。更新表示を読み込めませんでした。再読み込みしてください。下に残っている車案は以前の比較資料です。';
  }
}());
