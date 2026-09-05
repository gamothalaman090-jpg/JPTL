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

export { cloudinary };
