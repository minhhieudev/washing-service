import { connectToDB } from '@mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

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
    const { phone, type, note } = data;

    if (!phone || !type) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const newOrder = await Order.create({
      phone,
      type,
      note,
      status: 'pending',
      totalPayment: 0 // Sẽ được cập nhật bởi admin sau
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi tạo đơn hàng mới" }, { status: 500 });
  }
} 