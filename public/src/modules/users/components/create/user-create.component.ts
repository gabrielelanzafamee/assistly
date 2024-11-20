import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { UsersService } from '../../services/users.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { SelectComponent } from "../../../../shared/ui-components/select/select.component";
import { firstValueFrom } from 'rxjs';
import { UserRoles } from '../../../../shared/interfaces/users.interface';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, ModalComponent, InputComponent, SelectComponent],
  providers: [HttpClient],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent implements OnInit, OnDestroy {
  @Input() modal!: ModalComponent;
  @Input() refresh!: () => {};

  userForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
    role: new FormControl('', [Validators.required]),
  });
  roles: { label: string, value: string }[] = Object.keys(UserRoles).map(item => ({ label: item, value: UserRoles[item as keyof typeof UserRoles] }))

  constructor (
    private usersService: UsersService
  ) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  getControl(controlName: string): FormControl {
    return this.userForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const response = await firstValueFrom(this.usersService.createUser({
      firstName: this.getControl('firstName').value,
      lastName: this.getControl('lastName').value,
      email: this.getControl('email').value,
      password: this.getControl('password').value,
      role: this.getControl('role').value
    }));
    console.log('create user response', response);

    if (!response.ok) {
      this.userForm.markAllAsTouched();
      return ;
    }

    await this.refresh();
    this.modal.closeModal();
  }
}
