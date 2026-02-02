import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/federation.types';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
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
