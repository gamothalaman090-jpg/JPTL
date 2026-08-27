import mongoose from 'mongoose';

const { Schema } = mongoose;

const USER_ROLES = ['tenant', 'landlord', 'superadmin'];

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: '' },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'landlord' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export { User, USER_ROLES };
export default User;