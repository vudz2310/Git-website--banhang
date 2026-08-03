import { httpPost } from './http';
import type { ID } from './types';

export type CreateMomoPaymentResponse = {
  success: boolean;
  payUrl: string;
  momo?: any;
  order?: { id: ID; code: string };
  error?: string;
  detail?: string;
};

export class PaymentService {
  static async createMomoPayment(orderId: ID): Promise<CreateMomoPaymentResponse> {
    return httpPost<CreateMomoPaymentResponse>('payments/momo/create', { order_id: orderId });
  }
}


