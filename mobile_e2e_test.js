// simulate-mobile-flow.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
// Coordinates for "Palmiye Apartmanı" (from initializing_nestjs_backend.txt: 41.0082, 28.9784)
const APT_LAT = 41.0082;
const APT_LNG = 28.9784;

async function runTest() {
    try {
        console.log('--- 1. Login as Field Staff ---');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            phone: '5551112233', // Ahmet Yılmaz (Field Staff)
            password: 'password123'
        });
        console.log('✅ Login successful. Token obtained.');
        const token = loginRes.data.access_token;

        console.log('\n--- 2. Fetch My Tasks ---');
        // Note: We need to ensure /tasks/my-tasks endpoint exists or use GET /tasks with filter
        // Based on previous steps, we might not have created specific 'my-tasks' endpoint yet.
        // Let's rely on GET /tasks which returns all tasks for now, or check if we implemented filtering.
        // If we haven't implemented 'my-tasks', we might need to use GET /tasks and filter client side for test,
        // OR realize we need to implement it.
        // Let's try GET /tasks first.
        const tasksRes = await axios.get(`${BASE_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Fetched ${tasksRes.data.length} tasks.`);

        if (tasksRes.data.length === 0) {
            console.warn('⚠️ No tasks found. Cannot proceed with Start Task test.');
            return;
        }

        const task = tasksRes.data[0];
        console.log(`-> Selected Task ID: ${task.id}, Type: ${task.type}, Status: ${task.status}`);

        console.log('\n--- 3. Attempt to Start Task (Far Away) ---');
        try {
            await axios.post(`${BASE_URL}/tasks/${task.id}/start`, {
                latitude: 40.0, // Far away
                longitude: 28.0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('❌ Failed: Should have been forbidden!');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Correctly rejected (403 Forbidden).');
            } else {
                console.error('❌ Unexpected error:', error.message);
            }
        }

        console.log('\n--- 4. Attempt to Start Task (Correct Location) ---');
        // Using apartment coordinates from the task object if available, otherwise using hardcoded
        const lat = task.apartment?.location?.coordinates[1] || APT_LAT;
        const lng = task.apartment?.location?.coordinates[0] || APT_LNG;

        try {
            const startRes = await axios.post(`${BASE_URL}/tasks/${task.id}/start`, {
                latitude: lat,
                longitude: lng
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Task started successfully.', startRes.data);
        } catch (error) {
            console.error('❌ Failed to start task:', error.response?.data?.message || error.message);
        }

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

runTest();
