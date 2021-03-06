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
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var User_model_1 = require("../../models/User.model");
var login_service_1 = require("../../services/login.service");
var LoginComponent = (function () {
    function LoginComponent(_authorizationService, _router) {
        this._authorizationService = _authorizationService;
        this._router = _router;
        this.model = new User_model_1.User('', '', '');
        this.errorMessages = [];
    }
    LoginComponent.prototype.login = function () {
        this.errorMessages = this.isValid();
        if (this.errorMessages.length > 0)
            return;
        this._authorizationService.login(this.model);
    };
    /*
     * Validation method
     */
    LoginComponent.prototype.isValid = function () {
        var errors = new Array();
        if (this.model.getPassword().length == 0 || this.model.getPassword() === undefined)
            errors.push("No password set");
        if (this.model.getUsername().length == 0 || this.model.getUsername() === undefined)
            errors.push("No username set");
        return errors;
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    core_1.Component({
        selector: 'login',
        templateUrl: '../../views/login.component.html',
    })
    /*
     * Temporary login component - runs basic authentication for now - will be set up with tokens eventually
     */
    ,
    __metadata("design:paramtypes", [login_service_1.AuthorizationService,
        router_1.Router])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map