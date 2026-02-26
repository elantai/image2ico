export async function convertToIco(file: File, sizes: number[]): Promise<Blob> {
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const pngBuffers: ArrayBuffer[] = [];
  
  for (const size of sizes) {
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    
    // Smooth scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, 0, 0, size, size);
    
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to create PNG');
    
    const buffer = await blob.arrayBuffer();
    pngBuffers.push(buffer);
  }

  const headerSize = 6;
  const directorySize = 16 * sizes.length;
  let offset = headerSize + directorySize;
  
  const totalSize = offset + pngBuffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);
  const uint8View = new Uint8Array(icoBuffer);

  // Header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type (1 = ICO)
  view.setUint16(4, sizes.length, true); // Number of images

  // Directory
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const buffer = pngBuffers[i];
    const dirOffset = headerSize + (i * 16);
    
    view.setUint8(dirOffset, size === 256 ? 0 : size); // Width
    view.setUint8(dirOffset + 1, size === 256 ? 0 : size); // Height
    view.setUint8(dirOffset + 2, 0); // Color count
    view.setUint8(dirOffset + 3, 0); // Reserved
    view.setUint16(dirOffset + 4, 1, true); // Color planes
    view.setUint16(dirOffset + 6, 32, true); // Bits per pixel
    view.setUint32(dirOffset + 8, buffer.byteLength, true); // Image size
    view.setUint32(dirOffset + 12, offset, true); // Image offset
    
    // Copy PNG data
    uint8View.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}
