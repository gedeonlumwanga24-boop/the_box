import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.siteConfig.findMany();
    const configs: Record<string, string> = {};
    for (const row of rows) {
      configs[row.key] = row.value ?? "";
    }
    return configs;
  }

  async update(values: Record<string, string | null | undefined>) {
    const operations = Object.entries(values)
      .filter(([key]) => typeof key === "string" && key.trim().length > 0)
      .map(([key, value]) =>
        this.prisma.siteConfig.upsert({
          where: { key: key.trim() },
          update: { value: value == null ? null : String(value) },
          create: { key: key.trim(), value: value == null ? null : String(value) },
        }),
      );

    await this.prisma.$transaction(operations);
    return this.findAll();
  }
}
