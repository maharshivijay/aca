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

import { Component, OnDestroy, OnInit, ViewEncapsulation, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';
import { AppHookService, ContentApiService, PageLayoutComponent } from '@alfresco/aca-shared';
import { SetSelectedNodesAction } from '@alfresco/aca-shared/store';
import { Node } from '@alfresco/js-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContentUrlService } from '../../services/content-url.service';
import {
  DeleteNodesAction,
  DownloadNodesAction,
  ManagePermissionsAction,
  MoveNodesAction,
  CopyNodesAction,
  ManageAspectsAction,
  AddFavoriteAction,
  RemoveFavoriteAction,
  EditOfflineAction
} from '@alfresco/aca-shared/store';

import { CommentsTabComponent } from '../info-drawer/comments-tab/comments-tab.component';
import { MetadataTabComponent } from '../info-drawer/metadata-tab/metadata-tab.component';
import { VersionsTabComponent } from '../info-drawer/versions-tab/versions-tab.component';
import { TagNodeListComponent } from '@alfresco/adf-content-services';
import { PreviewComponent } from '@alfresco/aca-content/viewer';
import { NotificationService } from '@alfresco/adf-core';
import { ContentManagementService } from '../../services/content-management.service';

@Component({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    CommentsTabComponent,
    MetadataTabComponent,
    VersionsTabComponent,
    PreviewComponent,
    TagNodeListComponent,
    PageLayoutComponent
  ],
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentApi = inject(ContentApiService);
  private readonly location = inject(Location);
  private readonly store = inject(Store);
  private readonly contentUrlService = inject(ContentUrlService);
  private readonly notificationService = inject(NotificationService);
  private readonly appHookService = inject(AppHookService);
  private readonly contentManagementService = inject(ContentManagementService);

  @ViewChild('versionUploadInput') versionUploadInput: ElementRef<HTMLInputElement>;

  nodeId: string;
  node: Node;
  isLoading = true;
  shareUrl = '';
  likeCount = 3;
  isLiked = false;
  isFavorite = false;
  isMetadataReadOnly = true;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.nodeId = params.nodeId;
      this.loadNode();
    });

    this.appHookService.nodesDeleted
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.location.back();
      });
  }

  loadNode(): void {
    this.isLoading = true;
    this.contentApi.getNode(this.nodeId).subscribe({
      next: (node) => {
        this.node = node.entry;
        this.shareUrl = `${window.location.origin}/document-details/${this.node.id}`;
        this.store.dispatch(new SetSelectedNodesAction([{ entry: this.node }]));
        this.isFavorite = (this.node as any).isFavorite || false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading node for details', err);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  navigateToParent(): void {
    if (this.node?.parentId) {
      this.router.navigate(['/personal-files', this.node.parentId]);
    } else {
      this.router.navigate(['/personal-files']);
    }
  }

  toggleLike(): void {
    this.isLiked = !this.isLiked;
    this.likeCount += this.isLiked ? 1 : -1;
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.store.dispatch(new AddFavoriteAction([{ entry: this.node }]));
    } else {
      this.store.dispatch(new RemoveFavoriteAction([{ entry: this.node }]));
    }
  }

  download(): void {
    this.store.dispatch(new DownloadNodesAction([{ entry: this.node }]));
  }

  viewInBrowser(): void {
    this.contentUrlService.getNodeContentUrl(this.node.id, false).subscribe({
      next: (url) => {
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Error generating node content URL', err);
      }
    });
  }

  editOffline(): void {
    this.store.dispatch(new EditOfflineAction({ entry: this.node }));
  }

  triggerUploadVersion(): void {
    if (this.versionUploadInput) {
      this.versionUploadInput.nativeElement.click();
    }
  }

  onUploadVersion(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.contentManagementService.versionUpdateDialog(this.node, file);
      event.target.value = '';
      // Reload node after a brief delay
      setTimeout(() => this.loadNode(), 2000);
    }
  }

  editProperties(): void {
    this.isMetadataReadOnly = !this.isMetadataReadOnly;
  }

  move(): void {
    this.store.dispatch(new MoveNodesAction([{ entry: this.node }]));
  }

  copy(): void {
    this.store.dispatch(new CopyNodesAction([{ entry: this.node }]));
  }

  delete(): void {
    this.store.dispatch(new DeleteNodesAction([{ entry: this.node }]));
  }

  changeOwner(): void {
    this.contentManagementService.changeOwner({ entry: this.node });
  }

  managePermissions(): void {
    this.store.dispatch(new ManagePermissionsAction({ entry: this.node }));
  }

  manageAspects(): void {
    this.store.dispatch(new ManageAspectsAction({ entry: this.node }));
  }

  copyShareLink(inputElement: HTMLInputElement): void {
    inputElement.select();
    document.execCommand('copy');
    this.notificationService.openSnackMessage('Share link copied to clipboard!');
  }

  ngOnDestroy(): void {
    this.store.dispatch(new SetSelectedNodesAction([]));
  }
}
