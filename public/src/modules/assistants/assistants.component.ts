import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { AssistantsService } from './services/assistants.service';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { AssistantCreateComponent } from './components/create/assistant-create.component';
import { AssistantEditComponent } from './components/edit/assistant-edit.component';

@Component({
  selector: 'app-assistants',
  standalone: true,
  imports: [TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './assistants.component.html',
  styleUrls: ['./assistants.component.scss'],
})
export class AssistantsComponent implements OnInit {
  @ViewChild('createAssistantModal', { static: true }) createAssistantModal!: ModalComponent;
  @ViewChild('editAssistantModal', { static: true }) editAssistantModal!: ModalComponent;

  public Assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  constructor(
    private assistantsService: AssistantsService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const assistants = (await firstValueFrom(this.assistantsService.fetchAssistants())).results;

    this.columns = [
      {
        key: 'actions',
        label: 'Actions',
        type: 'actions',
        onView: null,
        onEdit: (event: any, row: any) => this.openEditModal(event, row),
        onDelete: (event: any, row: any) => this.handleDelete(event, row._id)
      },
      { key: '_id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'isActive', label: 'Is Active?', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'text' },
    ];

    this.data = assistants;
  }

  async handleDelete(event: Event, id: string) {
    event.preventDefault();
    const response = await firstValueFrom(this.assistantsService.deleteAssistant(id));
    console.log('Delete Assistant number', id, response)
    if (!response.ok) return alert(response.message);
    this.loadData();
  }

  openCreateModal(event: Event) {
    const componentRef: ComponentRef<AssistantCreateComponent> = this.createAssistantModal.loadComponent(AssistantCreateComponent);
    componentRef.instance.modal = this.createAssistantModal;
    componentRef.instance.refresh = this.loadData;
    this.createAssistantModal.openModal();
  }

  openEditModal(event: Event, assistant: IAssistantItem) {
    const componentRef: ComponentRef<AssistantEditComponent> = this.editAssistantModal.loadComponent(AssistantEditComponent);
    componentRef.instance.modal = this.editAssistantModal;
    componentRef.instance.refresh = this.loadData;
    componentRef.instance.data = assistant;
    this.editAssistantModal.openModal();
  }
}
