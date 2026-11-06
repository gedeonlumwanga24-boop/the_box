import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { AdminOrdersService } from "./admin-orders.service";

@Controller("admin/orders")
export class AdminOrdersController {
  constructor(private readonly service: AdminOrdersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
