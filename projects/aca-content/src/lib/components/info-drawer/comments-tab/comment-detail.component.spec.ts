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

import { CommentDetailComponent } from './comment-detail.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService, NoopTranslateModule } from '@alfresco/adf-core';
import { NodeCommentsService, UploadService } from '@alfresco/adf-content-services';
import { provideMockStore } from '@ngrx/store/testing';

describe('CommentDetailComponent', () => {
  let component: CommentDetailComponent;
  let fixture: ComponentFixture<CommentDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopTranslateModule, CommentDetailComponent],
      providers: [
        { provide: AuthenticationService, useValue: { getUsername: () => 'test-user' } },
        {
          provide: NodeCommentsService,
          useValue: {
            getUserImage: () => '',
            commentsApi: {
              deleteComment: () => Promise.resolve(),
              updateComment: () => Promise.resolve({ entry: {} })
            }
          }
        },
        {
          provide: UploadService,
          useValue: {
            uploadApi: {
              uploadFile: () => Promise.resolve({ entry: { id: 'attached-node-id', name: 'attached-file.txt' } })
            }
          }
        },
        provideMockStore({})
      ]
    });

    fixture = TestBed.createComponent(CommentDetailComponent);
    component = fixture.componentInstance;
    component.comment = {
      id: '1',
      userDisplayName: 'Test User',
      userInitials: 'TU',
      created: new Date(),
      createdBy: { id: 'test-user' },
      hasAvatarPicture: false,
      message: 'Test message'
    };
    component.nodeId = 'node-id';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should identify creator as author', () => {
    expect(component.isAuthor()).toBe(true);
  });

  it('should identify non-creator as not author', () => {
    component.comment.createdBy.id = 'other-user';
    expect(component.isAuthor()).toBe(false);
  });
});
