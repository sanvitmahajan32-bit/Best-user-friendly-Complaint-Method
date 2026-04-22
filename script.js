// Wait for the entire HTML document to load
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader-container");
    const mainContent = document.getElementById("main-content");

    if (!loader) return;

    setTimeout(() => {
        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.display = "none";
            if (mainContent) {
                mainContent.style.display = "block";
            }
        }, 500);
    }, 3000);
});

/* ------------------------------------------------------------------------- */
// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    
    const navbar = document.getElementById('navbar');

    // Add a shadow effect to the navbar when the user scrolls down
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            // Add class if scrolled past 20px
            navbar.classList.add('scrolled');
        } else {
            // Remove class if at the top
            navbar.classList.remove('scrolled');
        }
    });

    // Optional: Add a subtle staggered entrance animation for dropdown items
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', () => {
            const menuItems = dropdown.querySelectorAll('.dropdown-menu li');
            menuItems.forEach((item, index) => {
                // Reset inline styles first
                item.style.opacity = '0';
                item.style.transform = 'translateX(-10px)';
                
                // Stagger the animation using setTimeout
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 50); // 50ms delay for each subsequent item
            });
        });
    });
});
/* ------------------------------------------------------------------------- */
let slideIndex = 1;
let slideInterval;
let isPaused = false;

// Initialize Slideshow
showSlides(slideIndex);
startAutoSlide();

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
  resetTimer();
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
  resetTimer();
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

// Automatic Timer Logic
function startAutoSlide() {
    slideInterval = setInterval(() => {
        plusSlides(1);
    }, 5000); // Changes slide every 5 seconds
}

function resetTimer() {
    if (!isPaused) {
        clearInterval(slideInterval);
        startAutoSlide();
    }
}

// Play/Pause Functionality
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');

playPauseBtn.addEventListener('click', () => {
    if (isPaused) {
        startAutoSlide();
        playPauseIcon.classList.replace('fa-play', 'fa-pause');
        isPaused = false;
    } else {
        clearInterval(slideInterval);
        playPauseIcon.classList.replace('fa-pause', 'fa-play');
        isPaused = true;
    }
});
/* ------------------------------------------------------------------------- */
// script.js - Performance Optimized Version
document.addEventListener('DOMContentLoaded', () => {
    const tickerTrack = document.querySelector('.ticker-track');
    const toggleBtn = document.getElementById('toggleBtn');
    
    // Safety check: ensure elements exist before running logic
    if (!tickerTrack || !toggleBtn) return;

    let isPaused = false;

    // Use a single optimized function for the toggle
    const toggleTicker = () => {
        isPaused = !isPaused;
        tickerTrack.style.animationPlayState = isPaused ? 'paused' : 'running';
        toggleBtn.innerText = isPaused ? 'II' : '▶';
        
        // Add a small accessibility hint
        toggleBtn.setAttribute('aria-label', isPaused ? 'Play updates' : 'Pause updates');
    };

    toggleBtn.addEventListener('click', toggleTicker);

    // Optional: Only log in development to keep the console clean
    // console.log("Ticker active and non-blocking.");
});
/* ------------------------------------------------------------------------- */
const updateData = {
    new: [
        "Participate Amravati - Civic Engagement & CSR Facilitation Initiative",
        "बाह्य जाहिरातीची प्रदर्शित करण्याची मार्गदर्शक तत्त्वे २०२४",
        "List of Contesting Candidates : AMC Election",
        "AMC Election Helpline: 9619512847 / 022-22754028",
        "MCC Cell Helpline: 9619512251 / 022-22754001"
    ],
    media: [
        "Press Release: Monsoon Preparedness 2026",
        "AMC Commissioner's Address to Media",
        "Amravati Beautification Project Gallery"
    ],
    focus: [
        "Coastal Road Project Updates",
        "New Water Pipeline Project - Kathora",
        "Zero Waste Slum Initiative"
    ],
    popular: [
        "Apply for Birth Certificate Online",
        "Property Tax Payment Portal",
        "Tree Plantation Drive 2026"
    ]
};

const tabButtons = document.querySelectorAll('.tab-btn');
const contentContainer = document.getElementById('update-list');

function renderUpdates(category) {
    const items = updateData[category];
    contentContainer.innerHTML = items.map(text => `
        <div class="update-item">
            <span>${text}</span>
            <span class="badge-new">New</span>
        </div>
    `).join('');
}

// Initial Render
renderUpdates('new');

