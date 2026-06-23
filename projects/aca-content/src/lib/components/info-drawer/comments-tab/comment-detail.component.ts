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

import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { NodeEntry } from '@alfresco/js-api';
import { NodeCommentsService, UploadService } from '@alfresco/adf-content-services';
import { TimeAgoPipe, AuthenticationService } from '@alfresco/adf-core';
import { Store } from '@ngrx/store';
import { ViewNodeAction } from '@alfresco/aca-shared/store';
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
    MatMenuModule,
    TranslatePipe,
    TimeAgoPipe
  ],
  selector: 'app-comment-detail',
  templateUrl: './comment-detail.component.html',
  styleUrls: ['./comment-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommentDetailComponent implements OnInit {
  private readonly commentsService = inject(NodeCommentsService);
  private readonly uploadService = inject(UploadService);
  private readonly authService = inject(AuthenticationService);
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true })
  comment: ParsedComment;

  @Input({ required: true })
  nodeId: string;

  @Input()
  parentFolderId: string;

  @Output()
  commentUpdated = new EventEmitter<void>();

  @Output()
  commentDeleted = new EventEmitter<void>();

  isEditing = false;
  editControl = new FormControl('');
  selectedFile: File | null = null;
  attachmentRemoved = false;
  currentAttachment: { id: string; name: string } | null = null;
  currentUsername = '';
  saving = false;

  ngOnInit(): void {
    this.currentUsername = this.authService.getUsername();
  }

  isAuthor(): boolean {
    return this.comment.createdBy?.id === this.currentUsername;
  }

  getUserImage(userId: string): string {
    return this.commentsService.getUserImage(userId);
  }

  viewAttachment(attachmentId: string): void {
    this.store.dispatch(new ViewNodeAction(attachmentId));
  }

  startEdit(): void {
    this.isEditing = true;
    this.editControl.setValue(this.comment.message);
    this.selectedFile = null;
    this.attachmentRemoved = false;
    this.currentAttachment = this.comment.attachment || null;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editControl.setValue('');
    this.selectedFile = null;
    this.attachmentRemoved = false;
    this.currentAttachment = null;
    this.cdr.detectChanges();
  }

  removeCurrentAttachment(): void {
    this.attachmentRemoved = true;
    this.cdr.detectChanges();
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.cdr.detectChanges();
    }
  }

  canSave(): boolean {
    const hasText = !!this.editControl.value?.trim();
    const hasAttachment = (this.currentAttachment && !this.attachmentRemoved) || !!this.selectedFile;
    return (hasText || hasAttachment) && !this.saving;
  }

  saveEdit(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving = true;
    const commentText = this.editControl.value || '';

    const executeUpdate = (finalText: string) => {
      from(this.commentsService.commentsApi.updateComment(this.nodeId, this.comment.id.toString(), { content: finalText })).subscribe({
        next: () => {
          this.isEditing = false;
          this.saving = false;
          this.commentUpdated.emit();
        },
        error: (err) => {
          console.error('Failed to update comment', err);
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    };

    if (this.selectedFile) {
      const uploadPromise = this.uploadService.uploadApi.uploadFile(
        this.selectedFile,
        undefined,
        this.parentFolderId || '-my-',
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
          const finalText = commentText + `\n\n[Attachment:${JSON.stringify(attachmentObj)}]`;
          executeUpdate(finalText);
        },
        error: (err) => {
          console.error('Failed to upload new attachment', err);
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.currentAttachment && !this.attachmentRemoved) {
      const finalText = commentText + `\n\n[Attachment:${JSON.stringify(this.currentAttachment)}]`;
      executeUpdate(finalText);
    } else {
      executeUpdate(commentText);
    }
  }

  deleteComment(): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.saving = true;
      from(this.commentsService.commentsApi.deleteComment(this.nodeId, this.comment.id.toString())).subscribe({
        next: () => {
          this.saving = false;
          this.commentDeleted.emit();
        },
        error: (err) => {
          console.error('Failed to delete comment', err);
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
