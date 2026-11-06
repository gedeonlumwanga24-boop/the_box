import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { AdminCategoriesService } from "./admin-categories.service";

@Controller("admin/categories")
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      slug?: string;
      parentId?: number | null;
      displayOrder?: number;
      image?: string | null;
    },
  ) {
    return this.service.create(body);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      slug?: string;
      parentId?: number | null;
      displayOrder?: number;
      image?: string | null;
    },
  ) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
