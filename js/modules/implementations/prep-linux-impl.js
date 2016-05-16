"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var firmament_yargs_1 = require('firmament-yargs');
var PrepLinuxImpl = (function (_super) {
    __extends(PrepLinuxImpl, _super);
    function PrepLinuxImpl() {
        _super.call(this);
    }
    PrepLinuxImpl.prototype.tmp = function (containerConfig, cb) {
    };
    return PrepLinuxImpl;
}(firmament_yargs_1.CommandImpl));
exports.PrepLinuxImpl = PrepLinuxImpl;
//# sourceMappingURL=prep-linux-impl.js.map