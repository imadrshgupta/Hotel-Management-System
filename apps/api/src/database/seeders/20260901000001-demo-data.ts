import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const orgId = uuidv4();
    const propId = uuidv4();
    const userId = uuidv4();
    const now = new Date();

    // Organization
    await queryInterface.bulkInsert('organizations', [{
      id: orgId,
      name: 'Grand Hotel Group',
      slug: 'grand-hotel-group',
      email: 'admin@grandhotel.com',
      phone: '+1-555-0100',
      is_active: true,
      created_at: now,
      updated_at: now,
    }]);

    // Property
    await queryInterface.bulkInsert('properties', [{
      id: propId,
      organization_id: orgId,
      name: 'Grand Hotel Downtown',
      slug: 'grand-hotel-downtown',
      email: 'downtown@grandhotel.com',
      phone: '+1-555-0101',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'US',
      timezone: 'America/New_York',
      currency: 'USD',
      is_active: true,
      check_in_time: '15:00',
      check_out_time: '11:00',
      created_at: now,
      updated_at: now,
    }]);

    // Roles
    const superAdminRoleId = uuidv4();
    const managerRoleId = uuidv4();
    const receptionistRoleId = uuidv4();
    const housekeepingRoleId = uuidv4();

    await queryInterface.bulkInsert('roles', [
      { id: superAdminRoleId, name: 'Super Admin', slug: 'super-admin', is_system: true, is_active: true, created_at: now, updated_at: now },
      { id: managerRoleId, name: 'Manager', slug: 'manager', is_system: true, is_active: true, created_at: now, updated_at: now },
      { id: receptionistRoleId, name: 'Receptionist', slug: 'receptionist', is_system: true, is_active: true, created_at: now, updated_at: now },
      { id: housekeepingRoleId, name: 'Housekeeping', slug: 'housekeeping', is_system: true, is_active: true, created_at: now, updated_at: now },
    ]);

    // Permissions
    const permissions = [
      { module: 'reservation', actions: ['create', 'view', 'update', 'cancel'] },
      { module: 'checkin', actions: ['create'] },
      { module: 'checkout', actions: ['create'] },
      { module: 'room', actions: ['view', 'update'] },
      { module: 'billing', actions: ['create', 'refund'] },
      { module: 'guest', actions: ['create', 'view', 'update'] },
      { module: 'pos', actions: ['create', 'view'] },
      { module: 'inventory', actions: ['view', 'purchase', 'issue'] },
      { module: 'report', actions: ['view', 'export'] },
      { module: 'housekeeping', actions: ['view', 'update'] },
      { module: 'maintenance', actions: ['create', 'view', 'update'] },
      { module: 'banquet', actions: ['create', 'view', 'update'] },
      { module: 'loyalty', actions: ['view', 'update'] },
      { module: 'user', actions: ['create', 'view', 'update', 'delete'] },
      { module: 'role', actions: ['create', 'view', 'update'] },
      { module: 'property', actions: ['view', 'update'] },
      { module: 'organization', actions: ['view', 'update'] },
    ];

    const permissionIds: Record<string, string> = {};
    for (const { module: mod, actions } of permissions) {
      for (const action of actions) {
        const id = uuidv4();
        permissionIds[`${mod}.${action}`] = id;
        await queryInterface.bulkInsert('permissions', [{
          id,
          name: `${mod}.${action}`,
          slug: `${mod}.${action}`,
          module: mod,
          action,
          created_at: now,
          updated_at: now,
        }]);
      }
    }

    // Assign all permissions to super admin
    for (const permId of Object.values(permissionIds)) {
      await queryInterface.bulkInsert('role_permissions', [{
        id: uuidv4(),
        role_id: superAdminRoleId,
        permission_id: permId,
        created_at: now,
        updated_at: now,
      }]);
    }

    // User (password: admin123)
    const passwordHash = await bcrypt.hash('admin123', 12);
    await queryInterface.bulkInsert('users', [{
      id: userId,
      organization_id: orgId,
      email: 'admin@grandhotel.com',
      password_hash: passwordHash,
      first_name: 'System',
      last_name: 'Admin',
      phone: '+1-555-0100',
      is_active: true,
      is_email_verified: true,
      created_at: now,
      updated_at: now,
    }]);

    // User Role
    await queryInterface.bulkInsert('user_roles', [{
      id: uuidv4(),
      user_id: userId,
      role_id: superAdminRoleId,
      property_id: propId,
      created_at: now,
      updated_at: now,
    }]);

    // Floors
    const floor1Id = uuidv4();
    const floor2Id = uuidv4();
    const floor3Id = uuidv4();
    await queryInterface.bulkInsert('floors', [
      { id: floor1Id, organization_id: orgId, property_id: propId, name: 'Ground Floor', code: 'GF', level: 0, is_active: true, created_at: now, updated_at: now },
      { id: floor2Id, organization_id: orgId, property_id: propId, name: 'First Floor', code: 'F1', level: 1, is_active: true, created_at: now, updated_at: now },
      { id: floor3Id, organization_id: orgId, property_id: propId, name: 'Second Floor', code: 'F2', level: 2, is_active: true, created_at: now, updated_at: now },
    ]);

    // Room Types
    const deluxeTypeId = uuidv4();
    const suiteTypeId = uuidv4();
    const standardTypeId = uuidv4();
    await queryInterface.bulkInsert('room_types', [
      { id: standardTypeId, organization_id: orgId, property_id: propId, name: 'Standard Room', code: 'STD', base_rate: 120, max_occupancy: 2, max_adults: 2, max_children: 1, bed_count: 1, bed_type: 'Queen', is_active: true, created_at: now, updated_at: now },
      { id: deluxeTypeId, organization_id: orgId, property_id: propId, name: 'Deluxe Room', code: 'DLX', base_rate: 200, max_occupancy: 3, max_adults: 2, max_children: 1, bed_count: 1, bed_type: 'King', is_active: true, created_at: now, updated_at: now },
      { id: suiteTypeId, organization_id: orgId, property_id: propId, name: 'Executive Suite', code: 'STE', base_rate: 350, max_occupancy: 4, max_adults: 3, max_children: 1, bed_count: 2, bed_type: 'King', is_active: true, created_at: now, updated_at: now },
    ]);

    // Rooms
    const rooms = [];
    for (let i = 1; i <= 10; i++) {
      rooms.push({
        id: uuidv4(),
        organization_id: orgId,
        property_id: propId,
        room_type_id: i <= 5 ? standardTypeId : i <= 8 ? deluxeTypeId : suiteTypeId,
        floor_id: i <= 4 ? floor1Id : i <= 8 ? floor2Id : floor3Id,
        number: `${100 + i}`,
        status: 'VACANT_CLEAN',
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }
    await queryInterface.bulkInsert('rooms', rooms);

    // Menu Categories
    const foodCatId = uuidv4();
    const bevCatId = uuidv4();
    await queryInterface.bulkInsert('menu_categories', [
      { id: foodCatId, organization_id: orgId, property_id: propId, name: 'Food', code: 'FOOD', is_active: true, sort_order: 1, created_at: now, updated_at: now },
      { id: bevCatId, organization_id: orgId, property_id: propId, name: 'Beverages', code: 'BEV', is_active: true, sort_order: 2, created_at: now, updated_at: now },
    ]);

    // Menu Items
    await queryInterface.bulkInsert('menu_items', [
      { id: uuidv4(), organization_id: orgId, property_id: propId, category_id: foodCatId, name: 'Caesar Salad', code: 'CS001', price: 12.99, is_available: true, is_veg: false, created_at: now, updated_at: now },
      { id: uuidv4(), organization_id: orgId, property_id: propId, category_id: foodCatId, name: 'Grilled Chicken', code: 'GC001', price: 24.99, is_available: true, is_veg: false, created_at: now, updated_at: now },
      { id: uuidv4(), organization_id: orgId, property_id: propId, category_id: bevCatId, name: 'Fresh Orange Juice', code: 'OJ001', price: 5.99, is_available: true, is_veg: true, created_at: now, updated_at: now },
      { id: uuidv4(), organization_id: orgId, property_id: propId, category_id: bevCatId, name: 'Coffee', code: 'CF001', price: 3.99, is_available: true, is_veg: true, created_at: now, updated_at: now },
    ]);

    // Taxes
    await queryInterface.bulkInsert('taxes', [
      { id: uuidv4(), organization_id: orgId, property_id: propId, name: 'Service Tax', code: 'ST', rate: 5, type: 'PERCENTAGE', is_inclusive: false, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), organization_id: orgId, property_id: propId, name: 'GST', code: 'GST', rate: 12, type: 'PERCENTAGE', is_inclusive: false, is_active: true, created_at: now, updated_at: now },
    ]);

    // Units
    await queryInterface.bulkInsert('units', [
      { id: uuidv4(), name: 'Kilogram', symbol: 'kg', conversion_factor: 1, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Liter', symbol: 'L', conversion_factor: 1, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Piece', symbol: 'pc', conversion_factor: 1, created_at: now, updated_at: now },
    ]);

    // Guest
    const guestId = uuidv4();
    await queryInterface.bulkInsert('guests', [{
      id: guestId,
      organization_id: orgId,
      property_id: propId,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0200',
      nationality: 'US',
      created_at: now,
      updated_at: now,
    }]);
  },

  async down(queryInterface: QueryInterface) {
    const tables = [
      'refresh_tokens', 'audit_logs', 'notifications', 'discounts', 'taxes',
      'loyalty_transactions', 'members', 'membership_plans', 'event_items',
      'event_packages', 'banquet_events', 'banquet_halls',
      'goods_receipt_items', 'goods_receipts', 'purchase_order_items', 'purchase_orders',
      'vendors', 'stock_transactions', 'inventory_items', 'inventory_categories', 'units',
      'kot', 'order_items', 'orders', 'menu_modifiers', 'menu_items', 'menu_categories',
      'tables', 'restaurants', 'outlets',
      'maintenance_tickets', 'housekeeping_tasks',
      'invoices', 'refunds', 'payments', 'folio_items', 'folios',
      'stay_guests', 'stays',
      'reservation_guests', 'reservation_rooms', 'reservations',
      'guest_preferences', 'guest_documents', 'guests',
      'role_permissions', 'user_roles', 'permissions', 'roles', 'users',
      'room_status_history', 'room_amenities', 'rooms',
      'room_types', 'floors', 'properties', 'organizations',
    ];
    for (const table of tables) {
      await queryInterface.bulkDelete(table, {});
    }
  },
};
