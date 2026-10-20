// C17inator Frontend Application Logic
const $ = (id) => document.getElementById(id);

// Safe HTML escape helper
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Color Conversion Utilities
function hexToRgb(hex) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(Number(v) || 0)));
  const toHex = (v) => clamp(v).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// WCAG 2.1 Contrast Ratio Calculation
function getChannelLuminance(val8bit) {
  const c = val8bit / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(rgb) {
  const r = getChannelLuminance(rgb.r);
  const g = getChannelLuminance(rgb.g);
  const b = getChannelLuminance(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(hexText, hexBg) {
  const rgbText = hexToRgb(hexText);
  const rgbBg = hexToRgb(hexBg);
  const lum1 = getRelativeLuminance(rgbText);
  const lum2 = getRelativeLuminance(rgbBg);
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Application State
const state = {
  textColor: '#FFFFFF',
  bgColor: '#000000',
  ip: '',
  port: '',
  protocol: 'http',
  username: 'root',
  password: '',
  message: 'WELCOME TO AXIS C17',
  textSize: 'large',
  scrollMode: 'scrolling', // 'scrolling' | 'static'
  scrollDirection: 'fromRightToLeft', // 'fromRightToLeft' | 'fromLeftToRight' | 'fromBottomToTop'
  scrollSpeed: 5,
  duration: 0,
  allowInsecure: true, // Bypass TLS certificate verification for self-signed certs
  lastCurlCommand: '',
};

// Toast Notifications
function showToast(message, type = 'info', duration = 3500) {
  const container = $('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${esc(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// Update Status Indicator
function setConnectionStatus(status, text) {
  const dot = $('statusDot');
  const label = $('statusText');
  if (!dot || !label) return;

  dot.className = `status-indicator ${status}`;
  label.textContent = text;
}

// Synchronize Text Color Controls
function updateTextColor(hex, source = null) {
  if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return;
  const cleanHex = hex.startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase();
  state.textColor = cleanHex;

  const rgb = hexToRgb(cleanHex);

  if (source !== 'picker') $('textColorPicker').value = cleanHex;
  if (source !== 'hex') $('textHexInput').value = cleanHex;
  $('textHexBadge').textContent = cleanHex;
  $('textSwatch').style.backgroundColor = cleanHex;

  if (source !== 'sliders') {
    $('textRangeR').value = rgb.r;
    $('textNumR').value = rgb.r;
    $('textRangeG').value = rgb.g;
    $('textNumG').value = rgb.g;
    $('textRangeB').value = rgb.b;
    $('textNumB').value = rgb.b;
  }

  updateDisplayAndContrast();
}

// Synchronize Background Color Controls
function updateBgColor(hex, source = null) {
  if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return;
  const cleanHex = hex.startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase();
  state.bgColor = cleanHex;

  const rgb = hexToRgb(cleanHex);

  if (source !== 'picker') $('bgColorPicker').value = cleanHex;
  if (source !== 'hex') $('bgHexInput').value = cleanHex;
  $('bgHexBadge').textContent = cleanHex;
  $('bgSwatch').style.backgroundColor = cleanHex;

  if (source !== 'sliders') {
    $('bgRangeR').value = rgb.r;
    $('bgNumR').value = rgb.r;
    $('bgRangeG').value = rgb.g;
    $('bgNumG').value = rgb.g;
    $('bgRangeB').value = rgb.b;
    $('bgNumB').value = rgb.b;
  }

  updateDisplayAndContrast();
}

// Calculate & Update Contrast Ratio + Virtual Display
function updateDisplayAndContrast() {
  const ratio = calculateContrastRatio(state.textColor, state.bgColor);
  const ratioStr = ratio.toFixed(2);
  $('contrastRatio').textContent = ratioStr;

  // WCAG Compliance Grades
  const passesAANormal = ratio >= 4.5;
  const passesAAANormal = ratio >= 7.0;
  const passesAALarge = ratio >= 3.0;

  // Overall Badge
  const badge = $('overallBadge');
  const grade = $('badgeGrade');
  const icon = $('badgeIcon');
  const note = $('complianceNote');

  if (passesAAANormal) {
    badge.className = 'wcag-overall-badge pass-aaa';
    grade.textContent = 'AAA Pass';
    icon.textContent = '✓';
    note.textContent = 'Enhanced Accessibility (Optimal)';
  } else if (passesAANormal) {
    badge.className = 'wcag-overall-badge pass-aa';
    grade.textContent = 'AA Pass';
    icon.textContent = '✓';
    note.textContent = 'Meets standard accessibility';
  } else if (passesAALarge) {
    badge.className = 'wcag-overall-badge pass-large';
    grade.textContent = 'Large AA';
    icon.textContent = '✓';
    note.textContent = 'Passes only for large signage';
  } else {
    badge.className = 'wcag-overall-badge fail';
    grade.textContent = 'Fail';
    icon.textContent = '✕';
    note.textContent = 'Low contrast! Poor visibility';
  }

  // Progress Bar Gauge
  const pct = Math.min(100, Math.max(0, ((ratio - 1) / (21 - 1)) * 100));
  $('contrastGauge').style.setProperty('--gauge-mask', `${100 - pct}%`);

  // Matrix Checklist
  updateMatrixTag('tagAaNormal', passesAANormal);
  updateMatrixTag('tagAaaNormal', passesAAANormal);
  updateMatrixTag('tagAaLarge', passesAALarge);

  // Handle Static vs Scrolling Mode
  const isStatic = state.scrollMode === 'static';
  const speedGroup = $('speedGroup');
  const directionGroup = $('directionGroup');
  const speedLabel = $('speedLabel');

  if (isStatic) {
    if (speedGroup) speedGroup.classList.add('disabled');
    if (directionGroup) directionGroup.classList.add('disabled');
    if (speedLabel) speedLabel.textContent = 'Scroll Speed: Static (0 - stationary)';
  } else {
    const dir = $('scrollDirSelect').value || 'fromRightToLeft';
    state.scrollDirection = dir;
    if (speedGroup) speedGroup.classList.remove('disabled');
    if (directionGroup) directionGroup.classList.remove('disabled');

    const speed = Number($('scrollSpeedInput').value) || 5;
    if (speedLabel) speedLabel.innerHTML = `Scroll Speed (1 - 10): <span id="speedVal">${speed}</span>`;
  }

  persistSettings();
}

function updateMatrixTag(id, passed) {
  const el = $(id);
  if (!el) return;
  el.className = `matrix-item ${passed ? 'passed' : 'failed'}`;
  const icon = el.querySelector('.check-mark');
  if (icon) icon.textContent = passed ? '✓' : '✕';
}

// Log VAPIX activity in the console drawer
function logActivity({ method, url, status, durationMs, payload, responseData, rawBody, curlCommand, error, authMode }) {
  $('consoleStatus').textContent = status ? `${status}` : (error ? 'Error' : '—');
  $('consoleDuration').textContent = durationMs != null ? `${durationMs}ms` : '—';

  const isOk = status >= 200 && status < 300;
  state.lastCurlCommand = curlCommand || '';

  const jsonPayload = payload ? JSON.stringify(payload, null, 2) : '';
  const jsonResponse = responseData ? JSON.stringify(responseData, null, 2) : (rawBody || (error || 'No response body'));

  const entryHtml = `
    <div class="log-entry">
      <div class="log-header-line">
        <div>
          <span class="log-method">${esc(method)}</span>
          <span class="log-url">${esc(url)}</span>
        </div>
        <div>
          <span class="log-status ${isOk ? 'ok' : 'err'}">${status ? esc(status) : 'FAILED'}</span>
          <span style="color:var(--text-muted); font-size:0.65rem;">(${durationMs}ms${authMode ? ' · ' + esc(authMode) : ''})</span>
        </div>
      </div>
      ${jsonPayload ? `
        <div style="color:var(--text-muted); margin-top:2px;">Request Payload:</div>
        <pre class="code-block">${esc(jsonPayload)}</pre>
      ` : ''}
      <div style="color:var(--text-muted); margin-top:4px;">Response:</div>
      <pre class="code-block" style="border-left-color:${isOk ? '#10b981' : '#ef4444'};">${esc(jsonResponse)}</pre>
    </div>
  `;

  $('consoleOutput').innerHTML = entryHtml;
}

// Save & Load Settings via tiny.store
async function persistSettings() {
  const data = {
    ip: $('ipInput').value.trim(),
    port: $('portInput').value.trim(),
    protocol: $('protocolSelect').value,
    username: $('userInput').value.trim(),
    message: $('messageInput').value,
    textColor: state.textColor,
    bgColor: state.bgColor,
    textSize: $('textSizeSelect').value,
    scrollMode: state.scrollMode,
    scrollDirection: $('scrollDirSelect').value,
    scrollSpeed: $('scrollSpeedInput').value,
    duration: $('durationInput').value,
    allowInsecure: $('allowInsecureToggle') ? $('allowInsecureToggle').checked : true,
  };

  try {
    if (typeof tiny !== 'undefined' && tiny.store) {
      await tiny.store.set('c17_config', data);
    } else {
      localStorage.setItem('c17_config', JSON.stringify(data));
    }
  } catch (_) {
    // Ignore storage errors
  }
}

async function loadPersistedSettings() {
  let data = null;
  try {
    if (typeof tiny !== 'undefined' && tiny.store) {
      data = await tiny.store.get('c17_config');
    }
  } catch (_) {}

  if (!data) {
    try {
      const stored = localStorage.getItem('c17_config');
      if (stored) data = JSON.parse(stored);
    } catch (_) {}
  }

  if (data) {
    if (data.ip) $('ipInput').value = data.ip;
    if (data.port) $('portInput').value = data.port;
    if (data.protocol) $('protocolSelect').value = data.protocol;
    if (data.username) $('userInput').value = data.username;
    if (data.message != null) $('messageInput').value = data.message;
    if (data.textSize) $('textSizeSelect').value = data.textSize;
    if (data.scrollDirection) $('scrollDirSelect').value = data.scrollDirection;
    if (data.scrollSpeed) {
      $('scrollSpeedInput').value = data.scrollSpeed;
      $('speedVal').textContent = data.scrollSpeed;
    }
    if (data.scrollMode) {
      setScrollMode(data.scrollMode);
    }
    if (data.duration != null) $('durationInput').value = data.duration;
    if (data.allowInsecure !== undefined && $('allowInsecureToggle')) {
      $('allowInsecureToggle').checked = !!data.allowInsecure;
      state.allowInsecure = !!data.allowInsecure;
    }
    if (data.textColor) updateTextColor(data.textColor);
    if (data.bgColor) updateBgColor(data.bgColor);
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Color Picker & Hex Input - Text
  $('textColorPicker').addEventListener('input', (e) => updateTextColor(e.target.value, 'picker'));
  $('textHexInput').addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) updateTextColor(val, 'hex');
  });

  // RGB Sliders & Numbers - Text
  const updateTextFromRgb = () => {
    const r = $('textNumR').value;
    const g = $('textNumG').value;
    const b = $('textNumB').value;
    updateTextColor(rgbToHex(r, g, b), 'sliders');
  };

  ['R', 'G', 'B'].forEach((ch) => {
    $('textRange' + ch).addEventListener('input', (e) => {
      $('textNum' + ch).value = e.target.value;
      updateTextFromRgb();
    });
    $('textNum' + ch).addEventListener('input', (e) => {
      $('textRange' + ch).value = e.target.value;
      updateTextFromRgb();
    });
  });

  // Color Picker & Hex Input - Background
  $('bgColorPicker').addEventListener('input', (e) => updateBgColor(e.target.value, 'picker'));
  $('bgHexInput').addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) updateBgColor(val, 'hex');
  });

  // RGB Sliders & Numbers - Background
  const updateBgFromRgb = () => {
    const r = $('bgNumR').value;
    const g = $('bgNumG').value;
    const b = $('bgNumB').value;
    updateBgColor(rgbToHex(r, g, b), 'sliders');
  };

  ['R', 'G', 'B'].forEach((ch) => {
    $('bgRange' + ch).addEventListener('input', (e) => {
      $('bgNum' + ch).value = e.target.value;
      updateBgFromRgb();
    });
    $('bgNum' + ch).addEventListener('input', (e) => {
      $('bgRange' + ch).value = e.target.value;
      updateBgFromRgb();
    });
  });

  // Swap Colors
  $('swapColorsBtn').addEventListener('click', () => {
    const tempText = state.textColor;
    const tempBg = state.bgColor;
    updateTextColor(tempBg);
    updateBgColor(tempText);
    showToast('Colors swapped', 'info', 2000);
  });

  // Preset chips
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.text;
      const bg = chip.dataset.bg;
      if (text && bg) {
        updateTextColor(text);
        updateBgColor(bg);
        showToast(`Applied preset: ${chip.innerText.trim()}`, 'info', 2000);
      }
    });
  });

  // Message input
  $('messageInput').addEventListener('input', (e) => {
    $('charCount').textContent = `${e.target.value.length} chars`;
    updateDisplayAndContrast();
  });

  // Message quick sample pills
  document.querySelectorAll('.msg-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      $('messageInput').value = pill.dataset.msg;
      $('charCount').textContent = `${pill.dataset.msg.length} chars`;
      updateDisplayAndContrast();
    });
  });

  // Password toggle
  let passVisible = false;
  $('togglePassBtn').addEventListener('click', () => {
    passVisible = !passVisible;
    $('passInput').type = passVisible ? 'text' : 'password';
    $('eyeIcon').innerHTML = passVisible
      ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  });

  // Mode Buttons: Scrolling vs Static
  $('modeScrollingBtn').addEventListener('click', () => setScrollMode('scrolling'));
  $('modeStaticBtn').addEventListener('click', () => setScrollMode('static'));

  // Speed slider
  $('scrollSpeedInput').addEventListener('input', (e) => {
    const val = e.target.value;
    const speedVal = $('speedVal');
    if (speedVal) speedVal.textContent = val;
    updateDisplayAndContrast();
  });

  // Text size and scroll direction
  $('textSizeSelect').addEventListener('change', updateDisplayAndContrast);
  $('scrollDirSelect').addEventListener('change', updateDisplayAndContrast);
  $('durationInput').addEventListener('input', persistSettings);
  $('ipInput').addEventListener('input', persistSettings);
  $('portInput').addEventListener('input', persistSettings);
  $('protocolSelect').addEventListener('change', persistSettings);
  $('userInput').addEventListener('input', persistSettings);

  if ($('allowInsecureToggle')) {
    $('allowInsecureToggle').addEventListener('change', (e) => {
      state.allowInsecure = e.target.checked;
      persistSettings();
    });
  }

  // Action: SEND to Display
  $('sendBtn').addEventListener('click', handleSendNotification);

  // Action: STOP / Clear Display
  $('stopBtn').addEventListener('click', handleStopNotification);

  // Action: TEST Connection
  $('testConnBtn').addEventListener('click', handleTestConnection);

  // Action: COPY cURL
  $('copyCurlBtn').addEventListener('click', handleCopyCurl);
}

