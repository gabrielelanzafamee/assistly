import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CallsService } from '../../services/calls.service';

@Component({
  selector: 'app-calls-single',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CommonModule, InputComponent],
  providers: [HttpClient],
  templateUrl: './calls-single.component.html',
  styleUrl: './calls-single.component.scss'
})
export class CallsSingleComponent implements OnInit {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() refresh!: () => {};
  @Input() callId: string = '';

  transcription: {
    role: string;
    content: string;
    at: Date;
  }[] = [];

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.required])
  })

  constructor (
    private callsService: CallsService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.callId === '' || this.callId === null) return ;


    // fetch conversation message by conversationId
    const response = await firstValueFrom(this.callsService.singleCall(this.callId));
    console.log('GEREAFSA', response.results.transcript)
    this.transcription = response.results.transcript;
  }

  getControl(controlName: string): FormControl {
    return this.messageForm.get(controlName) as FormControl;
  }
}
