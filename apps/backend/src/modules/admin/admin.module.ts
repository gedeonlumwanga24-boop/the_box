import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { AdminProductsController } from "./admin-products.controller";
import { AdminProductsService } from "./admin-products.service";
import { AdminDashboardController } from "./admin-dashboard.controller";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminCategoriesController } from "./admin-categories.controller";
import { AdminCategoriesService } from "./admin-categories.service";
import { AdminOrdersController } from "./admin-orders.controller";
import { AdminOrdersService } from "./admin-orders.service";
import { AdminClientsController } from "./admin-clients.controller";
import { AdminClientsService } from "./admin-clients.service";
import { AdminMessagesController } from "./admin-messages.controller";
import { AdminMessagesService } from "./admin-messages.service";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminProductsController,
    AdminDashboardController,
    AdminCategoriesController,
    AdminOrdersController,
    AdminClientsController,
    AdminMessagesController,
  ],
  providers: [
    AdminProductsService,
    AdminDashboardService,
    AdminCategoriesService,
    AdminOrdersService,
    AdminClientsService,
    AdminMessagesService,
  ],
})
export class AdminModule {}
