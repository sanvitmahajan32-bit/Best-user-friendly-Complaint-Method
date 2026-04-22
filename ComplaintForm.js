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
    return (
      <div className="complaint-success">
        <div className="success-icon">✓</div>
        <h2>Complaint Submitted Successfully!</h2>
        <p>Your complaint has been registered. Reference number: AMC-{Date.now()}</p>
        <p>You will receive an email confirmation shortly.</p>
      </div>
    );
  }

  return (
    <div className="complaint-form-container">
      <div className="complaint-header">
        <h1>File a Complaint</h1>
        <p>Report issues in your area to help us serve you better</p>
      </div>

      <div className="complaint-page-grid">
        <section className="past-complaints-section">
          <div className="section-heading">
            <h2>Past Registered Complaints</h2>
            <p>Review your previous submissions and track current status.</p>
          </div>
          {pastComplaints.length === 0 ? (
            <div className="empty-state-card">
              <p>No past registered complaints yet.</p>
              <p>Submit a new complaint in the form on the right.</p>
            </div>
          ) : (
            <div className="complaint-list">
              {pastComplaints.map((complaint) => {
                const isActive = activeComplaintId === complaint.id;
                return (
                  <div
                    key={complaint.id}
                    className={`complaint-card${isActive ? ' expanded' : ''}`}
                    onClick={() => toggleComplaintDetails(complaint.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleComplaintDetails(complaint.id);
                      }
                    }}
                    aria-expanded={isActive}
                  >
                    <div className="card-header">
                      <div>
                        <h3>{complaint.category}</h3>
                        <p className="card-subject">{complaint.subject}</p>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="card-location">{complaint.location}</p>
                      <p className="card-meta">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    {isActive && (
                      <div className="card-details">
                        <p>{complaint.description}</p>
                        <p className="card-meta">Priority: {complaint.priority}</p>
                        {complaint.image && (
                          <div className="complaint-image">
                            <img src={complaint.image} alt="Complaint" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="new-complaint-section">
          <div className="section-heading">
            <h2>New Registered Complaint</h2>
            <p>Fill out the complaint form below to submit a new issue.</p>
          </div>
          <form className="complaint-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="your.email@example.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="+91 XXXXX XXXXX"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority Level</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Complaint Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location/Area *</label>
          <div className="location-section">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
              placeholder="Street, Area, Landmark"
            />
            <button
              type="button"
              className={`location-btn ${locationLoading ? 'loading' : ''}`}
              onClick={fetchLocation}
              disabled={locationLoading}
            >
              {locationLoading ? 'Detecting...' : 'Detect current location'}
            </button>
          </div>
          {errors.location && <span className="error-message">{errors.location}</span>}
          {locationStatus && (
            <div className={`location-status ${locationStatus.includes('denied') || locationStatus.includes('Unable') || locationStatus.includes('timed out') ? 'location-error' : ''}`}>
              {locationStatus}
            </div>
          )}
          {locationDetails && (
            <div className="location-meta">
              {locationDetails}
            </div>
          )}
          {coords && (
            <div className="location-meta">
              Exact coordinates: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={errors.subject ? 'error' : ''}
            placeholder="Brief description of the issue"
          />
          {errors.subject && <span className="error-message">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            placeholder="Please provide detailed information about the complaint..."
            rows="5"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image (Optional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Submit Complaint
          </button>
        </div>
          </form>
        </section>
      </div>
    </div>
  );
}

// Initialize the React app
const root = ReactDOM.createRoot(document.getElementById('complaint-root'));
root.render(<ComplaintForm />);