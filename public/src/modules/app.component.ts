import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../shared/components/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'public';
  isAuthenticated$: Observable<boolean>;
  sidebarItems: { link: string, class?: string, label: string, action: string, function?: Function }[] = [
    {
      link: '/',
      label: 'Dashboard',
      action: 'link',
    },
    {
      link: '/customers',
      label: 'Customers',
      action: 'link',
    },
    {
      link: '/phones',
      label: 'Phones',
      action: 'link',
    },
    {
      link: '/assistants',
      label: 'Assistants',
      action: 'link',
    },
    {
      link: '/knowledges',
      label: 'Knowledges',
      action: 'link',
    },
    {
      link: '/conversations',
      label: 'Conversations',
      action: 'link',
    },
    {
      link: '/calls',
      label: 'Calls',
      action: 'link',
    },
    {
      link: '/users',
      label: 'Users',
      action: 'link',
    },
    {
      link: '#',
      label: 'Logout',
      action: 'function',
      class: 'mt-auto',
      function: (_event: Event) => this.logout()
    }
  ];

  constructor(private authService: AuthService) {
    // Listen to authentication status
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    console.log(this.isAuthenticated$.subscribe(console.log))
  }

  logout() {
    console.log('CLICK')
    this.authService.logout();
  }
}
