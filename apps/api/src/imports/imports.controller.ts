import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { CatalogueImporter } from '@raza-stationers/db';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { Express } from 'express';
import "multer";

@Controller('admin/imports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportsController {
  @Post('catalogue')
  @Roles(UserRole.admin)
  @UseInterceptors(FileInterceptor('file'))
  async importCatalogue(
    @UploadedFile() file: any,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.originalname || 'catalogue.csv'}`);
    await fs.writeFile(tempPath, file.buffer);

    try {
      const { parsedRows, result } = await CatalogueImporter.generatePlan(tempPath);
      if (result.profile.invalidRows > 0) {
         throw new BadRequestException({ message: 'Catalogue contains validation errors', profile: result.profile });
      }

      const commitResult = await CatalogueImporter.commit(parsedRows, result.profile, userId);
      return commitResult;
    } finally {
      await fs.unlink(tempPath).catch(() => {});
    }
  }
}
