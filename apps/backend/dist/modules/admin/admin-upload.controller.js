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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUploadController = exports.uploadsDir = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
exports.uploadsDir = (0, path_1.join)(process.cwd(), "uploads");
const ensureUploadsDir = () => {
    if (!(0, fs_1.existsSync)(exports.uploadsDir)) {
        (0, fs_1.mkdirSync)(exports.uploadsDir, { recursive: true });
    }
};
let AdminUploadController = class AdminUploadController {
    uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException("Aucun fichier reçu");
        }
        const allowed = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
        if (!allowed) {
            throw new common_1.BadRequestException("Seuls les fichiers image et vidéo sont acceptés");
        }
        return { path: `/uploads/${file.filename}` };
    }
};
exports.AdminUploadController = AdminUploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                ensureUploadsDir();
                cb(null, exports.uploadsDir);
            },
            filename: (_req, file, cb) => {
                const ext = (0, path_1.extname)(file.originalname).toLowerCase() || ".bin";
                cb(null, `${Date.now()}-${(0, crypto_1.randomBytes)(4).toString("hex")}${ext}`);
            },
        }),
        limits: { fileSize: 50 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminUploadController.prototype, "uploadFile", null);
exports.AdminUploadController = AdminUploadController = __decorate([
    (0, common_1.Controller)("admin/upload")
], AdminUploadController);
