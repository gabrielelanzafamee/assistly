import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-phone-edit',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './phone-edit.component.html',
  styleUrl: './phone-edit.component.scss'
})
export class PhoneEditComponent {
  constructor(
    public dialogRef: MatDialogRef<PhoneEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
