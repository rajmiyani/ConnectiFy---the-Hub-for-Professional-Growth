import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const p = new PrismaClient();
const JWT_SECRET = 'developer';

// Get a user that actually has notifications
const notif = await p.notification.findFirst({ where: { recipientType: 'user' } });
const userId = notif?.recipientId;
console.log('Using userId with notifications:', userId);

if (!userId) {
    console.log('No notifications found in DB!');
    await p.$disconnect();
    process.exit(0);
}

const token = jwt.sign(
    { id: userId, email: 'test@test.com', role: 'user' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

const response = await fetch(`http://localhost:8000/users/notifications/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
});

console.log('Status:', response.status, response.statusText);
const data = await response.json();
console.log('Success:', data.success);
console.log('Notification count:', data.data?.length);
console.log('Unread count:', data.unreadCount);
if (data.data?.length > 0) {
    console.log('First notification type:', data.data[0].type);
}

await p.$disconnect();
