import * as onboardingService from './onboarding.service.js';

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
}

export async function getStatus(req, res) {
  try {
    const landlordId = req.user.id;
    const data = await onboardingService.getOnboardingStatus(landlordId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function savePlan(req, res) {
  try {
    const landlordId = req.user.id;
    const { plan } = req.body;
    const ipAddress = getClientIp(req);
    const data = await onboardingService.updatePlan(landlordId, plan, ipAddress);
    return res.status(200).json({ success: true, message: 'Portfolio plan updated', data });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function addProperty(req, res) {
  try {
    const landlordId = req.user.id;
    const ipAddress = getClientIp(req);
    const property = await onboardingService.createProperty(landlordId, req.body, ipAddress);
    return res.status(201).json({ success: true, message: 'Property created', data: property });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function addUnit(req, res) {
  try {
    const landlordId = req.user.id;
    const ipAddress = getClientIp(req);
    const unit = await onboardingService.createUnit(landlordId, req.body, ipAddress);
    return res.status(201).json({ success: true, message: 'Unit created', data: unit });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function addTenant(req, res) {
  try {
    const landlordId = req.user.id;
    const ipAddress = getClientIp(req);
    const tenant = await onboardingService.createTenant(landlordId, req.body, ipAddress);
    return res.status(201).json({
      success: true,
      message: 'Tenant pre-registered successfully',
      data: tenant,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function postAnnouncement(req, res) {
  try {
    const landlordId = req.user.id;
    const ipAddress = getClientIp(req);
    const announcement = await onboardingService.createWelcomeAnnouncement(landlordId, req.body, ipAddress);
    return res.status(201).json({
      success: true,
      message: 'Welcome announcement published',
      data: announcement,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function completeOnboarding(req, res) {
  try {
    const landlordId = req.user.id;
    const ipAddress = getClientIp(req);
    const result = await onboardingService.completeFullOnboarding(landlordId, req.body, ipAddress);
    return res.status(200).json({
      success: true,
      message: 'Landlord onboarding completed successfully',
      data: result,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
