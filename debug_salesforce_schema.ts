import jsforce from 'jsforce';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function checkSchema() {
    const conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://test.salesforce.com',
        version: '61.0'
    });

    try {
        await conn.login(
            process.env.SALESFORCE_USERNAME || '',
            (process.env.SALESFORCE_PASSWORD || '') + (process.env.SALESFORCE_SECURITY_TOKEN || '')
        );

        console.log('✅ Connected.');

        const globalDescribe = await conn.describeGlobal();

        const targetObj = 'WFH__c';
        console.log(`\nFields for ${targetObj}:`);
        const metadata = await conn.sobject(targetObj).describe();
        const fields = metadata.fields.map(f => f.name);
        console.log(JSON.stringify(fields, null, 2));

    } catch (err) {
        console.error('❌ Error:', err);
    }
}

checkSchema();
