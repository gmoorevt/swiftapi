"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCookie = parseCookie;
exports.parseSetCookieHeaders = parseSetCookieHeaders;
function parseCookie(cookieString) {
    if (!cookieString || !cookieString.trim()) {
        return null;
    }
    const parts = cookieString.split(';').map((part) => part.trim());
    const nameValuePair = parts[0];
    if (!nameValuePair) {
        return null;
    }
    const equalsIndex = nameValuePair.indexOf('=');
    if (equalsIndex === -1) {
        return null;
    }
    const name = nameValuePair.substring(0, equalsIndex).trim();
    const value = nameValuePair.substring(equalsIndex + 1);
    const cookie = { name, value };
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (!part)
            continue;
        const attrEqualsIndex = part.indexOf('=');
        if (attrEqualsIndex === -1) {
            const attrName = part.toLowerCase();
            if (attrName === 'secure') {
                cookie.secure = true;
            }
            else if (attrName === 'httponly') {
                cookie.httpOnly = true;
            }
        }
        else {
            const attrName = part.substring(0, attrEqualsIndex).trim().toLowerCase();
            const attrValue = part.substring(attrEqualsIndex + 1).trim();
            switch (attrName) {
                case 'domain':
                    cookie.domain = attrValue;
                    break;
                case 'path':
                    cookie.path = attrValue;
                    break;
                case 'expires':
                    cookie.expires = attrValue;
                    break;
                case 'max-age':
                    const maxAge = parseInt(attrValue, 10);
                    if (!isNaN(maxAge)) {
                        cookie.maxAge = maxAge;
                    }
                    break;
                case 'samesite':
                    cookie.sameSite = attrValue;
                    break;
            }
        }
    }
    return cookie;
}
function parseSetCookieHeaders(headers) {
    const cookies = [];
    for (const header of headers) {
        if (header.name.toLowerCase() === 'set-cookie') {
            const cookie = parseCookie(header.value);
            if (cookie) {
                cookies.push(cookie);
            }
        }
    }
    return cookies;
}
//# sourceMappingURL=cookieParser.js.map