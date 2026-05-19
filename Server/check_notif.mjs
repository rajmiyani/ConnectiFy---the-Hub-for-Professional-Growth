import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const count = await p.notification.count();
const sample = await p.notification.findFirst();
console.log('Total notifications:', count);
console.log('Sample recipientId:', sample?.recipientId, '| type:', sample?.recipientType);
await p.$disconnect();
