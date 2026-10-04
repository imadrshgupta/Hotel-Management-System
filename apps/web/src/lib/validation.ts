import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Guest ────────────────────────────────────────────────────
export const guestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .or(z.literal(""))
    .optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  is_vip: z.boolean().optional(),
  notes: z.string().optional(),
});
export type GuestFormData = z.infer<typeof guestSchema>;

// ─── Reservation ──────────────────────────────────────────────
export const reservationSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .or(z.literal(""))
      .optional(),
    phone: z.string().optional(),
    check_in_date: z.string().min(1, "Check-in date is required"),
    check_out_date: z.string().min(1, "Check-out date is required"),
    adults: z.coerce.number().min(1, "At least 1 adult is required"),
    children: z.coerce.number().min(0, "Children cannot be negative").optional(),
    room_type_id: z.string().min(1, "Room type is required"),
    source: z.string().optional(),
    advance_paid: z.coerce.number().min(0, "Advance cannot be negative").optional(),
    special_requests: z.string().optional(),
  })
  .refine((d) => d.check_out_date > d.check_in_date, {
    message: "Check-out must be after check-in",
    path: ["check_out_date"],
  });
export type ReservationFormData = z.infer<typeof reservationSchema>;

// ─── Walk-in (flat guest + dates; room picked via RoomSelector) ─
export const walkInSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .or(z.literal(""))
      .optional(),
    phone: z.string().optional(),
    id_type: z.string().optional(),
    id_number: z.string().optional(),
    check_in_date: z.string().min(1, "Check-in date is required"),
    check_out_date: z.string().min(1, "Check-out date is required"),
    adults: z.coerce.number().min(1, "At least 1 adult is required"),
    advance_paid: z.coerce.number().min(0, "Advance cannot be negative").optional(),
  })
  .refine((d) => d.check_out_date > d.check_in_date, {
    message: "Check-out must be after check-in",
    path: ["check_out_date"],
  });
export type WalkInFormData = z.infer<typeof walkInSchema>;

// ─── Payment ──────────────────────────────────────────────────
export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.string().min(1, "Payment method is required"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});
export type PaymentFormData = z.infer<typeof paymentSchema>;

// ─── Folio charge ─────────────────────────────────────────────
export const folioChargeSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative"),
  tax_amount: z.coerce.number().min(0).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
});
export type FolioChargeFormData = z.infer<typeof folioChargeSchema>;

// ─── Settings: user ───────────────────────────────────────────
export const userFormSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().optional(),
  })
  .refine((d) => !d.password || d.password.length >= 8, {
    message: "Password must be at least 8 characters",
    path: ["password"],
  });
export type UserFormData = z.infer<typeof userFormSchema>;

// ─── Settings: room ───────────────────────────────────────────
export const roomFormSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  name: z.string().optional(),
  room_type_id: z.string().min(1, "Room type is required"),
  floor_id: z.string().optional(),
  rate_override: z.coerce.number().min(0, "Rate cannot be negative").optional(),
  is_smoking: z.boolean().optional(),
  is_accessible: z.boolean().optional(),
  has_balcony: z.boolean().optional(),
  notes: z.string().optional(),
});
export type RoomFormData = z.infer<typeof roomFormSchema>;

// ─── Settings: room type ──────────────────────────────────────
export const roomTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  base_rate: z.coerce.number().min(0, "Base rate cannot be negative"),
  max_occupancy: z.coerce.number().min(0).optional(),
  max_adults: z.coerce.number().min(0).optional(),
  max_children: z.coerce.number().min(0).optional(),
  bed_count: z.coerce.number().min(0).optional(),
  bed_type: z.string().optional(),
  is_active: z.boolean().optional(),
});
export type RoomTypeFormData = z.infer<typeof roomTypeFormSchema>;

// ─── Settings: floor ──────────────────────────────────────────
export const floorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  level: z.coerce.number().min(0, "Level cannot be negative"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});
export type FloorFormData = z.infer<typeof floorFormSchema>;