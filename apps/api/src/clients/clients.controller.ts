import { Controller, Get, Post, Put, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ClientsService } from "./clients.service";

@ApiTags("Clients")
@Controller("clients")
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Register a new client business" })
  register(
    @CurrentUser("id") userId: string,
    @Body() body: { businessName: string; businessType: string; contactPerson: string; mobileNumber: string; address: string; city: string },
  ) {
    return this.clientsService.register(userId, body);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get client business details" })
  findById(@Param("id") id: string) {
    return this.clientsService.findById(id);
  }

  @Put(":id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("owner")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Approve a pending client business (owner only)" })
  approve(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.clientsService.approve(id, userId);
  }

  @Get(":id/credit")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get credit account summary for a client" })
  getCredit(@Param("id") id: string) {
    return this.clientsService.getCreditSummary(id);
  }
}
