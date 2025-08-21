import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegioniModal } from './regioni-modal';

describe('RegioniModal', () => {
  let component: RegioniModal;
  let fixture: ComponentFixture<RegioniModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegioniModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegioniModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
