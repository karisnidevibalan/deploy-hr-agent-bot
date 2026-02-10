try {
    console.log('Attempting to import PolicyService...');
    const service = require('./src/services/policyService');
    console.log('Import successful.');
    console.log('PolicyService keys:', Object.keys(service));
} catch (e) {
    console.error('Import failed:', e);
}
