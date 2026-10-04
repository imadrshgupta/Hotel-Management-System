import { Response } from 'express';

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message: string;
}

export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export function sendSuccess<T>(res: Response, data: T, message: string = 'Operation completed successfully', statusCode: number = 200): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
  };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message: string = 'Created successfully'): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Retrieved successfully'
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    message,
  };
  res.status(200).json(response);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
