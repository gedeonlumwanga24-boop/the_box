import { Body, Controller, Get, Put } from "@nestjs/common";
import { AdminConfigService } from "./admin-config.service";

@Controller("admin/config")
export class AdminConfigController {
  constructor(private readonly service: AdminConfigService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Put()
  update(@Body() body: Record<string, string | null | undefined>) {
    return this.service.update(body);
  }
}
