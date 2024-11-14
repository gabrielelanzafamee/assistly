import { Module } from "@nestjs/common";
import { Organization, OrganizationSchema } from "./entities/organization.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { OrganizationsController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";


@Module({
  imports: [
		MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }])
	],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [MongooseModule, OrganizationsService]
})
export class OrganizationsModule {}