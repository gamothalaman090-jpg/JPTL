import mongoose from 'mongoose';

const ANNOUNCEMENT_CATEGORIES = ['System', 'Maintenance', 'Policy', 'General'];

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ANNOUNCEMENT_CATEGORIES,
      default: 'General',
    },
    isPinned: { type: Boolean, default: false },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export { Announcement, ANNOUNCEMENT_CATEGORIES };
export default Announcement;