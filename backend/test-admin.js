const axios = require('axios');

async function testAdmin() {
    try {
        console.log('Testing admin functionality...');
        
        // First, check if server is running
        const debugResponse = await axios.get('http://localhost:3000/admin/debug');
        console.log('Debug response:', debugResponse.data);
        
        // Try to login with an existing admin (assuming one exists)
        // We'll use the debug info to see what's in the database
        console.log('\nAttempting admin login...');
        
        // This is just to test - in real app we'd use proper credentials
        const loginData = {
            username: 'testadmin',
            email: 'test@admin.com', 
            password: 'testpass'
        };
        
        try {
            const loginResponse = await axios.post('http://localhost:3000/admin/login', loginData);
            console.log('Login response:', loginResponse.data);
            
            if (loginResponse.data.token) {
                console.log('\nTesting admin courses endpoint...');
                const coursesResponse = await axios.get('http://localhost:3000/admin/course', {
                    headers: {
                        'Authorization': `Bearer ${loginResponse.data.token}`
                    }
                });
                console.log('Courses response:', coursesResponse.data);
            }
        } catch (loginError) {
            console.log('Login failed (expected if admin doesn\'t exist):', loginError.response?.data || loginError.message);
            
            // Try to register first
            console.log('\nTrying to register admin...');
            try {
                const registerData = {
                    ...loginData,
                    firstName: 'Test',
                    lastName: 'Admin'
                };
                
                const registerResponse = await axios.post('http://localhost:3000/admin/register', registerData);
                console.log('Register response:', registerResponse.data);
                
                if (registerResponse.data.token) {
                    console.log('\nTesting admin courses endpoint with new token...');
                    const coursesResponse = await axios.get('http://localhost:3000/admin/course', {
                        headers: {
                            'Authorization': `Bearer ${registerResponse.data.token}`
                        }
                    });
                    console.log('Courses response:', coursesResponse.data);
                }
            } catch (registerError) {
                console.log('Register failed:', registerError.response?.data || registerError.message);
            }
        }
        
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testAdmin();
