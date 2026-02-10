import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';

@Component({
    selector: 'app-update-images',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>Update Product Images</h2>
      <button (click)="checkAndFix()" style="padding: 10px; margin: 10px 0;">Check & Fix Images</button>
      <div *ngIf="loading">Working...</div>
      <textarea *ngIf="log" style="width: 100%; height: 300px; font-family: monospace; white-space: pre-wrap;" readonly>{{ log }}</textarea>
    </div>
  `
})
export class UpdateImagesComponent implements OnInit {
    loading = false;
    log = '';

    constructor(private supabase: SupabaseService) { }

    ngOnInit() {
    }

    async checkAndFix() {
        this.loading = true;
        this.log = 'Analyzing products...\n';

        // 1. Fetch all products
        const { data: products, error } = await this.supabase.getProducts();

        if (error) {
            this.log += `Error fetching products: ${error.message}\n`;
            this.loading = false;
            return;
        }

        if (!products || products.length === 0) {
            this.log += 'No products found.\n';
            this.loading = false;
            return;
        }

        this.log += `Found ${products.length} products. Generating SQL script...\n\n`;
        this.log += `--- COPY THE SQL BELOW AND RUN IN SUPABASE SQL EDITOR ---\n\n`;

        let sqlScript = `BEGIN;\n\n`;
        let updateCount = 0;

        for (const product of products) {
            // Check if product has images
            if (product.images) {
                let imageVal = product.images;
                let currentPath = '';

                // Handle different formats (string vs array)
                if (Array.isArray(imageVal) && imageVal.length > 0) {
                    currentPath = imageVal[0];
                } else if (typeof imageVal === 'string') {
                    // Try to parse JSON array string
                    try {
                        const parsed = JSON.parse(imageVal);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            currentPath = parsed[0];
                        } else {
                            currentPath = imageVal;
                        }
                    } catch {
                        currentPath = imageVal;
                    }
                }

                if (currentPath && !currentPath.startsWith('assets/') && !currentPath.startsWith('http')) {
                    // Needs fixing
                    const newPath = `assets/${currentPath.trim()}`;
                    const newJsonArray = JSON.stringify([newPath]);

                    // Escape single quotes for SQL
                    const safeJson = newJsonArray.replace(/'/g, "''");

                    sqlScript += `UPDATE public.products SET images = '${safeJson}' WHERE id = '${product.id}';\n`;
                    updateCount++;
                }
            }
        }

        sqlScript += `\nCOMMIT;`;

        if (updateCount === 0) {
            this.log += "✅ No products found needing 'assets/' prefix fix. \n(If images are still broken, check if filenames match exactly with src/assets folder).\n";
        } else {
            this.log += sqlScript;
            this.log += `\n\n--- END SQL SCRIPT (${updateCount} updates generated) ---\n`;
            this.log += `\nINSTRUCTIONS:\n1. Copy the SQL code above.\n2. Go to Supabase > SQL Editor.\n3. Paste and run.\n`;
        }

        this.loading = false;
    }
}
