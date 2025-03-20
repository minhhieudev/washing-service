import { connectToDB } from '@mongodb';
// import BieuMau from '@models/Order';

// export const GET = async (req) => {
//   try {
//     await connectToDB();

//     const bieuMaus = await BieuMau.find().sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất
    
//     return new Response(JSON.stringify(bieuMaus), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({ message: "Lỗi khi tải danh sách biểu mẫu" }), { status: 500 });
//   }
// };

// export const POST = async (req) => {
//   try {
//     await connectToDB();

//     const { filename, url, contentType, description } = await req.json();

//     // Validate dữ liệu
//     if (!filename || !url || !contentType) {
//       return new Response(JSON.stringify({ message: "Thiếu thông tin bắt buộc" }), { status: 400 });
//     }

//     // Tạo biểu mẫu mới
//     const newBieuMau = await BieuMau.create({
//       filename,
//       url,
//       contentType,
//       description
//     });

//     return new Response(JSON.stringify(newBieuMau), { status: 201 });
//   } catch (error) {
//     return new Response(JSON.stringify({ message: "Lỗi khi tạo biểu mẫu mới" }), { status: 500 });
//   }
// };

// export const DELETE = async (req) => {
//   try {
//     await connectToDB();

//     const { id } = await req.json();

//     if (!id) {
//       return new Response(JSON.stringify({ message: "ID không được cung cấp" }), { status: 400 });
//     }

//     const deletedBieuMau = await BieuMau.findByIdAndDelete(id);

//     if (!deletedBieuMau) {
//       return new Response(JSON.stringify({ message: "Không tìm thấy biểu mẫu" }), { status: 404 });
//     }

//     return new Response(JSON.stringify({ message: "Xóa biểu mẫu thành công" }), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({ message: "Lỗi khi xóa biểu mẫu" }), { status: 500 });
//   }
// };