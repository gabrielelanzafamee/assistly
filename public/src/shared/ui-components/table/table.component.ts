import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from "../button/button.component";
import { MatIconModule } from '@angular/material/icon';

interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'link' | 'button' | 'actions';
  linkUrl?: string;
  onClickAction?: (row: any) => void;
  onView?: (event: any, row: any) => void;
  onEdit?: (event: any, row: any) => void;
  onDelete?: (event: any, row: any) => void;
}

@Component({
  selector: 'app-shared-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatIconModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() dataSource: any[] = [];
  @Input() columns: TableColumn[] = [];

  // Helper to determine if a column type is 'text'
  isText(column: TableColumn): boolean {
    return column.type === 'text';
  }

  // Helper to determine if a column type is 'link'
  isLink(column: TableColumn): boolean {
    return column.type === 'link';
  }

  // Helper to determine if a column type is 'button'
  isButton(column: TableColumn): boolean {
    return column.type === 'button';
  }

  // Method to handle button clicks
  handleButtonClick(column: TableColumn, row: any) {
    if (column.onClickAction) {
      column.onClickAction(row);  // Trigger the function passed from the parent component
    }
  }

  isActions(column: TableColumn): boolean {
    return column.type === 'actions';
  }

  handleAction(action: 'view' | 'edit' | 'delete', event: any, handler?: (event: any,row: any) => void, row?: any): void {
    if (handler && row) {
      handler(event, row);
    }
  }
}
