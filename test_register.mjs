import axios from 'axios';

const registrationData = {
    accountType: "user",
    firstName: "Test",
    lastName: "User",
    username: "testuser_" + Math.random().toString(36).substring(7),
    email: "testuser_" + Math.random().toString(36).substring(7) + "@example.com",
    fullName: "Test User",
    password: "password123",
    confirmPassword: "password123",
    country: "India",
    city: "Surat",
    headline: "Tester",
    skills: "React, Node.js", // This is what the frontend sends
    accept: true
};

async function test() {
    try {
        console.log("Sending registration request...");
        const response = await axios.post("http://localhost:8000/api/users/register", registrationData);
        console.log("Success:", response.data);
    } catch (error) {
        if (error.response) {
            console.log("Error Status:", error.response.status);
            console.log("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("Error:", error.message);
        }
    }
}

test();