// Tab Click Event
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add to clicked
        button.classList.add('active');
        
        // Render content
        const tabKey = button.getAttribute('data-tab');
        renderUpdates(tabKey);
    });
});

/* ------------------------------------------------------------------------- */
// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    
    // Select all the link cards
    const buttons = document.querySelectorAll('.link-card');

    buttons.forEach(button => {
        button.addEventListener('mousedown', function (e) {
            // Get the exact coordinates of the element
            const rect = this.getBoundingClientRect();
            
            // Calculate where the click happened inside the element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Create a span element for the ripple
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            // Position the ripple where the click occurred
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // Make the ripple large enough to cover the button
            const diameter = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${diameter}px`;
            
            // Center the ripple span on the click coordinate
            ripple.style.marginLeft = `${-diameter / 2}px`;
            ripple.style.marginTop = `${-diameter / 2}px`;

            // Append the ripple to the button
            this.appendChild(ripple);

            // Remove the ripple element from the DOM after the animation completes (600ms)
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});
/* ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('#pmc-portal-wrapper .official-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        
        setTimeout(() => {
            card.style.transition = "all 0.6s ease-out";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 200);
    });
});
/* ------------------------------------------------------------------------- */
const API_KEY = '0f5d96235a244a07a4493234261404';
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');

async function fetchWeather(city) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=yes`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        alert(error.message);
    }
}

function updateUI(data) {
    const weatherContent = document.getElementById('weatherContent');
    
    // Update Main Display
    weatherContent.innerHTML = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <div class="skycast-date">${data.location.localtime}</div>
        <img src="${data.current.condition.icon}" alt="icon" width="80">
        <div class="skycast-temp">${Math.round(data.current.temp_c)}°C</div>
        <div class="skycast-condition">${data.current.condition.text}</div>
    `;

    // Update Metrics
    document.getElementById('humidity').innerText = `${data.current.humidity}%`;
    document.getElementById('windSpeed').innerText = `${data.current.wind_kph} km/h`;
    document.getElementById('uvIndex').innerText = data.current.uv;
    
    // US-EPA Air Quality Index
    const aqi = data.current.air_quality["us-epa-index"];
    document.getElementById('aqiIndex').innerText = aqi;
}

searchBtn.addEventListener('click', () => {
    if (cityInput.value) fetchWeather(cityInput.value);
});

// Allow 'Enter' key to search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather(cityInput.value);
});

// Default Load
window.onload = () => fetchWeather('Amravati');

/* ------------------------------------------------------------------------- */
// Function to add a slight float effect on mouse move
const bmcCards = document.querySelectorAll('.bmc-card');

bmcCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xRotation = ((y - rect.height / 2) / rect.height) * 10;
        const yRotation = ((x - rect.width / 2) / rect.width) * -10;
        
        card.style.transform = `perspective(1000px) scale(1.02) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
    });
});

// Chatbot button feedback
const connectBtn = document.getElementById('bmc-connectBtn');
if(connectBtn) {
    connectBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevents card click event
        this.textContent = "Connecting...";
        setTimeout(() => {
            alert("Chat session started!");
            this.innerHTML = `<span>Click to connect</span><svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`;
        }, 1000);
    });
}
/* ------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Dynamic Number Counter Animation ---
    const counterElement = document.getElementById('visitor-count');
    const targetNumber = parseInt(counterElement.getAttribute('data-target'), 10);
    
    // Formatting function to add commas to the number (Indian Numbering System format roughly, or standard locale)
    const formatNumber = (num) => {
        return num.toLocaleString('en-IN'); 
    };

    let currentNumber = 0;
    // We want the animation to take about 2 seconds
    const duration = 2000; 
    const frameRate = 30; // ms per frame
    const totalFrames = Math.round(duration / frameRate);
    const increment = targetNumber / totalFrames;

    // Use IntersectionObserver to start counting only when the footer comes into view
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counterInterval = setInterval(() => {
                    currentNumber += increment;
                    if (currentNumber >= targetNumber) {
                        counterElement.innerText = formatNumber(targetNumber);
                        clearInterval(counterInterval);
                    } else {
                        counterElement.innerText = formatNumber(Math.floor(currentNumber));
                    }
                }, frameRate);
                
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the visitor box is visible

    observer.observe(counterElement);

    // --- 2. Back to Top Button Functionality ---
    const backToTopBtn = document.getElementById("backToTop");

    backToTopBtn.addEventListener("click", () => {
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // Optional: Hide back to top button when at the absolute top of the page
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    });
});
/* ------------------------------------------------------------------------- */