// Set Scroll Mode (scrolling vs static)
function setScrollMode(mode) {
  state.scrollMode = mode;
  const isStatic = mode === 'static';
  if ($('modeScrollingBtn') && $('modeStaticBtn')) {
    if (isStatic) {
      $('modeStaticBtn').classList.add('active');
      $('modeScrollingBtn').classList.remove('active');
    } else {
      $('modeScrollingBtn').classList.add('active');
      $('modeStaticBtn').classList.remove('active');
    }
  }
  updateDisplayAndContrast();
}

// SEND VAPIX Handler
async function handleSendNotification() {
  const ip = $('ipInput').value.trim();
  if (!ip) {
    showToast('Please enter the C17 IP address', 'error');
    $('ipInput').focus();
    return;
  }

  const sendBtn = $('sendBtn');
  const sendLabel = $('sendBtnLabel');
  sendBtn.disabled = true;
  sendLabel.textContent = 'Sending...';
  setConnectionStatus('sending', 'Sending...');

  const isStatic = state.scrollMode === 'static';
  const payload = {
    ip,
    port: $('portInput').value.trim(),
    protocol: $('protocolSelect').value,
    username: $('userInput').value.trim(),
    password: $('passInput').value,
    message: $('messageInput').value || ' ',
    textColor: state.textColor,
    backgroundColor: state.bgColor,
    textSize: $('textSizeSelect').value,
    scrollMode: state.scrollMode,
    scrollDirection: $('scrollDirSelect').value,
    scrollSpeed: isStatic ? 0 : (Number($('scrollSpeedInput').value) || 5),
    duration: Number($('durationInput').value) || 0,
    allowInsecure: $('allowInsecureToggle') ? $('allowInsecureToggle').checked : true,
  };

  try {
    const res = await tiny.api.call('sendVapixNotification', payload);
    logActivity({
      method: 'POST',
      url: res.endpoint,
      status: res.status,
      durationMs: res.durationMs,
      payload: res.payload,
      responseData: res.data,
      rawBody: res.rawBody,
      curlCommand: res.curlCommand,
      error: res.error,
      authMode: res.authMode,
    });

    if (res.success) {
      setConnectionStatus('connected', `Sent OK (${res.status})`);
      showToast('Notification sent to C17 display!', 'success');
    } else {
      setConnectionStatus('error', `HTTP ${res.status || 'Err'}`);
      const errMsg = res.error || (res.status === 401 ? 'Authentication failed (401)' : `HTTP Error ${res.status}`);
      showToast(errMsg, 'error', 4500);
    }
  } catch (err) {
    setConnectionStatus('error', 'Failed');
    showToast(`Error: ${err.message || String(err)}`, 'error', 5000);
    logActivity({
      method: 'POST',
      url: `${$('protocolSelect').value}://${ip}/config/rest/speaker-display-notification/v1/simple`,
      status: 0,
      durationMs: 0,
      payload: { data: { message: payload.message, textColor: payload.textColor, backgroundColor: payload.backgroundColor } },
      error: err.message || String(err),
    });
  } finally {
    sendBtn.disabled = false;
    sendLabel.textContent = 'Send to Display';
  }
}

