import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CatalogueModule } from "./catalogue/catalogue.module";
import { ClientsModule } from "./clients/clients.module";
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CatalogueModule, ClientsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
