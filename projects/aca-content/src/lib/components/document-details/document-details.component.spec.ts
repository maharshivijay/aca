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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '../../testing/app-testing.module';
import { DocumentDetailsComponent } from './document-details.component';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ContentApiService } from '@alfresco/aca-shared';
import { NodeEntry } from '@alfresco/js-api';

describe('DocumentDetailsComponent', () => {
  let component: DocumentDetailsComponent;
  let fixture: ComponentFixture<DocumentDetailsComponent>;
  let contentApiService: ContentApiService;
  let node: NodeEntry;

  const mockStream = new Subject();
  const storeMock = {
    dispatch: jasmine.createSpy('dispatch').and.stub(),
    select: () => mockStream
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule, DocumentDetailsComponent],
      providers: [
        { provide: Store, useValue: storeMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ nodeId: 'someDocId' })
          }
        }
      ]
    });

    fixture = TestBed.createComponent(DocumentDetailsComponent);
    component = fixture.componentInstance;
    contentApiService = TestBed.inject(ContentApiService);
    storeMock.dispatch.calls.reset();

    node = {
      entry: {
        id: 'someDocId',
        name: 'test-document.pdf',
        isFile: true,
        isFolder: false,
        modifiedAt: new Date(),
        createdAt: new Date(),
        nodeType: 'cm:content',
        createdByUser: { id: 'admin', displayName: 'Administrator' },
        modifiedByUser: { id: 'admin', displayName: 'Administrator' },
        aspectNames: []
      }
    };
    spyOn(contentApiService, 'getNode').and.returnValue(of(node));
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should initialize and load node details', () => {
    fixture.detectChanges();
    expect(component.nodeId).toBe('someDocId');
    expect(contentApiService.getNode).toHaveBeenCalledWith('someDocId');
    expect(component.node.name).toBe('test-document.pdf');
  });

  it('should toggle like status and update likeCount', () => {
    fixture.detectChanges();
    expect(component.isLiked).toBe(false);
    expect(component.likeCount).toBe(3);

    component.toggleLike();
    expect(component.isLiked).toBe(true);
    expect(component.likeCount).toBe(4);

    component.toggleLike();
    expect(component.isLiked).toBe(false);
    expect(component.likeCount).toBe(3);
  });
});
