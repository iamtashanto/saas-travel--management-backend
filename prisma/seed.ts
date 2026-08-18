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
    
    // Phase 05 Permissions
    { key: 'destination.read', name: 'Read Destinations', module: 'destination' },
    { key: 'destination.create', name: 'Create Destinations', module: 'destination' },
    { key: 'destination.update', name: 'Update Destinations', module: 'destination' },
    { key: 'destination.delete', name: 'Delete Destinations', module: 'destination' },
    
    { key: 'tourCategory.read', name: 'Read Categories', module: 'tourCategory' },
    { key: 'tourCategory.create', name: 'Create Categories', module: 'tourCategory' },
    { key: 'tourCategory.update', name: 'Update Categories', module: 'tourCategory' },
    { key: 'tourCategory.delete', name: 'Delete Categories', module: 'tourCategory' },
    
    { key: 'pickupPoint.read', name: 'Read Pickup Points', module: 'pickupPoint' },
    { key: 'pickupPoint.create', name: 'Create Pickup Points', module: 'pickupPoint' },
    { key: 'pickupPoint.update', name: 'Update Pickup Points', module: 'pickupPoint' },
    { key: 'pickupPoint.delete', name: 'Delete Pickup Points', module: 'pickupPoint' },
    
    // Core Tour Permissions
    { key: 'tour.read', name: 'Read Tours', module: 'tour' },
    { key: 'tour.create', name: 'Create Tours', module: 'tour' },
    { key: 'tour.update', name: 'Update Tours', module: 'tour' },
    { key: 'tour.delete', name: 'Delete Tours', module: 'tour' },
    { key: 'tour.publish', name: 'Publish Tours', module: 'tour' },
    { key: 'tour.archive', name: 'Archive Tours', module: 'tour' },
    
    // Nested Tour Permissions
    { key: 'tour.schedule.read', name: 'Read Schedules', module: 'tour' },
    { key: 'tour.schedule.create', name: 'Create Schedules', module: 'tour' },
    { key: 'tour.schedule.update', name: 'Update Schedules', module: 'tour' },
    { key: 'tour.schedule.delete', name: 'Delete Schedules', module: 'tour' },
    { key: 'tour.schedule.bulkCreate', name: 'Bulk Create Schedules', module: 'tour' },
    { key: 'tour.schedule.duplicate', name: 'Duplicate Schedules', module: 'tour' },
    
    { key: 'tour.itinerary.read', name: 'Read Itinerary', module: 'tour' },
    { key: 'tour.itinerary.create', name: 'Create Itinerary', module: 'tour' },
    { key: 'tour.itinerary.update', name: 'Update Itinerary', module: 'tour' },
    { key: 'tour.itinerary.delete', name: 'Delete Itinerary', module: 'tour' },
    { key: 'tour.itinerary.reorder', name: 'Reorder Itinerary', module: 'tour' },
    
    { key: 'tour.addon.read', name: 'Read Addons', module: 'tour' },
    { key: 'tour.addon.create', name: 'Create Addons', module: 'tour' },
    { key: 'tour.addon.update', name: 'Update Addons', module: 'tour' },
    { key: 'tour.addon.delete', name: 'Delete Addons', module: 'tour' },
    
    { key: 'tour.media.read', name: 'Read Media', module: 'tour' },
    { key: 'tour.media.create', name: 'Create Media', module: 'tour' },
    { key: 'tour.media.update', name: 'Update Media', module: 'tour' },
    { key: 'tour.media.delete', name: 'Delete Media', module: 'tour' },
    { key: 'tour.media.reorder', name: 'Reorder Media', module: 'tour' },
    
    { key: 'tour.seo.read', name: 'Read SEO', module: 'tour' },
    { key: 'tour.seo.update', name: 'Update SEO', module: 'tour' },
    
    { key: 'tour.bookingRules.read', name: 'Read Booking Rules', module: 'tour' },
    { key: 'tour.bookingRules.update', name: 'Update Booking Rules', module: 'tour' },
    
    { key: 'tour.cancellationPolicy.read', name: 'Read Cancellation Policy', module: 'tour' },
    { key: 'tour.cancellationPolicy.update', name: 'Update Cancellation Policy', module: 'tour' },
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
  }
  
  // Need an adminUser reference for Phase 05 data
  const defaultUser = await prisma.user.findFirst({
    where: { organizationId: devOrg.id },
  });
  
  // 6. Phase 05 Demo Data
  console.log('Seeding Phase 05 demo data...');

  // Destinations
  const dest1 = await prisma.destination.upsert({
    where: { organizationId_slug: { organizationId: devOrg.id, slug: 'sundarbans' } },
    update: {},
    create: {
      organizationId: devOrg.id,
      name: 'Sundarbans',
      slug: 'sundarbans',
      status: 'ACTIVE',
    }
  });

  const dest2 = await prisma.destination.upsert({
    where: { organizationId_slug: { organizationId: devOrg.id, slug: 'tanguar-haor' } },
    update: {},
    create: {
      organizationId: devOrg.id,
      name: 'Tanguar Haor',
      slug: 'tanguar-haor',
      status: 'ACTIVE',
    }
  });

  // Category
  const cat1 = await prisma.tourCategory.upsert({
    where: { organizationId_slug: { organizationId: devOrg.id, slug: 'adventure' } },
    update: {},
    create: {
      organizationId: devOrg.id,
      name: 'Adventure',
      slug: 'adventure',
      status: 'ACTIVE',
    }
  });

  // Pickup Point
  const pickup = await prisma.pickupPoint.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' }, // Dummy ID to prevent duplicate if name changes
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: devOrg.id,
      name: 'নতুল্লাবাদ',
      status: 'ACTIVE',
    }
  });

  // Tour 1: Sundarbans
  const tour1 = await prisma.tourPackage.upsert({
    where: { organizationId_slug: { organizationId: devOrg.id, slug: 'sundarbans-tour' } },
    update: {},
    create: {
      organizationId: devOrg.id,
      title: 'Sundarbans Tour',
      slug: 'sundarbans-tour',
      destinationId: dest1.id,
      categoryId: cat1.id,
      durationDays: 2,
      durationNights: 1,
      basePrice: 999,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      createdBy: defaultUser ? defaultUser.id : '00000000-0000-0000-0000-000000000000',
      updatedBy: defaultUser ? defaultUser.id : '00000000-0000-0000-0000-000000000000',
    }
  });

  // Schedule 1: Sundarbans
  await prisma.tourSchedule.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: devOrg.id,
      tourPackageId: tour1.id,
      startDate: new Date('2026-09-03T00:00:00Z'),
      endDate: new Date('2026-09-04T00:00:00Z'),
      capacity: 50,
      status: 'OPEN',
    }
  });

  // Tour 2: Tanguar Haor
  const tour2 = await prisma.tourPackage.upsert({
    where: { organizationId_slug: { organizationId: devOrg.id, slug: 'tanguar-haor-tour' } },
    update: {},
    create: {
      organizationId: devOrg.id,
      title: 'Tanguar Haor',
      slug: 'tanguar-haor-tour',
      destinationId: dest2.id,
      categoryId: cat1.id,
      durationDays: 2,
      durationNights: 1,
      basePrice: 1599,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      createdBy: defaultUser ? defaultUser.id : '00000000-0000-0000-0000-000000000000',
      updatedBy: defaultUser ? defaultUser.id : '00000000-0000-0000-0000-000000000000',
    }
  });

  // Schedule 2: Tanguar Haor
  await prisma.tourSchedule.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      organizationId: devOrg.id,
      tourPackageId: tour2.id,
      startDate: new Date('2026-08-20T00:00:00Z'),
      endDate: new Date('2026-08-21T00:00:00Z'),
      departureLocation: pickup.name,
      capacity: 40,
      status: 'OPEN',
    }
  });

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
