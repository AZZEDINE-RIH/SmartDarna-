import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../theme.service'; // adjust path if needed

export interface History {
  id: string;
  type: string;
  icon: string;
  period: string;
  submissionDate: string;
  status: 'Submitted' | 'Pending' | 'Rejected';
  statusReason?: string;
  actionLabel?: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class HistoryComponent implements OnInit, OnDestroy {

  isDarkMode = false;
  private themeSub!: Subscription;

  historyRecords: History[] = [
    {
      id: '#DEC-2023-001',
      type: 'VAT Declaration',
      icon: 'description',
      period: 'Q3 2023',
      submissionDate: 'Oct 15, 2023',
      status: 'Submitted'
    },
    {
      id: '#DEC-2023-002',
      type: 'Monthly Sales Report',
      icon: 'article',
      period: 'September 2023',
      submissionDate: 'Oct 05, 2023',
      status: 'Submitted'
    },
    {
      id: '#DEC-2023-003',
      type: 'Compliance Audit',
      icon: 'account_balance',
      period: 'H1 2023',
      submissionDate: '-',
      status: 'Pending',
      actionLabel: 'Complete Now'
    },
    {
      id: '#DEC-2023-004',
      type: 'Import License Update',
      icon: 'report_problem',
      period: 'Annual 2023',
      submissionDate: 'Oct 28, 2023',
      status: 'Rejected',
      statusReason: 'Missing Info',
      actionLabel: 'Re-upload'
    },
    {
      id: '#DEC-2023-005',
      type: 'Monthly Sales Report',
      icon: 'article',
      period: 'October 2023',
      submissionDate: '-',
      status: 'Pending',
      actionLabel: 'Submit Report'
    }
  ];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSub = this.themeService.isDarkMode$.subscribe(
      value => (this.isDarkMode = value)
    );
  }

  ngOnDestroy(): void {
    this.themeSub.unsubscribe();
  }
}
