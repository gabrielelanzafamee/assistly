import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/ui-components/input/input.component';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  providers: [HttpClient],
  templateUrl: './login.component.html',
  styleUrl: '../global.component.scss'
})
export class AuthLoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor (
    private authService: AuthService,
    private router: Router
  ) {}

  getControl(controlName: string): FormControl {
    return this.loginForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    try {
      const response = await firstValueFrom(this.authService.login({
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      }));

      // save token in localStorage
      const token = response.results.access_token;
      localStorage.setItem('token', token);
      this.router.navigate(['/']);
    } catch (error) {
      this.getControl('email').setErrors({ backend: 'Check your credentials' });
      this.getControl('password').setErrors({ backend: 'Check your credentials' });
    }
  }
}
