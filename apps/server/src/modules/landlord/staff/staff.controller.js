import * as staffService from './staff.service.js';

export async function listStaff(req, res) {
  try {
    const staff = await staffService.listStaff(req.user.id);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

export async function inviteStaff(req, res) {
  try {
    const staff = await staffService.inviteStaff(req.user.id, req.body);
    return res.status(201).json({ success: true, data: staff });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

export async function deactivateStaff(req, res) {
  try {
    const staff = await staffService.deactivateStaff(req.user.id, req.params.id);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}
