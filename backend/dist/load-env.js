"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = require("./config/env");
const envPath = path_1.default.resolve(__dirname, '../.env');
const loaded = dotenv_1.default.config({ path: envPath });
if (loaded.error) {
    dotenv_1.default.config();
}
(0, env_1.getRuntimeEnv)();
