import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { PhonesService } from './services/phones.service';
import { filter, firstValueFrom } from 'rxjs';
import { IPhoneItem } from '../../shared/interfaces/phones.interface';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { PhoneCreateComponent } from "./components/create/phone-create.component";

@Component({
  selector: 'app-phones',
  standalone: true,
  imports: [TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './phones.component.html',
  styleUrls: ['./phones.component.scss'],
})
export class PhonesComponent implements OnInit {
  @ViewChild('createPhoneModal', { static: true }) createPhoneModal!: ModalComponent;

  public phones: IPhoneItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  constructor(
    private phonesService: PhonesService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const phones = (await firstValueFrom(this.phonesService.fetchPhones())).results;

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

    this.data = phones;
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
