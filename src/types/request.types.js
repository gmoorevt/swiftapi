"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyType = exports.HttpMethod = void 0;
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["DELETE"] = "DELETE";
})(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
var BodyType;
(function (BodyType) {
    BodyType["JSON"] = "json";
    BodyType["FORM_DATA"] = "formdata";
    BodyType["RAW"] = "raw";
    BodyType["NONE"] = "none";
})(BodyType || (exports.BodyType = BodyType = {}));
//# sourceMappingURL=request.types.js.map