import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login']);
    
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should handle successful login', async () => {
    authService.login.and.returnValue(of(true));
    
    component.email = 'test@example.com';
    component.password = 'password';
    
    await component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
    expect(component.errorMessage).toBe('');
  });

  it('should handle failed login', async () => {
    authService.login.and.returnValue(of(false));
    
    component.email = 'test@example.com';
    component.password = 'wrong-password';
    
    await component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'wrong-password');
    expect(component.errorMessage).toBe('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
  });
});