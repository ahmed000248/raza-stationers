import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CatalogueModule } from "./catalogue/catalogue.module";
import { ClientsModule } from "./clients/clients.module";
import { OrdersModule } from "./orders/orders.module";
import { InventoryModule } from "./inventory/inventory.module";
import { PricingModule } from "./pricing/pricing.module";
import { InvoicingModule } from "./invoicing/invoicing.module";
import { AuditModule } from "./audit/audit.module";
import { DeliveryModule } from "./delivery/delivery.module";
import { ReturnsModule } from "./returns/returns.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { StaffModule } from "./staff/staff.module";
import { AccountingModule } from "./accounting/accounting.module";
import { SettingsModule } from "./settings/settings.module";
import { ImportsModule } from "./imports/imports.module";

@Module({
  imports: [
    PrismaModule, AuthModule, UsersModule, CatalogueModule,
    ClientsModule, OrdersModule, InventoryModule, PricingModule,
    InvoicingModule, AuditModule, DeliveryModule, ReturnsModule,
    NotificationsModule, DashboardModule, StaffModule, AccountingModule,
    SettingsModule, ImportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
