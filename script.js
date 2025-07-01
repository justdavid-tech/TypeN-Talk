    function speakText() {
      const inputText = document.getElementById('text').value.trim();
      const language = document.getElementById('language').value;


      if (!inputText) {
        alert("Please enter text first!");
        return;
      }

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(inputText);
        utterance.lang = language;

        window.speechSynthesis.speak(utterance);
      } else {
        alert("Your browser doesn't support text-to-speech.");
      }
    };