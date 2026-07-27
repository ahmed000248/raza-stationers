import { Controller, Get, Post, Delete, Put, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post("subscriptions")
  @ApiOperation({ summary: "Subscribe to product or category notifications" })
  subscribe(@CurrentUser("id") userId: string, @Body() body: { scope: string; productId?: string; categoryId?: string }) {
    return this.notificationsService.subscribe(userId, body);
  }

  @Get("subscriptions")
  @ApiOperation({ summary: "Get notification subscriptions" })
  getSubscriptions(@CurrentUser("id") userId: string) {
    return this.notificationsService.getSubscriptions(userId);
  }

  @Delete("subscriptions/:id")
  @ApiOperation({ summary: "Remove a notification subscription" })
  removeSubscription(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.notificationsService.removeSubscription(id, userId);
  }

  @Get()
  @ApiOperation({ summary: "List notifications for current user" })
  findAll(@CurrentUser("id") userId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.notificationsService.findByUser(userId, page, limit);
  }

  @Put(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  markRead(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.notificationsService.markRead(id, userId);
  }
}
