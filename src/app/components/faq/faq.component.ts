import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { FaqService } from '../../services/faq.service';
import { FaqItem } from '../../models/faq.models';


@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  imports: [
    NavbarComponent,
    CommonModule,
    FooterComponent
  ],
})


export class FaqComponent {
  constructor(private router: Router, private faqService: FaqService) {}

  irASoporte() {
    this.router.navigate(['/home/soporte']);
  }

  faqs: FaqItem[] = [];


  ngOnInit(): void {
    this.faqService.getFaqs().subscribe({
      next: (data) => this.faqs = data,
      error: (err) => console.error('Error al cargar FAQs', err)
    });
  }
}


