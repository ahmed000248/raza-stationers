import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.businessSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.businessSettings.create({ data: {} });
    }
    return settings;
  }

  async update(data: { businessName?: string; contactPhone?: string; requireApproval?: boolean; stockAlert?: boolean; packingView?: boolean; pickupLocation?: string | null; pickupInstructions?: string | null }) {
    let settings = await this.prisma.businessSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.businessSettings.create({ data: {} });
    }
    const pickupLocation = data.pickupLocation === undefined ? settings.pickupLocation : data.pickupLocation?.trim() || null;
    const pickupInstructions = data.pickupInstructions === undefined ? settings.pickupInstructions : data.pickupInstructions?.trim() || null;
    if (Boolean(pickupLocation) !== Boolean(pickupInstructions)) throw new BadRequestException("Pickup location and pickup instructions must be configured together");
    return this.prisma.businessSettings.update({ where: { id: settings.id }, data: { ...data, pickupLocation, pickupInstructions } });
  }
}
