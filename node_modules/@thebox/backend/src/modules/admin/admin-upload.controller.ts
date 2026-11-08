import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { extname, join } from "path";

export const uploadsDir = join(process.cwd(), "uploads");

const ensureUploadsDir = () => {
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
};

@Controller("admin/upload")
export class AdminUploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadsDir();
          cb(null, uploadsDir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase() || ".bin";
          cb(
            null,
            `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`,
          );
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadFile(
    @UploadedFile()
    file?: { filename: string; mimetype: string; size: number },
  ) {
    if (!file) {
      throw new BadRequestException("Aucun fichier reçu");
    }

    const allowed = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (!allowed) {
      throw new BadRequestException(
        "Seuls les fichiers image et vidéo sont acceptés",
      );
    }

    return { path: `/uploads/${file.filename}` };
  }
}
