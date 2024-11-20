import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { UsersService } from './services/users.service';
import { firstValueFrom } from 'rxjs';
import { TableComponent } from "../../shared/ui-components/table/table.component";
import { ButtonComponent } from "../../shared/ui-components/button/button.component";
import { ModalComponent } from '../../shared/ui-components/modal/modal.component';
import { UserCreateComponent } from './components/create/user-create.component';
import { UserEditComponent } from './components/edit/user-edit.component';
import { IUserItem } from '../../shared/interfaces/users.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [TableComponent, ButtonComponent, ModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild('createUserModal', { static: true }) createUserModal!: ModalComponent;
  @ViewChild('editUserModal', { static: true }) editUserModal!: ModalComponent;

  public users: IUserItem[] = [];
  public columns: any = [];
  public data: any[] = [];

  constructor(
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  public async loadData() {
    const users = (await firstValueFrom(this.usersService.fetchUsers())).results;

    this.columns = [
      {
        key: 'actions',
        label: 'Actions',
        type: 'actions',
        onView: null,
        onEdit: (event: any, row: any) => this.openEditModal(event, row),
        onDelete: (event: any, row: any) => this.handleDelete(event, row._id)
      },
      { key: '_id', label: 'ID', type: 'text' },
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'isActive', label: 'Is Active?', type: 'text' },
      { key: 'createdAt', label: 'Created At', type: 'text' },
      { key: 'updatedAt', label: 'Updated At', type: 'text' },
    ];

    this.data = users;
  }

  async handleDelete(event: Event, id: string) {
    event.preventDefault();
    const response = await firstValueFrom(this.usersService.deleteUser(id));
    console.log('Delete user response', id, response)
    if (!response.ok) return alert(response.message);
    this.loadData();
  }

  openCreateModal(event: Event) {
    const componentRef: ComponentRef<UserCreateComponent> = this.createUserModal.loadComponent(UserCreateComponent);
    componentRef.instance.modal = this.createUserModal;
    componentRef.instance.refresh = this.loadData;
    this.createUserModal.openModal();
  }

  openEditModal(event: Event, user: IUserItem) {
    const componentRef: ComponentRef<UserEditComponent> = this.editUserModal.loadComponent(UserEditComponent);
    componentRef.instance.modal = this.editUserModal;
    componentRef.instance.refresh = this.loadData;
    componentRef.instance.data = user;
    this.editUserModal.openModal();
  }
}
