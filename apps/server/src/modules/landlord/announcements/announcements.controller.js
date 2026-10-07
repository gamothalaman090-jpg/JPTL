import * as announcementService from './announcements.service.js';
import { getLandlordScopeId } from '../../../shared/utils/landlordScope.js';

export async function createAnnouncement(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const announcement = await announcementService.createAnnouncement(landlordId, req.body);
    return res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getMyAnnouncements(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const announcements = await announcementService.getLandlordAnnouncements(landlordId, req.query);
    return res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const landlordId = req.user.id;
    const result = await announcementService.deleteLandlordAnnouncement(landlordId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
