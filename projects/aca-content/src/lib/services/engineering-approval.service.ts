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

import { inject, Injectable } from '@angular/core';
import { AlfrescoApiService, NodesApiService } from '@alfresco/adf-content-services';
import { NodeBodyUpdate, NodeEntry, NodesApi, LazyApi } from '@alfresco/js-api';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationService } from '@alfresco/adf-core';

@Injectable({
  providedIn: 'root'
})
export class EngineeringApprovalService {
  private readonly apiService = inject(AlfrescoApiService);
  private readonly nodesApiService = inject(NodesApiService);
  private readonly notificationService = inject(NotificationService);

  @LazyApi((self: EngineeringApprovalService) => new NodesApi(self.apiService.getInstance()))
  private readonly nodesApi: NodesApi;

  approve(nodeId: string): Observable<NodeEntry> {
    const updateBody: NodeBodyUpdate = {
      properties: {
        'cm:description': 'Approved'
      }
    };
    return from(this.nodesApi.updateNode(nodeId, updateBody)).pipe(
      tap({
        next: (nodeEntry: NodeEntry) => {
          this.nodesApiService.nodeUpdated.next(nodeEntry.entry);
          this.notificationService.showInfo('APP.MESSAGES.INFO.ENGINEERING_APPROVAL_SUCCESS');
        },
        error: () => {
          this.notificationService.showError('APP.MESSAGES.ERRORS.ENGINEERING_APPROVAL_FAILED');
        }
      })
    );
  }
}
