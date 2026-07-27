import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ReturnsService } from "./returns.service";

@ApiTags("Returns")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Post("returns")
  @ApiOperation({ summary: "Request a return" })
  create(@CurrentUser("id") userId: string, @Body() body: { orderId: string; invoiceId: string; reason: string }) {
    return this.returnsService.create({ ...body, userId });
  }

  @Get("returns/:id")
  @ApiOperation({ summary: "Get return details" })
  findById(@Param("id") id: string) {
    return this.returnsService.findById(id);
  }

  @Get("order-returns/:orderId")
  @ApiOperation({ summary: "List returns for an order" })
  findByOrder(@Param("orderId") orderId: string) {
    return this.returnsService.findByOrder(orderId);
  }
}
