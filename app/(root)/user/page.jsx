'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdLocalLaundryService,
  MdDeliveryDining,
  MdPendingActions,
  MdDone,
  MdLocalShipping,
  MdInfo
} from 'react-icons/md';
import {
  FaMotorcycle,
  FaUserCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaUser,
  FaEdit,
  FaClock,
  FaStar
} from 'react-icons/fa';
import { BiSolidWasher } from 'react-icons/bi';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { pusherClient } from '@/lib/pusher';

const StatusBadge = ({ currentStatus }) => {
  const badges = {
    pending: {
      text: 'Đang chờ xử lý',
      color: 'bg-yellow-300 text-yellow-800 border-yellow-600',
      Icon: MdPendingActions
    },
    processing: {
      text: 'Đang giặt',
      color: 'bg-blue-300 text-blue-800 border-blue-600',
      Icon: MdLocalLaundryService
    },
    completed: {
      text: 'Hoàn thành',
      color: 'bg-green-300 text-green-800 border-green-600',
      Icon: MdDone
    }
  };

  const statuses = ['pending', 'processing', 'completed'];

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
      {statuses.map((status) => {
        const badge = badges[status];
        const isActive = status === currentStatus;

        return (
          <div key={status} className={`flex flex-col items-center transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 opacity-50'}`}>
            <div className={`w-24 h-24 rounded-full ${badge.color} border-4 ${isActive ? 'border-purple-600' : 'border-transparent'} flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              <badge.Icon className="h-12 w-12" />
            </div>
            <span className="mt-1 text-sm font-semibold">{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
};

const StatusTimeline = ({ status }) => {
  // Không cần hiển thị ô trạng thái nữa
  return null; // Trả về null để không hiển thị gì
};

const User = () => {
  const [orders, setOrders] = useState([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    type: 'delivery',
    note: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Đọc cookie trong useEffect thay vì trực tiếp
  useEffect(() => {
    const phone = Cookies.get('phone');
    setUserPhone(phone);
  }, []);

  // Chỉ fetch orders khi đã có userPhone
  useEffect(() => {
    if (userPhone) {
      fetchOrders();
      fetchUserPoints();
    }
  }, [userPhone]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user?phone=${userPhone}`, {
        method: 'GET',
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const error = await res.json();
        toast.error(error.message || "Lỗi khi tải danh sách đơn hàng!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // Thêm useEffect để fetch điểm của user
  const fetchUserPoints = async () => {
    try {
      const res = await fetch(`/api/user/points?phone=${userPhone}`);
      if (res.ok) {
        const data = await res.json();
        setUserPoints(data.points);
        setTotalOrders(data.totalOrders);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  // Create new order
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    // Kiểm tra địa chỉ khi chọn delivery
    if (newOrder.type === 'delivery' && !newOrder.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ lấy hàng!');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: userPhone,
          type: newOrder.type,
          note: newOrder.note,
          address: newOrder.address,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev => [data, ...prev]);
        setIsCreatingOrder(false);
        setNewOrder({ type: 'delivery', note: '', address: '' });
        toast.success('Tạo đơn hàng thành công!');
      } else {
        const error = await res.json();
        toast.error(error.message || "Lỗi khi tạo đơn hàng!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/cancel', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId }),
      });

      if (res.ok) {
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, status: 'canceled' } : order
        ));
        toast.success('Đơn hàng đã được hủy!');
      } else {
        const error = await res.json();
        toast.error(error.message || "Lỗi khi hủy đơn hàng!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // Thêm xử lý cho nút thay đổi số điện thoại
  const handleChangePhone = () => {
    Cookies.remove('phone'); // Xóa cookie phone
    window.location.href = '/'; // Chuyển về trang chủ
  };

  useEffect(() => {
    if (userPhone) {
      // Subscribe to user's channel
      const channel = pusherClient.subscribe(`order-${userPhone}`);
      
      // Listen for order updates
      channel.bind('order-updated', (data) => {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === data.order._id ? data.order : order
          )
        );
        
        // Hiển thị thông báo
        toast.success('Đơn hàng của bạn vừa được cập nhật!');
      });

      // Cleanup khi component unmount
      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(`order-${userPhone}`);
      };
    }
  }, [userPhone]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
    >
      {/* Header Section - Responsive */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <img
                  src="https://tiemgiatsheep.com/wp-content/uploads/2023/04/about-us-uai-1032x821-2.png"
                  alt="Logo"
                  className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white/20"
                />
                <BiSolidWasher className="absolute -bottom-2 -right-2 text-2xl md:text-3xl text-purple-600 bg-white rounded-full p-1" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Laundry Service</h1>
                <p className="text-sm text-white/80">Giặt sạch - Giao nhanh</p>
              </div>
            </motion.div>

            {userPhone && (
              <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
                <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                  <FaPhone className="text-white/80" />
                  <span>{userPhone}</span>
                </div>
                <button
                  onClick={handleChangePhone}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Thay đổi
                </button>
                <div className="bg-yellow-400/20 px-4 py-2 rounded-full flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-white">
                    {userPoints} điểm ({totalOrders} đơn)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Shop Info & Create Order Section - Grid Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shop Owner Information */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src="https://img.lovepik.com/png/20231127/man-avatar-isolated-cartoon-hair-lifestyle_712040_wh860.png"
                  alt="Avatar"
                  className="h-24 w-24 rounded-full border-4 border-purple-100"
                />
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full">
                  <FaUser className="text-sm" />
                </div>
              </div>

              <div className="flex-1 space-y-4 text-center sm:text-left">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center  sm:justify-start gap-2">
                  <BiSolidWasher className="text-purple-600" />
                  Thông tin chủ shop
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 sm:justify-start">
                    <FaUser className="text-purple-600" />
                    <p className="text-gray-700">Thái Toại</p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-start">
                    <FaPhone className="text-purple-600" />
                    <p className="text-gray-700">0123 456 789</p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-start">
                    <FaCreditCard className="text-purple-600" />
                    <p className="text-gray-700">STK: 123456789</p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-start">
                    <FaMapMarkerAlt className="text-purple-600" />
                    <p className="text-gray-700">123 Đường ABC, Thành phố XYZ</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Create Order Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-center"
          >
            {!isCreatingOrder ? (
              <div className="text-center space-y-4">
                <div className="bg-purple-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
                  <BiSolidWasher className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Bắt đầu giặt đồ</h3>
                </div>
                <button
                  onClick={() => setIsCreatingOrder(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <MdLocalLaundryService className="text-xl" />
                  Tạo đơn giặt mới
                </button>
              </div>
            ) : null}
          </motion.div>
        </div>

        {/* Create Order Form - Responsive */}
        {isCreatingOrder && (
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <BiSolidWasher className="text-purple-600" />
                Tạo đơn giặt mới
              </h2>
              <button
                onClick={() => setIsCreatingOrder(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewOrder({ ...newOrder, type: 'delivery' })}
                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${newOrder.type === 'delivery'
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-200'
                      }`}
                  >
                    <div className={`p-4 rounded-full ${newOrder.type === 'delivery' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <FaMotorcycle className={`h-8 w-8 ${newOrder.type === 'delivery' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <span className="font-medium text-gray-800">Đến lấy tận nơi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewOrder({ ...newOrder, type: 'store' })}
                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${newOrder.type === 'store'
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-200'
                      }`}
                  >
                    <div className={`p-4 rounded-full ${newOrder.type === 'store' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <MdLocalLaundryService className={`h-8 w-8 ${newOrder.type === 'store' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <span className="font-medium text-gray-800">Mang đến tiệm</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Ghi chú
                </label>
                <textarea
                  value={newOrder.note}
                  onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Thêm ghi chú về đơn giặt của bạn..."
                />
              </div>

              {newOrder.type === 'delivery' && (
                <div className="mt-4">
                  <label className="block text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-purple-600" />
                    Địa chỉ lấy hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOrder.address}
                    onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${newOrder.address.trim() === '' ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Nhập địa chỉ lấy hàng..."
                  />
                  {newOrder.address.trim() === '' && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Vui lòng nhập địa chỉ lấy hàng
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <BiSolidWasher className="text-xl" />
                  Xác nhận đơn
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingOrder(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 font-medium hover:bg-gray-200 transition-all duration-300 rounded-xl flex items-center justify-center gap-2"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Orders List - Responsive */}
        <motion.div
          variants={cardVariants}
          className="space-y-6"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-3">
            <BiSolidWasher className="text-purple-600" />
            Đơn của bạn
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="bg-purple-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                <BiSolidWasher className="text-purple-600 text-3xl" />
              </div>
              <p className="text-gray-500">Bạn chưa có đơn giặt nào</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  variants={cardVariants}
                  className="bg-white rounded-2xl shadow-lg p-6"
                  onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-4 rounded-full">
                        {order.type === 'delivery' ? (
                          <FaMotorcycle className="text-purple-600 h-6 w-6" />
                        ) : (
                          <MdLocalLaundryService className="text-purple-600 h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-lg text-gray-800">
                          {order.type === 'delivery' ? 'Đến lấy tận nơi' : 'Mang đến tiệm'}
                        </p>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <FaClock className="text-purple-600" />
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto">
                      <StatusBadge currentStatus={order.status} />
                    </div>
                  </div>

                  {/* Thêm phần hiển thị chi tiết các khoản tiền */}
                  {order.totalPayment > 0 && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <div className="grid gap-2 text-sm">
                        {/* Tiền giặt ủi */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Tiền giặt ủi</span>
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold text-gray-700">
                              {order.subtotal?.toLocaleString('vi-VN')}
                            </span>
                            <span className="text-gray-600">đ</span>
                          </div>
                        </div>

                        {/* Phí vận chuyển nếu có */}
                        {order.type === 'delivery' && order.shippingFee > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Phí vận chuyển</span>
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold text-blue-600">
                                +{order.shippingFee?.toLocaleString('vi-VN')}
                              </span>
                              <span className="text-gray-600">đ</span>
                            </div>
                          </div>
                        )}

                        {/* Giảm giá nếu có */}
                        {order.discount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Giảm giá</span>
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold text-red-600">
                                {order.discountType === 'percent'
                                  ? `-${order.discount}% (${Math.round(order.actualDiscount).toLocaleString('vi-VN')}đ)`
                                  : `-${order.discount?.toLocaleString('vi-VN')}đ`
                                }
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Tổng tiền */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                          <span className="font-medium text-gray-700">Tổng tiền</span>
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-lg text-green-600">
                              {order.totalPayment?.toLocaleString('vi-VN')}
                            </span>
                            <span className="text-gray-600">đ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hiển thị ghi chú nếu có */}
                  {selectedOrder === order._id && order.note && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <div className="flex items-center gap-2 text-gray-600 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <MdInfo className="text-purple-600 flex-shrink-0" />
                        <p>{order.note}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Hiển thị địa chỉ nếu là đơn delivery */}
                  {order.type === 'delivery' && order.address && (
                    <div className="mt-4 flex items-start space-x-2 bg-purple-50 p-4 rounded-xl">
                      <FaMapMarkerAlt className="text-purple-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Địa chỉ: {order.address}</p>
                    </div>
                  )}

                  {/* Thêm phần nút hủy đơn hàng */}
                  {order.status === 'pending' && (
                    <div className="mt-4 border-t pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                          handleCancelOrder(order._id);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Hủy đơn hàng
                      </button>
                    </div>
                  )}

                  {/* Hiển thị trạng thái đã hủy nếu đơn bị hủy */}
                  {order.status === 'canceled' && (
                    <div className="mt-4 border-t pt-4">
                      <span className="text-red-600 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Đã hủy đơn
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang xử lý...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default User;


// Tích điểm đổi quà
// Thời gian thực