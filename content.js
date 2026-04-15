let userTimers = new Map();
const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

console.log("🛡️ 防干擾模式已啟動：當前頁面活動時不強行跳轉");

setInterval(() => {
    if (!chrome.runtime?.id) return;

    const users = document.querySelectorAll('div[class*="conversation-list-index-module__item"]');

    users.forEach((user) => {
        if (!user) return;

        const userId = user.innerText.trim().split('\n')[0];
        if (!userId) return;

        // 鎖定紅色計時器變數
        const timerElement = user.querySelector('div[style*="--auxiliary_color_01"]');
        
        let hasActiveTimer = false;
        if (timerElement && timerElement.innerText.includes(':') && timerElement.innerText !== "00:00:00") {
            hasActiveTimer = true;
        }

        // 處理完畢移除監控
        if (!hasActiveTimer) {
            if (userTimers.has(userId)) {
                console.log(`✅ [${userId}] 計時結束，移除。`);
                userTimers.delete(userId);
            }
            return;
        }

        // 發現紅色計時
        if (!userTimers.has(userId)) {
            console.log(`🚨 發現等待中會員 [${userId}]...`);
            userTimers.set(userId, { startTime: Date.now(), isNotified: false });
        } else {
            let userData = userTimers.get(userId);
            let waitTime = (Date.now() - userData.startTime) / 1000;

            if (waitTime >= 15 && !userData.isNotified) {
                
                // --- 核心防呆邏輯 ---
                // 檢查目前分頁是否「被隱藏」（即：你不在這個頁面上）
                if (document.hidden) {
                    console.log(`🏠 你不在頁面上，執行強制喚醒：${userId}`);
                    triggerAlert(user, userId);
                } else {
                    // 如果你正在頁面上，我們只「標記已超時」，但不跳轉
                    // 這樣就不會在你打字時突然被拉走
                    console.log(`🤫 會員 [${userId}] 已超時，但偵測到你正在處理，不執行跳轉。`);
                    // 雖然不跳轉，但我們可以選擇放個短音效提醒，或者乾脆保持安靜
                    // 如果你想要「人在頁面上也要有聲音提醒」，可以把下面這行取消註解
                    // audio.play().catch(() => {}); 
                    
                    userData.isNotified = true; // 標記為已提醒，防止你切走分頁後又被拉回來
                }
            }
        }
    });
}, 1000);

function triggerAlert(userElement, userId) {
    if (!chrome.runtime?.id) return;

    userTimers.get(userId).isNotified = true;
    audio.play().catch(() => {});

    if (Notification.permission === "granted") {
        new Notification("客服預警", { body: `會員 [${userId}] 等待已達 15 秒！` });
    } else {
        Notification.requestPermission();
    }

    // 只有在 document.hidden 時才會執行到這裡
    chrome.runtime.sendMessage({ action: "FOCUS_TAB" });
    userElement.click();
}