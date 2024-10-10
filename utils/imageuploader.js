const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (filePath, folder) => {
  const options = { folder };

  // Set the resource type as 'auto' so that Cloudinary will detect the type automatically
  options.resource_type = 'auto';

  try {
    // Upload file to CloudASCWFCinary using the file path
    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
