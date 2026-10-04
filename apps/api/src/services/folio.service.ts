import { getSequelize } from '../config/database';
import { Folio } from '../models/folio.model';
import { FolioItem } from '../models/folio-item.model';
import { Stay } from '../models/stay.model';
import { NotFoundError, BusinessRuleError } from '../errors/app-error';

export class FolioService {
  async findById(id: string): Promise<Folio> {
    const folio = await Folio.findByPk(id, {
      include: [
        { model: FolioItem, as: 'items', order: [['posted_at', 'DESC']] },
      ],
    });
    if (!folio) {
      throw new NotFoundError('Folio', id);
    }
    return folio;
  }

  async findByStay(stayId: string): Promise<Folio> {
    const folio = await Folio.findOne({
      where: { stay_id: stayId, status: 'OPEN' },
      include: [
        { model: FolioItem, as: 'items', order: [['posted_at', 'DESC']] },
      ],
    });
    if (!folio) {
      throw new NotFoundError('Folio for stay', stayId);
    }
    return folio;
  }

  async addItem(folioId: string, data: {
    description: string;
    category: string;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
    discount_amount?: number;
    reference_type?: string;
    reference_id?: string;
    posted_by?: string;
  }): Promise<FolioItem> {
    const folio = await Folio.findByPk(folioId);
    if (!folio) throw new NotFoundError('Folio', folioId);
    if (folio.status !== 'OPEN') throw new BusinessRuleError('Folio is not open');

    const amount = Number(data.quantity) * Number(data.unit_price);
    const netAmount = amount - (data.discount_amount || 0) + (data.tax_amount || 0);

    const item = await FolioItem.create({
      folio_id: folioId,
      ...data,
      amount,
      net_amount: netAmount,
      posted_at: new Date(),
    } as any);

    // Update folio totals
    await this.recalculateFolio(folioId);

    return item;
  }

  async removeItem(itemId: string): Promise<void> {
    const item = await FolioItem.findByPk(itemId);
    if (!item) throw new NotFoundError('Folio item', itemId);

    const folio = await Folio.findByPk(item.folio_id);
    if (!folio) throw new NotFoundError('Folio');
    if (folio.status !== 'OPEN') throw new BusinessRuleError('Folio is not open');

    await item.destroy();
    await this.recalculateFolio(folio.id);
  }

  async recalculateFolio(folioId: string): Promise<Folio> {
    const items = await FolioItem.findAll({ where: { folio_id: folioId } });

    let totalCharges = 0;
    let totalTaxes = 0;
    let totalDiscounts = 0;

    for (const item of items) {
      totalCharges += Number(item.amount);
      totalTaxes += Number(item.tax_amount);
      totalDiscounts += Number(item.discount_amount);
    }

    const folio = await Folio.findByPk(folioId);
    if (!folio) throw new NotFoundError('Folio', folioId);

    const balance = totalCharges + totalTaxes - totalDiscounts - Number(folio.total_payments) + Number(folio.total_refunds);

    await folio.update({
      total_charges: totalCharges,
      total_taxes: totalTaxes,
      total_discounts: totalDiscounts,
      balance,
    });

    return folio.reload();
  }
}

export const folioService = new FolioService();
