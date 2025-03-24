import { connectToDB } from '@mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

// Lấy danh sách đơn hàng của user
export async function GET(req) {
  try {
    await connectToDB();
    const phone = req.nextUrl.searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ message: "Số điện thoại không được cung cấp" }, { status: 400 });
    }

    const orders = await Order.find({ phone }).sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi tải danh sách đơn hàng" }, { status: 500 });
  }
}

// Tạo đơn hàng mới
export async function POST(req) {
  try {
    await connectToDB();
    const data = await req.json();
    const { phone, type, note, address } = data;

    if (!phone || !type) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra nếu là delivery thì bắt buộc phải có địa chỉ
    if (type === 'delivery' && !address) {
      return NextResponse.json({ message: "Vui lòng nhập địa chỉ lấy hàng" }, { status: 400 });
    }

    const newOrder = await Order.create({
      phone,
      type,
      note,
      address,
      status: 'pending',
      totalPayment: 0
    });

    // Emit event cho admin
    await pusherServer.trigger('admin-channel', 'new-order', {
      order: newOrder.toObject(),
      message: `Đơn hàng mới từ ${phone}`
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi tạo đơn hàng mới" }, { status: 500 });
  }
} 