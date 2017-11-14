"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const http_1 = require("@angular/http");
let HttpWrapperService = class HttpWrapperService {
    constructor(_http, user) {
        this._http = _http;
        this.user = user;
        this.options = new http_1.RequestOptions();
        this.options.method = 'GET';
        let headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Basic ' + btoa(user.username + ':' + user.password));
        this.options.headers = headers;
    }
    get(query) {
        return this._http.get(this.user.connectionLink + '/' + query, this.options).map((res) => this.getAsArray(res)).catch(this.handleError);
    }
};
HttpWrapperService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, Object])
], HttpWrapperService);
exports.HttpWrapperService = HttpWrapperService;
//# sourceMappingURL=HttpWrapper.service.js.map