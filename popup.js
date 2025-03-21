document.addEventListener('DOMContentLoaded', function() {
  const hideRecommendationsCheckbox = document.getElementById('hideRecommendations');
  const minutesDisplay = document.getElementById('minutes');
  const secondsDisplay = document.getElementById('seconds');
  const startTimerButton = document.getElementById('startTimer');
  const stopTimerButton = document.getElementById('stopTimer');
  const resetTimerButton = document.getElementById('resetTimer');
  const timerDurationInput = document.getElementById('timerDuration');
  const playbackSpeedSlider = document.getElementById('playbackSpeed');
  const speedValueDisplay = document.getElementById('speedValue');

  let timerInterval;
  let time = 0;
  let isRunning = false;

  // Load saved settings
  chrome.storage.sync.get({
    hideRecommendations: true,
    timerDuration: 25,
    playbackSpeed: 1
  }, function(items) {
    hideRecommendationsCheckbox.checked = items.hideRecommendations;
    timerDurationInput.value = items.timerDuration;
    time = items.timerDuration * 60;
    updateTimerDisplay();
    playbackSpeedSlider.value = items.playbackSpeed;
    speedValueDisplay.textContent = items.playbackSpeed + 'x';
  });

  // Hide Recommendations Toggle
  hideRecommendationsCheckbox.addEventListener('change', function() {
    const hideRecommendations = hideRecommendationsCheckbox.checked;
    chrome.storage.sync.set({ hideRecommendations: hideRecommendations });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'toggleRecommendations',
          hide: hideRecommendations
        });
      }
    });
  });

  // Playback Speed Slider
  playbackSpeedSlider.addEventListener('input', function() {
    const speed = parseFloat(playbackSpeedSlider.value);
    speedValueDisplay.textContent = speed + 'x';
    chrome.storage.sync.set({ playbackSpeed: speed });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'setPlaybackSpeed',
          speed: speed
        });
      }
    });
  });

  // Timer Functionality
  function updateTimerDisplay() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      startTimerButton.disabled = true;
      stopTimerButton.disabled = false;
      resetTimerButton.disabled = true;

      timerInterval = setInterval(() => {
        time--;
        if (time <= 0) {
          clearInterval(timerInterval);
          isRunning = false;
          startTimerButton.disabled = false;
          stopTimerButton.disabled = true;
          resetTimerButton.disabled = false;
          notifyTimerComplete();
        }
        updateTimerDisplay();
      }, 1000);
    }
  }

  function stopTimer() {
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      startTimerButton.disabled = false;
      stopTimerButton.disabled = true;
      resetTimerButton.disabled = false;
    }
  }

  function resetTimer() {
    stopTimer();
    time = parseInt(timerDurationInput.value) * 60;
    updateTimerDisplay();
    chrome.storage.sync.set({ timerDuration: parseInt(timerDurationInput.value) });
  }

  function notifyTimerComplete() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'timerComplete'
        });
      }
    });
  }

  // Event listeners for buttons
  startTimerButton.addEventListener('click', startTimer);
  stopTimerButton.addEventListener('click', stopTimer);
  resetTimerButton.addEventListener('click', resetTimer);

  // Initialize timer
  timerDurationInput.addEventListener('change', () => {
    time = parseInt(timerDurationInput.value) * 60;
    updateTimerDisplay();
    chrome.storage.sync.set({ timerDuration: parseInt(timerDurationInput.value) });
  });
});