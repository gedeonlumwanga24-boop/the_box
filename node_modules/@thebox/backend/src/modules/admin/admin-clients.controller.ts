import { Controller, Delete, Get, Param, ParseIntPipe } from "@nestjs/common";
import { AdminClientsService } from "./admin-clients.service";

@Controller("admin/clients")
export class AdminClientsController {
  constructor(private readonly service: AdminClientsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
