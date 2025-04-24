const { pool } = require('./index');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../../migrations/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);

    // Read and execute seed.sql
    const seedPath = path.join(__dirname, '../../migrations/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase(); 