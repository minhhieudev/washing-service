import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = models.User || model('User', UserSchema);

export default User;
