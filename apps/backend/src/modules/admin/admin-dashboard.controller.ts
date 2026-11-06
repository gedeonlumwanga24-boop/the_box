import { Controller, Get } from "@nestjs/common";
import { AdminDashboardService } from "./admin-dashboard.service";

@Controller("admin/dashboard")
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  getDashboard() {
    return this.service.getDashboard();
  }
}