// STOP VAPIX Handler
async function handleStopNotification() {
  const ip = $('ipInput').value.trim();
  if (!ip) {
    showToast('Please enter the C17 IP address', 'error');
    $('ipInput').focus();
    return;
  }

  const stopBtn = $('stopBtn');
  stopBtn.disabled = true;
  setConnectionStatus('sending', 'Stopping...');

  const payload = {
    ip,
    port: $('portInput').value.trim(),
    protocol: $('protocolSelect').value,
    username: $('userInput').value.trim(),
    password: $('passInput').value,
    allowInsecure: $('allowInsecureToggle') ? $('allowInsecureToggle').checked : true,
  };

  try {
    const res = await tiny.api.call('stopVapixNotification', payload);
    logActivity({
      method: 'POST',
      url: res.endpoint,
      status: res.status,
      durationMs: res.durationMs,
      payload: {},
      responseData: res.data,
      rawBody: res.rawBody,
      curlCommand: res.curlCommand,
      error: res.error,
      authMode: res.authMode,
    });

    if (res.success) {
      setConnectionStatus('connected', 'Cleared');
      showToast('Display notification stopped/cleared', 'success');
    } else {
      setConnectionStatus('error', `HTTP ${res.status || 'Err'}`);
      showToast(res.error || `HTTP ${res.status}`, 'error');
    }
  } catch (err) {
    setConnectionStatus('error', 'Failed');
    showToast(`Stop failed: ${err.message || String(err)}`, 'error');
  } finally {
    stopBtn.disabled = false;
  }
}

