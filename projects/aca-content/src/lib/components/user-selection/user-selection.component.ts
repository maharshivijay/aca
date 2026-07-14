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

import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { QueriesApi, Person, LazyApi } from '@alfresco/js-api';
import { debounceTime, switchMap, filter, map, catchError } from 'rxjs/operators';
import { of, Observable, from } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.scss']
})
export class UserSelectionComponent implements OnInit {
  private readonly apiService = inject(AlfrescoApiService);

  @LazyApi((self: UserSelectionComponent) => new QueriesApi(self.apiService.getInstance()))
  private readonly queriesApi: QueriesApi;

  @Output()
  userSelected = new EventEmitter<Person>();

  searchControl = new UntypedFormControl();
  filteredUsers$: Observable<Person[]>;

  ngOnInit() {
    this.filteredUsers$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      filter((value) => typeof value === 'string' && value.length >= 2),
      switchMap((searchTerm) =>
        from(this.queriesApi.findPeople(searchTerm, { maxItems: 10 })).pipe(
          map((paging) => paging.list.entries.map((entry) => entry.entry)),
          catchError(() => of([]))
        )
      )
    );
  }

  displayUser(user: Person): string {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName} (${user.id})`.trim();
  }

  onOptionSelected(event: any) {
    const user: Person = event.option.value;
    this.userSelected.emit(user);
  }
}
