/*!
 * Copyright © 2005-2025 Hyland Software, Inc. and its affiliates. All rights reserved.
 *
 * Alfresco Example Content Application
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail. Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * from Hyland Software. If not, see <http://www.gnu.org/licenses/>.
 */

import { Component, OnInit, ViewEncapsulation, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, NavigationEnd } from '@angular/router';
import { SitesService } from '@alfresco/adf-content-services';
import { ContentApiService } from '@alfresco/aca-shared';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface TreeNode {
  id: string;
  name: string;
  isLibrary: boolean;
  docLibId?: string;
  children: TreeNode[];
  isLoading: boolean;
  isExpanded: boolean;
  isFolder: boolean;
}

@Component({
  selector: 'app-sidenav-tree',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './sidenav-tree.component.html',
  styleUrl: './sidenav-tree.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SidenavTreeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly sitesService = inject(SitesService);
  private readonly contentApi = inject(ContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  treeNodes: TreeNode[] = [];
  activeNodeId: string | null = null;

  ngOnInit() {
    this.loadRootLibraries();
    this.updateActiveNodeFromUrl();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateActiveNodeFromUrl();
      });
  }

  loadRootLibraries() {
    this.sitesService.getSites({ maxItems: 100 }).subscribe({
      next: (sitesList) => {
        if (sitesList?.list?.entries) {
          this.treeNodes = sitesList.list.entries.map((site) => ({
            id: site.entry.guid,
            name: site.entry.title || site.entry.id,
            isLibrary: true,
            isFolder: false,
            children: [],
            isLoading: false,
            isExpanded: false
          }));
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  updateActiveNodeFromUrl() {
    const url = this.router.url;
    const match = url.match(/\/libraries\/([a-zA-Z0-9\-]+)/);
    if (match) {
      this.activeNodeId = match[1];
    } else {
      this.activeNodeId = null;
    }
    this.cdr.detectChanges();
  }

  toggleExpand(node: TreeNode, event: Event) {
    if (event) {
      event.stopPropagation();
    }
    node.isExpanded = !node.isExpanded;
    if (node.isExpanded && node.children.length === 0) {
      this.loadChildren(node);
    } else {
      this.cdr.detectChanges();
    }
  }

  loadChildren(node: TreeNode) {
    node.isLoading = true;
    this.cdr.detectChanges();
    if (node.isLibrary) {
      if (node.docLibId) {
        this.fetchFolderChildren(node, node.docLibId);
      } else {
        this.contentApi.getNode(node.id, { relativePath: '/documentLibrary' }).subscribe({
          next: (nodeEntry) => {
            node.docLibId = nodeEntry.entry.id;
            this.fetchFolderChildren(node, node.docLibId);
          },
          error: () => {
            node.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    } else {
      this.fetchFolderChildren(node, node.id);
    }
  }

  fetchFolderChildren(node: TreeNode, folderId: string) {
    this.contentApi.getNodeChildren(folderId, { maxItems: 100 }).subscribe({
      next: (paging) => {
        if (paging?.list?.entries) {
          node.children = paging.list.entries
            .filter((entry) => entry.entry.isFolder || entry.entry.nodeType === 'cm:folder' || entry.entry.nodeType === 'app:folderlink')
            .map((entry) => ({
              id: entry.entry.id,
              name: entry.entry.name,
              isLibrary: false,
              isFolder: true,
              children: [],
              isLoading: false,
              isExpanded: false
            }));
        }
        node.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        node.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectNode(node: TreeNode) {
    if (node.isLibrary) {
      if (node.docLibId) {
        this.activeNodeId = node.docLibId;
        void this.router.navigate(['/libraries', node.docLibId]);
      } else {
        node.isLoading = true;
        this.cdr.detectChanges();
        this.contentApi.getNode(node.id, { relativePath: '/documentLibrary' }).subscribe({
          next: (nodeEntry) => {
            node.docLibId = nodeEntry.entry.id;
            node.isLoading = false;
            this.activeNodeId = node.docLibId;
            void this.router.navigate(['/libraries', node.docLibId]);
            this.cdr.detectChanges();
          },
          error: () => {
            node.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    } else {
      this.activeNodeId = node.id;
      void this.router.navigate(['/libraries', node.id]);
      this.cdr.detectChanges();
    }

    if (!node.isExpanded) {
      node.isExpanded = true;
      this.loadChildren(node);
    }
  }
}
