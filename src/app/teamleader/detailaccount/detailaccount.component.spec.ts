import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailaccountComponent } from './detailaccount.component';

describe('DetailaccountComponent', () => {
  let component: DetailaccountComponent;
  let fixture: ComponentFixture<DetailaccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailaccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailaccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
