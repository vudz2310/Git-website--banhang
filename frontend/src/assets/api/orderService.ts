import { httpGet, httpPost } from './http';
import type { Order, OrderItem, Paginated, CreateOrderResponse, OrderItemWithDetails, ID } from './types';

export class OrderService {
  // Lấy danh sách đơn hàng của user
  static async getUserOrders(userId: ID, page: number = 1, pageSize: number = 10): Promise<Paginated<Order>> {
    return httpGet<Paginated<Order>>(`orders/user/${userId}?page=${page}&pageSize=${pageSize}`);
  }

  // Lấy chi tiết đơn hàng
  static async getOrder(orderId: ID): Promise<Order> {
    return httpGet<Order>(`orders/${orderId}`);
  }

  // Lấy danh sách sản phẩm trong đơn hàng với thông tin chi tiết
  static async getOrderItemsWithDetails(orderId: ID): Promise<OrderItemWithDetails[]> {
    const resp = await httpGet<{ data: OrderItemWithDetails[] }>(`orders/${orderId}/items-with-details`);
    return Array.isArray(resp?.data) ? resp.data : [];
  }

  // Lấy danh sách sản phẩm trong đơn hàng (cũ, giữ lại để tương thích)
  static async getOrderItems(orderId: ID): Promise<OrderItem[]> {
    return httpGet<OrderItem[]>(`orders/${orderId}/items`);
  }

  // Tạo đơn hàng mới
  static async createOrder(orderData: Partial<Order>): Promise<CreateOrderResponse> {
    return httpPost<CreateOrderResponse>('orders', orderData);
  }

  // Cập nhật đơn hàng
  static async updateOrder(orderId: ID, orderData: Partial<Order>): Promise<Order> {
    return httpPost<Order>(`orders/${orderId}`, orderData);
  }

  // Cập nhật trạng thái đơn hàng (sử dụng POST thay vì PUT)
  static async updateOrderStatus(orderId: ID, status: Order['status']): Promise<Order> {
    return httpPost<Order>(`orders/${orderId}/status`, { status });
  }

  // Hủy đơn hàng (sử dụng POST thay vì PUT)
  static async cancelOrder(orderId: ID): Promise<Order> {
    return httpPost<Order>(`orders/${orderId}/cancel`, {});
  }
} 