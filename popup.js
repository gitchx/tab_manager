document.addEventListener('DOMContentLoaded', function() {

  const tabList = document.getElementById('tab-list');
  const closeButton = document.getElementById('close-tabs');
  const selectAllButton = document.getElementById('select-all');
  const deselectAllButton = document.getElementById('deselect-all');
  const searchBox = document.getElementById('search-box');
  const message = document.getElementById('message');

  let tabState = {};
  let allTabs = [];

  // チェック状態を読み込み
  chrome.storage.local.get('tabState', function(data) {
    tabState = data.tabState || {};

    // タブを初期読み込み
    updateTabs();
  });

  // タブのリストを更新する関数
  function updateTabs() {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      allTabs = tabs;
      renderTabList(tabs);
    });
  }

  // タブリストを描画する関数
  function renderTabList(tabs) {
    tabList.innerHTML = '';

    const query = searchBox.value.toLowerCase();

    tabs.forEach(function(tab) {
      if (tab.title.toLowerCase().includes(query)) {
        let listItem = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.tabId = tab.id;
        checkbox.checked = tabState[tab.id] || false;

        checkbox.addEventListener('change', function() {
          tabState[tab.id] = checkbox.checked;
          chrome.storage.local.set({ tabState: tabState });
        });

        let favicon = document.createElement('img');
        favicon.src = tab.favIconUrl || 'chrome://favicon';

        let title = document.createElement('span');
        title.textContent = tab.title;

        listItem.appendChild(checkbox);
        listItem.appendChild(favicon);
        listItem.appendChild(title);
        tabList.appendChild(listItem);
      }
    });
  }

  // タブの検索機能
  searchBox.addEventListener('input', function() {
    renderTabList(allTabs);
  });

  // すべて選択ボタン
  selectAllButton.addEventListener('click', function() {
    allTabs.forEach(function(tab) {
      tabState[tab.id] = true;
    });
    chrome.storage.local.set({ tabState: tabState }, function() {
      renderTabList(allTabs);
    });
  });

  // すべて解除ボタン
  deselectAllButton.addEventListener('click', function() {
    allTabs.forEach(function(tab) {
      tabState[tab.id] = false;
    });
    chrome.storage.local.set({ tabState: tabState }, function() {
      renderTabList(allTabs);
    });
  });

  // タブを閉じるボタン
  closeButton.addEventListener('click', function() {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      tabs.forEach(function(tab) {
        if (!tabState[tab.id]) {
          chrome.tabs.remove(tab.id);
          delete tabState[tab.id]; // タブが閉じられたので状態を削除
        }
      });
      chrome.storage.local.set({ tabState: tabState }, function() {
        message.textContent = '未チェックのタブを閉じました。';
        updateTabs();
      });
    });
  });

  // タブの自動更新
  chrome.tabs.onCreated.addListener(updateAndRefresh);
  chrome.tabs.onRemoved.addListener(updateAndRefresh);
  chrome.tabs.onUpdated.addListener(updateAndRefresh);

  function updateAndRefresh() {
    updateTabs();
  }

});
