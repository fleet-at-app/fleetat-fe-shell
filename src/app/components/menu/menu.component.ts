import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/federation.types';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', opacity: '0', overflow: 'hidden', visibility: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1', overflow: 'hidden', visibility: 'visible' })),
      transition('expanded <=> collapsed', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ],
  template: `
    <nav class="sidebar" role="navigation" aria-label="Main Navigation">
      <div class="logo">Fleet At</div>

      @for (category of menuService.menuCategories(); track category) {
        <div class="category-group">
          <button class="category-toggle"
                  (click)="toggleCategory(category)"
                  [attr.aria-expanded]="isCategoryExpanded(category)"
                  [attr.aria-controls]="'category-list-' + category">
            <h3 [id]="'category-title-' + category">{{ category }}</h3>
            <i class="icon-chevron-down transition-transform"
               [class.rotate-180]="isCategoryExpanded(category)"
               aria-hidden="true"></i>
          </button>

          <div [@expandCollapse]="isCategoryExpanded(category) ? 'expanded' : 'collapsed'">
            <ul [id]="'category-list-' + category" [attr.aria-labelledby]="'category-title-' + category">
              @for (item of menuService.getMenuItemsByCategory(category); track item.name) {
                <ng-container *ngTemplateOutlet="menuItemTemplate; context: { $implicit: item }"></ng-container>
              }
            </ul>
          </div>
        </div>
      }

      <ng-template #menuItemTemplate let-item>
        @if (item.visible && hasPermission(item)) {
          <li>
            <div class="menu-item-container" [class.has-children]="item.children?.length > 0">
              <a [routerLink]="item.basePath"
                 [attr.title]="item.description"
                 routerLinkActive="active-link"
                 [routerLinkActiveOptions]="{ exact: false }"
                 class="menu-link">
                <i [class]="'icon-' + item.icon" aria-hidden="true"></i>
                <span class="label">{{ item.label }}</span>

                @if (item.badge) {
                  <span class="badge" aria-label="Notification">{{ item.badge }}</span>
                }
              </a>

              @if (item.children && item.children.length > 0) {
                <button class="toggle-btn"
                        (click)="toggleExpand(item.name)"
                        [attr.aria-expanded]="isExpanded(item.name)"
                        [attr.aria-label]="isExpanded(item.name) ? 'Collapse' : 'Expand'">
                  <i class="icon-chevron-down transition-transform"
                     [class.rotate-180]="isExpanded(item.name)"
                     aria-hidden="true"></i>
                </button>
              }
            </div>

            @if (item.children && item.children.length > 0) {
              <div [@expandCollapse]="isExpanded(item.name) ? 'expanded' : 'collapsed'">
                <ul class="nested-menu" role="group">
                  @for (child of item.children; track child.name) {
                    <ng-container *ngTemplateOutlet="menuItemTemplate; context: { $implicit: child }"></ng-container>
                  }
                </ul>
              </div>
            }

            @if (item.dividerAfter) {
              <hr aria-hidden="true">
            }
          </li>
        }
      </ng-template>
    </nav>
  `,
  styles: `
    .sidebar {
      width: 260px;
      background-color: #ffffff;
      border-right: 1px solid #e9ecef;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      height: 100%;
      overflow-y: auto;
    }

    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: #1a1a1a;
      padding-left: 0.75rem;
    }

    .category-group {
      margin-bottom: 1.5rem;
    }

    .category-toggle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: none;
      border: none;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      text-align: left;
      border-radius: 0.375rem;
      transition: background-color 0.2s;
      margin-bottom: 0.25rem;
    }

    .category-toggle:hover {
      background-color: #f8f9fa;
    }

    .category-toggle h3 {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #6c757d;
      margin: 0;
      letter-spacing: 0.025rem;
    }

    .category-toggle i {
      margin: 0;
      font-size: 0.75rem;
      color: #adb5bd;
    }

    .transition-transform {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .rotate-180 {
      transform: rotate(180deg);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      margin-bottom: 0.125rem;
    }

    .menu-item-container {
      display: flex;
      align-items: center;
      border-radius: 0.375rem;
      transition: background-color 0.2s;
    }

    .menu-item-container:hover {
      background-color: #f8f9fa;
    }

    .menu-link {
      display: flex;
      align-items: center;
      flex: 1;
      padding: 0.625rem 0.75rem;
      text-decoration: none;
      color: #495057;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .active-link {
      color: #0d6efd !important;
      font-weight: 600;
    }

    .menu-item-container:has(.active-link) {
      background-color: #f0f7ff;
    }

    i {
      margin-right: 0.75rem;
      font-size: 1rem;
      width: 1.25rem;
      text-align: center;
      color: #adb5bd;
    }

    .active-link i {
      color: #0d6efd;
    }

    .label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge {
      background-color: #dc3545;
      color: #fff;
      padding: 0.125rem 0.375rem;
      border-radius: 1rem;
      font-size: 0.7rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .toggle-btn {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: #adb5bd;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-btn:hover {
      color: #495057;
    }

    .toggle-btn i {
      margin: 0;
      font-size: 0.75rem;
    }

    .nested-menu {
      padding-left: 1.5rem;
      margin-top: 0.125rem;
    }

    hr {
      margin: 0.5rem 0.75rem;
      border: 0;
      border-top: 1px solid #e9ecef;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  protected readonly menuService = inject(MenuService);
  private readonly expandedItems = signal<Set<string>>(new Set());
  private readonly expandedCategories = signal<Set<string>>(new Set());

  async ngOnInit() {
    await this.menuService.initializeMenu();
  }

  protected hasPermission(_item: MenuItem): boolean {
    return true;
  }

  protected isExpanded(name: string): boolean {
    return this.expandedItems().has(name);
  }

  protected toggleExpand(name: string): void {
    this.expandedItems.update(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  protected isCategoryExpanded(category: string): boolean {
    return this.expandedCategories().has(category);
  }

  protected toggleCategory(category: string): void {
    this.expandedCategories.update(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }
}
