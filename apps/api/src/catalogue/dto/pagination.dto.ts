import { IsOptional, IsInt, Min, Max, IsString, IsIn, IsNumber } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ enum: ["individual", "bulk"] })
  @IsOptional()
  @IsIn(["individual", "bulk"])
  saleType?: "individual" | "bulk";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ enum: ["updating", "out_of_stock", "low_stock", "in_stock"] })
  @IsOptional()
  @IsIn(["updating", "out_of_stock", "low_stock", "in_stock"])
  stock?: "updating" | "out_of_stock" | "low_stock" | "in_stock";

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ["name_asc", "name_desc", "newest"] })
  @IsOptional()
  @IsIn(["name_asc", "name_desc", "newest"])
  sort?: "name_asc" | "name_desc" | "newest" = "name_asc";
}
