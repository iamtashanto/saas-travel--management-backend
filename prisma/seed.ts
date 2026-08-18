import { PrismaClient, OrganizationStatus, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Seed Permissions
  const foundationalPermissions = [
    { key: 'organization.read', name: 'Read Organization', module: 'organization' },
    { key: 'organization.update', name: 'Update Organization', module: 'organization' },
    { key: 'user.read', name: 'Read Users', module: 'user' },
    { key: 'user.create', name: 'Create Users', module: 'user' },
    { key: 'user.update', name: 'Update Users', module: 'user' },
    { key: 'user.delete', name: 'Delete Users', module: 'user' },
    { key: 'role.read', name: 'Read Roles', module: 'role' },
    { key: 'role.create', name: 'Create Roles', module: 'role' },
    { key: 'role.update', name: 'Update Roles', module: 'role' },
    { key: 'role.delete', name: 'Delete Roles', module: 'role' },
    { key: 'booking.read', name: 'Read Bookings', module: 'booking' },
    { key: 'booking.create', name: 'Create Bookings', module: 'booking' },
    { key: 'booking.update', name: 'Update Bookings', module: 'booking' },
    { key: 'booking.cancel', name: 'Cancel Bookings', module: 'booking' },
    { key: 'tour.read', name: 'Read Tours', module: 'tour' },
    { key: 'tour.create', name: 'Create Tours', module: 'tour' },
    { key: 'tour.update', name: 'Update Tours', module: 'tour' },
    { key: 'tour.delete', name: 'Delete Tours', module: 'tour' },
    { key: 'payment.read', name: 'Read Payments', module: 'payment' },
    { key: 'payment.create', name: 'Create Payments', module: 'payment' },
    { key: 'payment.update', name: 'Update Payments', module: 'payment' },
    { key: 'payment.refund', name: 'Refund Payments', module: 'payment' },
    { key: 'expense.read', name: 'Read Expenses', module: 'expense' },
    { key: 'expense.create', name: 'Create Expenses', module: 'expense' },
    { key: 'expense.update', name: 'Update Expenses', module: 'expense' },
    { key: 'report.read', name: 'Read Reports', module: 'report' },
  ];

  console.log('Seeding permissions...');
  for (const perm of foundationalPermissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
  }

  // 2. Create Development Organization
  console.log('Seeding dev organization...');
  const devOrg = await prisma.organization.upsert({
    where: { slug: 'tour-group-barishal' },
    update: {},
    create: {
      name: 'Tour Group Barishal',
      slug: 'tour-group-barishal',
      defaultCurrency: 'BDT',
      timezone: 'Asia/Dhaka',
      countryCode: 'BD',
      status: OrganizationStatus.ACTIVE,
      settings: {
        create: {
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          weekStartsOn: 1,
        },
      },
    },
  });

  // 3. Create Sequences
  console.log('Seeding sequences...');
  const sequences = [
    { key: 'BOOKING', prefix: 'TGB-BKG-' },
    { key: 'INVOICE', prefix: 'TGB-INV-' },
    { key: 'QUOTATION', prefix: 'TGB-QUO-' },
    { key: 'CUSTOMER', prefix: 'TGB-CUS-' },
  ];

  for (const seq of sequences) {
    await prisma.sequence.upsert({
      where: {
        organizationId_key: {
          organizationId: devOrg.id,
          key: seq.key,
        },
      },
      update: {},
      create: {
        organizationId: devOrg.id,
        key: seq.key,
        prefix: seq.prefix,
        currentValue: 0,
        padding: 5,
      },
    });
  }

  // 4. Create System OWNER Role
  console.log('Seeding OWNER role...');
  const ownerRole = await prisma.role.upsert({
    where: {
      organizationId_slug: {
        organizationId: devOrg.id,
        slug: 'owner',
      },
    },
    update: {},
    create: {
      organizationId: devOrg.id,
      name: 'Owner',
      slug: 'owner',
      description: 'System owner with full access',
      isSystem: true,
    },
  });

  // Attach all permissions to the OWNER role
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 5. Seed Admin User (if env vars are provided)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log(`Seeding admin user: ${adminEmail}`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: devOrg.id,
          email: adminEmail,
        },
      },
      update: {
        passwordHash, // Reset password if run again
      },
      create: {
        organizationId: devOrg.id,
        name: 'Development Owner',
        email: adminEmail,
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });

    // Assign OWNER role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: ownerRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: ownerRole.id,
      },
    });
  } else {
    console.log('SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set. Skipping user seed.');
  }

  console.log('Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
