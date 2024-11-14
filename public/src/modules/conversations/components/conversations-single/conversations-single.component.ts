import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { SelectComponent } from "../../../../shared/ui-components/select/select.component";
import { FileComponent } from "../../../../shared/ui-components/file/file.component";
import { ConversationsService } from '../../services/conversations.service';
import { MessagesService } from '../../services/messages.service';
import { firstValueFrom } from 'rxjs';
import { IMessageItem, IMessageListResponse } from '../../../../shared/interfaces/messages.interface';
import { CommonModule } from '@angular/common';
import { SwitchComponent } from "../../../../shared/ui-components/swtich/swtich.component";
import { IConversationItem, IConversationSingleResponse } from '../../../../shared/interfaces/conversations.interface';

@Component({
  selector: 'app-conversations-single',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CommonModule, ModalComponent, InputComponent, SwitchComponent],
  providers: [HttpClient],
  templateUrl: './conversations-single.component.html',
  styleUrl: './conversations-single.component.scss'
})
export class ConversationsSingleComponent implements OnInit, OnDestroy {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() refresh!: () => {};
  @Input() conversationId: string = '';

  automaticReply = new FormControl(true);

  conversation: IConversationItem = {} as IConversationItem;
  messages: IMessageItem[] = [];
  private intervalId: any = null;

  messageForm = new FormGroup({
    message: new FormControl('')
  })

  constructor (
    private conversationsService: ConversationsService,
    private messagesService: MessagesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.intervalId = setInterval(() => {
      this.loadData();
    }, 5_000);
    this.modal.onClose.subscribe(() => {
      if (!this.intervalId) return ;
      clearInterval(this.intervalId);
    });
  }

  ngOnDestroy(): void {
    if (!this.intervalId) return ;
    clearInterval(this.intervalId);
  }

  loadData(): void {
    if (this.conversationId === '' || this.conversationId === null) return ;

    // fetch conversation message by conversationId
    this.conversationsService.singleConversation(this.conversationId).subscribe({
      next: (response: IConversationSingleResponse) => {
        this.conversation = response.results;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.automaticReply.setValue(this.conversation.automaticReply);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      }
    });

    this.messagesService.fetchMessagesConversation(this.conversationId).subscribe({
      next: (response: IMessageListResponse) => {
        this.messages = response.results;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getControl(controlName: string): FormControl {
    return this.messageForm.get(controlName) as FormControl;
  }

  async onSendMessage(event: Event) {
    if (this.getControl('message').value === '' || this.getControl('message').value === null) return ;
    const response = await firstValueFrom(this.messagesService.sendMessage(this.conversationId, this.getControl('message').value));
    console.log(response);
    console.log("send message");
    this.getControl('message').setValue('');
    this.loadData();
  }

  async onSwitchChange(value: boolean) {
    const response = await firstValueFrom(this.conversationsService.updateConversation(this.conversationId, {
      automaticReply: value
    }));

    console.log(response);
    console.log("switch changed");
  }
}
