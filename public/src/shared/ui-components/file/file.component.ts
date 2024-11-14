import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: 'app-shared-file',
  standalone: true,
  imports: [FormsModule, CommonModule, ButtonComponent],
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileComponent),
      multi: true,
    },
  ],
})
export class FileComponent implements ControlValueAccessor {
  @Input() id!: string;
  @Input() label!: string;
  @Input() control!: FormControl;

  files: File[] = [];  // Array to store the uploaded files

  onChange: (value: File[]) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: File[]): void {
    this.files = value || [];
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Handle file input
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => this.files.push(file));
      this.onChange(this.files);
    }
  }

  // Handle file drop
  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
      this.onChange(this.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();  // Prevent the browser's default behavior
  }

  // Remove a file from the list
  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.onChange(this.files);
  }

  getErrorMessage() {
    console.log(this.control.errors)
    if (this.control.errors?.['required']) {
      return `${this.label} is required`;
    }
    if (this.control.errors?.['email']) {
      return 'Invalid email format';
    }
    if (this.control.errors?.['backend']) {
      return this.control.errors?.['backend'];
    }
    return 'Error';
  }
}
