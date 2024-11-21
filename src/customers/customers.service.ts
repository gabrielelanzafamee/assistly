import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Customer, CustomerDocument } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<Customer>,
  ) {}

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    return this.customerModel.findOne({ email });
  }

  async list(organizationId: string, pagination = null) {
		if (pagination !== null) {
			return await this.customerModel.find({ organization: organizationId }).skip(pagination.offset).limit(pagination.limit);
		}
		return await this.customerModel.find({ organization: organizationId });
  }

	async count(organizationId: string) {
		return await this.customerModel.countDocuments({ organization: organizationId });
	}


	async create(customer: CreateCustomerDto): Promise<CustomerDocument> {
		return await new this.customerModel(customer).save();
	}

	async update(id: string, organization: string, customer: UpdateCustomerDto): Promise<CustomerDocument> {
		return await this.customerModel.findOneAndReplace({ _id: id, organization }, customer, { new: true }).populate(['organization']);
	}

	async delete(id: string, organization: string): Promise<CustomerDocument> {
		return await this.customerModel.findOneAndDelete({ _id: id, organization });
	}

	async get(id: string, organization: string): Promise<CustomerDocument> {
		return await this.customerModel.findOne({ _id: id, organization }).populate(['organization']);
	}

	async updateInteractionHistory(
		customerId: string, 
		organization: string,
		query?: string, 
		resolution?: string,
		customFields?: Record<string, any>
	): Promise<CustomerDocument> {
		const customer = await this.get(customerId, organization);

		if (!customer) {
			throw new Error('Customer not found');
		}

		// Update interaction metrics
		const updates: Partial<UpdateCustomerDto> = {
			...customer.toObject(),
			...customFields,
			organization: customer.organization._id.toString(),
			lastInteractionDate: new Date(),
			interactionCount: customer.interactionCount + 1,
		};

		// Add query to history if provided
		if (query && resolution) {
			updates.previousQueries = [
				...customer.previousQueries,
				{
					timestamp: new Date(),
					query,
					resolution,
				},
			];
		}

		return await this.update(customerId, organization, updates);
	}

	async updatePreferences(
		customerId: string, 
		organization: string,
		preferences: UpdateCustomerDto['preferences']
	): Promise<CustomerDocument> {
		const customer = await this.get(customerId, organization);

		if (!customer) {
			throw new Error('Customer not found');
		}

		return await this.update(customerId, organization, { preferences });
	}

	async updateCustomerStatus(
		customerId: string, 
		organization: string,
		status: UpdateCustomerDto['customerStatus']
	): Promise<CustomerDocument> {
		const customer = await this.get(customerId, organization);

		if (!customer) {
			throw new Error('Customer not found');
		}

		return await this.update(customerId, organization, { customerStatus: status });
	}

	async updateServiceLevel(
		customerId: string, 
		organization: string,
		level: UpdateCustomerDto['serviceLevel']
	): Promise<CustomerDocument> {
		const customer = await this.get(customerId, organization);

		if (!customer) {
			throw new Error('Customer not found');
		}

		return await this.update(customerId, organization, { serviceLevel: level });
	}

	async updateOpenTickets(
		customerId: string, 
		organization: string,
		tickets: UpdateCustomerDto['openTickets']
	): Promise<CustomerDocument> {
		const customer = await this.get(customerId, organization);

		if (!customer) {
			throw new Error('Customer not found');
		}

		return await this.update(customerId, organization, { openTickets: tickets });
	}

	async findCustomerByPhone(phoneNumber: string, organizationId: string): Promise<CustomerDocument | null> {
		return this.customerModel.findOne({ phoneNumber, organization: organizationId });
	}

	async createOrUpdateByPhone(customerData: CreateCustomerDto, organizationId: string): Promise<CustomerDocument> {
		try {
			if (customerData.phoneNumber) {
				const existingCustomer = await this.findCustomerByPhone(
					customerData.phoneNumber,
					organizationId
				);

				if (existingCustomer) {
					return await this.customerModel.findOneAndUpdate(
						{ _id: existingCustomer._id, organization: new mongoose.Types.ObjectId(organizationId) },
						{
							...customerData,
							interactionCount: (existingCustomer.interactionCount || 0) + 1,
							lastInteractionDate: new Date(),
						},
						{ new: true }
					);
				}
			}

			const newCustomer = new this.customerModel({
				...customerData,
				organization: organizationId,
				firstInteractionDate: new Date(),
				lastInteractionDate: new Date(),
				interactionCount: 1,
				customerStatus: customerData.customerStatus || 'active',
				serviceLevel: customerData.serviceLevel || 'basic',
				openTickets: customerData.openTickets || 0,
				previousQueries: customerData.previousQueries || [],
				tags: customerData.tags || [],
			});

			return await newCustomer.save();
		} catch (error) {
			throw new Error(`Failed to create or update customer: ${error.message}`);
		}
	}
}
