'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdLocalLaundryService, MdDeliveryDining, MdPendingActions, MdDone, MdLocalShipping } from 'react-icons/md';
import { FaMotorcycle } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ currentStatus }) => {
  const badges = {
    pending: {
      text: 'Đang chờ xử lý',
      color: 'bg-yellow-100 text-yellow-800',
      Icon: MdPendingActions
    },
    processing: {
      text: 'Đang giặt',
      color: 'bg-blue-100 text-blue-800',
      Icon: MdLocalLaundryService
    },
    completed: {
      text: 'Hoàn thành',
      color: 'bg-green-100 text-green-800',
      Icon: MdDone
    }
  };

  const statuses = ['pending', 'processing', 'completed'];
  
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
      {statuses.map((status) => {
        const badge = badges[status];
        const isActive = status === currentStatus;
        const opacityClass = isActive ? 'opacity-100' : 'opacity-50';
        const borderClass = isActive ? 'border-2 border-purple-600' : 'border';

        return (
          <div key={status} className={`flex flex-col items-center ${opacityClass}`}>
            <div className={`w-20 h-20 rounded-full ${badge.color} flex items-center justify-center ${borderClass}`}>
              <badge.Icon className="h-10 w-10" />
            </div>
            <span className="mt-1 text-sm">{badge.text}</span>
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
  });
  const [loading, setLoading] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  // Create new order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(prev => [data, ...prev]);
        setIsCreatingOrder(false);
        setNewOrder({ type: 'delivery', note: '' });
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#f9eeee] to-[#ecf9ec]"
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto ">
        <div className="text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Welcome to Laundry Service
          </motion.h1>
          {userPhone && <p className="text-gray-600">Số điện thoại: {userPhone}</p>}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang xử lý...</p>
            </div>
          </div>
        )}

        {/* Create Order Button */}
        {!isCreatingOrder && (
          <motion.div
            variants={cardVariants}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={() => setIsCreatingOrder(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <MdLocalLaundryService className="text-xl" />
              <span>Tạo đơn giặt mới</span>
            </button>
          </motion.div>
        )}

        {/* Create Order Form */}
        {isCreatingOrder && (
          <motion.div
            variants={cardVariants}
            className="mt-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tạo đơn giặt mới</h2>
            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình thức
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewOrder({ ...newOrder, type: 'delivery' })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-2 transition-all duration-200 ${
                      newOrder.type === 'delivery'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <FaMotorcycle className="h-10 w-10 text-purple-600" />
                    <span className="font-medium">Đến lấy tận nơi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrder({ ...newOrder, type: 'store' })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-2 transition-all duration-200 ${
                      newOrder.type === 'store'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <MdLocalLaundryService className="h-10 w-10 text-purple-600" />
                    <span className="font-medium">Mang đến tiệm</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  id="note"
                  value={newOrder.note}
                  onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Thêm ghi chú về đơn giặt của bạn..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingOrder(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 font-medium hover:bg-gray-200 transition-all duration-200 p-6 rounded-md"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Orders List */}
        <motion.div
          variants={cardVariants}
          className="mt-12 grid gap-6 max-w-7xl mx-auto"
        >
          <h2 className="text-2xl font-semibold text-gray-800">Đơn của bạn:</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <MdLocalLaundryService className="mx-auto text-5xl text-gray-400 mb-4" />
              <p className="text-gray-500">Bạn chưa có đơn giặt nào</p>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order._id}
                variants={cardVariants}
                className="bg-white rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between ">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    {order.type === 'delivery' ? (
                      <MdDeliveryDining className="text-purple-600 h-10 w-10" />
                    ) : (
                      <MdLocalLaundryService className="text-purple-600 h-10 w-10" />
                    )}
                    <div>
                      <p className="font-medium text-lg">
                        {order.type === 'delivery' ? 'Đến lấy tận nơi' : 'Mang đến tiệm'}
                      </p>
                      <StatusTimeline status={order.status} />
                      <p className="text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge currentStatus={order.status} />
                </div>
                {selectedOrder === order._id && order.note && (
                  <p className="mt-4 text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.note}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4">
                  {order.status === 'pending' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelOrder(order._id);
                      }}
                      className="bg-red-500 text-white py-1 px-3 rounded-md font-medium hover:bg-red-600 transition-all duration-200"
                    >
                      Hủy
                    </button>
                  ) : order.status === 'canceled' ? (
                    <span className="text-red-600 font-bold">Đã hủy</span>
                  ) : null}
                  <p className="text-gray-500 text-sm font-bold">
                    Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPayment)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default User;