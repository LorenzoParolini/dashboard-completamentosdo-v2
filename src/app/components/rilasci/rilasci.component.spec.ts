import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RilasciComponent } from './rilasci.component';
import { RilasciService } from '../../services/rilasci.service';

describe('RilasciComponent', () => {
  let component: RilasciComponent;
  let fixture: ComponentFixture<RilasciComponent>;

  const rilasciServiceMock = {
    getAllRilasci: jasmine.createSpy('getAllRilasci').and.returnValue(of([])),
    deleteRilascio: jasmine
      .createSpy('deleteRilascio')
      .and.returnValue(of(void 0)),
    addRilascio: jasmine
      .createSpy('addRilascio')
      .and.returnValue(of({} as any)),
    updateRilascio: jasmine
      .createSpy('updateRilascio')
      .and.returnValue(of({} as any)),
  };

  const modalMock = {
    open: jasmine.createSpy('open'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RilasciComponent],
      providers: [
        { provide: RilasciService, useValue: rilasciServiceMock },
        { provide: NgbModal, useValue: modalMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RilasciComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
