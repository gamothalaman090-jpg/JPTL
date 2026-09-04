import Vendor from '../../../shared/models/vendor.model.js';

export async function getLandlordVendors(landlordId, query = {}) {
  const filter = { landlord: landlordId };
  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }
  if (query.search?.trim()) {
    const s = query.search.trim();
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { company: { $regex: s, $options: 'i' } },
      { contactPerson: { $regex: s, $options: 'i' } },
    ];
  }

  const vendors = await Vendor.find(filter).sort({ name: 1 }).lean();
  return vendors;
}

export async function createVendor(landlordId, data) {
  const { name, category, contactPhone, email, company, contactPerson, autoAssign, rating, notes } = data;

  if (!name?.trim() || !category || !contactPhone?.trim()) {
    const error = new Error('Vendor name, category, and contactPhone are required');
    error.statusCode = 400;
    throw error;
  }

  const vendor = await Vendor.create({
    landlord: landlordId,
    name: name.trim(),
    category,
    contactPhone: contactPhone.trim(),
    email: email?.trim() || '',
    company: company?.trim() || '',
    contactPerson: contactPerson?.trim() || '',
    autoAssign: Boolean(autoAssign),
    rating: rating !== undefined ? Number(rating) : 5.0,
    notes: notes?.trim() || '',
  });

  return vendor;
}

export async function updateVendor(landlordId, vendorId, data) {
  const vendor = await Vendor.findOne({ _id: vendorId, landlord: landlordId });
  if (!vendor) {
    const error = new Error('Vendor not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  if (data.name !== undefined) vendor.name = data.name.trim();
  if (data.category !== undefined) vendor.category = data.category;
  if (data.contactPhone !== undefined) vendor.contactPhone = data.contactPhone.trim();
  if (data.email !== undefined) vendor.email = data.email.trim();
  if (data.company !== undefined) vendor.company = data.company.trim();
  if (data.contactPerson !== undefined) vendor.contactPerson = data.contactPerson.trim();
  if (data.autoAssign !== undefined) vendor.autoAssign = Boolean(data.autoAssign);
  if (data.rating !== undefined) vendor.rating = Number(data.rating);
  if (data.notes !== undefined) vendor.notes = data.notes.trim();

  await vendor.save();
  return vendor;
}

export async function deleteVendor(landlordId, vendorId) {
  const result = await Vendor.findOneAndDelete({ _id: vendorId, landlord: landlordId });
  if (!result) {
    const error = new Error('Vendor not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return { success: true, message: 'Vendor deleted successfully' };
}
