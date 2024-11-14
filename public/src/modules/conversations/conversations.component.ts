import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { ConversationsService } from './services/conversations.service';
import { IConversationItem } from '../../shared/interfaces/conversations.interface';
import { ConversationsSingleComponent } from './components/conversations-single/conversations-single.component';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
})
export class ConversationsComponent implements OnInit {
  @ViewChild('viewConversationModal', { static: true }) viewConversationModal!: ModalComponent;

  public Assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  constructor(
    private conversationsService: ConversationsService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const conversations = (await firstValueFrom(this.conversationsService.fetchConversations())).results;

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
      { key: 'from', label: 'From', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'assistant', label: 'Assistant', type: 'text' },
      { key: 'automatic', label: 'Automatic Reply', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'text' },
    ];

    this.data = conversations.map(conversation => ({
      ...conversation,
      phone: conversation.phone?.friendlyName || 'N/A',
      assistant: conversation.assistant.name,
      automatic: conversation.automaticReply ? 'ACTIVATED' : 'DISABLED',
    }));
  }

  async handleDelete(event: Event, id: string) {
    event.preventDefault();
    const response = await firstValueFrom(this.conversationsService.deleteConversation(id));
    console.log('Delete Conversation', id, response)
    if (!response.ok) return alert(response.message);
    this.loadData();
  }

  async handleOpen(event: Event, conversation: IConversationItem) {
    const componentRef: ComponentRef<ConversationsSingleComponent> = this.viewConversationModal.loadComponent(ConversationsSingleComponent);
    componentRef.instance.modal = this.viewConversationModal;
    componentRef.instance.conversationId = conversation._id;
    this.viewConversationModal.openModal();
  }
}
