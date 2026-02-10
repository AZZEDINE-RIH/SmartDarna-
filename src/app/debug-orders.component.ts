import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';

@Component({
    selector: 'app-debug-orders',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>Orders Table Schema Debug</h2>
      <button (click)="checkSchema()" style="padding: 10px; margin: 10px 0;">Check Schema</button>
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" style="color: red;">Error: {{ error }}</div>
      <div *ngIf="schema">
        <h3>Orders Table Structure:</h3>
        <pre>{{ schema | json }}</pre>
      </div>
    </div>
  `
})
export class DebugOrdersComponent implements OnInit {
    schema: any = null;
    loading = false;
    error: string | null = null;

    constructor(private supabase: SupabaseService) { }

    ngOnInit() {
        this.checkSchema();
    }

    async checkSchema() {
        this.loading = true;
        this.error = null;
        this.schema = null;

        console.log('🔍 DEBUG: Fetching orders table schema...');

        // Fetch one order to see the structure
        const { data, error } = await this.supabase.getOrders();

        console.log('🔍 DEBUG: Response data:', data);
        console.log('🔍 DEBUG: Response error:', error);

        if (error) {
            this.error = error.message || 'Unknown error';
            console.error('❌ DEBUG: Error fetching orders:', error);
        } else if (data && data.length > 0) {
            // Get the keys from the first order
            this.schema = {
                columns: Object.keys(data[0]),
                sampleData: data[0]
            };
            console.log('✅ DEBUG: Schema:', this.schema);
        } else {
            this.schema = {
                message: 'No orders in table yet. Will create test order.',
                columns: []
            };
            console.log('⚠️ DEBUG: No orders found');
        }

        this.loading = false;
    }
}
