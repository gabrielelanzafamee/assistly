import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { KnowledgesService } from './services/knowledges.service';
import { KnowledgeCreateComponent } from './components/create/knowledges-create.component';

@Component({
  selector: 'app-knowledges',
  standalone: true,
  imports: [TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './knowledges.component.html',
  styleUrls: ['./knowledges.component.scss'],
})
export class KnowledgesComponent implements OnInit {
  @ViewChild('createKnowledgeModal', { static: true }) createKnowledgeModal!: ModalComponent;

  public assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  constructor(
    private knowledgesService: KnowledgesService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const knowledges = (await firstValueFrom(this.knowledgesService.fetchKnowledge())).results;

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
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'organization', label: 'Organization', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'text' },
    ];

    this.data = knowledges;
  }

  async handleDelete(event: Event, id: string) {
    event.preventDefault();
    const response = await firstValueFrom(this.knowledgesService.deleteKnowledge(id));
    console.log('Delete Assistant number', id, response)
    if (!response.ok) return alert(response.message);
    this.loadData();
  }

  openCreateModal(event: Event) {
    const componentRef: ComponentRef<KnowledgeCreateComponent> = this.createKnowledgeModal.loadComponent(KnowledgeCreateComponent);
    componentRef.instance.modal = this.createKnowledgeModal;
    componentRef.instance.refresh = this.loadData;
    this.createKnowledgeModal.openModal();
  }
}
