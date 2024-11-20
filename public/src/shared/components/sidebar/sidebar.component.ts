import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router'; // Add this import

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() items: { link: string, class?: string, label: string, action: string, function?: Function }[] = [];

  constructor(private router: Router) {} // Inject Router

  isActive(link: string): boolean {
    return this.router.url === link; // Check if the current route matches the link
  }
}
