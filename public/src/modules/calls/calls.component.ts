import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { CallsService } from './services/calls.service';
import { ICallItem } from '../../shared/interfaces/calls.interface';
import { CallsSingleComponent } from './components/calls-single/calls-single.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [CommonModule, TableComponent, ModalComponent],
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.scss'],
})
export class CallsComponent implements OnInit {
  @ViewChild('viewCallModal', { static: true }) viewCallModal!: ModalComponent;

  public Assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  public currentPage: number = 1;
  public itemsPerPage: number = 12;
  public totalPages: number = 0;

  public pages: number[] = []; // Array for page numbers

  constructor(
    private callsService: CallsService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const offset = (this.currentPage - 1) * this.itemsPerPage; // Calculate offset
    const response = await firstValueFrom(
      this.callsService.fetchCalls(this.itemsPerPage, offset)
    );

    const { results: calls, count } = response;

    this.data = calls.map(item => ({ ...item, assistant: item.assistant.name }));
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
      { key: 'assistant', label: 'Assistant', type: 'text' },
      { key: 'from', label: 'From', type: 'text' },
      { key: 'to', label: 'To', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'text' },
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
    const response = await firstValueFrom(this.callsService.deleteCall(id));
    console.log('Delete Conversation', id, response)
    if (!response.ok) return alert(response.message);
    this.loadData();
  }

  async handleOpen(event: Event, call: ICallItem) {
    const componentRef: ComponentRef<CallsSingleComponent> = this.viewCallModal.loadComponent(CallsSingleComponent);
    componentRef.instance.modal = this.viewCallModal;
    componentRef.instance.callId = call._id;
    this.viewCallModal.openModal();
  }
}
