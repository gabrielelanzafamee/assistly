import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { PhonesService } from './services/phones.service';
import { firstValueFrom } from 'rxjs';
import { IPhoneItem } from '../../shared/interfaces/phones.interface';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { PhoneCreateComponent } from "./components/create/phone-create.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phones',
  standalone: true,
  imports: [CommonModule, TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './phones.component.html',
  styleUrls: ['./phones.component.scss'],
})
export class PhonesComponent implements OnInit {
  @ViewChild('createPhoneModal', { static: true }) createPhoneModal!: ModalComponent;

  public phones: IPhoneItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  public currentPage: number = 1;
  public itemsPerPage: number = 12;
  public totalPages: number = 0;

  public pages: number[] = []; // Array for page numbers

  constructor(
    private phonesService: PhonesService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const offset = (this.currentPage - 1) * this.itemsPerPage; // Calculate offset
    const response = await firstValueFrom(
      this.phonesService.fetchPhones(this.itemsPerPage, offset)
    );

    const { results: phones, count } = response;

    this.data = phones;
    this.totalPages = Math.ceil(count / this.itemsPerPage); // Calculate total pages
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1); // Generate page numbers

    this.columns = [
      {
        key: 'actions',
        label: 'Actions',
        type: 'actions',
        onView: null,
        onEdit: null,
        onDelete: (event: any, row: any) => this.handleDelete(event, row._id)
      },
      { key: '_id', label: 'ID', type: 'text' },
      { key: 'phoneNumber', label: 'Phone', type: 'text' },
      { key: 'friendlyName', label: 'Name', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'text' },
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
    const response = await firstValueFrom(this.phonesService.deletePhoneNumber(id));
    console.log('Delete phone number', id, response)
    if (!response.ok) return alert(response.message);
    this.loadData();
  }

  openCreateModal(event: Event) {
    const componentRef: ComponentRef<PhoneCreateComponent> = this.createPhoneModal.loadComponent(PhoneCreateComponent);
    componentRef.instance.modal = this.createPhoneModal;
    componentRef.instance.refresh = this.loadData;
    this.createPhoneModal.openModal();
  }
}
