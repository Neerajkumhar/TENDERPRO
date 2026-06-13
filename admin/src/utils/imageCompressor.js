export const compressImage = (file, maxSizeMB = 4) => {
  return new Promise((resolve) => {
    // Only compress images
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }
    
    // If the file is already small, don't compress
    if (file.size <= maxSizeMB * 1024 * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if image is extremely large to avoid memory issues and speed up compression
        const maxDimension = 2048;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        const getBlob = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }
              if (blob.size > maxSizeMB * 1024 * 1024 && q > 0.1) {
                getBlob(q - 0.15);
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: file.type || 'image/jpeg',
                  lastModified: Date.now()
                });
                console.log(`Compressed image from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedFile);
              }
            },
            file.type || 'image/jpeg',
            q
          );
        };
        getBlob(quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
