import { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  phone: {
    type: String,
  },
  type: {
    type: String,
  },
  status: {
    type: String,
  },
  note: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['amount', 'percent'],
    default: 'amount'
  },
  actualDiscount: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  totalPayment: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = models.Order || model('Order', OrderSchema);

export default Order;