import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type Product = {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number | string;
  mark: string;
  in_stock: boolean;
};

@Component({
  selector: 'app-dashboard',
  imports: [HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {

  products: Product[] = [];
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.http.get<{products: Product[]}>('assets/products.json').subscribe({
      next: (data) => {
        this.products = data.products.slice(0, 3); 
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  ngAfterViewInit(): void {
    
    // Get the canvas element
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    
    if (!canvas) {
      console.error('Canvas element with id "revenueChart" not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get 2d context from canvas');
      return;
    }

    // Gradient for the chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(96, 206, 214, 0.3)');
    gradient.addColorStop(1, 'rgba(96, 206, 214, 0)');

    // Initialize the chart
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{
          data: [32000, 48000, 38000, 52000, 42000, 35000, 28000, 58000, 45000, 35000, 48000],
          borderColor: '#60CED6',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#60CED6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 0
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1f2937',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context: any) {
                return (context.parsed?.y ?? 0).toLocaleString() + ' MAD';
              }
            }
          }
        },
        scales: {
          y: { 
            display: false, 
            beginAtZero: true, 
            grid: { 
              drawTicks: false,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            border: { 
              display: false,
            }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { 
              color: '#9ca3af', 
              font: { size: 12 } 
            }
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  }
}
