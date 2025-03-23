import { connectToDB } from '@/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectToDB();
    
    // Lấy ngày đầu và cuối của tháng hiện tại
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Lấy ngày đầu và cuối của năm hiện tại
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    // Query doanh thu tháng
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'completed' // Chỉ tính các đơn đã hoàn thành
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPayment' }
        }
      }
    ]);

    // Query doanh thu năm
    const yearlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPayment' }
        }
      }
    ]);

    return NextResponse.json({
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      yearlyRevenue: yearlyRevenue[0]?.total || 0
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Lỗi khi tải thống kê doanh thu' },
      { status: 500 }
    );
  }
}