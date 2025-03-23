import { connectToDB } from '@/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

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

    const previousStatus = order.status;
    
    // Cập nhật thông tin đơn hàng
    if (status) order.status = status;
    if (subtotal !== undefined) order.subtotal = subtotal;
    if (shippingFee !== undefined) order.shippingFee = shippingFee;
    if (discount !== undefined) order.discount = discount;
    if (discountType) order.discountType = discountType;
    if (actualDiscount !== undefined) order.actualDiscount = actualDiscount;
    if (totalPayment !== undefined) order.totalPayment = totalPayment;

    await order.save();

    // Gửi thông báo qua Pusher sau khi lưu
    await pusherServer.trigger(`order-${order.phone}`, 'order-updated', {
      order: order.toObject()
    });

    // Nếu đơn hàng chuyển sang trạng thái completed, cập nhật điểm cho user
    if (status === 'completed' && previousStatus !== 'completed') {
      // Tìm hoặc tạo user mới
      let user = await User.findOne({ phone: order.phone });
      if (!user) {
        user = new User({ phone: order.phone });
      }
      
      // Tăng điểm và số đơn hàng
      user.points += 1;
      user.totalOrders += 1;
      await user.save();

      // Trả về thông tin đơn hàng kèm điểm của user
      return NextResponse.json({
        ...order.toObject(),
        userPoints: user.points,
        totalOrders: user.totalOrders
      });
    }

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