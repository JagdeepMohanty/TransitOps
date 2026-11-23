import prisma from '../src/config/prisma.js';

async function run() {
  console.log('Running safe migration and backfill...');
  try {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'approvalStatus'
    `);

    if (!Array.isArray(cols) || cols.length === 0) {
      console.log('Adding new columns and constraints to users table...');
      await prisma.$executeRawUnsafe(`ALTER TABLE users MODIFY COLUMN roleId INT NULL`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN requestedRole VARCHAR(191) NULL`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN approvalStatus ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING'`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN approvedAt DATETIME(3) NULL`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN rejectedAt DATETIME(3) NULL`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN approvedById INT NULL`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN rejectionReason TEXT NULL`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD CONSTRAINT users_approvedById_fkey FOREIGN KEY (approvedById) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE`);
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD INDEX users_approvalStatus_idx(approvalStatus)`);
      console.log('Columns and foreign keys created successfully.');
    } else {
      console.log('approvalStatus column already exists.');
    }

    // Backfill existing users to APPROVED with their current role
    const backfillCount = await prisma.$executeRawUnsafe(`
      UPDATE users u
      LEFT JOIN roles r ON u.roleId = r.id
      SET u.approvalStatus = 'APPROVED',
          u.approvedAt = NOW(),
          u.requestedRole = COALESCE(r.name, 'FLEET_MANAGER')
      WHERE u.roleId IS NOT NULL AND u.approvalStatus = 'PENDING'
    `);
    console.log('Backfill updated records:', backfillCount);

    const users = await prisma.user.findMany({
      include: { role: true },
    });
    console.log('Current users verified:');
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role?.name}, Status: ${u.approvalStatus}, Requested: ${u.requestedRole}`);
    });
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
