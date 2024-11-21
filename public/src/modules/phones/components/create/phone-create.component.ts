import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { PhonesService } from '../../services/phones.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { Router } from '@angular/router';
import { SelectComponent } from "../../../../shared/ui-components/select/select.component";
import { IPhonesListTwilioResponse } from '../../../../shared/interfaces/phones.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-phone-create',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, SelectComponent],
  providers: [HttpClient],
  templateUrl: './phone-create.component.html',
  styleUrl: './phone-create.component.scss'
})
export class PhoneCreateComponent implements OnInit, OnDestroy {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() refresh!: () => {};

  phoneForm = new FormGroup({
    friendlyName: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required])
  });
  availablePhones: { label: string, value: string }[] = [];

  constructor (
    private phonesService: PhonesService
  ) {}

  ngOnInit(): void {
    this.phonesService.fetchAvailablePhones('GB').subscribe({
      next: (response: IPhonesListTwilioResponse) => {
        this.availablePhones = response.results.map((item) => {
          return {
            value: item.phoneNumber,
            label: item.friendlyName
          }
        });
      },
      error: (err) => {
        console.error('Error in phone fetching interval:', err);
      },
    });
  }

  ngOnDestroy(): void {}

  getControl(controlName: string): FormControl {
    return this.phoneForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      return;
    }

    const response = await firstValueFrom(this.phonesService.createPhoneNumber({
      friendlyName: this.getControl('friendlyName').value,
      phoneNumber: this.getControl('phoneNumber').value
    }));

    console.log('create phone response', response);

    await this.refresh();
    this.modal.closeModal();
  }
}
