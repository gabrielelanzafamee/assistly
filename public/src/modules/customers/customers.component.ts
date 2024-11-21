import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { CustomersService } from './services/customers.service';
import { ICustomerItem } from '../../shared/interfaces/customers.interface';
import { CustomersSingleComponent } from './components/customers-single/customers-single.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, TableComponent, ModalComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  @ViewChild('viewCustomerModal', { static: true }) viewCustomerModal!: ModalComponent;

  public Assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  public currentPage: number = 1;
  public itemsPerPage: number = 12;
  public totalPages: number = 0;

  public pages: number[] = []; // Array for page numbers


  constructor(
    private customersService: CustomersService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const offset = (this.currentPage - 1) * this.itemsPerPage; // Calculate offset
    const response = await firstValueFrom(
      this.customersService.fetchCustomers(this.itemsPerPage, offset)
    );

    const { results: customers, count } = response;

    this.data = customers;
    this.totalPages = Math.ceil(count / this.itemsPerPage); // Calculate total pages
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1); // Generate page numbers

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
  }

  public nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData(); // Load the next page
    }
  }

  public previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData(); // Load the previous page
    }
  }

  public goToPage(page: number) {
    this.currentPage = page;
    this.loadData();
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
