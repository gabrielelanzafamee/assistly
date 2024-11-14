import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { CallsService } from './services/calls.service';
import { IConversationItem } from '../../shared/interfaces/conversations.interface';
import { ICallItem } from '../../shared/interfaces/calls.interface';
import { CallsSingleComponent } from './components/calls-single/calls-single.component';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.scss'],
})
export class CallsComponent implements OnInit {
  @ViewChild('viewCallModal', { static: true }) viewCallModal!: ModalComponent;

  public Assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  constructor(
    private callsService: CallsService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const calls = (await firstValueFrom(this.callsService.fetchCalls())).results;

    console.log(calls);

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

    this.data = calls;
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
