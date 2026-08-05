import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ClientsService } from "./clients.service";

@ApiTags("Clients")
@Controller("clients")
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all client businesses" })
  findAll(@Query() query: { page?: number; limit?: number; status?: string }) {
    return this.clientsService.findAll(query);
  }

  @Post()
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Register a new client business" })
  register(
    @CurrentUser("id") userId: string,
    @Body() body: { businessName: string; businessType: string; contactPerson: string; mobileNumber: string; address: string; city: string },
  ) {
    return this.clientsService.register(userId, body);
  }

  @Get("me")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user linked client business" })
  findMyClient(@CurrentUser("id") userId: string) {
    return this.clientsService.findMyClient(userId);
  }

  @Get(":id")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get client business details" })
  findById(@Param("id") id: string) {
    return this.clientsService.findById(id);
  }

  @Put(":id/approve")
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles("owner")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Approve a pending client business (owner only)" })
  approve(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.clientsService.approve(id, userId);
  }

  @Put(":id/credit")
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles("owner")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update credit limit for a client (owner only)" })
  updateCredit(@Param("id") id: string, @Body() body: { creditLimit: number; creditDays?: number }) {
    return this.clientsService.updateCredit(id, body);
  }

  @Get(":id/credit")
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get credit account summary for a client" })
  getCredit(@Param("id") id: string) {
    return this.clientsService.getCreditSummary(id);
  }
}
