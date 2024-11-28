chrome.runtime.onInstalled.addListener(function() {
    // 必要な場合の初期化処理
  });
  
  // タブのイベントをリッスンしておく（ポップアップが開いていなくても）
  chrome.tabs.onCreated.addListener(function(tab) {
    // 特別な処理が必要ならここに記述
  });
  
  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    // 特別な処理が必要ならここに記述
  });
  