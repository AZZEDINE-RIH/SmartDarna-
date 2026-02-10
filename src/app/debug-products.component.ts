import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';

@Component({
    selector: 'app-debug-products',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>Dashboard & Data Debugger</h2>
      
      <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px;">
        <strong>Current User:</strong> {{ user?.email || 'Not logged in' }} <br>
        <strong>User ID:</strong> {{ user?.id }}
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <button (click)="fetchProducts()" style="padding: 10px;">1. List All Products</button>
        <button (click)="testDashboardQuery()" style="padding: 10px; font-weight: bold;">2. Test Seller Data</button>
        <button (click)="analyzeOrders()" style="padding: 10px; background: #e0f7fa; border: 1px solid #b2ebf2;">3. Check DB Orders</button>
        <button (click)="createTestOrder()" style="padding: 10px; background: #60CED6; color: white; border: none; font-weight: bold; cursor: pointer;">4. + Create Test Order</button>
      </div>

      <div *ngIf="fixScript" style="background: #eef; padding: 15px; border: 1px solid #ccf; margin-bottom: 20px;">
        <strong>SQL Fix Script (Run in Supabase):</strong>
        <pre style="background: white; padding: 10px; border: 1px solid #ddd; margin-top: 5px;">{{ fixScript }}</pre>
      </div>

      <div *ngIf="mockDataScript" style="background: #eaffea; padding: 15px; border: 1px solid #ccf; margin-bottom: 20px;">
        <strong>SQL Mock Data Script (Run in Supabase to see real numbers):</strong>
        <pre style="background: white; padding: 10px; border: 1px solid #ddd; margin-top: 5px;">{{ mockDataScript }}</pre>
      </div>

      <div *ngIf="loading">⏳ Working...</div>
      
      <div *ngIf="analysis.length > 0" style="background: #333; color: #fff; padding: 15px; margin-bottom: 20px; font-family: monospace;">
        <h3>Database Order Analysis</h3>
        <div *ngFor="let line of analysis">{{ line }}</div>
      </div>

      <div *ngIf="error" style="color: red; background: #fee; padding: 10px; border: 1px solid red; margin: 10px 0;">
        ⚠️ {{ error }}
      </div>

      <!-- Products List -->
      <div *ngIf="products" style="margin-bottom: 30px;">
        <h3>All Products ({{ products.length }})</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
                <th>Product Name</th>
                <th>Seller ID (Database)</th>
                <th>Processing Check</th>
            </tr>
            <tr *ngFor="let p of products">
                <td>{{ p.name }}</td>
                <td [style.background]="p.seller_id === user?.id ? '#dff0d8' : '#f2dede'">
                    {{ p.seller_id }}
                    <span *ngIf="p.seller_id === user?.id">✅ (YOURS)</span>
                    <span *ngIf="p.seller_id !== user?.id">❌ (NOT YOURS)</span>
                </td>
                <td>{{ p.id }}</td>
            </tr>
        </table>
      </div>

      <!-- Dashboard Data -->
      <div *ngIf="dashboardStats">
        <h3>Dashboard Order Items ({{ dashboardStats.length }})</h3>
        <pre>{{ dashboardStats | json }}</pre>
      </div>
    </div>
  `
})
export class DebugProductsComponent implements OnInit {
    products: any[] | null = null;
    orders: any[] | null = null;
    loading = false;
    error: string | null = null;
    user: any = null;
    dashboardStats: any = null;
    fixScript: string | null = null;
    mockDataScript: string | null = null;

    constructor(private supabase: SupabaseService) { }

    async ngOnInit() {
        const { data: { user } } = await this.supabase.getClient().auth.getUser();
        this.user = user;
    }

    async fetchProducts() {
        this.loading = true;
        this.error = null;
        this.products = null;

        console.log('🔍 DEBUG: Fetching products...');

        // 1. Fetch Products
        const { data, error } = await this.supabase.getProducts();

        if (error) {
            this.error = `Products Error: ${error.message}`;
            console.error('❌ DEBUG:', error);
        } else {
            this.products = data || [];
            console.log('✅ DEBUG: Products:', this.products);
        }

        this.loading = false;
    }

    async testDashboardQuery() {
        this.loading = true;
        this.error = null;
        this.dashboardStats = null;

        if (!this.user) {
            this.error = "No user logged in!";
            this.loading = false;
            return;
        }

        console.log(`🔍 DEBUG: Testing Dashboard Query for Seller: ${this.user.id}`);

        const client = this.supabase.getClient();

        // Query used in SellerDashboardService
        const { data, error } = await client
            .from('order_items')
            .select(`
                quantity,
                price_per_item,
                products!inner(seller_id),
                orders!inner(id, status, created_at, total_amount)
            `)
            .eq('products.seller_id', this.user.id);

        if (error) {
            this.error = `Dashboard Query Error: ${error.message} (Hint: Check RLS policies)`;
            console.error('❌ DEBUG:', error);
        } else {
            this.dashboardStats = data;
            console.log('✅ DEBUG: Dashboard Data:', data);

            if (data && data.length === 0) {
                this.error = "Query returned 0 rows. You have no sales yet.";
                this.generateMockDataScript();
            }
        }

        this.loading = false;
    }

    analysis: string[] = [];

    async analyzeOrders() {
        this.loading = true;
        this.analysis = [];

        const client = this.supabase.getClient();

        // 1. Count Total Orders & Items
        const { count: ordersCount } = await client.from('orders').select('*', { count: 'exact', head: true });
        const { count: itemsCount } = await client.from('order_items').select('*', { count: 'exact', head: true });

        this.analysis.push(`📊 DB SUMMARY: Total Orders: ${ordersCount}, Total Items: ${itemsCount}`);

        if (itemsCount === 0) {
            this.analysis.push(`⚠️ RESULT: The database is empty of orders. The "zeros" you see are real.`);
            this.loading = false;
            return;
        }

        // 2. Sample Items
        const { data: items, error } = await client
            .from('order_items')
            .select(`
                id,
                product_id,
                products ( id, name, seller_id )
            `)
            .limit(5);

        if (error) {
            this.analysis.push(`❌ ERROR reading items: ${error.message}`);
        } else if (items) {
            this.analysis.push(`🔍 SAMPLE ITEMS CHECK:`);
            items.forEach((item: any) => {
                const seller = item.products?.seller_id;
                const isMine = seller === this.user?.id;
                this.analysis.push(`- Item for product "${item.products?.name}": Seller ID is ${seller} -> ${isMine ? '✅ YOURS' : '❌ NOT YOURS'}`);
            });
        }

        this.loading = false;
    }

    async createTestOrder() {
        if (!this.user || !this.products || this.products.length === 0) {
            alert('No user or no products found. Cannot create order.');
            return;
        }

        this.loading = true;
        const productId = this.products[0].id; // Use first product
        const client = this.supabase.getClient();

        // 1. Create Order
        const { data: order, error: orderError } = await client
            .from('orders')
            .insert({
                customer_id: this.user.id, // Bought by self
                total_amount: 550.00,
                status: 'completed'
            })
            .select()
            .single();

        if (orderError) {
            alert(`Error creating order: ${orderError.message}`);
            this.loading = false;
            return;
        }

        // 2. Create Order Item
        const { error: itemError } = await client
            .from('order_items')
            .insert({
                order_id: order.id,
                product_id: productId,
                quantity: 2,
                price_per_item: 275.00
            });

        if (itemError) {
            alert(`Error creating item: ${itemError.message}`);
        } else {
            alert('✅ Test Order Created! Check Dashboard.');
            this.analyzeOrders(); // Refresh analysis
        }
        this.loading = false;
    }

    generateFixScript() {
        if (!this.user) return;
        this.fixScript = `-- UPDATE ALL PRODUCTS TO BELONG TO YOU\nUPDATE public.products SET seller_id = '${this.user.id}';`;
        this.mockDataScript = null; // Clear other script
    }

    generateMockDataScript() {
        if (!this.user || !this.products || this.products.length === 0) return;

        const productId = this.products[0].id;
        const sellerId = this.user.id;

        this.mockDataScript = `
-- INSERT DUMMY ORDER FOR TESTING
WITH new_order AS (
  INSERT INTO public.orders (customer_id, total_amount, status)
  VALUES ('${sellerId}', 999.00, 'completed') -- Using your ID as customer too for simplicity
  RETURNING id
)
INSERT INTO public.order_items (order_id, product_id, quantity, price_per_item)
SELECT id, '${productId}', 1, 999.00 FROM new_order;
`;
    }
}
