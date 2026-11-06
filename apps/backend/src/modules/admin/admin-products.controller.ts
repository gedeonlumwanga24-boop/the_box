import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { AdminProductsService } from "./admin-products.service";

@Controller("admin/products")
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  findAll() {
    return this.adminProductsService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      category?: string;
      price?: number;
      stock?: number;
      description?: string;
      imageUrl?: string;
    },
  ) {
    return this.adminProductsService.create({
      name: body.name,
      category: body.category ?? "Autre",
      price: Number(body.price ?? 0),
      stock: Number(body.stock ?? 0),
      description: body.description,
      imageUrl: body.imageUrl,
    });
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      category?: string;
      price?: number;
      stock?: number;
      description?: string;
      imageUrl?: string;
    },
  ) {
    return this.adminProductsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.adminProductsService.remove(id);
  }
}
