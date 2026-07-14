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

import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { NodeEntry, Person } from '@alfresco/js-api';
import { UserSelectionComponent } from '../../components/user-selection/user-selection.component';

@Component({
  selector: 'app-change-owner-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    UserSelectionComponent
  ],
  templateUrl: './change-owner.dialog.html',
  styleUrls: ['./change-owner.dialog.scss']
})
export class ChangeOwnerDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ChangeOwnerDialogComponent>);

  node: NodeEntry;
  currentOwnerName = '';
  selectedUser: Person | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { node: NodeEntry }) {
    this.node = data.node;
  }

  ngOnInit() {
    const properties = this.node.entry?.properties;
    const owner = properties?.['cm:owner'];
    const creator = this.node.entry?.createdByUser;

    if (owner) {
      this.currentOwnerName = typeof owner === 'object' && owner ? owner.displayName || owner.id : owner;
    } else if (creator) {
      this.currentOwnerName = creator.displayName || creator.id;
    } else {
      this.currentOwnerName = 'Unknown';
    }
  }

  onUserSelected(user: Person) {
    this.selectedUser = user;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.selectedUser) {
      this.dialogRef.close(this.selectedUser);
    }
  }
}