// TEST Connection Handler
async function handleTestConnection() {
  const ip = $('ipInput').value.trim();
  if (!ip) {
    showToast('Please enter the C17 IP address', 'error');
    $('ipInput').focus();
    return;
  }

  const testBtn = $('testConnBtn');
  testBtn.disabled = true;
  setConnectionStatus('sending', 'Pinging...');

  const payload = {
    ip,
    port: $('portInput').value.trim(),
    protocol: $('protocolSelect').value,
    username: $('userInput').value.trim(),
    password: $('passInput').value,
    allowInsecure: $('allowInsecureToggle') ? $('allowInsecureToggle').checked : true,
  };

  try {
    const res = await tiny.api.call('testVapixConnection', payload);
    logActivity({
      method: 'GET',
      url: res.endpoint,
      status: res.status,
      durationMs: res.durationMs,
      payload: null,
      responseData: res.data,
      rawBody: res.rawBody,
      error: res.error,
      authMode: res.authMode,
    });

    if (res.success) {
      setConnectionStatus('connected', 'Online');
      showToast(`C17 device reachable (${res.durationMs}ms)`, 'success');
    } else {
      setConnectionStatus('error', `Status ${res.status}`);
      showToast(res.error || `Ping failed with HTTP ${res.status}`, 'error');
    }
  } catch (err) {
    setConnectionStatus('error', 'Unreachable');
    showToast(`Test connection error: ${err.message || String(err)}`, 'error');
  } finally {
    testBtn.disabled = false;
  }
}

