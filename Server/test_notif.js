const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:8000/users/notifications/some-id');
        console.log(res.data);
    } catch (err) {
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}

test();
