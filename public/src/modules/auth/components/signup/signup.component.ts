import { Component, OnInit } from '@angular/core';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { COUNTRY_INFO } from '../../../../shared/enums/country.enum';
import { SelectComponent } from "../../../../shared/ui-components/select/select.component";

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  providers: [HttpClient],
  templateUrl: './signup.component.html',
  styleUrl: '../global.component.scss'
})
export class AuthSignupComponent {
  public signupForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    zipcode: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    userFirstName: new FormControl('', [Validators.required]),
    userLastName: new FormControl('', [Validators.required]),
    userEmail: new FormControl('', [Validators.required, Validators.email]),
    userPassword: new FormControl('', [Validators.required]),
  });
  public countries: { value: string, label: string }[] = Object.keys(COUNTRY_INFO).map((item) => {
    return {
      value: COUNTRY_INFO[item as keyof typeof COUNTRY_INFO].code,
      label: COUNTRY_INFO[item as keyof typeof COUNTRY_INFO].name
    };
  });

  constructor (
    private authService: AuthService
  ) {}

  getControl(controlName: string): FormControl {
    return this.signupForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (!this.signupForm.valid) {
      return ;
    }

    try {
      const response = await firstValueFrom(this.authService.signup({
        user: {
          firstName: this.signupForm.get('userFirstName')?.value,
          lastName: this.signupForm.get('userLastName')?.value,
          email: this.signupForm.get('userEmail')?.value,
          password: this.signupForm.get('userPassword')?.value,
        },
        organization: {
          name: this.signupForm.get('name')?.value,
          type: this.signupForm.get('type')?.value,
          address: this.signupForm.get('address')?.value,
          zipcode: this.signupForm.get('zipcode')?.value,
          country: COUNTRY_INFO[this.signupForm.get('country')?.value as keyof typeof COUNTRY_INFO].name,
          countryCode: this.signupForm.get('country')?.value,
          city: this.signupForm.get('city')?.value,
          phoneNumber: this.signupForm.get('phoneNumber')?.value,
          email: this.signupForm.get('email')?.value,
        }
      }));

      console.log("RESPONSE", response);
    } catch (error) {
      console.log('ERROR', error);
    }
  }
}
