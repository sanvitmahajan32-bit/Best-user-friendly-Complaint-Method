# Complaint System

This folder contains a React-based complaint filing system for the Amravati Municipal Corporation website.

## Features

- **Interactive Form**: Built with React for a modern, responsive user experience
- **Form Validation**: Client-side validation with error messages
- **Multiple Categories**: Support for various complaint types (Road Maintenance, Water Supply, etc.)
- **Priority Levels**: Low, Medium, High, and Urgent priority options
- **Image Upload**: Drag & drop or browse to upload up to 5 images (JPG, PNG, GIF, max 5MB each)
- **Location Detection**: Auto-detect current location using GPS or manual entry
- **Success Feedback**: Confirmation message with reference number after submission
- **Responsive Design**: Works on desktop and mobile devices

## New Features Added

### 🖼️ Image Upload
- **Drag & Drop**: Users can drag images directly onto the upload area
- **File Browser**: Click to browse and select multiple files
- **Image Preview**: See thumbnails of uploaded images before submission
- **Validation**: Only accepts JPG, PNG, GIF files under 5MB each
- **Limit**: Maximum 5 images per complaint
- **Remove Images**: Easy removal of selected images

### 📍 Location Detection
- **Auto-Detection**: One-click GPS location detection using browser geolocation API
- **Reverse Geocoding**: Converts coordinates to readable addresses using OpenStreetMap
- **Manual Entry**: Traditional text input for location
- **Fallback**: Shows coordinates if address lookup fails
- **Status Messages**: Real-time feedback during location detection

## Files

- `complaint.html` - Main HTML file with embedded React application
- `ComplaintForm.js` - React component (for reference, not used in current setup)
- `ComplaintForm.css` - CSS styles (embedded in HTML for simplicity)

## Technical Implementation

- **React 18** loaded from CDN for component framework
- **Babel Standalone** for JSX compilation in browser
- **Geolocation API** for GPS location detection
- **OpenStreetMap Nominatim** for reverse geocoding (free API)
- **File API** for image handling and validation
- **Drag & Drop API** for intuitive file uploads
- **CSS-in-JS** styling embedded directly in the HTML

## Usage

1. Access the complaint form via the "File a Complaint" link in the main website
2. Fill out all required fields (* marked)
3. Add images by dragging & dropping or browsing files
4. Set location by typing manually or clicking "Auto Detect" for GPS
5. Select appropriate category and priority
6. Submit the form
7. Receive confirmation with reference number

## Browser Requirements

- **Geolocation**: Modern browsers with GPS/location permission support
- **File API**: Modern browsers for file upload functionality
- **ES6 Support**: React 18 requires modern JavaScript features
- **HTTPS**: Required for geolocation API in most browsers

## Privacy & Security

- **Location Data**: Only collected with explicit user permission
- **Image Storage**: Images are processed client-side only (not stored)
- **No Tracking**: No personal data stored without explicit submission
- **HTTPS Required**: Secure connection needed for geolocation features

## Future Enhancements

- Backend API integration for storing complaints and images
- Image compression for faster uploads
- Complaint tracking system with status updates
- Admin dashboard for complaint management
- Email/SMS notifications for complaint status
- Offline support with service workers
- Advanced image editing (crop, rotate)

## Development

To modify the React component:
1. Edit the JSX code in the `<script type="text/babel">` section
2. Test changes by opening `complaint.html` in a browser
3. For production, consider setting up a proper build system with Webpack

## Browser Support

- Modern browsers with ES6 support
- React 18 requires modern browser features
- Babel handles JSX compilation automatically