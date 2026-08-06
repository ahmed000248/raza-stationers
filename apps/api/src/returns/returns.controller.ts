import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ReturnsService } from "./returns.service";

@ApiTags("Returns")
@Controller("returns")
@UseGuards(BetterAuthGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: "Request a return" })
  create(@CurrentUser() user: any, @Body() body: { orderId: string; invoiceId: string; reason: string }) {
    return this.returnsService.create({ ...body, userId: user.id, userRole: user.role });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get return details" })
  findById(@Param("id") id: string, @CurrentUser() user: any) {
    return this.returnsService.findById(id, user);
  }

  @Get("order/:orderId")
  @ApiOperation({ summary: "List returns for an order" })
  findByOrder(@Param("orderId") orderId: string, @CurrentUser() user: any) {
    return this.returnsService.findByOrder(orderId, user);
  }
}
