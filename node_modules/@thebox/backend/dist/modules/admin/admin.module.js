"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const admin_products_controller_1 = require("./admin-products.controller");
const admin_products_service_1 = require("./admin-products.service");
const admin_dashboard_controller_1 = require("./admin-dashboard.controller");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const admin_categories_controller_1 = require("./admin-categories.controller");
const admin_categories_service_1 = require("./admin-categories.service");
const admin_orders_controller_1 = require("./admin-orders.controller");
const admin_orders_service_1 = require("./admin-orders.service");
const admin_clients_controller_1 = require("./admin-clients.controller");
const admin_clients_service_1 = require("./admin-clients.service");
const admin_messages_controller_1 = require("./admin-messages.controller");
const admin_messages_service_1 = require("./admin-messages.service");
const admin_config_controller_1 = require("./admin-config.controller");
const admin_config_service_1 = require("./admin-config.service");
const admin_upload_controller_1 = require("./admin-upload.controller");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            admin_products_controller_1.AdminProductsController,
            admin_dashboard_controller_1.AdminDashboardController,
            admin_categories_controller_1.AdminCategoriesController,
            admin_orders_controller_1.AdminOrdersController,
            admin_clients_controller_1.AdminClientsController,
            admin_messages_controller_1.AdminMessagesController,
            admin_config_controller_1.AdminConfigController,
            admin_upload_controller_1.AdminUploadController,
        ],
        providers: [
            admin_products_service_1.AdminProductsService,
            admin_dashboard_service_1.AdminDashboardService,
            admin_categories_service_1.AdminCategoriesService,
            admin_orders_service_1.AdminOrdersService,
            admin_clients_service_1.AdminClientsService,
            admin_messages_service_1.AdminMessagesService,
            admin_config_service_1.AdminConfigService,
        ],
    })
], AdminModule);
