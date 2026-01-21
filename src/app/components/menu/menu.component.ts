import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/federation.types';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  template: `
    <nav class="sidebar">
      <div class="logo">Fleet At</div>

      @for (category of menuService.menuCategories(); track category) {
        <div class="category-group">
          <h3>{{ category }}</h3>
          <ul>
            @for (item of menuService.getMenuItemsByCategory(category); track item.name) {
              @if (hasPermission(item)) {
                <li [class.active]="isActive(item)">
                  <a [routerLink]="item.basePath">
                    <i [class]="'icon-' + item.icon"></i>
                    <span>{{ item.label }}</span>
                    @if (item.badge) {
                      <span class="badge">{{ item.badge }}</span>
                    }
                  </a>
                  @if (item.dividerAfter) {
                    <hr>
                  }
                </li>
              }
            }
          </ul>
        </div>
      }
    </nav>
  `,
  styles: `
    .sidebar {
      width: 250px;
      background-color: #f8f9fa;
      border-right: 1px solid #dee2e6;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      height: 100%;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 2rem;
      color: #0d6efd;
    }

    .category-group {
      margin-bottom: 1.5rem;
    }

    .category-group h3 {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #6c757d;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05rem;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      margin-bottom: 0.25rem;
    }

    a {
      display: flex;
      align-items: center;
      padding: 0.5rem 0.75rem;
      text-decoration: none;
      color: #212529;
      border-radius: 0.375rem;
      transition: background-color 0.2s;
    }

    a:hover {
      background-color: #e9ecef;
    }

    li.active a {
      background-color: #0d6efd;
      color: white;
    }

    .badge {
      margin-left: auto;
      background-color: #ffc107;
      color: #000;
      padding: 0.1rem 0.4rem;
      border-radius: 1rem;
      font-size: 0.7rem;
      font-weight: bold;
    }

    hr {
      margin: 0.5rem 0;
      border: 0;
      border-top: 1px solid #dee2e6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  protected readonly menuService = inject(MenuService);

  async ngOnInit() {
    await this.menuService.initializeMenu();
  }

  protected hasPermission(_item: MenuItem): boolean {
    // Implement your permission logic
    return true;
  }

  protected isActive(item: MenuItem): boolean {
    return window.location.pathname.startsWith(item.basePath);
  }
}
