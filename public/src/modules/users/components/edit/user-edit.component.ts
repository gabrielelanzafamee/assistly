import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from "../../../../shared/ui-components/button/button.component";
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { UsersService } from '../../services/users.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from "../../../../shared/ui-components/input/input.component";
import { SelectComponent } from "../../../../shared/ui-components/select/select.component";
import { TextAreaComponent } from "../../../../shared/ui-components/textarea/textarea.component";
import { firstValueFrom } from 'rxjs';
import { SwitchComponent } from "../../../../shared/ui-components/swtich/swtich.component";
import { IUserItem, UserRoles } from '../../../../shared/interfaces/users.interface';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, ModalComponent, InputComponent, SelectComponent, TextAreaComponent, SwitchComponent],
  providers: [HttpClient],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent implements OnInit {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() data!: IUserItem;
  @Input() refresh!: () => {};

  userForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', []),
    role: new FormControl('', [Validators.required]),
    isActive: new FormControl(false, [Validators.required]),
  });
  roles: { label: string, value: string }[] = Object.keys(UserRoles).map(item => ({ label: item, value: UserRoles[item as keyof typeof UserRoles] }))


  constructor (
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setFormValues();
  }

  setFormValues(): void {
    console.log(this.data);
    this.cdr.detectChanges();
    this.getControl('firstName').setValue(this.data.firstName);
    this.getControl('lastName').setValue(this.data.lastName);
    this.getControl('email').setValue(this.data.email);
    this.getControl('password').setValue('');
    this.getControl('role').setValue(this.data.role);
    this.getControl('isActive').setValue(this.data.isActive);
  }

  getControl(controlName: string): FormControl {
    return this.userForm.get(controlName) as FormControl;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (!this.data || typeof this.data._id !== 'string') {
      this.userForm.markAllAsTouched();
      return ;
    }

    const response = await firstValueFrom(this.usersService.updateUser(this.data._id, {
      firstName: this.getControl('firstName').value,
      lastName: this.getControl('lastName').value,
      email: this.getControl('email').value,
      password: this.getControl('password').value === '' ? null : this.getControl('password').value,
      role: this.getControl('role').value,
      isActive: this.getControl('isActive').value
    }));

    console.log('update user response', response);

    if (!response.ok) {
      this.userForm.markAllAsTouched();
      return ;
    }

    setTimeout(() => {
      this.refresh();
    }, 1500);

    this.modal.closeModal();
  }
}
