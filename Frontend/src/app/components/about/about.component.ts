import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2>About Us</h2>
          <p>We are a team dedicated to creating innovative solutions for our clients.</p>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {
}