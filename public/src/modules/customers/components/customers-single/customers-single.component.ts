import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalComponent } from "../../../../shared/ui-components/modal/modal.component";
import { HttpClient } from '@angular/common/http';
import { ICustomerItem, ICustomerSingleResponse } from '../../../../shared/interfaces/customers.interface';
import { CommonModule } from '@angular/common';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-customers-single',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  providers: [HttpClient],
  templateUrl: './customers-single.component.html',
  styleUrl: './customers-single.component.scss'
})
export class CustomersSingleComponent implements OnInit, OnDestroy {
  @Input() modal!: ModalComponent;  // Modal reference passed from parent component
  @Input() refresh!: () => {};
  @Input() customerId: string = '';

  customer: ICustomerItem = {} as ICustomerItem;
  private intervalId: any = null;

  constructor (
    private customersService: CustomersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.intervalId = setInterval(() => {
      this.loadData();
    }, 5_000);
    this.modal.onClose.subscribe(() => {
      if (!this.intervalId) return ;
      clearInterval(this.intervalId);
    });
  }

  ngOnDestroy(): void {
    if (!this.intervalId) return ;
    clearInterval(this.intervalId);
  }

  loadData(): void {
    if (this.customerId === '' || this.customerId === null) return ;
    this.customersService.singleCustomer(this.customerId).subscribe({
      next: (response: ICustomerSingleResponse) => {
        this.customer = response.results;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
