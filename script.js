// Global variables
let isSpeaking = false;
let currentUtterance = null;
let availableVoices = [];

// Initialize speech synthesis and filter available languages
async function initSpeech() {
  // Load voices
  await loadVoices();
  
  // Filter and populate language options
  const supportedLanguages = getSupportedLanguages();
  populateLanguageSelect(supportedLanguages);
  
  // Set up event listeners
  document.getElementById('speakButton').addEventListener('click', toggleSpeak);
  document.getElementById('language').addEventListener('change', updateVoiceStatus);
  
  // Initial status update
  updateVoiceStatus();
}

// Load voices with retry logic
function loadVoices() {
  return new Promise((resolve) => {
    availableVoices = window.speechSynthesis.getVoices();
    
    if (availableVoices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        availableVoices = window.speechSynthesis.getVoices();
        resolve();
      };
      // Some browsers need a trigger
      window.speechSynthesis.getVoices();
    } else {
      resolve();
    }
  });
}

// Get only languages with available voices
function getSupportedLanguages() {
  const languageOptions = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'fr-CA', name: 'French (Canada)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ar-SA', name: 'Arabic' },
    { code: 'ru-RU', name: 'Russian' }
  ];

  return languageOptions.filter(option => {
    return availableVoices.some(voice => {
      return voice.lang === option.code || 
             voice.lang.startsWith(option.code.substring(0, 2));
    });
  });
}

// Populate language select with supported options
function populateLanguageSelect(supportedLanguages) {
  const select = document.getElementById('language');
  select.innerHTML = '';
  
  supportedLanguages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    select.appendChild(option);
  });
}

// Update voice status display
function updateVoiceStatus() {
  const lang = document.getElementById('language').value;
  const voice = getBestVoiceForLang(lang);
  const statusElement = document.getElementById('voiceStatus');
  
  if (voice) {
    statusElement.textContent = `Using voice: ${voice.name} (${voice.lang})`;
    statusElement.style.color = '#28a745';
  } else {
    statusElement.textContent = 'No native voice available - using default';
    statusElement.style.color = '#dc3545';
  }
}

// Find the best available voice for a language
function getBestVoiceForLang(lang) {
  // Try exact match first
  const exactMatch = availableVoices.find(voice => voice.lang === lang);
  if (exactMatch) return exactMatch;
  
  // Then try language family match
  const langPrefix = lang.substring(0, 2);
  const familyMatch = availableVoices.find(voice => voice.lang.startsWith(langPrefix));
  if (familyMatch) return familyMatch;
  
  // Finally try any voice that includes the language 
  return availableVoices.find(voice => voice.lang.includes(langPrefix));
}

// Main speak function
function toggleSpeak() {
  const speakButton = document.getElementById('speakButton');
  
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    speakButton.textContent = 'Speak';
    return;
  }
  
  const inputText = document.getElementById('text').value.trim();
  const language = document.getElementById('language').value;

  if (!inputText) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter text first.",
      confirmButtonColor: "#dc3545"
    });
    return;
  }

  if (!('speechSynthesis' in window)) {
    Swal.fire({
      icon: "error",
      title: "Not Supported",
      text: "Your browser doesn't support text-to-speech.",
      confirmButtonColor: "#dc3545"
    });
    return;
  }

  window.speechSynthesis.cancel();

  currentUtterance = new SpeechSynthesisUtterance(inputText);
  currentUtterance.lang = language;
  
  const voice = getBestVoiceForLang(language);
  if (voice) {
    currentUtterance.voice = voice;
  }

  currentUtterance.onstart = () => {
    isSpeaking = true;
    speakButton.textContent = 'Stop';
  };

  currentUtterance.onend = currentUtterance.onerror = () => {
    isSpeaking = false;
    speakButton.textContent = 'Speak';
    currentUtterance = null;
  };

  window.speechSynthesis.speak(currentUtterance);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSpeech);