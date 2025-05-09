// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      
      // Toggle the hamburger to X
      const spans = this.querySelectorAll('span');
      spans.forEach(span => {
        span.classList.toggle('active');
      });
    });
  }
  
  // Add active class to current page nav link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.endsWith(href)) {
      link.classList.add('active');
    } else if (currentPath === '/' && href === 'index.html') {
      link.classList.add('active');
    }
  });
});

// Scroll animations
window.addEventListener('scroll', function() {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Simple form validation for contact form
if (document.querySelector('#contact-form')) {
  const contactForm = document.querySelector('#contact-form');
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let valid = true;
    const name = document.querySelector('#name');
    const email = document.querySelector('#email');
    const message = document.querySelector('#message');
    
    // Simple validation
    if (!name.value.trim()) {
      showError(name, 'Name is required');
      valid = false;
    } else {
      removeError(name);
    }
    
    if (!email.value.trim()) {
      showError(email, 'Email is required');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      showError(email, 'Please enter a valid email');
      valid = false;
    } else {
      removeError(email);
    }
    
    if (!message.value.trim()) {
      showError(message, 'Message is required');
      valid = false;
    } else {
      removeError(message);
    }
    
    if (valid) {
      // Submit form or show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
      
      contactForm.reset();
      contactForm.appendChild(successMessage);
      
      // Remove message after 5 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 5000);
    }
  });
}

// Form validation helper functions
function showError(input, message) {
  const formGroup = input.closest('.form-group');
  const errorElement = formGroup.querySelector('.error-message') || document.createElement('div');
  
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  if (!formGroup.querySelector('.error-message')) {
    formGroup.appendChild(errorElement);
  }
  
  input.classList.add('error');
}

function removeError(input) {
  const formGroup = input.closest('.form-group');
  const errorElement = formGroup.querySelector('.error-message');
  
  if (errorElement) {
    errorElement.remove();
  }
  
  input.classList.remove('error');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Calendar functionality
if (document.querySelector('#calendar-container')) {
  // Calendar state
  let collectionData = [];
  let currentDate = new Date();
  
  // Fetch collection data for current month and year
  async function fetchCollectionData(month, year) {
    try {
      const loadingHtml = `
        <div class="loading-calendar">
          <p>Loading collection schedule...</p>
        </div>
      `;
      document.querySelector('#calendar-container').innerHTML = loadingHtml;
      
      const response = await fetch(`/api/collections/${year}/${month}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        // Handle error
        console.error('Failed to fetch collection data:', await response.text());
        return [];
      }
    } catch (error) {
      console.error('Error fetching collection data:', error);
      return [];
    }
  }
  
  // Initialize calendar
  async function initCalendar() {
    // Fetch and render initial calendar
    collectionData = await fetchCollectionData(currentDate.getFullYear(), currentDate.getMonth() + 1);
    generateCalendar(currentDate, collectionData);
    
    // Set up month navigation
    const prevMonthBtn = document.querySelector('#prev-month');
    const nextMonthBtn = document.querySelector('#next-month');
    
    if (prevMonthBtn && nextMonthBtn) {
      prevMonthBtn.addEventListener('click', async function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        collectionData = await fetchCollectionData(currentDate.getFullYear(), currentDate.getMonth() + 1);
        generateCalendar(currentDate, collectionData);
      });
      
      nextMonthBtn.addEventListener('click', async function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        collectionData = await fetchCollectionData(currentDate.getFullYear(), currentDate.getMonth() + 1);
        generateCalendar(currentDate, collectionData);
      });
    }
  }
  
  // Generate calendar HTML
  function generateCalendar(date, collections) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Update the month display
    const currentMonthDisplay = document.querySelector('#current-month');
    if (currentMonthDisplay) {
      const options = { month: 'long', year: 'numeric' };
      currentMonthDisplay.textContent = date.toLocaleDateString('en-US', options);
    }
    
    const calendarContainer = document.querySelector('#calendar-container');
    if (!calendarContainer) return;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create table
    let calendarHtml = `
      <table class="waste-calendar">
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Create calendar grid
    let dayCount = 1;
    let calendarRows = '';
    
    // Create weeks (rows)
    for (let i = 0; i < 6; i++) {
      let weekRow = '<tr>';
      
      // Create days (cells)
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          // Empty cells before the first day
          weekRow += '<td></td>';
        } else if (dayCount > daysInMonth) {
          // Empty cells after the last day
          weekRow += '<td></td>';
        } else {
          // Format the date to check for collections
          const currentDayDate = new Date(year, month, dayCount);
          const formattedDate = currentDayDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          // Check if there's a collection for this day
          const todayCollection = collections.find(c => {
            const collectionDate = new Date(c.collectionDate);
            return collectionDate.toISOString().split('T')[0] === formattedDate;
          });
          
          if (todayCollection) {
            weekRow += `
              <td class="collection-day ${todayCollection.type}">
                ${dayCount}
                <div class="collection-info">
                  <small>${todayCollection.type.charAt(0).toUpperCase() + todayCollection.type.slice(1)}</small>
                  <small>${todayCollection.area}</small>
                </div>
              </td>
            `;
          } else {
            weekRow += `<td>${dayCount}</td>`;
          }
          
          dayCount++;
        }
      }
      
      weekRow += '</tr>';
      calendarRows += weekRow;
      
      // Stop if we've used all days in the month
      if (dayCount > daysInMonth) break;
    }
    
    calendarHtml += calendarRows + '</tbody></table>';
    calendarContainer.innerHTML = calendarHtml;
  }
  
  // Start calendar
  initCalendar();
}

// Authentication functionality
if (document.querySelector('#login-form') || document.querySelector('#register-form')) {
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  const switchToRegister = document.querySelector('#switch-to-register');
  const switchToLogin = document.querySelector('#switch-to-login');
  
  // Toggle between login and register forms
  if (switchToRegister && switchToLogin) {
    switchToRegister.addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    });
    
    switchToLogin.addEventListener('click', function(e) {
      e.preventDefault();
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }
  
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.querySelector('#login-username');
      const password = document.querySelector('#login-password');
      
      let valid = true;
      
      if (!username.value.trim()) {
        showError(username, 'Username is required');
        valid = false;
      } else {
        removeError(username);
      }
      
      if (!password.value.trim()) {
        showError(password, 'Password is required');
        valid = false;
      } else {
        removeError(password);
      }
      
      if (valid) {
        try {
          // Show loading state
          const submitBtn = loginForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.textContent;
          submitBtn.textContent = 'Signing in...';
          submitBtn.disabled = true;
          
          // Call API to login
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username.value,
              password: password.value
            })
          });
          
          if (response.ok) {
            const user = await response.json();
            // Store user info
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'index.html';
          } else {
            // Handle error
            const errorText = await response.text();
            throw new Error(errorText || 'Login failed. Please check your credentials.');
          }
        } catch (error) {
          console.error('Login error:', error);
          // Show error message above the form
          const errorContainer = document.createElement('div');
          errorContainer.className = 'auth-error';
          errorContainer.textContent = error.message || 'Login failed. Please try again.';
          
          // Insert error at the top of the form
          const formTitle = document.querySelector('.auth-form-title');
          formTitle.insertAdjacentElement('afterend', errorContainer);
          
          // Remove after 5 seconds
          setTimeout(() => {
            errorContainer.remove();
          }, 5000);
          
          // Reset button
          const submitBtn = loginForm.querySelector('button[type="submit"]');
          submitBtn.textContent = 'Sign In';
          submitBtn.disabled = false;
        }
      }
    });
  }
  
  // Registration form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.querySelector('#register-username');
      const email = document.querySelector('#register-email');
      const password = document.querySelector('#register-password');
      const confirmPassword = document.querySelector('#register-confirm-password');
      
      let valid = true;
      
      if (!username.value.trim()) {
        showError(username, 'Username is required');
        valid = false;
      } else {
        removeError(username);
      }
      
      if (!email.value.trim()) {
        showError(email, 'Email is required');
        valid = false;
      } else if (!isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        valid = false;
      } else {
        removeError(email);
      }
      
      if (!password.value.trim()) {
        showError(password, 'Password is required');
        valid = false;
      } else if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters');
        valid = false;
      } else {
        removeError(password);
      }
      
      if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        valid = false;
      } else {
        removeError(confirmPassword);
      }
      
      if (valid) {
        try {
          // Show loading state
          const submitBtn = registerForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.textContent;
          submitBtn.textContent = 'Creating account...';
          submitBtn.disabled = true;
          
          // Call API to register
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username.value,
              email: email.value,
              password: password.value
            })
          });
          
          if (response.ok) {
            const user = await response.json();
            // Store user info and redirect
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'index.html';
          } else {
            // Handle error
            const errorText = await response.text();
            throw new Error(errorText || 'Registration failed. Please try again.');
          }
        } catch (error) {
          console.error('Registration error:', error);
          // Show error message above the form
          const errorContainer = document.createElement('div');
          errorContainer.className = 'auth-error';
          errorContainer.textContent = error.message || 'Registration failed. Please try again.';
          
          // Insert error at the top of the form
          const formTitle = document.querySelector('.auth-form-title');
          formTitle.insertAdjacentElement('afterend', errorContainer);
          
          // Remove after 5 seconds
          setTimeout(() => {
            errorContainer.remove();
          }, 5000);
          
          // Reset button
          const submitBtn = registerForm.querySelector('button[type="submit"]');
          submitBtn.textContent = 'Register';
          submitBtn.disabled = false;
        }
      }
    });
  }
}

// Check if user is logged in
async function checkAuth() {
  const authButtons = document.querySelector('.auth-buttons');
  if (!authButtons) return;

  try {
    // Call the API to get the current user
    const response = await fetch('/api/user');
    
    if (response.ok) {
      // User is logged in
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      
      authButtons.innerHTML = `
        <span class="welcome-text">Welcome, ${user.username}</span>
        <button id="logout-btn" class="btn btn-outline">Logout</button>
      `;
      
      const logoutBtn = document.querySelector('#logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
          try {
            // Call the API to logout
            await fetch('/api/logout', {
              method: 'POST'
            });
            
            // Clear the stored user and reload
            localStorage.removeItem('user');
            window.location.reload();
          } catch (error) {
            console.error('Logout failed:', error);
          }
        });
      }
    } else {
      // User is not logged in or session expired
      localStorage.removeItem('user');
      
      if (window.location.pathname.includes('calendar.html') && !authButtons.querySelector('.btn-primary')) {
        // Redirect to authentication page if trying to access protected pages
        window.location.href = 'auth.html';
      }
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
}

// Call the checkAuth function when the page loads
document.addEventListener('DOMContentLoaded', checkAuth);