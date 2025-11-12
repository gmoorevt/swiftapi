"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
const cookieParser_1 = require("../lib/cookieParser");
class Response {
    statusCode;
    statusText;
    headers;
    body;
    responseTime;
    size;
    contentType;
    timestamp;
    statusCategory;
    formattedSize;
    isJson;
    isXml;
    isHtml;
    cookies;
    hasCookies;
    constructor(options) {
        this.statusCode = options.statusCode;
        this.statusText = options.statusText;
        this.headers = options.headers;
        this.body = options.body;
        this.responseTime = options.responseTime;
        this.size = options.size;
        this.timestamp = options.timestamp;
        const contentTypeHeader = this.headers.find((h) => h.name.toLowerCase() === 'content-type');
        this.contentType = contentTypeHeader?.value ?? null;
        this.statusCategory = this.computeStatusCategory();
        this.formattedSize = this.formatSize();
        this.isJson = this.checkIsJson();
        this.isXml = this.checkIsXml();
        this.isHtml = this.checkIsHtml();
        this.cookies = (0, cookieParser_1.parseSetCookieHeaders)(this.headers);
        this.hasCookies = this.cookies.length > 0;
    }
    computeStatusCategory() {
        if (this.statusCode >= 200 && this.statusCode < 300) {
            return 'success';
        }
        if (this.statusCode >= 300 && this.statusCode < 400) {
            return 'redirect';
        }
        if (this.statusCode >= 400) {
            return 'error';
        }
        return 'info';
    }
    formatSize() {
        const KB = 1024;
        const MB = KB * 1024;
        if (this.size >= MB) {
            return `${(this.size / MB).toFixed(2)} MB`;
        }
        if (this.size >= KB) {
            return `${(this.size / KB).toFixed(2)} KB`;
        }
        return `${this.size} bytes`;
    }
    checkIsJson() {
        if (!this.contentType) {
            return false;
        }
        return this.contentType.toLowerCase().includes('application/json');
    }
    checkIsXml() {
        if (!this.contentType) {
            return false;
        }
        const lower = this.contentType.toLowerCase();
        return lower.includes('application/xml') || lower.includes('text/xml');
    }
    checkIsHtml() {
        if (!this.contentType) {
            return false;
        }
        return this.contentType.toLowerCase().includes('text/html');
    }
    toJSON() {
        return {
            statusCode: this.statusCode,
            statusText: this.statusText,
            headers: this.headers,
            body: this.body,
            responseTime: this.responseTime,
            size: this.size,
            contentType: this.contentType,
            timestamp: this.timestamp,
            statusCategory: this.statusCategory,
            formattedSize: this.formattedSize,
            isJson: this.isJson,
            isXml: this.isXml,
            isHtml: this.isHtml,
            cookies: this.cookies,
            hasCookies: this.hasCookies,
        };
    }
}
exports.Response = Response;
//# sourceMappingURL=Response.js.map