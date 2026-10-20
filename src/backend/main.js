// Backend for C17inator
// Runs on txiki.js with full system access and network fetch

const dec = new TextDecoder();

// Pure JavaScript MD5 Implementation (RFC 1321)
function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    const lX8 = (lX & 0x80000000);
    const lY8 = (lY & 0x80000000);
    const lX4 = (lX & 0x40000000);
    const lY4 = (lY & 0x40000000);
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    }
    return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = new Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    let wordToHexValue = '', wordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue += wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }
  string = unescape(encodeURIComponent(string));
  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

function parseDigestHeader(header) {
  const params = {};
  const clean = header.replace(/^Digest\s+/i, '');
  const regex = /(\w+)=(?:"([^"]+)"|([^\s,]+))/g;
  let match;
  while ((match = regex.exec(clean)) !== null) {
    params[match[1]] = match[2] !== undefined ? match[2] : match[3];
  }
  return params;
}

function computeDigestAuth({ username, password, method, uri, challenge, nc = 1, cnonce = null }) {
  const realm = challenge.realm || '';
  const nonce = challenge.nonce || '';
  const qop = challenge.qop || '';
  const opaque = challenge.opaque;

  const ncStr = String(nc).padStart(8, '0');
  if (!cnonce) {
    cnonce = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  }

  const ha1 = md5(`${username}:${realm}:${password}`);
  const ha2 = md5(`${method}:${uri}`);

  let response;
  if (qop.toLowerCase().includes('auth')) {
    response = md5(`${ha1}:${nonce}:${ncStr}:${cnonce}:auth:${ha2}`);
  } else {
    response = md5(`${ha1}:${nonce}:${ha2}`);
  }

  let digest = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;
  if (qop.toLowerCase().includes('auth')) {
    digest += `, qop=auth, nc=${ncStr}, cnonce="${cnonce}"`;
  }
  if (opaque) {
    digest += `, opaque="${opaque}"`;
  }
  if (challenge.algorithm) {
    digest += `, algorithm=${challenge.algorithm}`;
  }
  return digest;
}

function normalizeTargetUrl({ ip, port, protocol, path }) {
  let target = (ip || '').trim();
  if (!target) throw new Error('IP address or hostname is required');

  let proto = (protocol || 'http').replace(/:$/, '').toLowerCase();
  if (target.startsWith('http://')) {
    proto = 'http';
    target = target.substring(7);
  } else if (target.startsWith('https://')) {
    proto = 'https';
    target = target.substring(8);
  }

  // Remove trailing slashes or path if accidentally entered in IP box
  const slashIdx = target.indexOf('/');
  if (slashIdx !== -1) {
    target = target.substring(0, slashIdx);
  }

  let host = target;
  let explicitPort = (port || '').toString().trim();
  if (host.includes(':')) {
    const parts = host.split(':');
    host = parts[0];
    if (!explicitPort) explicitPort = parts[1];
  }

  let portSuffix = '';
  if (explicitPort && !((proto === 'http' && explicitPort === '80') || (proto === 'https' && explicitPort === '443'))) {
    portSuffix = `:${explicitPort}`;
  }

  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return {
    fullUrl: `${proto}://${host}${portSuffix}${cleanPath}`,
    host,
    port: explicitPort,
    proto,
    uri: cleanPath,
  };
}

async function performVapixRequest({ urlInfo, method = 'POST', headers = {}, body = null, username, password, timeoutMs = 8000, allowInsecure = true }) {
  const reqHeaders = { ...headers };
  const authModeUsed = [];

  if (username && password) {
    const basicToken = btoa(`${username}:${password}`);
    reqHeaders['Authorization'] = `Basic ${basicToken}`;
    authModeUsed.push('Basic');
  }

  const startTime = Date.now();
  let response;
  let signal;
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    signal = AbortSignal.timeout(timeoutMs);
  }

  try {
    response = await fetch(urlInfo.fullUrl, {
      method,
      headers: reqHeaders,
      body,
      signal,
      allowInsecure: !!allowInsecure,
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      status: 0,
      statusText: 'Network Error',
      durationMs,
      error: `Network failure connecting to ${urlInfo.fullUrl}: ${err.message || String(err)}`,
      authMode: authModeUsed.join(', ') || 'None',
      rawBody: '',
    };
  }

  // Handle 401 Unauthorized with Digest challenge
  if (response.status === 401 && username && password) {
    const wwwAuth = response.headers.get('www-authenticate') || '';
    if (wwwAuth.toLowerCase().includes('digest')) {
      const challenge = parseDigestHeader(wwwAuth);
      const digestHeader = computeDigestAuth({
        username,
        password,
        method,
        uri: urlInfo.uri,
        challenge,
      });

      const retryHeaders = { ...headers, Authorization: digestHeader };
      authModeUsed.push('Digest');

      try {
        const retrySignal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(timeoutMs) : undefined;
        response = await fetch(urlInfo.fullUrl, {
          method,
          headers: retryHeaders,
          body,
          signal: retrySignal,
          allowInsecure: !!allowInsecure,
        });
      } catch (retryErr) {
        return {
          success: false,
          status: 0,
          statusText: 'Retry Error',
          durationMs: Date.now() - startTime,
          error: `Digest challenge retry failed: ${retryErr.message || String(retryErr)}`,
          authMode: authModeUsed.join(' → '),
          rawBody: '',
        };
      }
    }
  }

  const durationMs = Date.now() - startTime;
  let rawBody = '';
  try {
    rawBody = await response.text();
  } catch (e) {
    rawBody = '';
  }

  let parsedJson = null;
  if (rawBody) {
    try {
      parsedJson = JSON.parse(rawBody);
    } catch (_) {
      // Body is not JSON (could be text or HTML)
    }
  }

  const isSuccess = response.status >= 200 && response.status < 300;

  return {
    success: isSuccess,
    status: response.status,
    statusText: response.statusText || (isSuccess ? 'OK' : 'Error'),
    durationMs,
    data: parsedJson,
    rawBody,
    authMode: authModeUsed.join(' → ') || 'None',
    headers: Object.fromEntries(response.headers.entries ? response.headers.entries() : []),
  };
}

