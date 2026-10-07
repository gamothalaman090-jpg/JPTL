import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure and return Cloudinary instance if credentials are set in environment
 */
export function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return cloudinary;
  }
  return null;
}

/**
 * Upload a file buffer to Cloudinary (or return simulated secure URL if credentials not set)
 */
export async function uploadDocumentToCloudinary(fileBuffer, originalName = 'document.pdf', folder = 'jptl_compliance_vault') {
  const client = getCloudinaryClient();

  if (!client) {
    // Graceful fallback for development / test environments without Cloudinary
    const cleanName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const timestamp = Date.now();
    return {
      secure_url: `https://res.cloudinary.com/demo/image/upload/v${timestamp}/jptl_vault/${cleanName}`,
      public_id: `jptl_vault/${cleanName}_${timestamp}`,
      bytes: fileBuffer ? fileBuffer.length : 1450000,
      format: originalName.split('.').pop() || 'pdf',
      isSimulated: true,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload a maintenance ticket photo buffer to Cloudinary.
 * Falls back to a demo URL when credentials are missing (dev / CI).
 */
export async function uploadTicketPhotoToCloudinary(fileBuffer, originalName = 'photo.jpg') {
  const client = getCloudinaryClient();
  const folder = 'jptl_maintenance_photos';

  if (!client) {
    const cleanName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ts = Date.now();
    return {
      secure_url: `https://res.cloudinary.com/demo/image/upload/v${ts}/${folder}/${cleanName}`,
      public_id: `${folder}/${cleanName}_${ts}`,
      bytes: fileBuffer ? fileBuffer.length : 0,
      format: originalName.split('.').pop() || 'jpg',
      isSimulated: true,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_')}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload a user avatar photo buffer to Cloudinary with face-centering and optimization.
 */
export async function uploadAvatarToCloudinary(fileBuffer, originalName = 'avatar.jpg', userId = '') {
  const client = getCloudinaryClient();
  const folder = 'jptl_avatars';

  if (!client) {
    const cleanName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ts = Date.now();
    return {
      secure_url: `https://res.cloudinary.com/demo/image/upload/v${ts}/${folder}/${cleanName}`,
      public_id: `${folder}/${cleanName}_${ts}`,
      bytes: fileBuffer ? fileBuffer.length : 0,
      format: originalName.split('.').pop() || 'jpg',
      isSimulated: true,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: `avatar_${userId || Date.now()}`,
        overwrite: true,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

/** Upload payment assets; tenant evidence uses authenticated Cloudinary delivery. */
export async function uploadPaymentAssetToCloudinary(fileBuffer, originalName, { privateAsset = false, folder = 'jptl_payment_assets' } = {}) {
  const client = getCloudinaryClient();
  const safeName = String(originalName || 'payment-file').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const extension = String(originalName || '').split('.').pop()?.toLowerCase() || '';
  if (!client) {
    throw new Error('Payment file storage is not configured. Configure Cloudinary before accepting QR images or payment receipts.');
  }
  return new Promise((resolve, reject) => {
    client.uploader.upload_stream({
      folder,
      resource_type: 'auto',
      type: privateAsset ? 'authenticated' : 'upload',
      public_id: `${Date.now()}_${safeName}`,
      overwrite: false,
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }).end(fileBuffer);
  });
}

export async function getPrivatePaymentAssetUrl(publicId, format, resourceType = 'image') {
  const client = getCloudinaryClient();
  if (!client) return null;
  const downloadUrl = client.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: 'authenticated',
  });
  return downloadUrl;
}

export { cloudinary };