// COPY cURL Handler
async function handleCopyCurl() {
  let cmd = state.lastCurlCommand;
  if (!cmd) {
    // Generate fresh curl command from current state
    const ip = $('ipInput').value.trim() || '<C17_IP>';
    const proto = $('protocolSelect').value;
    const port = $('portInput').value.trim();
    const portSuffix = port ? `:${port}` : '';
    const user = $('userInput').value.trim() || 'root';
    const pass = $('passInput').value ? '***' : '';
    const isStatic = state.scrollMode === 'static';
    const payloadData = {
      message: $('messageInput').value || 'WELCOME TO AXIS C17',
      textColor: state.textColor,
      backgroundColor: state.bgColor,
      textSize: $('textSizeSelect').value,
      scrollSpeed: isStatic ? 0 : (Number($('scrollSpeedInput').value) || 5),
      scrollDirection: $('scrollDirSelect').value,
    };
    const durSec = Number($('durationInput').value) || 0;
    if (durSec > 0) {
      payloadData.duration = { type: 'time', value: Math.round(durSec * 1000) };
    }
    const payload = { data: payloadData };
    const allowInsecure = $('allowInsecureToggle') ? $('allowInsecureToggle').checked : true;
    const insecureFlag = (proto === 'https' && allowInsecure) ? '  --insecure \\\n' : '';
    cmd = `curl --request POST \\\n  --anyauth \\\n${insecureFlag}  --user "${user}:${pass}" \\\n  --header "Content-Type: application/json" \\\n  "${proto}://${ip}${portSuffix}/config/rest/speaker-display-notification/v1/simple" \\\n  --data '${JSON.stringify(payload, null, 2)}'`;
  }

  try {
    if (typeof tiny !== 'undefined' && tiny.clipboard) {
      await tiny.clipboard.write({ text: cmd });
    } else {
      await navigator.clipboard.writeText(cmd);
    }
    showToast('cURL command copied to clipboard!', 'info');
  } catch (err) {
    showToast('Failed to copy to clipboard', 'error');
  }
}

// App Initialization
async function init() {
  setupEventListeners();
  await loadPersistedSettings();

  // Initial UI sync
  updateTextColor(state.textColor);
  updateBgColor(state.bgColor);
  $('charCount').textContent = `${$('messageInput').value.length} chars`;

  // Start with marquee enabled
  $('screenTrack').classList.add('marquee');

  // Verify backend ping
  try {
    await tiny.api.call('ping');
    setConnectionStatus('ready', 'Ready');
  } catch (err) {
    console.error('Backend ping failed:', err);
  }
}

init().catch(console.error);