export const api = {
  async ping() {
    return 'pong';
  },

  async sendVapixNotification({
    ip,
    port,
    protocol,
    username,
    password,
    message,
    textColor,
    backgroundColor,
    textSize = 'large',
    scrollDirection = 'fromRightToLeft',
    scrollSpeed = 5,
    scrollMode = 'scrolling',
    duration = null,
    allowInsecure = true,
  }) {
    const path = '/config/rest/speaker-display-notification/v1/simple';
    const urlInfo = normalizeTargetUrl({ ip, port, protocol, path });

    const speedNum = Number(scrollSpeed);
    const isStatic = scrollMode === 'static' || speedNum === 0 || scrollSpeed === false;
    const finalSpeed = isStatic ? 0 : Math.max(1, Math.min(10, speedNum || 5));

    // Valid Axis VAPIX scroll directions: fromRightToLeft, fromLeftToRight, fromBottomToTop
    const validDirections = ['fromRightToLeft', 'fromLeftToRight', 'fromBottomToTop'];
    const finalDirection = validDirections.includes(scrollDirection)
      ? scrollDirection
      : (scrollDirection === 'right' ? 'fromLeftToRight' : 'fromRightToLeft');

    const payloadData = {
      message: String(message || '').trim(),
      textColor: (textColor || '#FFFFFF').toUpperCase(),
      backgroundColor: (backgroundColor || '#000000').toUpperCase(),
      textSize: textSize || 'large',
      scrollSpeed: finalSpeed,
      scrollDirection: finalDirection,
    };

    if (duration && Number(duration) > 0) {
      payloadData.duration = {
        type: 'time',
        value: Math.round(Number(duration) * 1000),
      };
    }

    const payload = { data: payloadData };
    const bodyStr = JSON.stringify(payload);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const res = await performVapixRequest({
      urlInfo,
      method: 'POST',
      headers,
      body: bodyStr,
      username,
      password,
      allowInsecure,
    });

    // Generate equivalent curl command for convenience
    const insecureFlag = (allowInsecure && urlInfo.proto === 'https') ? '  --insecure \\\n' : '';
    const curlCommand = `curl --request POST \\\n  --anyauth \\\n${insecureFlag}  --user "${username || 'root'}:${password ? '***' : ''}" \\\n  --header "Content-Type: application/json" \\\n  "${urlInfo.fullUrl}" \\\n  --data '${JSON.stringify(payload, null, 2)}'`;

    return {
      ...res,
      endpoint: urlInfo.fullUrl,
      payload,
      curlCommand,
    };
  },

  async stopVapixNotification({ ip, port, protocol, username, password, allowInsecure = true }) {
    const path = '/config/rest/speaker-display-notification/v1/stop';
    const urlInfo = normalizeTargetUrl({ ip, port, protocol, path });

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const res = await performVapixRequest({
      urlInfo,
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      username,
      password,
      allowInsecure,
    });

    const insecureFlag = (allowInsecure && urlInfo.proto === 'https') ? '  --insecure \\\n' : '';
    const curlCommand = `curl --request POST \\\n  --anyauth \\\n${insecureFlag}  --user "${username || 'root'}:${password ? '***' : ''}" \\\n  "${urlInfo.fullUrl}"`;

    return {
      ...res,
      endpoint: urlInfo.fullUrl,
      curlCommand,
    };
  },

  async testVapixConnection({ ip, port, protocol, username, password, allowInsecure = true }) {
    // Try the Speaker Display settings appearance endpoint first, or fallback to basicdeviceinfo
    const path = '/config/rest/speaker-display-settings/v1/appearance';
    const urlInfo = normalizeTargetUrl({ ip, port, protocol, path });

    const headers = {
      'Accept': 'application/json',
    };

    let res = await performVapixRequest({
      urlInfo,
      method: 'GET',
      headers,
      username,
      password,
      allowInsecure,
    });

    // If 404, try basic device info
    if (res.status === 404) {
      const fallbackUrlInfo = normalizeTargetUrl({ ip, port, protocol, path: '/axis-cgi/basicdeviceinfo.cgi' });
      res = await performVapixRequest({
        urlInfo: fallbackUrlInfo,
        method: 'GET',
        headers: { 'Accept': '*/*' },
        username,
        password,
        allowInsecure,
      });
      return {
        ...res,
        endpoint: fallbackUrlInfo.fullUrl,
      };
    }

    return {
      ...res,
      endpoint: urlInfo.fullUrl,
    };
  },
};

export function init(app) {
  // App initialization hook
}
