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

import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import { provideNoopAnimations, provideAnimations } from '@angular/platform-browser/animations';
import { AuthGuard, provideAppConfig, provideCoreAuth, provideI18N } from '@alfresco/adf-core';
import { AppService, provideContentAppExtensions } from '@alfresco/aca-shared';
import { provideApplicationExtensions } from './extensions.module';
import { environment } from '../environments/environment';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeJa from '@angular/common/locales/ja';
import localeNl from '@angular/common/locales/nl';
import localePt from '@angular/common/locales/pt';
import localeNb from '@angular/common/locales/nb';
import localeRu from '@angular/common/locales/ru';
import localeCh from '@angular/common/locales/zh';
import localeAr from '@angular/common/locales/ar';
import localeCs from '@angular/common/locales/cs';
import localePl from '@angular/common/locales/pl';
import localeFi from '@angular/common/locales/fi';
import localeDa from '@angular/common/locales/da';
import localeSv from '@angular/common/locales/sv';
import { provideRouter, withHashLocation } from '@angular/router';
import { CONTENT_LAYOUT_ROUTES, ContentServiceExtensionModule } from '@alfresco/aca-content';
import { SEARCH_QUERY_TOKEN, SearchService } from '@alfresco/adf-content-services';
import { SHELL_APP_SERVICE, SHELL_AUTH_TOKEN, provideShellRoutes } from '@alfresco/adf-core/shell';
import { APP_ROUTES } from './app.routes';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { WebscriptApi } from '@alfresco/js-api';
import { from } from 'rxjs';

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeIt);
registerLocaleData(localeEs);
registerLocaleData(localeJa);
registerLocaleData(localeNl);
registerLocaleData(localePt);
registerLocaleData(localeNb);
registerLocaleData(localeRu);
registerLocaleData(localeCh);
registerLocaleData(localeAr);
registerLocaleData(localeCs);
registerLocaleData(localePl);
registerLocaleData(localeFi);
registerLocaleData(localeDa);
registerLocaleData(localeSv);

const originalSearch = SearchService.prototype.search;
SearchService.prototype.search = function (this: any, searchTerm: string, maxResults: number, skipCount: number) {
  const queryBody = this.searchConfigurationService?.generateQueryBody(searchTerm, maxResults, skipCount);
  const isPermissionSearch = queryBody?.filterQueries?.some((fq: any) => fq?.query?.indexOf('cm:authority') !== -1);

  if (isPermissionSearch) {
    const webscriptApi = new WebscriptApi(this.apiService.getInstance());

    const peoplePromise = webscriptApi.executeWebScript('GET', 'api/people', { filter: searchTerm })
      .then((res: any) => res?.people || [])
      .catch(() => []);

    const groupsPromise = webscriptApi.executeWebScript('GET', 'api/groups', { shortNameFilter: searchTerm })
      .then((res: any) => res?.data || [])
      .catch(() => []);

    const combinedPromise = Promise.all([peoplePromise, groupsPromise]).then(([people, groups]) => {
      const entries = [];

      people.forEach((p: any) => {
        entries.push({
          entry: {
            id: p.userName,
            nodeType: 'cm:person',
            properties: {
              'cm:userName': p.userName,
              'cm:firstName': p.firstName,
              'cm:lastName': p.lastName,
              'cm:email': p.email
            }
          }
        });
      });

      groups.forEach((g: any) => {
        entries.push({
          entry: {
            id: g.fullName,
            nodeType: 'cm:authorityContainer',
            properties: {
              'cm:authorityName': g.fullName,
              'cm:authorityDisplayName': g.displayName
            }
          }
        });
      });

      const nodePaging = {
        list: {
          pagination: {
            count: entries.length,
            hasMoreItems: false,
            totalItems: entries.length,
            skipCount: skipCount || 0,
            maxItems: maxResults || entries.length
          },
          entries: entries
        }
      };

      this.dataLoaded.next(nodePaging);
      return nodePaging;
    });

    return from(combinedPromise);
  }

  return originalSearch.apply(this, arguments);
};

export const AppConfig: ApplicationConfig = {
  providers: [
    provideCoreAuth({ useHash: true }),
    provideAppConfig(),
    importProvidersFrom(ContentServiceExtensionModule),
    provideI18N({
      assets: [['app', 'assets']]
    }),
    provideContentAppExtensions(),
    provideApplicationExtensions(),
    provideRouter(APP_ROUTES, withHashLocation()),
    environment.e2e ? provideNoopAnimations() : provideAnimations(),
    provideShellRoutes(CONTENT_LAYOUT_ROUTES),
    {
      provide: SHELL_APP_SERVICE,
      useClass: AppService
    },
    {
      provide: SHELL_AUTH_TOKEN,
      useValue: AuthGuard
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 10000,
        politeness: 'polite'
      }
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', floatLabel: 'always', subscriptSizing: 'dynamic' }
    },
    {
      provide: SEARCH_QUERY_TOKEN,
      useValue: {
        query: '(userName:*${searchTerm}* OR email:*${searchTerm}* OR firstName:*${searchTerm}* OR lastName:*${searchTerm}* OR authorityName:*${searchTerm}* OR authorityDisplayName:*${searchTerm}*)'
      }
    }
  ]
};
