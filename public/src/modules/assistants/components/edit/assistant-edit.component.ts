import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
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
import { IAssistantItem } from '../../../../shared/interfaces/assistants.interface';
import { SwitchComponent } from "../../../../shared/ui-components/swtich/swtich.component";
import { KnowledgesService } from '../../../knowledges/services/knowledges.service';
import { IKnowledgeListResponse } from '../../../../shared/interfaces/knowledges.interface';

@Component({
  selector: 'app-assistant-edit',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, SelectComponent, TextAreaComponent, SwitchComponent],
  providers: [HttpClient],
  templateUrl: './assistant-edit.component.html',
  styleUrl: './assistant-edit.component.scss'
})
export class AssistantEditComponent implements OnInit {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() data!: IAssistantItem;
  @Input() refresh!: () => {};

  assistantForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    numberId: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    instructions: new FormControl('', [Validators.required]),
    knowledge: new FormControl([], [Validators.required]),
    isActive: new FormControl(false, [Validators.required])
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
    private knowledgesService: KnowledgesService,
    private cdr: ChangeDetectorRef
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
      complete: () => {
        this.setFormValues();
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
      complete: () => {
        this.setFormValues();
      },
      error: (err) => {
        console.error('Error in assistant fetching interval:', err);
      },
    });
  }

  setFormValues(): void {
    this.cdr.detectChanges();
    this.getControl('name').setValue(this.data.name);
    this.getControl('numberId').setValue(this.data.number);
    this.getControl('type').setValue(this.data.type);
    this.getControl('instructions').setValue(this.data.instructions);
    this.getControl('isActive').setValue(this.data.isActive);
    this.getControl('knowledge').setValue(
      this.knowledges
        .filter((item) => this.data.knowledge.includes(item.value))
    );
  }

  getControl(controlName: string): FormControl {
    return this.assistantForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.assistantForm.invalid) {
      this.assistantForm.markAllAsTouched();
      return;
    }

    if (!this.data || typeof this.data._id !== 'string') {
      this.assistantForm.markAllAsTouched();
      return ;
    }

    // fix knowledge format
    const knowledge = this.getControl('knowledge').value.map((item: any) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object') return item.value;
    });

    const response = await firstValueFrom(this.assistantsService.updateAssistant(this.data._id, {
      instructions: this.getControl('instructions').value,
      type: this.getControl('type').value,
      name: this.getControl('name').value,
      numberId: this.getControl('numberId').value,
      knowledge: knowledge,
      isActive: this.getControl('isActive').value
    }));

    console.log('create assistant response', response);

    setTimeout(() => {
      this.refresh();
    }, 1500);
    this.modal.closeModal();
  }
}
