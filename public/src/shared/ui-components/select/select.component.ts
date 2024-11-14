import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: 'app-shared-select',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() id!: string;
  @Input() options: { value: any; label: string }[] = [];
  @Input() control!: FormControl;
  @Input() multiple: boolean = false;

  selectedValues: { value: any; label: string }[] = [];  // Array to store selected values
  value!: string;  // Single value for the select input

  onChange: (value: any | any[]) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any | any[]): void {
    if (this.multiple && Array.isArray(value)) {
      this.selectedValues = value || [];
    } else {
      this.value = value;
    }
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Handle select input change
  onInputChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedOption = this.options.find(option => option.value === select.value);

    if (this.multiple) {
      // Handle multiple selection case
      if (selectedOption && !this.selectedValues.some(option => option.value === selectedOption.value)) {
        this.selectedValues.push(selectedOption);  // Add selected option to the array
      }
      // Emit the updated array of values
      this.onChange(this.selectedValues.map(option => option.value));
    } else {
      // Handle single selection case
      if (selectedOption) {
        this.value = selectedOption.value;  // Set the selected single value
        this.onChange(this.value);  // Emit the single selected value
      }
    }

    this.onTouched();
  }

  // Remove a selected option from the array
  removeSelectedOption(option: { value: any; label: string }): void {
    if (this.multiple) {
      this.selectedValues = this.selectedValues.filter(item => item.value !== option.value);
      this.onChange(this.selectedValues.map(option => option.value));  // Emit updated array of values
    }
  }

  getErrorMessage() {
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
