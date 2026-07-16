import { Component, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  searchQuery = signal('');
  isOpen = signal(false);
  isLoading = signal(false);
  results = signal<Product[]>([]);
  showDropdown = signal(false);

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.results.set([]);
          this.isLoading.set(false);
          return [];
        }
        this.isLoading.set(true);
        return this.productService.getProducts({ keyword: query, limit: 5 });
      })
    ).subscribe({
      next: (response: any) => {
        this.results.set(response.data || []);
        this.isLoading.set(false);
        this.showDropdown.set(true);
      },
      error: () => {
        this.results.set([]);
        this.isLoading.set(false);
      }
    });
  }

  toggleSearch() {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) {
      this.closeSearch();
    }
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { keyword: query } });
      this.closeSearch();
    }
  }

  closeSearch() {
    this.showDropdown.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeSearch();
      // If empty, also close the input box on mobile/desktop
      if (!this.searchQuery().trim() && this.isOpen()) {
        this.isOpen.set(false);
      }
    }
  }
}
