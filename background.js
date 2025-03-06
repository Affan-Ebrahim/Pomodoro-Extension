console.log("Background script loaded!");
let timeRemaining = 25 * 60; 
let isWorkSession = true; 
let pomodorosCompleted = 0; 
let timerInterval; 

function startTimer() {
    if (timerInterval) return; 

    timerInterval = setInterval(() => {
        timeRemaining--;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval); 
            switchSession(); 
        }

        
        chrome.runtime.sendMessage({ type: 'update', timeRemaining, isWorkSession, pomodorosCompleted });
    }, 1000); 
}

function switchSession() {
    console.log("Switching session...");
    clearInterval(timerInterval); 
    timerInterval = null; 

    if (isWorkSession) {
        pomodorosCompleted++;
        console.log(`Pomodoros completed: ${pomodorosCompleted}`);
        if (pomodorosCompleted % 4 === 0) {
            timeRemaining = 15 * 60; 
            console.log("Starting long break...");
        } else {
            timeRemaining = 5 * 60; 
            console.log("Starting short break...");
        }
        isWorkSession = false;
    } else {
        timeRemaining = 25 * 60;
        isWorkSession = true;
        console.log("Starting work session...");
    }

    
    chrome.runtime.sendMessage({ type: 'update', timeRemaining, isWorkSession, pomodorosCompleted });

    startTimer(); 
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background script:", message);

    if (message.type === 'start') {
        console.log("Starting timer from message...");
        startTimer();
    } else if (message.type === 'pause') {
        console.log("Pausing timer...");
        clearInterval(timerInterval);
        timerInterval = null;
    } else if (message.type === 'reset') {
        console.log("Resetting timer...");
        clearInterval(timerInterval);
        timerInterval = null;
        timeRemaining = 25 * 60;
        isWorkSession = true;
        pomodorosCompleted = 0;

      
        chrome.storage.local.set({ timeRemaining, isWorkSession, pomodorosCompleted });

        
        chrome.runtime.sendMessage({ type: 'update', timeRemaining, isWorkSession, pomodorosCompleted }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("No receiver for message:", chrome.runtime.lastError.message);
            }
        });
    }

    sendResponse({ timeRemaining, isWorkSession, pomodorosCompleted });

    return true; 
});
