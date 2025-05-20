import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeWizardDialogComponent } from './challenge-wizard-dialog.component';

describe('ChallengeWizardDialogComponent', () => {
  let component: ChallengeWizardDialogComponent;
  let fixture: ComponentFixture<ChallengeWizardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeWizardDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
