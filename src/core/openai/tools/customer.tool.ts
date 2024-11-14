import { Injectable } from '@nestjs/common';
import { BaseTool } from './base.tool';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class CustomerTool extends BaseTool {
  name = 'saveCustomer';
  description = 'Save or update the user information if you detect any usefull information about the user, can be used to enrich the user profile, for example: name, email, phone number, date of birth, occupation, company, address, etc.';
  parameters = {
    type: 'object',
    properties: {
      // Basic Information
      firstName: {
        type: 'string',
        description: 'Customer\'s first name'
      },
      lastName: {
        type: 'string',
        description: 'Customer\'s last name'
      },
      email: {
        type: 'string',
        description: 'Customer\'s email address'
      },
      phoneNumber: {
        type: 'string',
        description: 'Customer\'s phone number'
      },
      
      // Personal Information
      dateOfBirth: {
        type: 'string',
        description: 'Customer\'s date of birth (YYYY-MM-DD)'
      },
      occupation: {
        type: 'string',
        description: 'Customer\'s occupation or profession'
      },
      company: {
        type: 'string',
        description: 'Customer\'s company name'
      },

      // Address Information
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          postalCode: { type: 'string' }
        }
      },

      // Interaction Context
      query: {
        type: 'string',
        description: 'Current customer query or message'
      },
      resolution: {
        type: 'string',
        description: 'Resolution or response to the query'
      },
      sentiment: {
        type: 'string',
        enum: ['positive', 'neutral', 'negative'],
        description: 'Detected sentiment of the interaction'
      },
      
      // Preferences
      preferredLanguage: {
        type: 'string',
        description: 'Customer\'s preferred language'
      },
      productInterests: {
        type: 'array',
        items: { type: 'string' },
        description: 'Products or services the customer is interested in'
      },
      specialNeeds: {
        type: 'string',
        description: 'Any special needs or requirements'
      },
      
      // Additional Context
      category: {
        type: 'string',
        description: 'Category of the interaction or query'
      },
      followUpRequired: {
        type: 'boolean',
        description: 'Whether this interaction requires follow-up'
      },
      customFields: {
        type: 'object',
        description: 'Any additional custom fields to save'
      }
    },
    required: ['firstName', 'lastName', 'query', 'resolution']
  };

  constructor(private customersService: CustomersService) {
    super();
  }

  async execute(args: Record<string, any>, params: any): Promise<any> {
    try {
      const customerData = {
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
        phoneNumber: params.phoneNumber,
        dateOfBirth: args.dateOfBirth,
        occupation: args.occupation,
        company: args.company,
        address: args.address,
        preferredLanguage: args.preferredLanguage,
        preferences: {
          productInterests: args.productInterests || [],
          specialNeeds: args.specialNeeds,
          communicationFrequency: 'normal'
        },
        customFields: args.customFields
      };

      const customer = await this.customersService.createOrUpdateByPhone(
        customerData as any,
        params.organizationId
      );

      // Update interaction history with sentiment analysis
      await this.customersService.updateInteractionHistory(
        customer._id.toString(),
        customer.organization._id.toString(),
        args.query,
        args.resolution,
        {
          sentiment: args.sentiment,
          category: args.category,
          followUpRequired: args.followUpRequired
        }
      );

      return {
        success: true,
        customerId: customer._id,
        message: 'Customer information processed successfully'
      };
    } catch (error) {
      console.error('Error executing customer tool:', error);
      return {
        success: false,
        error: true,
        message: `Failed to process customer information: ${error.message}`
      };
    }
  }
} 