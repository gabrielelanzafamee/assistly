import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shared-switch',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './switch.component.html',
  styleUrls: ['./swtich.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() id!: string;
  @Input() label!: string;
  @Input() control!: FormControl;

  @Output() onSwitchChange = new EventEmitter<boolean>();  // EventEmitter to emit switch value

  value: boolean = false;

  private controlSubscription!: Subscription;  // For listening to form control changes

  ngOnInit() {
    // Subscribe to FormControl value changes
    if (this.control) {
      this.controlSubscription = this.control.valueChanges.subscribe((newValue) => {
        this.writeValue(newValue);
      });
    }
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }

  // Functions for ControlValueAccessor
  onChange = (value: boolean) => {};
  onTouched = () => {};

  // Called when the value in the form changes
  writeValue(value: boolean): void {
    this.value = value;
  }

  // Registers the onChange function
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  // Registers the onTouched function
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Toggle switch state when user clicks
  toggleSwitch(event: Event): void {
    this.value = (event.target as HTMLInputElement).checked;
    this.onChange(this.value);
    this.onTouched();
    this.onSwitchChange.emit(this.value);
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
