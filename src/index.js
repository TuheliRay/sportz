import express from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { demoUsers } from './schema.js';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the Express server! Neon + Drizzle integration is setup. Visit /test-crud to run the database demo.');
});

app.get('/test-crud', async (req, res) => {
  try {
    console.log('Performing CRUD operations...');

    // CREATE: Insert a new user
    // Appending timestamp to email avoids unique constraint errors on repeated tests
    const distinctEmail = `admin_${Date.now()}@example.com`;
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: 'Admin User', email: distinctEmail })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }
    
    console.log('✅ CREATE: New user created:', newUser);

    // READ: Select the user
    const foundUser = await db.select().from(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log('✅ READ: Found user:', foundUser[0]);

    // UPDATE: Change the user's name
    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name: 'Super Admin' })
      .where(eq(demoUsers.id, newUser.id))
      .returning();
    
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    
    console.log('✅ UPDATE: User updated:', updatedUser);

    // DELETE: Remove the user
    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log('✅ DELETE: User deleted.');

    console.log('\nCRUD operations completed successfully.');
    res.json({ success: true, message: "CRUD operations completed successfully", data: { created: newUser, updated: updatedUser }});
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
