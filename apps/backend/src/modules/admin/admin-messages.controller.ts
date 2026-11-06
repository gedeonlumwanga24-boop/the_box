import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { AdminMessagesService } from "./admin-messages.service";

@Controller("admin/messages")
export class AdminMessagesController {
  constructor(private readonly service: AdminMessagesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post(":id/reply")
  reply(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { reply?: string },
  ) {
    return this.service.reply(id, body.reply ?? "");
  }
}
