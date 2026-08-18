const path = require('path');
const fs = require('fs');

let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));
}

try {
  require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
} catch (e) {
  try {
    require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
  } catch (err) {}
}

async function seedDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.argv[2] || process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'school_management';

  console.log(`Connecting to MySQL at ${host}:${port} as user "${user}"...`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server.');

    const sqlFilePath = path.join(__dirname, 'school_management.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log(`Executing database setup and seed script (${sqlFilePath})...`);
    await connection.query(sql);

    console.log('🎉 Database "school_management" and all tables/students seeded successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database seed error:', error.message);
    console.log('\nTip: If your MySQL root user has a password, run:');
    console.log('node database/seed.js YOUR_MYSQL_PASSWORD');
  }
}

seedDatabase();
