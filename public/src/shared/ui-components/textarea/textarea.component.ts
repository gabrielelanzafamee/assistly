import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shared-textarea',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true,
    },
  ],
})
export class TextAreaComponent implements ControlValueAccessor {
  @Input() id!: string;
  @Input() label!: string;
  @Input() control!: FormControl;

  value: string = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
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
