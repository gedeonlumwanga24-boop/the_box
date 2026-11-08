"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const admin_upload_controller_1 = require("./modules/admin/admin-upload.controller");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useStaticAssets(admin_upload_controller_1.uploadsDir, { prefix: '/uploads' });
    app.setGlobalPrefix('api/v1');
    await app.listen(process.env.PORT || 3001);
}
bootstrap();
