const { useState, useEffect } = React;

function ComplaintForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    location: '',
    image: null
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locationDetails, setLocationDetails] = useState('');
  const [pastComplaints, setPastComplaints] = useState([]);
  const [activeComplaintId, setActiveComplaintId] = useState(null);

  const categories = [
    'Road Maintenance',
    'Water Supply',
    'Electricity',
    'Sanitation',
    'Public Health',
    'Traffic & Transportation',
    'Street Lighting',
    'Parks & Gardens',
    'Building & Construction',
    'Noise Pollution',
    'Cleanliness Target Unit (Dirty Spot)',
    'Garbage Dump',
    'Garbage Vehicle Not Arrived',
    'Burning of Garbage in Open Space',
    'Sweeping Not Done',
    'Dustbins Not Cleaned',
    'Open Defecation',
    'Overflow of Sewerage or Storm Water Drains',
    'Stagnant Water on Road / Open Area',
    'Removal of Dead Animals',
    'Improper Disposal of Fecal Waste / Septage',
    'Blockage in Public Toilet',
    'Unclean Public Toilet',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveComplaintsToStorage = (complaints) => {
    try {
      localStorage.setItem('amcComplaints', JSON.stringify(complaints));
    } catch (error) {
      console.warn('Unable to save complaints to storage', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Progress':
        return 'badge-progress';
      case 'Resolved':
        return 'badge-resolved';
      default:
        return 'badge-pending';
    }
  };

  const toggleComplaintDetails = (id) => {
    setActiveComplaintId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('amcComplaints');
      if (saved) {
        setPastComplaints(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Unable to load past complaints', error);
    }
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      return null;
    }
  };

  const formatExactLocation = (address) => {
    if (!address) return null;
    const area = address.neighbourhood || address.suburb || address.village || address.hamlet || address.locality || address.road;
    const city = address.city || address.town || address.village || address.municipality || address.city_district;
    const district = address.county || address.state_district || address.city_district || address.region;
    const state = address.state;
    const parts = [area, city, district, state].filter(Boolean);
    return parts.join(', ');
  };

  const formatLocationMeta = (address) => {
    if (!address) return '';
    const area = address.neighbourhood || address.suburb || address.village || address.hamlet || address.locality || address.road;
    const city = address.city || address.town || address.village || address.municipality || address.city_district;
    const district = address.county || address.state_district || address.city_district || address.region;
    const state = address.state;
    const lines = [];
    if (area) lines.push(`Area: ${area}`);
    if (city) lines.push(`City: ${city}`);
    if (district) lines.push(`District: ${district}`);
    if (state) lines.push(`State: ${state}`);
    return lines.join(' | ');
  };

  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationStatus('Detecting your current location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        const address = await reverseGeocode(latitude, longitude);
        const locationText = address
          ? formatExactLocation(address)
          : `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
        setLocationDetails(address ? formatLocationMeta(address) : '');

        setFormData((prev) => ({
          ...prev,
          location: locationText
        }));

        setLocationStatus('Live location captured successfully. You can edit it if needed.');
        setLocationLoading(false);
      },
      (error) => {
        let message = 'Unable to detect location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow location access or enter manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Try again.';
        }
        setLocationStatus(message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newComplaint = {
      id: Date.now(),
      category: formData.category,
      subject: formData.subject,
      description: formData.description,
      location: formData.location,
      priority: formData.priority,
      image: formData.image,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const updatedComplaints = [newComplaint, ...pastComplaints];
    setPastComplaints(updatedComplaints);
    saveComplaintsToStorage(updatedComplaints);

    // Simulate API call
    console.log('Complaint submitted:', newComplaint);

    // Show success message
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        subject: '',
        description: '',
        priority: 'medium',
        location: '',
        image: null
      });
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return React.createElement('div', { className: 'complaint-success' },
      React.createElement('div', { className: 'success-icon' }, '✓'),
      React.createElement('h2', null, 'Complaint Submitted Successfully!'),
      React.createElement('p', null, `Your complaint has been registered. Reference number: AMC-${Date.now()}`),
      React.createElement('p', null, 'You will receive an email confirmation shortly.')
    );
  }

  return React.createElement('div', { className: 'complaint-form-container' },
    React.createElement('div', { className: 'complaint-header' },
      React.createElement('h1', null, 'File a Complaint'),
      React.createElement('p', null, 'Report issues in your area to help us serve you better')
    ),

    React.createElement('div', { className: 'complaint-page-grid' },
      // Past Complaints Section
      React.createElement('section', { className: 'past-complaints-section' },
        React.createElement('div', { className: 'section-heading' },
          React.createElement('h2', null, 'Past Registered Complaints'),
          React.createElement('p', null, 'Review your previous submissions and track current status.')
        ),
        pastComplaints.length === 0
          ? React.createElement('div', { className: 'empty-state-card' },
              React.createElement('p', null, 'No past registered complaints yet.'),
              React.createElement('p', null, 'Submit a new complaint in the form on the right.')
            )
          : React.createElement('div', { className: 'complaint-list' },
              pastComplaints.map((complaint) => {
                const isActive = activeComplaintId === complaint.id;
                return React.createElement('div', {
                  key: complaint.id,
                  className: `complaint-card${isActive ? ' expanded' : ''}`,
                  onClick: () => toggleComplaintDetails(complaint.id),
                  role: 'button',
                  tabIndex: 0,
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleComplaintDetails(complaint.id);
                    }
                  },
                  'aria-expanded': isActive
                },
                  React.createElement('div', { className: 'card-header' },
                    React.createElement('div', null,
                      React.createElement('h3', null, complaint.category),
                      React.createElement('p', { className: 'card-subject' }, complaint.subject)
                    ),
                    React.createElement('span', { className: `status-badge ${getStatusBadgeClass(complaint.status)}` }, complaint.status)
                  ),
                  React.createElement('div', { className: 'card-body' },
                    React.createElement('p', { className: 'card-location' }, complaint.location),
                    React.createElement('p', { className: 'card-meta' }, new Date(complaint.createdAt).toLocaleDateString())
                  ),
                  isActive && React.createElement('div', { className: 'card-details' },
                    React.createElement('p', null, complaint.description),
                    React.createElement('p', { className: 'card-meta' }, `Priority: ${complaint.priority}`),
                    complaint.image && React.createElement('div', { className: 'complaint-image' },
                      React.createElement('img', { src: complaint.image, alt: 'Complaint', style: { maxWidth: '100%', maxHeight: '300px' } })
                    )
                  )
                );
              })
            )
      ),

      // New Complaint Section
      React.createElement('section', { className: 'new-complaint-section' },
        React.createElement('div', { className: 'section-heading' },
          React.createElement('h2', null, 'New Registered Complaint'),
          React.createElement('p', null, 'Fill out the complaint form below to submit a new issue.')
        ),
        React.createElement('form', { className: 'complaint-form', onSubmit: handleSubmit },
          React.createElement('div', { className: 'form-row' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { htmlFor: 'name' }, 'Full Name *'),
              React.createElement('input', {
                type: 'text',
                id: 'name',
                name: 'name',
                value: formData.name,
                onChange: handleChange,
                className: errors.name ? 'error' : '',
                placeholder: 'Enter your full name'
              }),
              errors.name && React.createElement('span', { className: 'error-message' }, errors.name)
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { htmlFor: 'email' }, 'Email Address *'),
              React.createElement('input', {
                type: 'email',
                id: 'email',
                name: 'email',
                value: formData.email,
                onChange: handleChange,
                className: errors.email ? 'error' : '',
                placeholder: 'your.email@example.com'
              }),
              errors.email && React.createElement('span', { className: 'error-message' }, errors.email)
            )
          ),
          React.createElement('div', { className: 'form-row' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { htmlFor: 'phone' }, 'Phone Number *'),
              React.createElement('input', {
                type: 'tel',
                id: 'phone',
                name: 'phone',
                value: formData.phone,
                onChange: handleChange,
                className: errors.phone ? 'error' : '',
                placeholder: '+91 XXXXX XXXXX'
              }),
              errors.phone && React.createElement('span', { className: 'error-message' }, errors.phone)
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { htmlFor: 'priority' }, 'Priority Level'),
              React.createElement('select', {
                id: 'priority',
                name: 'priority',
                value: formData.priority,
                onChange: handleChange
              },
                React.createElement('option', { value: 'low' }, 'Low'),
                React.createElement('option', { value: 'medium' }, 'Medium'),
                React.createElement('option', { value: 'high' }, 'High'),
                React.createElement('option', { value: 'urgent' }, 'Urgent')
              )
            )
          ),
          React.createElement('div', { className: 'form-row' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { htmlFor: 'category' }, 'Complaint Category *'),
              React.createElement('select', {
                id: 'category',
                name: 'category',
                value: formData.category,
                onChange: handleChange,
                className: errors.category ? 'error' : ''
              },
                React.createElement('option', { value: '' }, 'Select a category'),
                categories.map((cat) => React.createElement('option', { key: cat, value: cat }, cat))
              ),
              errors.category && React.createElement('span', { className: 'error-message' }, errors.category)
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { htmlFor: 'subject' }, 'Subject *'),
              React.createElement('input', {
                type: 'text',
                id: 'subject',
                name: 'subject',
                value: formData.subject,
                onChange: handleChange,
                className: errors.subject ? 'error' : '',
                placeholder: 'Brief subject of complaint'
              }),
              errors.subject && React.createElement('span', { className: 'error-message' }, errors.subject)
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { htmlFor: 'description' }, 'Description *'),
            React.createElement('textarea', {
              id: 'description',
              name: 'description',
              value: formData.description,
              onChange: handleChange,
              className: errors.description ? 'error' : '',
              placeholder: 'Describe the issue in detail...',
              rows: '5'
            }),
            errors.description && React.createElement('span', { className: 'error-message' }, errors.description)
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', null, 'Location *'),
            React.createElement('div', { className: 'location-section' },
              React.createElement('input', {
                type: 'text',
                name: 'location',
                value: formData.location,
                onChange: handleChange,
                className: errors.location ? 'error' : '',
                placeholder: 'Enter location or click "Detect Location"'
              }),
              React.createElement('button', {
                type: 'button',
                className: `location-btn ${locationLoading ? 'loading' : ''}`,
                onClick: fetchLocation,
                disabled: locationLoading
              },
                React.createElement('i', { className: 'fas fa-location-dot' }),
                locationLoading ? ' Detecting...' : ' Detect Location'
              )
            ),
            locationStatus && React.createElement('div', { className: `location-status ${locationStatus.includes('denied') || locationStatus.includes('Unable') ? 'location-error' : ''}` }, locationStatus),
            locationDetails && React.createElement('div', { className: 'location-meta' }, locationDetails),
            errors.location && React.createElement('span', { className: 'error-message' }, errors.location)
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { htmlFor: 'file-upload' }, 'Upload Image (Optional)'),
            React.createElement('input', {
              type: 'file',
              id: 'file-upload',
              accept: 'image/*',
              onChange: handleImageChange,
              style: { display: 'none' }
            }),
            React.createElement('button', {
              type: 'button',
              className: 'upload-btn',
              onClick: () => document.getElementById('file-upload').click()
            },
              React.createElement('i', { className: 'fas fa-cloud-arrow-up' }),
              ' Choose Image'
            ),
            formData.image && React.createElement('div', { className: 'image-preview' },
              React.createElement('div', { className: 'image-item' },
                React.createElement('img', { src: formData.image, alt: 'Preview' }),
                React.createElement('button', {
                  type: 'button',
                  className: 'remove-image',
                  onClick: () => setFormData(prev => ({ ...prev, image: null }))
                }, '×')
              )
            )
          ),
          React.createElement('div', { className: 'form-actions' },
            React.createElement('button', { type: 'submit', className: 'btn-primary' },
              'Submit Complaint'
            ),
            React.createElement('button', {
              type: 'button',
              className: 'btn-secondary',
              onClick: () => {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  category: '',
                  subject: '',
                  description: '',
                  priority: 'medium',
                  location: '',
                  image: null
                });
                setErrors({});
              }
            },
              'Clear Form'
            )
          )
        )
      )
    )
  );
}

// Render the component
const root = ReactDOM.createRoot(document.getElementById('complaint-root'));
root.render(React.createElement(ComplaintForm));
