async function loadImage(src) {
  const image = new Image();
  image.src = src;
  await new Promise((resolve, reject) => {
    if (image.complete && image.naturalWidth) return resolve();
    image.onload = resolve;
    image.onerror = () => reject(new Error('RallyHub could not read that image. Please try a JPG, PNG or WebP file.'));
  });
  return image;
}

export async function prepareEventLogoDraft(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Please choose an image file for the club logo.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Club logo must be 5 MB or smaller.');
  const originalUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(originalUrl);
    const scanMax = 600;
    const scanScale = Math.min(1, scanMax / image.naturalWidth, scanMax / image.naturalHeight);
    const scanWidth = Math.max(1, Math.round(image.naturalWidth * scanScale));
    const scanHeight = Math.max(1, Math.round(image.naturalHeight * scanScale));
    const scan = document.createElement('canvas');
    scan.width = scanWidth;
    scan.height = scanHeight;
    const scanCtx = scan.getContext('2d', { willReadFrequently: true });
    scanCtx.clearRect(0, 0, scanWidth, scanHeight);
    scanCtx.drawImage(image, 0, 0, scanWidth, scanHeight);
    const pixels = scanCtx.getImageData(0, 0, scanWidth, scanHeight).data;
    const pixelAt = (x, y) => {
      const i = (y * scanWidth + x) * 4;
      return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
    };
    const corners = [pixelAt(0, 0), pixelAt(scanWidth - 1, 0), pixelAt(0, scanHeight - 1), pixelAt(scanWidth - 1, scanHeight - 1)];
    const nearWhite = ([r, g, b, a]) => a > 220 && r > 240 && g > 240 && b > 240;
    const transparent = ([, , , a]) => a < 24;
    const trimTransparent = corners.filter(transparent).length >= 3;
    const trimWhite = !trimTransparent && corners.filter(nearWhite).length >= 3;
    let minX = scanWidth, minY = scanHeight, maxX = -1, maxY = -1;
    if (trimTransparent || trimWhite) {
      for (let y = 0; y < scanHeight; y += 1) {
        for (let x = 0; x < scanWidth; x += 1) {
          const i = (y * scanWidth + x) * 4;
          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
          const background = trimTransparent ? a < 24 : (a > 220 && r > 240 && g > 240 && b > 240);
          if (!background) {
            minX = Math.min(minX, x); minY = Math.min(minY, y);
            maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          }
        }
      }
    }
    const foundContent = maxX >= minX && maxY >= minY;
    if (!foundContent) return { file, url: originalUrl, width:image.naturalWidth, height:image.naturalHeight, zoom:1, offsetX:0, offsetY:0, autoTrimmed:false };

    const pad = Math.max(2, Math.round(Math.max(maxX - minX + 1, maxY - minY + 1) * 0.025));
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
    maxX = Math.min(scanWidth - 1, maxX + pad); maxY = Math.min(scanHeight - 1, maxY + pad);
    const cropX = Math.floor(minX / scanScale);
    const cropY = Math.floor(minY / scanScale);
    const cropWidth = Math.min(image.naturalWidth - cropX, Math.ceil((maxX - minX + 1) / scanScale));
    const cropHeight = Math.min(image.naturalHeight - cropY, Math.ceil((maxY - minY + 1) / scanScale));
    const maxPrepared = 1400;
    const preparedScale = Math.min(1, maxPrepared / cropWidth, maxPrepared / cropHeight);
    const preparedWidth = Math.max(1, Math.round(cropWidth * preparedScale));
    const preparedHeight = Math.max(1, Math.round(cropHeight * preparedScale));
    const prepared = document.createElement('canvas');
    prepared.width = preparedWidth;
    prepared.height = preparedHeight;
    const preparedCtx = prepared.getContext('2d');
    preparedCtx.clearRect(0, 0, preparedWidth, preparedHeight);
    preparedCtx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, preparedWidth, preparedHeight);
    const preparedBlob = await new Promise((resolve, reject) => prepared.toBlob(value => value ? resolve(value) : reject(new Error('Could not prepare the logo image.')), 'image/png'));
    URL.revokeObjectURL(originalUrl);
    const preparedUrl = URL.createObjectURL(preparedBlob);
    return { file, url:preparedUrl, width:preparedWidth, height:preparedHeight, zoom:1, offsetX:0, offsetY:0, autoTrimmed:true };
  } catch (error) {
    URL.revokeObjectURL(originalUrl);
    throw error;
  }
}

export async function prepareEventLogoDraftFromUrl(url, filename='club-logo') {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not reload the current logo for editing.');
  const blob = await response.blob();
  const type = blob.type?.startsWith('image/') ? blob.type : 'image/png';
  const ext = type.includes('jpeg') ? 'jpg' : type.split('/')[1] || 'png';
  return prepareEventLogoDraft(new File([blob], `${filename}.${ext}`, { type }));
}

export async function renderPositionedEventLogo(draft, filename='club-logo') {
  if (!draft?.url) throw new Error('No logo is ready to position.');
  const image = await loadImage(draft.url);
  const size = 800;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  const baseScale = Math.min((size * 0.88) / image.naturalWidth, (size * 0.88) / image.naturalHeight);
  const scale = baseScale * Number(draft.zoom || 1);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (size - drawWidth) / 2 + (Number(draft.offsetX || 0) / 100) * (size / 2);
  const drawY = (size - drawHeight) / 2 + (Number(draft.offsetY || 0) / 100) * (size / 2);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not prepare the positioned logo.')), 'image/webp', 0.9));
  return new File([blob], `${filename}.webp`, { type:blob.type || 'image/webp' });
}
