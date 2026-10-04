import { QueryInterface, DataTypes } from 'sequelize';

const UUIDPK = {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
  allowNull: false,
};

const Timestamps = {
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
};

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Organizations
    await queryInterface.createTable('organizations', {
      id: UUIDPK,
      name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      email: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(50) },
      address: { type: DataTypes.TEXT },
      logo_url: { type: DataTypes.STRING(500) },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      settings: { type: DataTypes.JSONB },
      ...Timestamps,
    });

    // Properties
    await queryInterface.createTable('properties', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(50) },
      address: { type: DataTypes.TEXT },
      city: { type: DataTypes.STRING(100) },
      state: { type: DataTypes.STRING(100) },
      country: { type: DataTypes.STRING(100) },
      postal_code: { type: DataTypes.STRING(20) },
      timezone: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'UTC' },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      tax_id: { type: DataTypes.STRING(100) },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      settings: { type: DataTypes.JSONB },
      check_in_time: { type: DataTypes.STRING(5), allowNull: false, defaultValue: '14:00' },
      check_out_time: { type: DataTypes.STRING(5), allowNull: false, defaultValue: '11:00' },
      ...Timestamps,
    });

    // Floors
    await queryInterface.createTable('floors', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      level: { type: DataTypes.INTEGER, allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      description: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Room Types
    await queryInterface.createTable('room_types', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      description: { type: DataTypes.TEXT },
      base_rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      max_occupancy: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
      max_adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
      max_children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      bed_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      bed_type: { type: DataTypes.STRING(50) },
      room_area: { type: DataTypes.DECIMAL(8, 2) },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      amenities: { type: DataTypes.ARRAY(DataTypes.TEXT) },
      image_url: { type: DataTypes.STRING(500) },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...Timestamps,
    });

    // Rooms
    await queryInterface.createTable('rooms', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      room_type_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'room_types', key: 'id' } },
      floor_id: { type: DataTypes.UUID, references: { model: 'floors', key: 'id' } },
      number: { type: DataTypes.STRING(20), allowNull: false },
      name: { type: DataTypes.STRING(100) },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'VACANT_CLEAN' },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_smoking: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_accessible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      has_balcony: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      connecting_room_id: { type: DataTypes.UUID, references: { model: 'rooms', key: 'id' } },
      notes: { type: DataTypes.TEXT },
      rate_override: { type: DataTypes.DECIMAL(10, 2) },
      last_maintained_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    await queryInterface.addIndex('rooms', ['property_id']);
    await queryInterface.addIndex('rooms', ['property_id', 'number'], { unique: true, where: { deleted_at: null } });
    await queryInterface.addIndex('rooms', ['room_type_id']);
    await queryInterface.addIndex('rooms', ['floor_id']);
    await queryInterface.addIndex('rooms', ['status']);

    // Room Amenities
    await queryInterface.createTable('room_amenities', {
      id: UUIDPK,
      room_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'rooms', key: 'id' } },
      amenity_name: { type: DataTypes.STRING(100), allowNull: false },
      amenity_value: { type: DataTypes.STRING(255) },
      ...Timestamps,
    });

    // Room Status History
    await queryInterface.createTable('room_status_history', {
      id: UUIDPK,
      room_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'rooms', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      from_status: { type: DataTypes.STRING(30), allowNull: false },
      to_status: { type: DataTypes.STRING(30), allowNull: false },
      changed_by: { type: DataTypes.UUID },
      reason: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Users
    await queryInterface.createTable('users', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, references: { model: 'organizations', key: 'id' } },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      first_name: { type: DataTypes.STRING(100), allowNull: false },
      last_name: { type: DataTypes.STRING(100), allowNull: false },
      phone: { type: DataTypes.STRING(50) },
      avatar_url: { type: DataTypes.STRING(500) },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      last_login_at: { type: DataTypes.DATE },
      password_changed_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Roles
    await queryInterface.createTable('roles', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, references: { model: 'organizations', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      slug: { type: DataTypes.STRING(100), allowNull: false },
      description: { type: DataTypes.TEXT },
      is_system: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      ...Timestamps,
    });

    await queryInterface.addIndex('roles', ['organization_id', 'slug'], { unique: true, where: { deleted_at: null } });

    // Permissions
    await queryInterface.createTable('permissions', {
      id: UUIDPK,
      name: { type: DataTypes.STRING(100), allowNull: false },
      slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      module: { type: DataTypes.STRING(50), allowNull: false },
      action: { type: DataTypes.STRING(50), allowNull: false },
      description: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // User Roles
    await queryInterface.createTable('user_roles', {
      id: UUIDPK,
      user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      role_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'roles', key: 'id' } },
      property_id: { type: DataTypes.UUID, references: { model: 'properties', key: 'id' } },
      ...Timestamps,
    });

    // Role Permissions
    await queryInterface.createTable('role_permissions', {
      id: UUIDPK,
      role_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'roles', key: 'id' } },
      permission_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'permissions', key: 'id' } },
      ...Timestamps,
    });

    // Guests
    await queryInterface.createTable('guests', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      first_name: { type: DataTypes.STRING(100), allowNull: false },
      last_name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(255) },
      phone: { type: DataTypes.STRING(50) },
      date_of_birth: { type: DataTypes.DATEONLY },
      gender: { type: DataTypes.STRING(20) },
      nationality: { type: DataTypes.STRING(100) },
      id_type: { type: DataTypes.STRING(50) },
      id_number: { type: DataTypes.STRING(100) },
      id_expiry: { type: DataTypes.DATEONLY },
      address: { type: DataTypes.TEXT },
      city: { type: DataTypes.STRING(100) },
      state: { type: DataTypes.STRING(100) },
      country: { type: DataTypes.STRING(100) },
      postal_code: { type: DataTypes.STRING(20) },
      company_name: { type: DataTypes.STRING(255) },
      tax_id: { type: DataTypes.STRING(100) },
      vip_status: { type: DataTypes.STRING(20) },
      notes: { type: DataTypes.TEXT },
      total_stays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      total_revenue: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      last_stay_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Guest Documents
    await queryInterface.createTable('guest_documents', {
      id: UUIDPK,
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      document_type: { type: DataTypes.STRING(50), allowNull: false },
      document_number: { type: DataTypes.STRING(100), allowNull: false },
      document_url: { type: DataTypes.STRING(500) },
      expiry_date: { type: DataTypes.DATEONLY },
      is_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ...Timestamps,
    });

    // Guest Preferences
    await queryInterface.createTable('guest_preferences', {
      id: UUIDPK,
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      preference_key: { type: DataTypes.STRING(100), allowNull: false },
      preference_value: { type: DataTypes.TEXT, allowNull: false },
      ...Timestamps,
    });

    // Reservations
    await queryInterface.createTable('reservations', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      created_by: { type: DataTypes.UUID },
      updated_by: { type: DataTypes.UUID },
      confirmation_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'INQUIRY' },
      check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
      check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
      adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      rooms_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      source: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'DIRECT' },
      room_type_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'room_types', key: 'id' } },
      rate_plan_id: { type: DataTypes.UUID },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      advance_paid: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      net_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      special_requests: { type: DataTypes.TEXT },
      notes: { type: DataTypes.TEXT },
      cancelled_at: { type: DataTypes.DATE },
      cancelled_by: { type: DataTypes.UUID },
      cancellation_reason: { type: DataTypes.TEXT },
      no_show_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Reservation Rooms
    await queryInterface.createTable('reservation_rooms', {
      id: UUIDPK,
      reservation_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'reservations', key: 'id' } },
      room_id: { type: DataTypes.UUID, references: { model: 'rooms', key: 'id' } },
      room_type_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'room_types', key: 'id' } },
      rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      rate_per_night: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      nights: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
      check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
      adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PENDING' },
      assigned_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Reservation Guests
    await queryInterface.createTable('reservation_guests', {
      id: UUIDPK,
      reservation_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'reservations', key: 'id' } },
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      room_number: { type: DataTypes.STRING(20) },
      ...Timestamps,
    });

    // Stays
    await queryInterface.createTable('stays', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      created_by: { type: DataTypes.UUID },
      updated_by: { type: DataTypes.UUID },
      reservation_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'reservations', key: 'id' } },
      room_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'rooms', key: 'id' } },
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
      check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
      actual_check_in: { type: DataTypes.DATE },
      actual_check_out: { type: DataTypes.DATE },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
      adults: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      children: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Stay Guests
    await queryInterface.createTable('stay_guests', {
      id: UUIDPK,
      stay_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'stays', key: 'id' } },
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ...Timestamps,
    });

    // Folios
    await queryInterface.createTable('folios', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      stay_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'stays', key: 'id' } },
      folio_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'OPEN' },
      total_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_payments: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_taxes: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_discounts: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_refunds: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      ...Timestamps,
    });

    // Folio Items
    await queryInterface.createTable('folio_items', {
      id: UUIDPK,
      folio_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'folios', key: 'id' } },
      description: { type: DataTypes.STRING(500), allowNull: false },
      category: { type: DataTypes.STRING(50), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      net_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      reference_type: { type: DataTypes.STRING(50) },
      reference_id: { type: DataTypes.UUID },
      posted_by: { type: DataTypes.UUID },
      posted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      ...Timestamps,
    });

    // Payments
    await queryInterface.createTable('payments', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      folio_id: { type: DataTypes.UUID, references: { model: 'folios', key: 'id' } },
      stay_id: { type: DataTypes.UUID, references: { model: 'stays', key: 'id' } },
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      method: { type: DataTypes.STRING(30), allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'COMPLETED' },
      reference_number: { type: DataTypes.STRING(100) },
      card_last_four: { type: DataTypes.STRING(4) },
      card_type: { type: DataTypes.STRING(20) },
      notes: { type: DataTypes.TEXT },
      processed_by: { type: DataTypes.UUID },
      processed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      ...Timestamps,
    });

    // Refunds
    await queryInterface.createTable('refunds', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      payment_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'payments', key: 'id' } },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'COMPLETED' },
      reference_number: { type: DataTypes.STRING(100) },
      processed_by: { type: DataTypes.UUID },
      processed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      ...Timestamps,
    });

    // Invoices
    await queryInterface.createTable('invoices', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      invoice_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      stay_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'stays', key: 'id' } },
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'DRAFT' },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      paid_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
      issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      paid_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Housekeeping Tasks
    await queryInterface.createTable('housekeeping_tasks', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      room_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'rooms', key: 'id' } },
      task_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'CHECKOUT' },
      priority: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'MEDIUM' },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PENDING' },
      assigned_to: { type: DataTypes.UUID },
      notes: { type: DataTypes.TEXT },
      started_at: { type: DataTypes.DATE },
      completed_at: { type: DataTypes.DATE },
      inspected_by: { type: DataTypes.UUID },
      inspected_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Maintenance Tickets
    await queryInterface.createTable('maintenance_tickets', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      room_id: { type: DataTypes.UUID, references: { model: 'rooms', key: 'id' } },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      category: { type: DataTypes.STRING(50), allowNull: false },
      priority: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'MEDIUM' },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'OPEN' },
      assigned_to: { type: DataTypes.UUID },
      reported_by: { type: DataTypes.UUID, allowNull: false },
      notes: { type: DataTypes.TEXT },
      started_at: { type: DataTypes.DATE },
      resolved_at: { type: DataTypes.DATE },
      closed_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Outlets
    await queryInterface.createTable('outlets', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      type: { type: DataTypes.STRING(30), allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      operating_hours: { type: DataTypes.JSONB },
      ...Timestamps,
    });

    // Restaurants
    await queryInterface.createTable('restaurants', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      outlet_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'outlets', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_active_for_room_service: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ...Timestamps,
    });

    // Tables
    await queryInterface.createTable('tables', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      restaurant_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
      number: { type: DataTypes.STRING(20), allowNull: false },
      capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'AVAILABLE' },
      section: { type: DataTypes.STRING(50) },
      ...Timestamps,
    });

    // Menu Categories
    await queryInterface.createTable('menu_categories', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      description: { type: DataTypes.TEXT },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      image_url: { type: DataTypes.STRING(500) },
      ...Timestamps,
    });

    // Menu Items
    await queryInterface.createTable('menu_items', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      category_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'menu_categories', key: 'id' } },
      name: { type: DataTypes.STRING(255), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      description: { type: DataTypes.TEXT },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_veg: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      preparation_time: { type: DataTypes.INTEGER },
      image_url: { type: DataTypes.STRING(500) },
      tax_ids: { type: DataTypes.ARRAY(DataTypes.UUID) },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...Timestamps,
    });

    // Menu Modifiers
    await queryInterface.createTable('menu_modifiers', {
      id: UUIDPK,
      menu_item_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'menu_items', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      ...Timestamps,
    });

    // Orders
    await queryInterface.createTable('orders', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      order_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      restaurant_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'restaurants', key: 'id' } },
      table_id: { type: DataTypes.UUID, references: { model: 'tables', key: 'id' } },
      stay_id: { type: DataTypes.UUID, references: { model: 'stays', key: 'id' } },
      room_number: { type: DataTypes.STRING(20) },
      order_type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'DINE_IN' },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PLACED' },
      guest_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
      ordered_by: { type: DataTypes.UUID },
      ...Timestamps,
    });

    // Order Items
    await queryInterface.createTable('order_items', {
      id: UUIDPK,
      order_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'orders', key: 'id' } },
      menu_item_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'menu_items', key: 'id' } },
      name: { type: DataTypes.STRING(255), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      modifiers: { type: DataTypes.JSONB },
      special_instructions: { type: DataTypes.TEXT },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PLACED' },
      ...Timestamps,
    });

    // KOT
    await queryInterface.createTable('kot', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      order_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'orders', key: 'id' } },
      kot_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PRINTED' },
      priority: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'NORMAL' },
      notes: { type: DataTypes.TEXT },
      printed_at: { type: DataTypes.DATE },
      started_at: { type: DataTypes.DATE },
      ready_at: { type: DataTypes.DATE },
      served_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Units
    await queryInterface.createTable('units', {
      id: UUIDPK,
      name: { type: DataTypes.STRING(50), allowNull: false },
      symbol: { type: DataTypes.STRING(10), allowNull: false, unique: true },
      base_unit: { type: DataTypes.STRING(50) },
      conversion_factor: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 1 },
      ...Timestamps,
    });

    // Inventory Categories
    await queryInterface.createTable('inventory_categories', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      description: { type: DataTypes.TEXT },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      ...Timestamps,
    });

    // Inventory Items
    await queryInterface.createTable('inventory_items', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      category_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'inventory_categories', key: 'id' } },
      unit_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'units', key: 'id' } },
      name: { type: DataTypes.STRING(255), allowNull: false },
      code: { type: DataTypes.STRING(50), allowNull: false },
      description: { type: DataTypes.TEXT },
      sku: { type: DataTypes.STRING(100) },
      barcode: { type: DataTypes.STRING(100) },
      current_stock: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      minimum_stock: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      maximum_stock: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      reorder_point: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_consumable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      ...Timestamps,
    });

    // Stock Transactions
    await queryInterface.createTable('stock_transactions', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      inventory_item_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'inventory_items', key: 'id' } },
      transaction_type: { type: DataTypes.STRING(30), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
      unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      reference_type: { type: DataTypes.STRING(50) },
      reference_id: { type: DataTypes.UUID },
      from_location: { type: DataTypes.STRING(100) },
      to_location: { type: DataTypes.STRING(100) },
      notes: { type: DataTypes.TEXT },
      performed_by: { type: DataTypes.UUID, allowNull: false },
      ...Timestamps,
    });

    // Vendors
    await queryInterface.createTable('vendors', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(255), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      contact_person: { type: DataTypes.STRING(255) },
      email: { type: DataTypes.STRING(255) },
      phone: { type: DataTypes.STRING(50) },
      address: { type: DataTypes.TEXT },
      city: { type: DataTypes.STRING(100) },
      state: { type: DataTypes.STRING(100) },
      country: { type: DataTypes.STRING(100) },
      postal_code: { type: DataTypes.STRING(20) },
      tax_id: { type: DataTypes.STRING(100) },
      payment_terms: { type: DataTypes.STRING(100) },
      notes: { type: DataTypes.TEXT },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      rating: { type: DataTypes.DECIMAL(3, 1) },
      ...Timestamps,
    });

    // Purchase Orders
    await queryInterface.createTable('purchase_orders', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      created_by: { type: DataTypes.UUID },
      updated_by: { type: DataTypes.UUID },
      po_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      vendor_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'vendors', key: 'id' } },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'DRAFT' },
      order_date: { type: DataTypes.DATEONLY, allowNull: false },
      expected_delivery_date: { type: DataTypes.DATEONLY },
      actual_delivery_date: { type: DataTypes.DATEONLY },
      subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
      approved_by: { type: DataTypes.UUID },
      approved_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Purchase Order Items
    await queryInterface.createTable('purchase_order_items', {
      id: UUIDPK,
      purchase_order_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'purchase_orders', key: 'id' } },
      inventory_item_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'inventory_items', key: 'id' } },
      quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      received_quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Goods Receipts
    await queryInterface.createTable('goods_receipts', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      created_by: { type: DataTypes.UUID },
      updated_by: { type: DataTypes.UUID },
      purchase_order_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'purchase_orders', key: 'id' } },
      receipt_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      received_date: { type: DataTypes.DATEONLY, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'RECEIVED' },
      notes: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Goods Receipt Items
    await queryInterface.createTable('goods_receipt_items', {
      id: UUIDPK,
      goods_receipt_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'goods_receipts', key: 'id' } },
      inventory_item_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'inventory_items', key: 'id' } },
      ordered_quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      received_quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Banquet Halls
    await queryInterface.createTable('banquet_halls', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      capacity: { type: DataTypes.INTEGER, allowNull: false },
      area: { type: DataTypes.DECIMAL(10, 2) },
      floor: { type: DataTypes.STRING(50) },
      rate_per_hour: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      rate_per_day: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      amenities: { type: DataTypes.ARRAY(DataTypes.TEXT) },
      image_url: { type: DataTypes.STRING(500) },
      ...Timestamps,
    });

    // Banquet Events
    await queryInterface.createTable('banquet_events', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      created_by: { type: DataTypes.UUID },
      updated_by: { type: DataTypes.UUID },
      banquet_hall_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'banquet_halls', key: 'id' } },
      event_name: { type: DataTypes.STRING(255), allowNull: false },
      event_type: { type: DataTypes.STRING(50), allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'INQUIRY' },
      event_date: { type: DataTypes.DATEONLY, allowNull: false },
      start_time: { type: DataTypes.STRING(5), allowNull: false },
      end_time: { type: DataTypes.STRING(5), allowNull: false },
      guest_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      contact_name: { type: DataTypes.STRING(255), allowNull: false },
      contact_email: { type: DataTypes.STRING(255) },
      contact_phone: { type: DataTypes.STRING(50), allowNull: false },
      company_name: { type: DataTypes.STRING(255) },
      hall_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      food_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      additional_charges: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      advance_paid: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      net_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      special_requests: { type: DataTypes.TEXT },
      notes: { type: DataTypes.TEXT },
      cancelled_at: { type: DataTypes.DATE },
      cancellation_reason: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Event Packages
    await queryInterface.createTable('event_packages', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(255), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      description: { type: DataTypes.TEXT },
      price_per_person: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      minimum_guests: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      maximum_guests: { type: DataTypes.INTEGER },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      ...Timestamps,
    });

    // Event Items
    await queryInterface.createTable('event_items', {
      id: UUIDPK,
      event_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'banquet_events', key: 'id' } },
      description: { type: DataTypes.STRING(500), allowNull: false },
      category: { type: DataTypes.STRING(50), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
      ...Timestamps,
    });

    // Membership Plans
    await queryInterface.createTable('membership_plans', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      description: { type: DataTypes.TEXT },
      points_per_dollar: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
      minimum_points_for_redemption: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
      redemption_value_per_point: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 0.01 },
      tier_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      benefits: { type: DataTypes.JSONB },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      ...Timestamps,
    });

    // Members
    await queryInterface.createTable('members', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      membership_plan_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'membership_plans', key: 'id' } },
      guest_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'guests', key: 'id' } },
      member_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      points_balance: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      lifetime_points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      total_redemption: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
      joined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      tier_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      ...Timestamps,
    });

    // Loyalty Transactions
    await queryInterface.createTable('loyalty_transactions', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      member_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'members', key: 'id' } },
      transaction_type: { type: DataTypes.STRING(30), allowNull: false },
      points: { type: DataTypes.INTEGER, allowNull: false },
      balance_after: { type: DataTypes.INTEGER, allowNull: false },
      reference_type: { type: DataTypes.STRING(50) },
      reference_id: { type: DataTypes.UUID },
      description: { type: DataTypes.TEXT },
      performed_by: { type: DataTypes.UUID },
      ...Timestamps,
    });

    // Taxes
    await queryInterface.createTable('taxes', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PERCENTAGE' },
      is_inclusive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      applies_to: { type: DataTypes.ARRAY(DataTypes.TEXT) },
      ...Timestamps,
    });

    // Discounts
    await queryInterface.createTable('discounts', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: false },
      type: { type: DataTypes.STRING(20), allowNull: false },
      value: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      max_discount_amount: { type: DataTypes.DECIMAL(10, 2) },
      min_booking_amount: { type: DataTypes.DECIMAL(10, 2) },
      start_date: { type: DataTypes.DATEONLY },
      end_date: { type: DataTypes.DATEONLY },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      applies_to: { type: DataTypes.ARRAY(DataTypes.TEXT) },
      max_uses: { type: DataTypes.INTEGER },
      current_uses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...Timestamps,
    });

    // Notifications
    await queryInterface.createTable('notifications', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      type: { type: DataTypes.STRING(30), allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      reference_type: { type: DataTypes.STRING(50) },
      reference_id: { type: DataTypes.UUID },
      metadata: { type: DataTypes.JSONB },
      read_at: { type: DataTypes.DATE },
      ...Timestamps,
    });

    // Audit Logs
    await queryInterface.createTable('audit_logs', {
      id: UUIDPK,
      organization_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'organizations', key: 'id' } },
      property_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'properties', key: 'id' } },
      user_id: { type: DataTypes.UUID },
      action: { type: DataTypes.STRING(50), allowNull: false },
      entity: { type: DataTypes.STRING(50), allowNull: false },
      entity_id: { type: DataTypes.UUID, allowNull: false },
      old_value: { type: DataTypes.JSONB },
      new_value: { type: DataTypes.JSONB },
      ip_address: { type: DataTypes.STRING(45) },
      user_agent: { type: DataTypes.STRING(500) },
      ...Timestamps,
    });

    // Refresh Tokens
    await queryInterface.createTable('refresh_tokens', {
      id: UUIDPK,
      user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      token: { type: DataTypes.STRING(500), allowNull: false, unique: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      is_revoked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      user_agent: { type: DataTypes.STRING(500) },
      ip_address: { type: DataTypes.STRING(45) },
      ...Timestamps,
    });
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
      await queryInterface.dropTable(table, { force: true });
    }
  },
};
