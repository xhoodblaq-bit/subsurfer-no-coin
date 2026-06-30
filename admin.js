const form = document.getElementById('commandForm');
const input = document.getElementById('commandInput');
const log = document.getElementById('commandLog');
const statusBadge = document.getElementById('statusBadge');
const authGate = document.getElementById('authGate');
const adminContent = document.getElementById('adminContent');
const passwordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('adminLoginBtn');
const authMessage = document.getElementById('authMessage');
const logoutBtn = document.getElementById('logoutBtn');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const currentMessageText = document.getElementById('currentMessageText');

const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const difficultySlider = document.getElementById('difficultySlider');
const difficultyValue = document.getElementById('difficultyValue');
const laneSlider = document.getElementById('laneSlider');
const laneValue = document.getElementById('laneValue');
const applySettingsBtn = document.getElementById('applySettingsBtn');

const lanes = ['Links', 'Mitte', 'Rechts'];
const commandHistory = [];
const ADMIN_PASSWORD = 'subway123';
const AUTH_KEY = 'subwayAdmin';
const MESSAGE_KEY = 'subwayAdminMessage';

function addLog(message) {
  commandHistory.unshift(message);
  if (commandHistory.length > 10) commandHistory.pop();
  log.innerHTML = commandHistory.map((entry) => `<li>${entry}</li>`).join('');
}

function setStatus(text, ok = true) {
  statusBadge.textContent = text;
  statusBadge.style.background = ok ? 'rgba(51,255,204,0.15)' : 'rgba(255,77,77,0.16)';
  statusBadge.style.color = ok ? '#33ffcc' : '#ff6b6b';
}

function showAdminPanel() {
  authGate.hidden = true;
  adminContent.hidden = false;
}

function showLogin() {
  authGate.hidden = false;
  adminContent.hidden = true;
}

function login() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true');
    showAdminPanel();
    setStatus('Admin verbunden');
    addLog('Admin-Anmeldung erfolgreich');
  } else {
    authMessage.textContent = 'Falsches Passwort.';
  }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  showLogin();
  passwordInput.value = '';
  authMessage.textContent = '';
}

function applySettings() {
  const speed = Number(speedSlider.value);
  const difficulty = Number(difficultySlider.value);
  const lane = Number(laneSlider.value);
  const laneName = lanes[lane] || 'Mitte';

  localStorage.setItem('adminSpeed', speed);
  localStorage.setItem('adminDifficulty', difficulty);
  localStorage.setItem('adminLane', lane);

  speedValue.textContent = speed;
  difficultyValue.textContent = difficulty;
  laneValue.textContent = laneName;
  setStatus('Einstellungen gespeichert');
  addLog(`Einstellungen: Speed ${speed}, Schwierigkeitsgrad ${difficulty}, Spur ${laneName}`);
}

function updateMessagePreview() {
  const message = localStorage.getItem(MESSAGE_KEY) || '';
  currentMessageText.textContent = message || 'Keine Nachricht gesendet.';
}

if (localStorage.getItem(AUTH_KEY) === 'true') {
  showAdminPanel();
} else {
  showLogin();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const command = input.value.trim();
  if (!command) return;

  const normalized = command.toLowerCase();
  setStatus(`Befehl: ${command}`);
  addLog(`> ${command}`);

  if (normalized.includes('spawn obstacle')) {
    localStorage.setItem('adminCommand', 'spawn obstacle');
  } else if (normalized.includes('spawn coin')) {
    localStorage.setItem('adminCommand', 'spawn coin');
  } else if (normalized.includes('spawn shield')) {
    localStorage.setItem('adminCommand', 'spawn shield');
  } else if (normalized.includes('spawn boost')) {
    localStorage.setItem('adminCommand', 'spawn boost');
  } else if (normalized.includes('set speed')) {
    const value = normalized.replace(/set speed\s*/, '');
    localStorage.setItem('adminSpeed', value);
    speedSlider.value = value;
    speedValue.textContent = value;
  } else if (normalized.includes('add score')) {
    const value = normalized.replace(/add score\s*/, '');
    localStorage.setItem('adminCommand', `add score ${value}`);
  } else if (normalized.includes('reset')) {
    localStorage.removeItem('adminCommand');
    localStorage.setItem('adminReset', '1');
  }

  input.value = '';
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  localStorage.setItem(MESSAGE_KEY, message);
  updateMessagePreview();
  setStatus('Nachricht gesendet');
  addLog(`Nachricht: ${message}`);
  messageInput.value = '';
});

document.querySelectorAll('[data-command]').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.getAttribute('data-command');
    form.requestSubmit();
  });
});

applySettingsBtn.addEventListener('click', applySettings);
loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') login();
});

speedSlider.addEventListener('input', () => speedValue.textContent = speedSlider.value);
difficultySlider.addEventListener('input', () => difficultyValue.textContent = difficultySlider.value);
laneSlider.addEventListener('input', () => {
  laneValue.textContent = lanes[Number(laneSlider.value)] || 'Mitte';
});

applySettings();
updateMessagePreview();
addLog('Admin-Konsole bereit');
