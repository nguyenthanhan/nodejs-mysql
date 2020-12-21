let cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let self = (module.exports = {
  uploadSingle: (file, folder = 'singleV1.0.0', width = 500, height = 500) => {
    return new Promise(resolve => {
      cloudinary.uploader
        .upload(file, {
          folder: folder,
          width: width,
          height: height,
          crop: 'pad',
          quality: 'auto',
        })
        .then(result => {
          if (result) {
            const fs = require('fs');
            fs.unlinkSync(file);
            resolve({
              url: result.secure_url,
            });
          }
        });
    });
  },
  uploadMultiple: file => {
    return new Promise(resolve => {
      cloudinary.uploader
        .upload(file, {
          folder: 'home',
        })
        .then(result => {
          if (result) {
            const fs = require('fs');
            fs.unlinkSync(file);
            resolve({
              url: result.secure_url,
              id: result.public_id,
              thumb1: self.reSizeImage(result.public_id, 200, 200),
              main: self.reSizeImage(result.public_id, 500, 500),
              thumb2: self.reSizeImage(result.public_id, 300, 300),
            });
          }
        });
    });
  },
  reSizeImage: (id, h, w) => {
    return cloudinary.url(id, {
      height: h,
      width: w,
      crop: 'scale',
    });
  },
});
