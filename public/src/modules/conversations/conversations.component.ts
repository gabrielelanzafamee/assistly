import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { IAssistantItem } from '../../shared/interfaces/assistants.interface';
import { ConversationsService } from './services/conversations.service';
import { IConversationItem } from '../../shared/interfaces/conversations.interface';
import { ConversationsSingleComponent } from './components/conversations-single/conversations-single.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, TableComponent, ModalComponent],
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
})
export class ConversationsComponent implements OnInit {
  @ViewChild('viewConversationModal', { static: true }) viewConversationModal!: ModalComponent;

  public Assistants: IAssistantItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  public currentPage: number = 1;
  public itemsPerPage: number = 12;
  public totalPages: number = 0;

  public pages: number[] = []; // Array for page numbers

  constructor(
    private conversationsService: ConversationsService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const offset = (this.currentPage - 1) * this.itemsPerPage; // Calculate offset
    const response = await firstValueFrom(
      this.conversationsService.fetchConversations(this.itemsPerPage, offset)
    );

    const { results: conversations, count } = response;

    this.data = conversations.map(conversation => ({
      ...conversation,
      phone: conversation.phone?.friendlyName || 'N/A',
      assistant: conversation.assistant.name,
      automatic: conversation.automaticReply ? 'ACTIVATED' : 'DISABLED',
    }));
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
      { key: 'from', label: 'From', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'assistant', label: 'Assistant', type: 'text' },
      { key: 'automatic', label: 'Automatic Reply', type: 'text' },
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
