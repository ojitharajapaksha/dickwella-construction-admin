// Database setup script for production
const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
  })

  try {
    console.log("🔗 Connected to MySQL database")

    // Read and execute table creation script
    const createTablesSQL = fs.readFileSync(path.join(__dirname, "01-mysql-create-tables.sql"), "utf8")

    await connection.execute(createTablesSQL)
    console.log("✅ Database tables created successfully")

    // Read and execute seed data script
    const seedDataSQL = fs.readFileSync(path.join(__dirname, "02-mysql-seed-data.sql"), "utf8")

    await connection.execute(seedDataSQL)
    console.log("✅ Sample data inserted successfully")

    console.log("🎉 Database setup completed!")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    throw error
  } finally {
    await connection.end()
  }
}

// Run setup
setupDatabase().catch(console.error)
