'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdLocalLaundryService, MdDeliveryDining, MdPendingActions, MdDone, MdLocalShipping, MdSearch, MdFilterList, MdAccessTime, MdPhone, MdNoteAlt, MdLocationOn } from 'react-icons/md';
import { FaShoppingBasket, FaMoneyBillWave, FaTruck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

const StatusBadge = ({ status }) => {
  const badges = {
    pending: {
      text: 'Chờ xử lý',
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
    },
    canceled: {
      text: 'Đã hủy',
      color: 'bg-red-100 text-red-800',
      Icon: MdLocalShipping // Use an appropriate icon for canceled
    }
  };

  const badge = badges[status];
  const Icon = badge.Icon;

  return (
    <div className={`px-4 py-2 rounded-full ${badge.color} flex items-center space-x-1`}>
      <Icon className="text-lg" />
      <span>{badge.text}</span>
    </div>
  );
};

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: 'all',
    search: ''
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    canceled: 0,
    total: 0
  });
  const [discountType, setDiscountType] = useState('amount'); // 'amount' hoặc 'percent'
  const [showStats, setShowStats] = useState(true);
  const [revenue, setRevenue] = useState({
    monthly: 0,
    yearly: 0
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Cập nhật thống kê
  const updateStats = (ordersList) => {
    const newStats = ordersList.reduce((acc, order) => {
      acc[order.status]++;
      acc.total++;
      return acc;
    }, { pending: 0, processing: 0, completed: 0, canceled: 0, total: 0 });
    setStats(newStats);
  };

  // Fetch orders with filters
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: filters.status,
        type: filters.type,
        search: filters.search,
      }).toString();

      const res = await fetch(`/api/admin?${query}`, {
        method: 'GET',
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        updateStats(data);
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

  // Update order status
  const handleUpdateOrder = async (orderId, updates) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          ...updates
        }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(order =>
          order._id === orderId ? updatedOrder : order
        ));
        setEditingOrder(null);
        toast.success('Cập nhật đơn hàng thành công!');
      } else {
        const error = await res.json();
        toast.error(error.message || "Lỗi khi cập nhật đơn hàng!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue
  const fetchRevenue = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setRevenue({
          monthly: data.monthlyRevenue,
          yearly: data.yearlyRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRevenue();
  }, [filters.status, filters.type, filters.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header với nút toggle stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <MdLocalLaundryService className="text-purple-600 h-10 w-10" />
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Giặt</h1>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="mt-4 sm:mt-0 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2"
          >
            <MdFilterList />
            <span>{showStats ? 'Ẩn thống kê' : 'Hiện thống kê'}</span>
          </button>
        </div>

        {/* Stats Cards với animation */}
        <motion.div
          initial={false}
          animate={showStats ? 'visible' : 'hidden'}
          variants={{
            visible: { height: 'auto', opacity: 1 },
            hidden: { height: 0, opacity: 0 }
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {/* Thống kê đơn hàng */}
            <motion.div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <MdPendingActions className="text-2xl text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Chờ xử lý</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdLocalLaundryService className="text-2xl text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Đang giặt</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.processing}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdDone className="text-2xl text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Hoàn thành</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <MdLocalShipping className="text-2xl text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Đã hủy</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.canceled}</p>
                </div>
              </div>
            </motion.div>

            {/* Thêm ô doanh thu tháng */}
            <motion.div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <FaMoneyBillWave className="text-2xl text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Tháng</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {revenue.monthly.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Thêm ô doanh thu năm */}
            <motion.div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaMoneyBillWave className="text-2xl text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Năm</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {revenue.yearly.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo số điện thoại..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang chờ xử lý</option>
                <option value="processing">Đang giặt</option>
                <option value="completed">Hoàn thành</option>
                <option value="canceled">Đã hủy</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="delivery">Đến lấy tận nơi</option>
                <option value="store">Mang đến tiệm</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl shadow-lg"
              >
                <MdLocalLaundryService className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-xl text-gray-500">Không có đơn hàng nào</p>
              </motion.div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order._id}
                  variants={cardVariants}
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex sm:items-start space-x-4 sm:space-x-6 items-center">
                      <div className={`p-3 sm:p-4 rounded-full ${order.type === 'delivery' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {order.type === 'delivery' ? (
                          <FaTruck className="text-xl sm:text-2xl text-blue-600" />
                        ) : (
                          <FaShoppingBasket className="text-xl sm:text-2xl text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                          <span className="font-medium text-base sm:text-lg">
                            {order.type === 'delivery' ? 'Đến lấy tận nơi' : 'Mang đến tiệm'}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-500">
                          <div className="flex items-center">
                            <MdPhone className="mr-1" />
                            <span>{order.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <MdAccessTime className="mr-1" />
                            <span>
                              {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </span>
                            <span className="mx-1">-</span>
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {editingOrder?._id === order._id ? (
                      <div className="flex flex-col w-full gap-4 bg-gray-50 p-4 rounded-lg">
                        {/* Hàng 1: Status và Tiền giặt ủi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Trạng thái</label>
                            <select
                              value={editingOrder.status}
                              onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="pending">Chờ xử lý</option>
                              <option value="processing">Đang giặt</option>
                              <option value="completed">Hoàn thành</option>
                              <option value="canceled">Đã hủy</option>
                            </select>
                          </div>

                          <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Tiền giặt ủi</label>
                            <input
                              type="number"
                              value={editingOrder.subtotal}
                              onChange={(e) => {
                                const subtotal = Number(e.target.value);
                                const shippingFee = editingOrder.shippingFee || 0;
                                const actualDiscount = discountType === 'percent'
                                  ? (subtotal * (editingOrder.discount || 0) / 100)
                                  : (editingOrder.discount || 0);
                                const total = subtotal + shippingFee - actualDiscount;
                                setEditingOrder({ 
                                  ...editingOrder, 
                                  subtotal,
                                  actualDiscount,
                                  totalPayment: total
                                });
                              }}
                              placeholder="Nhập tiền giặt ủi"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Hàng 2: Phí ship và Giảm giá */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Phí vận chuyển</label>
                            <input
                              type="number"
                              value={editingOrder.shippingFee}
                              onChange={(e) => {
                                const shippingFee = Number(e.target.value);
                                const subtotal = editingOrder.subtotal || 0;
                                const actualDiscount = editingOrder.actualDiscount || 0;
                                const total = subtotal + shippingFee - actualDiscount;
                                setEditingOrder({ 
                                  ...editingOrder, 
                                  shippingFee,
                                  totalPayment: total
                                });
                              }}
                              placeholder="Nhập phí ship"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">Giảm giá</label>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                value={editingOrder.discount}
                                onChange={(e) => {
                                  const discountInput = Number(e.target.value);
                                  const subtotal = editingOrder.subtotal || 0;
                                  const shippingFee = editingOrder.shippingFee || 0;
                                  const beforeDiscount = subtotal + shippingFee; // Tổng tiền trước khi giảm
                                  
                                  // Tính toán số tiền giảm giá dựa trên loại
                                  const actualDiscount = discountType === 'percent' 
                                    ? (beforeDiscount * discountInput / 100) // Giảm % trên tổng tiền
                                    : discountInput;
                                  
                                  const total = beforeDiscount - actualDiscount;
                                  
                                  setEditingOrder({ 
                                    ...editingOrder, 
                                    discount: discountInput,
                                    actualDiscount: actualDiscount,
                                    totalPayment: total
                                  });
                                }}
                                placeholder={discountType === 'percent' ? "Nhập %" : "Nhập số tiền"}
                                className="px-3 py-2 flex-1 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <select
                                value={discountType}
                                onChange={(e) => {
                                  setDiscountType(e.target.value);
                                  setEditingOrder({
                                    ...editingOrder,
                                    discount: 0,
                                    actualDiscount: 0,
                                    totalPayment: (editingOrder.subtotal || 0) + (editingOrder.shippingFee || 0)
                                  });
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                              >
                                <option value="amount">VNĐ</option>
                                <option value="percent">%</option>
                              </select>
                            </div>
                            {/* Hiển thị giá trị giảm giá thực tế */}
                            {editingOrder.discount > 0 && (
                              <div className="text-sm text-gray-500 mt-1">
                                {discountType === 'percent' ? (
                                  <span>
                                    → Giảm {editingOrder.discount}% trên tổng {(editingOrder.subtotal + editingOrder.shippingFee).toLocaleString('vi-VN')}đ 
                                    = {Math.round(editingOrder.actualDiscount).toLocaleString('vi-VN')}đ
                                  </span>
                                ) : (
                                  <span>→ Giảm {editingOrder.discount.toLocaleString('vi-VN')}đ</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hàng 3: Tổng kết */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-gray-600 flex items-center">
                              <span>Tiền giặt ủi</span>
                            </div>
                            <div className="text-right flex items-center justify-end space-x-1">
                              <span className="font-semibold text-gray-700">
                                {(editingOrder.subtotal || 0).toLocaleString('vi-VN')}
                              </span>
                              <span className="text-gray-600">đ</span>
                            </div>
                            
                            <div className="text-gray-600 flex items-center">
                              <span>Phí ship</span>
                            </div>
                            <div className="text-right flex items-center justify-end space-x-1">
                              <span className="text-blue-600 font-semibold">
                                +{(editingOrder.shippingFee || 0).toLocaleString('vi-VN')}
                              </span>
                              <span className="text-gray-600">đ</span>
                            </div>
                            
                            <div className="text-gray-600 flex items-center">
                              <span>Giảm giá</span>
                            </div>
                            <div className="text-right flex items-center justify-end space-x-1">
                              <span className="text-red-600 font-semibold">
                                -{Math.round(editingOrder.actualDiscount || 0).toLocaleString('vi-VN')}
                              </span>
                              <span className="text-gray-600">đ</span>
                            </div>
                            
                            <div className="text-gray-800 font-medium pt-3 border-t flex items-center">
                              <span>Tổng tiền</span>
                            </div>
                            <div className="text-right pt-3 border-t flex items-center justify-end space-x-1">
                              <span className="text-green-600 font-bold text-lg">
                                {editingOrder.totalPayment?.toLocaleString('vi-VN')}
                              </span>
                              <span className="text-gray-600">đ</span>
                            </div>
                          </div>
                        </div>

                        {/* Hàng 4: Buttons */}
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleUpdateOrder(order._id, {
                              status: editingOrder.status,
                              subtotal: editingOrder.subtotal,
                              shippingFee: editingOrder.shippingFee,
                              discount: editingOrder.discount,
                              discountType: discountType,
                              actualDiscount: editingOrder.actualDiscount,
                              totalPayment: editingOrder.totalPayment
                            })}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Lưu thay đổi
                          </button>
                          <button
                            onClick={() => setEditingOrder(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
                        <StatusBadge status={order.status} />
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          {order.subtotal > 0 && (
                            <span className="text-gray-600">
                              Tiền giặt: {order.subtotal.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                          {order.shippingFee > 0 && (
                            <span className="text-blue-600">
                              Ship: +{order.shippingFee.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                          {order.discount > 0 && (
                            <span className="text-red-600">
                              Giảm: {order.discountType === 'percent' 
                                ? `${order.discount}% trên ${(order.subtotal + order.shippingFee).toLocaleString('vi-VN')}đ (${Math.round(order.actualDiscount).toLocaleString('vi-VN')}đ)`
                                : `${order.discount.toLocaleString('vi-VN')}đ`
                              }
                            </span>
                          )}
                          {order.totalPayment > 0 && (
                            <span className="font-medium text-green-600">
                              Tổng: {order.totalPayment.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          Cập nhật
                        </button>
                      </div>
                    )}
                  </div>
                  {order.note && (
                    <div className="mt-4 flex items-start space-x-2 bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <MdNoteAlt className="text-gray-400 mt-1" />
                      <p className="text-gray-600">{order.note}</p>
                    </div>
                  )}
                  {order.type === 'delivery' && order.address && (
                    <div className="mt-4 flex items-start space-x-2 bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <MdLocationOn className="text-blue-600 mt-1" />
                      <div className='flex gap-3'>
                        <p className="font-medium text-gray-700">Địa chỉ:</p>
                        <p className="font-bold">{order.address}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;