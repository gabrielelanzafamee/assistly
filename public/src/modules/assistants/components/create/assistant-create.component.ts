import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { AssistantsService } from '../../services/assistants.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { SelectComponent } from "../../../../shared/ui-components/select/select.component";
import { PhonesService } from '../../../phones/services/phones.service';
import { IPhonesListResponse } from '../../../../shared/interfaces/phones.interface';
import { TextAreaComponent } from "../../../../shared/ui-components/textarea/textarea.component";
import { firstValueFrom } from 'rxjs';
import { KnowledgesService } from '../../../knowledges/services/knowledges.service';
import { IKnowledgeListResponse } from '../../../../shared/interfaces/knowledges.interface';

@Component({
  selector: 'app-assistant-create',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, ModalComponent, InputComponent, SelectComponent, TextAreaComponent],
  providers: [HttpClient],
  templateUrl: './assistant-create.component.html',
  styleUrl: './assistant-create.component.scss'
})
export class AssistantCreateComponent implements OnInit, OnDestroy {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() refresh!: () => {};

  assistantForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    numberId: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    knowledge: new FormControl([], [Validators.required]),
    instructions: new FormControl('', [Validators.required])
  });
  phones: { label: string, value: string }[] = [];
  knowledges: { label: string, value: string }[] = [];
  types: { label: string, value: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Call', value: 'call' },
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'SMS', value: 'sms' },
  ];

  constructor (
    private assistantsService: AssistantsService,
    private phonesService: PhonesService,
    private knowledgesService: KnowledgesService
  ) {}

  ngOnInit(): void {
    this.phonesService.fetchPhones().subscribe({
      next: (response: IPhonesListResponse) => {
        this.phones = response.results.map((item) => {
          return {
            value: item._id,
            label: item.friendlyName
          }
        });
      },
      error: (err) => {
        console.error('Error in assistant fetching interval:', err);
      },
    });

    this.knowledgesService.fetchKnowledge().subscribe({
      next: (response: IKnowledgeListResponse) => {
        this.knowledges = response.results.map((item) => {
          return {
            value: item._id,
            label: item.name
          }
        });
      },
      error: (err) => {
        console.error('Error in assistant fetching interval:', err);
      },
    });
  }

  ngOnDestroy(): void {}

  getControl(controlName: string): FormControl {
    return this.assistantForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.assistantForm.invalid) {
      this.assistantForm.markAllAsTouched();
      return;
    }

    const response = await firstValueFrom(this.assistantsService.createAssistant({
      instructions: this.getControl('instructions').value,
      type: this.getControl('type').value,
      name: this.getControl('name').value,
      numberId: this.getControl('numberId').value,
      knowledge: this.getControl('knowledge').value,
    }));
    console.log('create assistant response', response);

    await this.refresh();
    this.modal.closeModal();
  }
}
