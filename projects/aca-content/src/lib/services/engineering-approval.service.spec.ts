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

import { TestBed } from '@angular/core/testing';
import { EngineeringApprovalService } from './engineering-approval.service';
import { AlfrescoApiService, NodesApiService } from '@alfresco/adf-content-services';
import { NotificationService } from '@alfresco/adf-core';
import { NodesApi } from '@alfresco/js-api';
import { Subject } from 'rxjs';

describe('EngineeringApprovalService', () => {
  let service: EngineeringApprovalService;
  let nodesApiService: NodesApiService;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EngineeringApprovalService,
        {
          provide: AlfrescoApiService,
          useValue: {
            getInstance: () => ({})
          }
        },
        {
          provide: NodesApiService,
          useValue: {
            nodeUpdated: new Subject()
          }
        },
        {
          provide: NotificationService,
          useValue: {
            showInfo: jasmine.createSpy('showInfo'),
            showError: jasmine.createSpy('showError')
          }
        }
      ]
    });

    service = TestBed.inject(EngineeringApprovalService);
    nodesApiService = TestBed.inject(NodesApiService);
    notificationService = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('approve', () => {
    it('should successfully update the node, emit nodeUpdated, and show success notification', (done) => {
      const mockNodeEntry = {
        entry: {
          id: 'test-node-id',
          name: 'test-file.txt',
          properties: {
            'cm:description': 'Approved'
          }
        }
      } as any;


      const updateNodeSpy = spyOn(NodesApi.prototype, 'updateNode').and.returnValue(Promise.resolve(mockNodeEntry) as any);
      const nodeUpdatedSpy = spyOn(nodesApiService.nodeUpdated, 'next').and.callThrough();

      service.approve('test-node-id').subscribe({
        next: (result) => {
          expect(result).toEqual(mockNodeEntry);
          expect(updateNodeSpy).toHaveBeenCalledWith('test-node-id', {
            properties: {
              'cm:description': 'Approved'
            }
          });
          expect(nodeUpdatedSpy).toHaveBeenCalledWith(mockNodeEntry.entry);
          expect(notificationService.showInfo).toHaveBeenCalledWith('APP.MESSAGES.INFO.ENGINEERING_APPROVAL_SUCCESS');
          done();
        },
        error: () => {
          fail('Should not fail');
          done();
        }
      });
    });

    it('should show error notification when update fails', (done) => {
      const mockError = new Error('error');
      const updateNodeSpy = spyOn(NodesApi.prototype, 'updateNode').and.returnValue(Promise.reject(mockError) as any);

      service.approve('test-node-id').subscribe({
        next: () => {
          fail('Should not succeed');
          done();
        },
        error: (err) => {
          expect(err).toBe(mockError);
          expect(updateNodeSpy).toHaveBeenCalled();
          expect(notificationService.showError).toHaveBeenCalledWith('APP.MESSAGES.ERRORS.ENGINEERING_APPROVAL_FAILED');
          done();
        }
      });
    });
  });
});
