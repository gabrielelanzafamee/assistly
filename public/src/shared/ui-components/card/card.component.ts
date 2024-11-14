import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shared-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() image: string = '';
  @Input() catLabel: string = '';
}
