import { connectToDB } from '@/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectToDB();
    const phone = req.nextUrl.searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { message: "Số điện thoại không được cung cấp" }, 
        { status: 400 }
      );
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = { phone, points: 0, totalOrders: 0 };
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi khi tải thông tin điểm" }, 
      { status: 500 }
    );
  }
}