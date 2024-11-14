import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
  AfterViewInit,
  OnDestroy,
  Type,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @ViewChild('modalContent', { read: ViewContainerRef }) modalContent!: ViewContainerRef;

  @Output() onOpen = new EventEmitter<void>();  // EventEmitter for modal open
  @Output() onClose = new EventEmitter<void>();  // EventEmitter for modal close

  private componentRef!: ComponentRef<any>;

  constructor() {}

  ngAfterViewInit(): void {
    this.updateModalState();
  }

  openModal(): void {
    this.isOpen = true;

    const body = document.querySelector('body');
    if (body) {
      body.style.overflow = 'hidden';
    }

    this.updateModalState();
    this.onOpen.emit();
  }

  closeModal(): void {
    this.isOpen = false;
    this.updateModalState();

    const body = document.querySelector('body');
    if (body) {
      body.style.overflow = 'hidden';
    }

    this.onClose.emit();
  }

  updateModalState(): void {
    if (this.isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  // Dynamically load a component (e.g., PhoneCreateComponent)
  loadComponent<T>(component: Type<T>): ComponentRef<T> {
    this.modalContent.clear();  // Clear any existing component
    this.componentRef = this.modalContent.createComponent(component);
    return this.componentRef;
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
