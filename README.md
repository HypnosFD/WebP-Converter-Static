# WebP Converter - GitHub Pages

🎨 **100% Client-Side WebP Converter** - No uploads, complete privacy!

## Features

- ✅ **Single Image Conversion** - Convert one image with before/after comparison
- ✅ **Batch Conversion** - Convert multiple images at once
- ✅ **Quality Control** - Adjust quality (1-100) or use lossless mode
- ✅ **ZIP Download** - Download all converted images as a single ZIP file
- ✅ **Privacy First** - Everything runs in your browser, no server uploads
- ✅ **Cross-Platform** - Works on Windows, Mac, Linux, and mobile devices

## How It Works

This tool uses **WebAssembly** to encode WebP images directly in your browser:

- Images are processed locally on your device
- No files are uploaded to any server
- All conversions happen client-side using `@jsquash/webp`

## Usage

### Single Image Mode

1. Click "Single Image"
2. Upload or drag & drop a JPG/PNG image
3. Adjust quality settings if needed
4. View the before/after comparison
5. Download the WebP image

### Batch Mode

1. Click "Batch Convert"
2. Select multiple JPG/PNG images
3. Wait for conversion to complete
4. Download individual files or all as ZIP

## Technologies

- **WebAssembly** - `@jsquash/webp` for WebP encoding
- **JSZip** - For creating ZIP archives
- **Vanilla JavaScript** - No frameworks, pure performance
- **Modern CSS** - Beautiful, responsive design

## Deployment

This is a static site that can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Simply upload the `github-pages` folder contents to your hosting provider.

## Local Testing

Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).

## Browser Support

Works in all modern browsers that support:

- WebAssembly
- Canvas API
- File API
- Blob API

## License

MIT License - Feel free to use and modify!

---

Made with ❤️ using WebAssembly
