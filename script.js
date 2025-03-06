
let timeRemaining;
let isWorkSession;
let pomodorosCompleted;


function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    document.getElementById('timer').textContent = displayTime;
    document.getElementById('session').textContent = isWorkSession ? 'Work' : 'Break';
    document.getElementById('pomodoros').textContent = `Pomodoros: ${pomodorosCompleted}`;
}


chrome.storage.local.get(["timeRemaining", "isWorkSession", "pomodorosCompleted"], (data) => {
    if (data.timeRemaining !== undefined) {
        timeRemaining = data.timeRemaining;
        isWorkSession = data.isWorkSession;
        pomodorosCompleted = data.pomodorosCompleted;
    } else {
    
        timeRemaining = 25 * 60;
        isWorkSession = true;
        pomodorosCompleted = 0;
    }
    updateTimerDisplay();
});


chrome.runtime.onMessage.addListener((message) => {
    console.log("Message received in popup:", message);

    if (message.type === 'update') {
        timeRemaining = message.timeRemaining;
        isWorkSession = message.isWorkSession;
        pomodorosCompleted = message.pomodorosCompleted;
        updateTimerDisplay();
    }
});


document.getElementById('startBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'start' });
});


document.getElementById('pauseBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'pause' });
});


document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'reset' });
});


setInterval(() => {
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
        if (response) {
            timeRemaining = response.timeRemaining;
            isWorkSession = response.isWorkSession;
            pomodorosCompleted = response.pomodorosCompleted;
            updateTimerDisplay();
        }
    });
}, 1000);
