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

import { Component, Input, OnInit, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Node, NodeEntry } from '@alfresco/js-api';
import { isLocked, NodePermissionService } from '@alfresco/aca-shared';
import { NodeCommentsService, UploadService } from '@alfresco/adf-content-services';
import { CommentModel } from '@alfresco/adf-core';
import { ExternalNodePermissionCommentsTabService } from './external-node-permission-comments-tab.service';
import { CommentDetailComponent } from './comment-detail.component';
import { from } from 'rxjs';

interface ParsedComment {
  id: string | number;
  userDisplayName: string;
  userInitials: string;
  created: Date;
  createdBy: any;
  hasAvatarPicture: boolean;
  message: string;
  attachment?: {
    id: string;
    name: string;
  };
}

@Component({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslatePipe,
    CommentDetailComponent
  ],
  selector: 'app-comments-tab',
  templateUrl: './comments-tab.component.html',
  styleUrls: ['./comments-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommentsTabComponent implements OnInit {
  private readonly permission = inject(NodePermissionService);
  private readonly externalPermissionNodeService = inject(ExternalNodePermissionCommentsTabService, { optional: true });
  private readonly commentsService = inject(NodeCommentsService);
  private readonly uploadService = inject(UploadService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input()
  node: Node;

  canUpdateNode = false;
  comments: ParsedComment[] = [];
  isLoading = false;
  beingAdded = false;
  selectedFile: File | null = null;
  commentControl = new FormControl('');

  ngOnInit(): void {
    if (!this.node) {
      this.canUpdateNode = false;
    }
    if (this.node.isFolder || (this.node.isFile && !isLocked({ entry: this.node }))) {
      this.canUpdateNode = this.permission.check(this.node, ['update']);
      if (this.externalPermissionNodeService) {
        this.canUpdateNode &&= this.externalPermissionNodeService.canAddComments(this.node);
      }
    }
    this.loadComments();
  }

  loadComments(): void {
    if (!this.node?.id) {
      return;
    }
    this.isLoading = true;
    this.commentsService.get(this.node.id).subscribe({
      next: (comments) => {
        this.comments = (comments || []).map((c) => this.parseComment(c));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  parseComment(comment: CommentModel): ParsedComment {
    const message = comment.message || '';
    const match = message.match(/\n\n\[Attachment:({.+})\]$/);
    if (match) {
      try {
        const attachment = JSON.parse(match[1]);
        const cleanMessage = message.replace(/\n\n\[Attachment:({.+})\]$/, '');
        return {
          id: comment.id,
          userDisplayName: comment.userDisplayName,
          userInitials: comment.userInitials,
          created: comment.created,
          createdBy: comment.createdBy,
          hasAvatarPicture: comment.hasAvatarPicture,
          message: cleanMessage,
          attachment
        };
      } catch (e) {
        // Fallback to plain comment if JSON parsing fails
      }
    }
    return {
      id: comment.id,
      userDisplayName: comment.userDisplayName,
      userInitials: comment.userInitials,
      created: comment.created,
      createdBy: comment.createdBy,
      hasAvatarPicture: comment.hasAvatarPicture,
      message: message
    };
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.cdr.detectChanges();
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  canAddComment(): boolean {
    return !!this.node?.id && (!!this.commentControl.value?.trim() || !!this.selectedFile) && !this.beingAdded;
  }

  addComment(): void {
    if (!this.canAddComment()) {
      return;
    }
    this.beingAdded = true;
    const commentText = this.commentControl.value || '';

    if (this.selectedFile) {
      const uploadPromise = this.uploadService.uploadApi.uploadFile(
        this.selectedFile,
        undefined,
        this.node.parentId || '-my-',
        {
          name: this.selectedFile.name,
          nodeType: 'cm:content'
        }
      );

      from(uploadPromise).subscribe({
        next: (nodeEntry: NodeEntry) => {
          const uploadedNode = nodeEntry.entry;
          const attachmentObj = {
            id: uploadedNode.id,
            name: uploadedNode.name
          };
          const finalCommentText = commentText + `\n\n[Attachment:${JSON.stringify(attachmentObj)}]`;

          this.commentsService.add(this.node.id, finalCommentText).subscribe({
            next: () => {
              this.commentControl.reset();
              this.selectedFile = null;
              this.beingAdded = false;
              this.loadComments();
            },
            error: (err) => {
              console.error('Failed to add comment', err);
              this.beingAdded = false;
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          console.error('Failed to upload attachment', err);
          this.beingAdded = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.commentsService.add(this.node.id, commentText).subscribe({
        next: () => {
          this.commentControl.reset();
          this.beingAdded = false;
          this.loadComments();
        },
        error: (err) => {
          console.error(err);
          this.beingAdded = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
