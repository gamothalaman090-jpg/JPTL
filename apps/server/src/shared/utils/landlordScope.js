export function getLandlordScopeId(user) {
  return user?.role === 'staff' ? (user.landlord || user.landlordId) : (user?._id || user?.id);
}
