import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { SelectComponent } from "../../../../shared/ui-components/select/select.component";
import { KnowledgesService } from '../../services/knowledges.service';
import { FileComponent } from "../../../../shared/ui-components/file/file.component";
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-knowledges-create',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, ModalComponent, InputComponent, SelectComponent, FileComponent],
  providers: [HttpClient],
  templateUrl: './knowledges-create.component.html',
  styleUrl: './knowledges-create.component.scss'
})
export class KnowledgeCreateComponent implements OnInit, OnDestroy {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() refresh!: () => {};

  knowledgeForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    files: new FormControl('', [Validators.required])
  });
  availablePhones: { label: string, value: string }[] = [];

  constructor (
    private knowledgesService: KnowledgesService
  ) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  getControl(controlName: string): FormControl {
    return this.knowledgeForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.knowledgeForm.disable();

    if (this.knowledgeForm.invalid) {
      this.knowledgeForm.markAllAsTouched();
      return;
    }

    // Build the FormData object
    const formData = new FormData();
    formData.append('name', this.getControl('name').value);

    const files: File[] = this.getControl('files').value;
    files.forEach((file, index) => {
      formData.append(`files`, file, file.name);  // Append each file with its name
    });

    const response = await firstValueFrom(this.knowledgesService.createKnowledge(formData));
    console.log('create phone response', response);

    await this.refresh();
    this.modal.closeModal();
    this.knowledgeForm.enable();
  }
}
