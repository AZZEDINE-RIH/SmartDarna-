import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';

@Component({
    selector: 'app-test-order-save',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>Test Order Save to Database</h2>
      <button (click)="testOrderSave()" style="padding: 10px; margin: 10px 0; background: #4CAF50; color: white; border: none; cursor: pointer;">
        Test Save Order
      </button>
      <div *ngIf="loading">Saving test order...</div>
      <div *ngIf="error" style="color: red; margin-top: 10px;">
        <strong>Error:</strong>
        <pre>{{ error | json }}</pre>
      </div>
      <div *ngIf="success" style="color: green; margin-top: 10px;">
        <strong>✅ Success!</strong>
        <pre>{{ success | json }}</pre>
      </div>
    </div>
  `
})
export class TestOrderSaveComponent {
    loading = false;
    error: any = null;
    success: any = null;

    constructor(private supabase: SupabaseService) { }

    async testOrderSave() {
        this.loading = true;
        this.error = null;
        this.success = null;

        console.log('🧪 TEST: Creating test order...');

        const testOrder = {
            customer_id: null,
            total_amount: 12344,
            status: 'pending',
            shipping_address: JSON.stringify({
                customer: {
                    name: 'Test User',
                    email: 'test@test.com',
                    phone: '+212 600 000 000',
                    address: '123 Test Street',
                    city: 'Test City'
                },
                items: [
                    {
                        productId: 'test-123',
                        name: 'Test Product',
                        price: 12344,
                        quantity: 1,
                        selectedColor: 'default',
                        image: 'test.jpg'
                    }
                ],
                payment_method: 'cod',
                tracking_number: 'TEST-123456'
            }),
            user_id: null,
            seller_id: null
        };

        console.log('🧪 TEST: Order data:', testOrder);

        try {
            const { data, error } = await this.supabase.createOrder(testOrder);

            if (error) {
                console.error('❌ TEST: Error:', error);
                this.error = error;
            } else {
                console.log('✅ TEST: Success!', data);
                this.success = data;
            }
        } catch (err) {
            console.error('❌ TEST: Exception:', err);
            this.error = err;
        }

        this.loading = false;
    }
}
