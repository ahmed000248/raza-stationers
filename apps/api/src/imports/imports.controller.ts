import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException, ConflictException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { CatalogueImporter } from '@raza-stationers/db';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { Express } from 'express';
import "multer";

const CERTIFIED_SHA256 = '7cb65d6d07b30c75a048431dab4f855fd60b901515c07fe0f2253f8faccafa0b';

function validateXlsxFile(file: any) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  // Validate extension
  if (!file.originalname?.endsWith('.xlsx')) {
    throw new BadRequestException('Invalid file extension. Only .xlsx files are allowed.');
  }

  // Validate MIME type
  if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.mimetype !== 'application/octet-stream') {
    throw new BadRequestException('Invalid MIME type. Only .xlsx files are allowed.');
  }

  // Validate magic bytes (ZIP signature)
  if (file.buffer.length < 4 || file.buffer[0] !== 0x50 || file.buffer[1] !== 0x4b || file.buffer[2] !== 0x03 || file.buffer[3] !== 0x04) {
    throw new BadRequestException('Invalid file signature. File is not a valid ZIP/XLSX archive.');
  }

  // Validate SHA-256 workbook identity
  const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
  if (sha256 !== CERTIFIED_SHA256) {
    throw new BadRequestException('Unauthorized workbook. Only the certified catalogue workbook is allowed.');
  }
}

@Controller('admin/imports/catalogue')
@UseGuards(BetterAuthGuard, RolesGuard)
export class ImportsController {
  
  @Post('plan')
  @Roles(UserRole.admin)
  @UseInterceptors(FileInterceptor('file'))
  async generatePlan(
    @UploadedFile() file: any,
  ) {
    validateXlsxFile(file);

    const tempPath = path.join(os.tmpdir(), `upload-plan-${Date.now()}-${file.originalname || 'catalogue.xlsx'}`);
    await fs.writeFile(tempPath, file.buffer);

    try {
      const { parsedRows, result } = await CatalogueImporter.generatePlan(tempPath);
      
      // Redact buying prices from row data in user-facing response
      const sanitizedRows = parsedRows.map(({ buyingPrice, ...rest }) => rest);
      
      return {
        ...result,
        rows: sanitizedRows,
      };
    } finally {
      await fs.unlink(tempPath).catch(() => {});
    }
  }

  @Post('commit')
  @Roles(UserRole.admin)
  @UseInterceptors(FileInterceptor('file'))
  async commitImport(
    @UploadedFile() file: any,
    @Query('planChecksum') planChecksum: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!planChecksum) {
      throw new BadRequestException('planChecksum query parameter is required');
    }
    validateXlsxFile(file);

    const tempPath = path.join(os.tmpdir(), `upload-commit-${Date.now()}-${file.originalname || 'catalogue.xlsx'}`);
    await fs.writeFile(tempPath, file.buffer);

    try {
      const fileSha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
      const commitResult = await CatalogueImporter.commitWorkbook(tempPath, userId, planChecksum);
      return commitResult;
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('Plan checksum mismatch') || msg.includes('checksum mismatch') || msg.includes('stale') || msg.includes('Stale')) {
        throw new BadRequestException(msg);
      }
      if (msg.includes('validation errors') || msg.includes('validation error')) {
        throw new BadRequestException(msg);
      }
      if (msg.includes('already committed') || msg.includes('Already committed') || msg.includes('lock') || msg.includes('conflict')) {
        throw new ConflictException(msg);
      }
      throw error;
    } finally {
      await fs.unlink(tempPath).catch(() => {});
    }
  }
}
