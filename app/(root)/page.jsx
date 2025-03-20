'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../app/globals.css';
import Cookies from 'js-cookie';
import { MdLocalLaundryService, MdPhone, MdDry, MdIron } from 'react-icons/md';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    Cookies.set('phone', phone);
    if (phone === '0123456789') {
      router.push('/admin');
    } else {
      router.push('/user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              x: ['0%', '100%'],
              y: [i * 30 + '%', i * 30 + '%'],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            {i === 0 && <MdLocalLaundryService className="text-white text-6xl opacity-20" />}
            {i === 1 && <MdDry className="text-white text-6xl opacity-20" />}
            {i === 2 && <MdIron className="text-white text-6xl opacity-20" />}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MdLocalLaundryService className="text-white text-3xl" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dịch vụ giặt đồ thông minh
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Chất lượng hoàn hảo - Giao hàng nhanh chóng
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại của bạn
            </label>
            <div className="relative">
              <MdPhone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ease-in-out"
                placeholder="Nhập số điện thoại của bạn"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out"
          >
            Tiếp tục
          </motion.button>
        </motion.form>

        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <MdDry className="text-purple-500 text-xl" />
            <MdLocalLaundryService className="text-blue-500 text-xl" />
            <MdIron className="text-pink-500 text-xl" />
          </div>
          <p className="text-sm text-gray-500">
            Dịch vụ chuyên nghiệp - An toàn - Tiện lợi
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;