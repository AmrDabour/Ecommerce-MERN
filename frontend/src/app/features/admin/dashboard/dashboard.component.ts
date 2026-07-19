import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  protected readonly loading = signal(true);
  protected readonly stats = signal<AdminStats | null>(null);

  // Charts Config
  protected readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: { borderRadius: 8, backgroundColor: '#10b981' }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, border: { dash: [4, 4] } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 12, cornerRadius: 8 }
    }
  };

  protected readonly pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#a1a1aa', padding: 20, font: { size: 12 } } },
      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 12, cornerRadius: 8 }
    },
    cutout: '65%', // makes it a modern donut chart instead of a primitive pie
    elements: {
      arc: { borderWidth: 0 } // remove white borders between slices
    }
  };

  protected barChartData = signal<ChartConfiguration<'bar'>['data']>({ labels: [], datasets: [] });
  protected pieChartData = signal<ChartConfiguration<'pie'>['data']>({ labels: [], datasets: [] });

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (res) => {
        const data = res.data;
        this.stats.set(data);
        
        // Prepare Bar Chart Data (Monthly Revenue)
        const labels = data.monthlySales.map(m => m.month);
        const revenue = data.monthlySales.map(m => m.revenue);
        this.barChartData.set({
          labels,
          datasets: [{ 
            data: revenue, 
            label: 'Revenue ($)', 
            backgroundColor: '#10b981', // green theme
            hoverBackgroundColor: '#059669',
            barThickness: 32 // structured width
          }]
        });

        // Prepare Pie Chart Data (Products by Category)
        const pieLabels = data.productsByCategory.map(p => p.categoryName);
        const pieCounts = data.productsByCategory.map(p => p.count);
        this.pieChartData.set({
          labels: pieLabels,
          datasets: [{ 
            data: pieCounts, 
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'] 
          }]
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
