import { Op } from 'sequelize';
import { Guest } from '../models/guest.model';
import { GuestDocument } from '../models/guest-document.model';
import { GuestPreference } from '../models/guest-preference.model';
import { NotFoundError, ConflictError, ValidationError } from '../errors/app-error';

export class GuestService {
  async findById(id: string): Promise<Guest> {
    const guest = await Guest.findByPk(id, {
      include: [
        { model: GuestDocument, as: 'documents' },
        { model: GuestPreference, as: 'preferences' },
      ],
    });
    if (!guest) {
      throw new NotFoundError('Guest', id);
    }
    return guest;
  }

  async findAll(propertyId: string, filters: any, page: number = 1, limit: number = 20) {
    const where: any = { property_id: propertyId };
    if (filters.search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${filters.search}%` } },
        { last_name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
        { phone: { [Op.iLike]: `%${filters.search}%` } },
        { company_name: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }
    if (filters.vip_status) where.vip_status = filters.vip_status;

    const { count, rows } = await Guest.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { guests: rows, total: count };
  }

  async create(data: any): Promise<Guest> {
    // Check for duplicate guest
    if (data.email) {
      const existing = await Guest.findOne({
        where: { property_id: data.property_id, email: data.email },
      });
      if (existing) {
        throw new ConflictError('Guest with this email already exists');
      }
    }

    return Guest.create(data);
  }

  async update(id: string, data: any): Promise<Guest> {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      throw new NotFoundError('Guest', id);
    }
    await guest.update(data);
    return guest.reload();
  }

  async delete(id: string): Promise<void> {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      throw new NotFoundError('Guest', id);
    }
    await guest.destroy();
  }

  async searchDuplicate(propertyId: string, email?: string, phone?: string): Promise<Guest[]> {
    const conditions: any[] = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    if (conditions.length === 0) return [];

    return Guest.findAll({
      where: {
        property_id: propertyId,
        [Op.or]: conditions,
      },
      limit: 5,
    });
  }

  async addDocument(guestId: string, data: any): Promise<GuestDocument> {
    const guest = await Guest.findByPk(guestId);
    if (!guest) throw new NotFoundError('Guest', guestId);

    return GuestDocument.create({ ...data, guest_id: guestId });
  }

  async addPreference(guestId: string, key: string, value: string): Promise<GuestPreference> {
    const guest = await Guest.findByPk(guestId);
    if (!guest) throw new NotFoundError('Guest', guestId);

    const existing = await GuestPreference.findOne({
      where: { guest_id: guestId, preference_key: key },
    });

    if (existing) {
      await existing.update({ preference_value: value });
      return existing;
    }

    return GuestPreference.create({
      guest_id: guestId,
      preference_key: key,
      preference_value: value,
    });
  }
}

export const guestService = new GuestService();
