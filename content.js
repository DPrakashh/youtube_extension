// Initialize the extension
let hideRecommendations = false;

// Check storage for settings
chrome.storage.sync.get({
  hideRecommendations: false,
  playbackSpeed: 1.0
}, function(data) {
  hideRecommendations = data.hideRecommendations;
  
  // Apply settings
  if (hideRecommendations) {
    hideYouTubeRecommendations();
  }
  
  setPlaybackSpeed(data.playbackSpeed);
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'toggleRecommendations') {
    hideRecommendations = message.hide;
    if (hideRecommendations) {
      hideYouTubeRecommendations();
    } else {
      showYouTubeRecommendations();
    }
  } else if (message.action === 'setPlaybackSpeed') {
    setPlaybackSpeed(message.speed);
  }
  
  sendResponse({ success: true });
  return true;
});

// Functions to modify YouTube UI
function hideYouTubeRecommendations() {
  // Add a class to the body for CSS to target
  document.body.classList.add('yt-focus-hide-recommendations');
}

function showYouTubeRecommendations() {
  // Remove the class from the body
  document.body.classList.remove('yt-focus-hide-recommendations');
}

function setPlaybackSpeed(speed) {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    videoElement.playbackRate = speed;
  }
}

// Watch for navigation changes (YouTube is a SPA)
const observer = new MutationObserver(function(mutations) {
  if (hideRecommendations) {
    hideYouTubeRecommendations();
  }
  
  // Reapply playback speed when video changes
  chrome.storage.sync.get('playbackSpeed', function(data) {
    setTimeout(function() {
      setPlaybackSpeed(data.playbackSpeed);
    }, 1000); // Small delay to ensure video is loaded
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });