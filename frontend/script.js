const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");

// 🔴 CHANGE THIS
const BACKEND_URL = "https://YOUR-BACKEND.onrender.com";

let sessionId = null;
let voiceEnabled = true;

// ------------------ CHAT UI ------------------

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `msg ${sender}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  let url = `${BACKEND_URL}/chat?message=${encodeURIComponent(text)}`;
  if (sessionId) url += `&session_id=${sessionId}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.reply) {
        addMessage(data.reply, "ai");
        speakText(data.reply);
        sessionId = data.session_id;
      } else {
        addMessage("Error: No reply", "ai");
      }
    })
    .catch(() => {
      addMessage("Connection error", "ai");
    });
}

input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// ------------------ VOICE INPUT ------------------

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    addMessage("🎙️ Listening...", "ai");
  };

  recognition.onresult = event => {
    input.value = event.results[0][0].transcript;
  };

  recognition.onerror = () => {
    addMessage("Voice recognition error", "ai");
  };
}

function startListening() {
  if (recognition) recognition.start();
  else alert("Speech recognition not supported");
}

// ------------------ TEXT TO SPEECH ------------------

function speakText(text) {
  if (!voiceEnabled) return;
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.volume = 1.0;

  const voices = speechSynthesis.getVoices();
  const goodVoice = voices.find(v =>
    v.lang.includes("en") && v.name.toLowerCase().includes("google")
  );
  if (goodVoice) utter.voice = goodVoice;

  window.speechSynthesis.speak(utter);
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  window.speechSynthesis.cancel();
}
