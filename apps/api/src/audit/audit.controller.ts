import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BetterAuthGuard } from "../auth/guards/better-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AuditService } from "./audit.service";

@ApiTags("Audit")
@Controller("audit-logs")
@UseGuards(BetterAuthGuard, RolesGuard)
@Roles("owner")
@ApiBearerAuth()
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "List audit logs (owner only)" })
  findAll(@Query() query: { page?: number; limit?: number; entityType?: string; actorId?: string }) {
    return this.auditService.findAll(query);
  }
}
