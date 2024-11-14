import { IResponseBase } from "./response.interface";

export interface ICustomerItem {
  _id: string;
	organization: any;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber?: string;
	dateOfBirth?: Date;
	gender?: string;
	occupation?: string;
	company?: string;
	address?: {
		street?: string;
		city?: string;
		state?: string;
		country?: string;
		postalCode?: string;
	};
	preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
	preferredLanguage: string;
	preferredContactTimes?: string[];
	marketingConsent?: boolean;
	newsletterSubscribed?: boolean;
	firstInteractionDate: Date;
	lastInteractionDate: Date;
	interactionCount: number;
	interactions: Array<{
		timestamp: Date;
		type: 'call' | 'message' | 'email' | 'whatsapp';
		content: string;
		sentiment?: 'positive' | 'neutral' | 'negative';
		duration?: number;
		outcome?: string;
	}>;
	previousQueries: Array<{
		timestamp: Date;
		query: string;
		resolution: string;
		successful: boolean;
		category?: string;
		followUpRequired?: boolean;
	}>;
	preferences: {
		productInterests: string[];
		communicationFrequency: string;
		specialNeeds?: string;
		favoriteProducts?: string[];
		interests?: string[];
		preferences?: Record<string, any>;
	};
	customerStatus: 'active' | 'inactive' | 'blocked' | 'pending';
	serviceLevel: 'basic' | 'premium' | 'enterprise';
	openTickets: number;
	tickets: Array<{
		ticketId: string;
		status: string;
		priority: string;
		category: string;
		createdAt: Date;
		resolvedAt?: Date;
	}>;
	purchases: Array<{
		productId: string;
		productName: string;
		purchaseDate: Date;
		amount: number;
		status: string;
	}>;
	feedback: Array<{
		date: Date;
		rating: number;
		comment: string;
		category: string;
	}>;
	createdAt: Date;
	updatedAt: Date;
	tags: string[];
	customFields?: Record<string, any>;
}


export interface ICustomerListResponse extends IResponseBase {
  results: ICustomerItem[];
}

export interface ICustomerSingleResponse extends IResponseBase {
  results: ICustomerItem;
}

export interface ICustomerDeleteResponse extends IResponseBase {
  results: string;
}
