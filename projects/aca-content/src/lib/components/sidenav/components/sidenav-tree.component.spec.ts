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

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SidenavTreeComponent } from './sidenav-tree.component';
import { AppTestingModule } from '../../../testing/app-testing.module';
import { Router } from '@angular/router';
import { SitesService } from '@alfresco/adf-content-services';
import { ContentApiService } from '@alfresco/aca-shared';
import { of } from 'rxjs';
import { SitePaging, NodeEntry, NodePaging } from '@alfresco/js-api';

describe('SidenavTreeComponent', () => {
  let component: SidenavTreeComponent;
  let fixture: ComponentFixture<SidenavTreeComponent>;
  let router: Router;
  let sitesService: SitesService;
  let contentApi: ContentApiService;

  const mockSitesList: SitePaging = {
    list: {
      entries: [
        {
          entry: {
            id: 'site-1',
            title: 'Library One',
            guid: 'guid-1',
            visibility: 'PUBLIC'
          }
        }
      ],
      pagination: {
        skipCount: 0,
        maxItems: 25,
        totalItems: 1
      }
    }
  } as any;

  const mockDocLibNode: NodeEntry = {
    entry: {
      id: 'doclib-folder-id',
      name: 'documentLibrary',
      isFolder: true
    }
  } as any;

  const mockChildrenList: NodePaging = {
    list: {
      entries: [
        {
          entry: {
            id: 'child-folder-id',
            name: 'Child Folder',
            isFolder: true
          }
        },
        {
          entry: {
            id: 'child-file-id',
            name: 'Child File',
            isFolder: false
          }
        }
      ],
      pagination: {
        skipCount: 0,
        maxItems: 25,
        totalItems: 2
      }
    }
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule, SidenavTreeComponent],
      providers: [
        {
          provide: SitesService,
          useValue: {
            getSites: () => of(mockSitesList)
          }
        },
        {
          provide: ContentApiService,
          useValue: {
            getNode: () => of(mockDocLibNode),
            getNodeChildren: () => of(mockChildrenList)
          }
        }
      ]
    });

    fixture = TestBed.createComponent(SidenavTreeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sitesService = TestBed.inject(SitesService);
    contentApi = TestBed.inject(ContentApiService);

    spyOn(router, 'navigate');
  });

  it('should initialize and load root libraries', () => {
    fixture.detectChanges();
    expect(component.treeNodes.length).toBe(1);
    expect(component.treeNodes[0].name).toBe('Library One');
    expect(component.treeNodes[0].id).toBe('guid-1');
  });

  it('should resolve documentLibrary guid and load children on expand', () => {
    fixture.detectChanges();
    const node = component.treeNodes[0];
    spyOn(contentApi, 'getNode').and.callThrough();
    spyOn(contentApi, 'getNodeChildren').and.callThrough();

    component.toggleExpand(node, new MouseEvent('click'));

    expect(node.isExpanded).toBe(true);
    expect(contentApi.getNode).toHaveBeenCalledWith('guid-1', { relativePath: '/documentLibrary' });
    expect(contentApi.getNodeChildren).toHaveBeenCalledWith('doclib-folder-id', { maxItems: 100 });
    expect(node.children.length).toBe(1); // child-folder-id (only folder)
    expect(node.children[0].name).toBe('Child Folder');
  });

  it('should navigate on selection', () => {
    fixture.detectChanges();
    const node = component.treeNodes[0];

    component.selectNode(node);

    expect(router.navigate).toHaveBeenCalledWith(['/libraries', 'doclib-folder-id']);
  });
});
