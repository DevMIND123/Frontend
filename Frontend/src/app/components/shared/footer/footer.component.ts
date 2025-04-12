import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer mt-auto py-3 bg-light">
      <div class="container">
        <span class="text-muted">© 2024 Your App. All rights reserved.</span>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}