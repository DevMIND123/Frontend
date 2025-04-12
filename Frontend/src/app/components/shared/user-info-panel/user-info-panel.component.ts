import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-info-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-info-panel">
      <h3>User Information</h3>
      <div class="user-details">
        <p>Role: {{userRole}}</p>
        <!-- User details content here -->
      </div>
    </div>
  `,
  styles: []
})
export class UserInfoPanelComponent {
  @Input() userRole!: string;
}