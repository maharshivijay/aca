import { AlfrescoApi, PeopleApi, WebscriptApi } from '@alfresco/js-api';

const oauthConfig = {
    authType: 'BASIC',
    hostEcm: 'http://10.20.20.96:8080',
    provider: 'ECM',
    contextRoot: 'alfresco'
};

const alfrescoJsApi = new AlfrescoApi(oauthConfig);

async function run() {
    try {
        await alfrescoJsApi.login('admin', 'admin');
        console.log('Logged in successfully!');
        
        // Test 1: PeopleApi.listPeople
        try {
            console.log('Calling peopleApi.listPeople...');
            const peopleApi = new PeopleApi(alfrescoJsApi);
            const listResult = await peopleApi.listPeople({ maxItems: 10 });
            console.log('listPeople result count:', listResult.list.entries.length);
        } catch (e1) {
            console.error('listPeople error:', e1.message || e1);
        }

        // Test 2: Webscript API 'api/people'
        try {
            console.log('Calling api/people webscript...');
            const webscriptApi = new WebscriptApi(alfrescoJsApi);
            const webscriptResult = await webscriptApi.executeWebScript('GET', 'api/people', { filter: 'admin' });
            console.log('webscript api/people result:', JSON.stringify(webscriptResult, null, 2));
        } catch (e2) {
            console.error('webscript api/people error:', e2.message || e2);
        }

    } catch (e) {
        console.error('Login error:', e);
    }
}

run();
