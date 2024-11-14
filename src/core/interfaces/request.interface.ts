import { OrganizationDocument } from "src/organizations/entities/organization.entity";
import { UserDocument } from "src/users/entities/user.entity";

export interface IRequest extends Request {
	user?: UserDocument;
	organization?: OrganizationDocument;
}