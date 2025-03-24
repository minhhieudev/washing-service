import { connectToDB } from '@mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

// ... existing code ...

// Update order status to 'canceled'
export async function PATCH(req) {
  try {
    await connectToDB();
    const { id: orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.status === 'processing') {
      return NextResponse.json({ message: "Cannot cancel an order that is processing" }, { status: 400 });
    }

    order.status = 'canceled';
    await order.save();

    // Emit event cho admin
    await pusherServer.trigger('admin-channel', 'order-canceled', {
      order: order.toObject(),
      message: `Đơn hàng ${orderId} đã bị hủy bởi khách hàng ${order.phone}`
    });

    return NextResponse.json({ message: "Order status updated to canceled" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating order status" }, { status: 500 });
  }
}