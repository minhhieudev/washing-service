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
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalPayment: {
    type: Number,
  }
});

const Order = models.Order || model('Order', OrderSchema);

export default Order;