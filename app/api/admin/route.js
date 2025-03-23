import { connectToDB } from '@/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// Get all orders with filters
export async function GET(request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;
    if (search) query.phone = { $regex: search, $options: 'i' };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { message: 'Lỗi khi tải danh sách đơn hàng' },
      { status: 500 }
    );
  }
}

// Update order
export async function PUT(request) {
  try {
    const { 
      orderId, 
      status, 
      subtotal, 
      shippingFee, 
      discount,
      discountType,
      actualDiscount,
      totalPayment 
    } = await request.json();
    
    await connectToDB();
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    if (status) order.status = status;
    if (subtotal !== undefined) order.subtotal = subtotal;
    if (shippingFee !== undefined) order.shippingFee = shippingFee;
    if (discount !== undefined) order.discount = discount;
    if (discountType) order.discountType = discountType;
    if (actualDiscount !== undefined) order.actualDiscount = actualDiscount;
    if (totalPayment !== undefined) order.totalPayment = totalPayment;

    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: 'Lỗi khi cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}

// Delete order
export async function DELETE(request) {
  try {
    const { orderId } = await request.json();
    
    await connectToDB();
    
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return NextResponse.json(
        { message: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Lỗi khi xóa đơn hàng' },
      { status: 500 }
    );
  }
} 