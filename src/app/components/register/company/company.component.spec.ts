import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyComponent } from './company.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CompanyComponent', () => {
  let component: CompanyComponent;
  let fixture: ComponentFixture<CompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CompanyComponent,              // IMPORT, no declarations (por ser standalone)
        FormsModule,                   // Para [(ngModel)]
        RouterTestingModule,           // Para Router
        HttpClientTestingModule        // Para mock de HttpClient (AuthService)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
