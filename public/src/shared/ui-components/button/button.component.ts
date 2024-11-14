import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shared-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() label: string = 'Button';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Input() onClick: (event: Event) => void = () => {};  // Click handler with optional event

  handleClick(event: Event): void {
    this.onClick(event);  // Call the passed-in function when clicked
  }
}
