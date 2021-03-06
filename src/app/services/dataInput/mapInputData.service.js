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
var Subject_1 = require("rxjs/Subject");
/*
 * This service is used for sending validation messages between components
 * A issue is the ability for reuse if there are multiple observers - it runs as a singelton instance.
 */
var MapInputDataService = (function () {
    function MapInputDataService() {
        this.inputDataMessage = new Subject_1.Subject();
    }
    MapInputDataService.prototype.getInputDataMessage = function () {
        return this.inputDataMessage.asObservable();
    };
    MapInputDataService.prototype.clearInputDataMessage = function () {
        this.inputDataMessage.next();
    };
    MapInputDataService.prototype.sendInputDataMessage = function (inputDataMessage) {
        this.inputDataMessage.next(inputDataMessage);
    };
    return MapInputDataService;
}());
MapInputDataService.RECEIVER_ADDRESS_APP_MAIN = 1;
MapInputDataService.REVIEVER_ADDRESS_PREV_TABLE = 2;
MapInputDataService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], MapInputDataService);
exports.MapInputDataService = MapInputDataService;
//# sourceMappingURL=mapInputData.service.js.map