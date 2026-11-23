/**
 * calculateExpiry — Utility to calculate date expiration and urgency metrics.
 *
 * @param {string|Date} expiryDate
 * @returns {Object} { isExpired, daysRemaining, status: 'expired' | 'critical' | 'warning' | 'valid', formattedDate }
 */
export function calculateExpiry(expiryDate) {
  if (!expiryDate) {
    return {
      isExpired: false,
      daysRemaining: null,
      status: 'valid',
      formattedDate: '—',
    };
  }

  const expiry = new Date(expiryDate);
  const now = new Date();

  // Reset hours to compare pure calendar dates
  expiry.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = daysRemaining < 0;

  let status = 'valid';
  if (isExpired) {
    status = 'expired';
  } else if (daysRemaining <= 15) {
    status = 'critical';
  } else if (daysRemaining <= 30) {
    status = 'warning';
  }

  return {
    isExpired,
    daysRemaining,
    status,
    formattedDate: expiry.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
}

export default calculateExpiry;

