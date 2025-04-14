import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoporteHomeComponent } from './soporte.component';

describe('SoporteComponent', () => {
  let component: SoporteHomeComponent;
  let fixture: ComponentFixture<SoporteHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SoporteHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoporteHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
