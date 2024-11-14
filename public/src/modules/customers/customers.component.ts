import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { CustomersService } from './services/customers.service';
import { ICustomerItem } from '../../shared/interfaces/customers.interface';
import { CustomersSingleComponent } from './components/customers-single/customers-single.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  @ViewChild('viewCustomerModal', { static: true }) viewCustomerModal!: ModalComponent;

  public Assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  constructor(
    private customersService: CustomersService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const customers = (await firstValueFrom(this.customersService.fetchCustomers())).results;

    this.columns = [
      {
        key: 'actions',
        label: 'Actions',
        type: 'actions',
        onView: (event: any, row: any) => this.handleOpen(event, row),
        onEdit: null,
        onDelete: (event: any, row: any) => this.handleDelete(event, row._id)
      },
      { key: '_id', label: 'ID', type: 'text' },
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phoneNumber', label: 'Phone', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'text' }
    ];

    this.data = customers;
  }

  async handleDelete(event: Event, id: string) {
    event.preventDefault();
    const response = await firstValueFrom(this.customersService.deleteCustomer(id));
    console.log('Delete Customer', id, response)
    if (!response.ok) return alert(response.message);
    this.loadData();
  }

  async handleOpen(event: Event, customer: ICustomerItem) {
    const componentRef: ComponentRef<CustomersSingleComponent> = this.viewCustomerModal.loadComponent(CustomersSingleComponent);
    componentRef.instance.modal = this.viewCustomerModal;
    componentRef.instance.customerId = customer._id;
    this.viewCustomerModal.openModal();
  }
}
