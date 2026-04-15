chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "FOCUS_TAB") {
        // 找到發送消息的這個分頁
        const tabId = sender.tab.id;
        const windowId = sender.tab.windowId;

        // 1. 將該分頁設為活動分頁
        chrome.tabs.update(tabId, { active: true });
        // 2. 將該視窗設為焦點視窗（如果瀏覽器沒最小化，會跳到最前面）
        chrome.windows.update(windowId, { focused: true });
    }
});