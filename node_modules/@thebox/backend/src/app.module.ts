import { Module } from "@nestjs/common";
import { AdminModule } from "./modules/admin/admin.module";
import { CatalogModule } from "./modules/catalog/catalog.module";

@Module({
  imports: [CatalogModule, AdminModule],
})
export class AppModule {}
