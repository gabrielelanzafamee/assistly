import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrganizationDocument } from 'src/organizations/entities/organization.entity';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema()
export class Customer {
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
	organization: OrganizationDocument;

	// Basic Information
	@Prop()
	firstName: string;
	@Prop()
	lastName: string;
	@Prop()
	email: string;
	@Prop()
	phoneNumber?: string;

	// Additional Personal Information
	@Prop()
	dateOfBirth?: Date;
	@Prop()
	gender?: string;
	@Prop()
	occupation?: string;
	@Prop()
	company?: string;

	// Address Information
	@Prop({ type: Object })
	address?: {
		street?: string;
		city?: string;
		state?: string;
		country?: string;
		postalCode?: string;
	};

	// Communication Preferences
	@Prop()
	preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
	@Prop()
	preferredLanguage: string;
	@Prop()
	preferredContactTimes?: string[];
	@Prop()
	marketingConsent?: boolean;
	@Prop()
	newsletterSubscribed?: boolean;

	// Interaction History
	@Prop()
	firstInteractionDate: Date;
	@Prop()
	lastInteractionDate: Date;
	@Prop()
	interactionCount: number;
	@Prop({ type: [Object] })
	interactions: Array<{
		timestamp: Date;
		type: 'call' | 'message' | 'email' | 'whatsapp';
		content: string;
		sentiment?: 'positive' | 'neutral' | 'negative';
		duration?: number;
		outcome?: string;
	}>;

	// Previous Queries & Context
	@Prop({ type: [Object] })
	previousQueries: Array<{
		timestamp: Date;
		query: string;
		resolution: string;
		successful: boolean;
		category?: string;
		followUpRequired?: boolean;
	}>;

	// Preferences & Interests
	@Prop({ type: Object })
	preferences: {
		productInterests: string[];
		communicationFrequency: string;
		specialNeeds?: string;
		favoriteProducts?: string[];
		interests?: string[];
		preferences?: Record<string, any>;
	};

	// Service-Related
	@Prop()
	customerStatus: 'active' | 'inactive' | 'blocked' | 'pending';
	@Prop()
	serviceLevel: 'basic' | 'premium' | 'enterprise';
	@Prop()
	openTickets: number;
	@Prop({ type: [Object] })
	tickets: Array<{
		ticketId: string;
		status: string;
		priority: string;
		category: string;
		createdAt: Date;
		resolvedAt?: Date;
	}>;

	// Purchase History
	@Prop({ type: [Object] })
	purchases: Array<{
		productId: string;
		productName: string;
		purchaseDate: Date;
		amount: number;
		status: string;
	}>;

	// Feedback & Satisfaction
	@Prop({ type: [Object] })
	feedback: Array<{
		date: Date;
		rating: number;
		comment: string;
		category: string;
	}>;

	// Metadata
	@Prop()
	createdAt: Date;
	@Prop()
	updatedAt: Date;
	@Prop()
	tags: string[];
	@Prop({ type: Object })
	customFields?: Record<string, any>;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.pre('save', function (next) {
	const now = new Date();
	this.updatedAt = now;
	if (!this.createdAt) {
		this.createdAt = now;
	}
	next();
});
