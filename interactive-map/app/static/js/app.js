// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('expanded');
        });
    }
    
    // Close flash messages
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.opacity = '0';
            setTimeout(() => {
                this.parentElement.remove();
            }, 300);
        });
    });
    
    // Tab functionality
    const tabs = document.querySelectorAll('.nav-tabs li, .profile-menu li');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const tabContainer = this.closest('.admin-tabs, .profile-content');
            
            // Update active tab
            tabContainer.querySelectorAll('.nav-tabs li, .profile-menu li').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show corresponding content
            tabContainer.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Initialize password strength meter
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.nextElementSibling && this.nextElementSibling.classList.contains('password-strength')) {
                updatePasswordStrength(this);
            }
        });
    });
});

function updatePasswordStrength(input) {
    const password = input.value;
    const strengthBars = input.nextElementSibling.querySelectorAll('.strength-bar');
    
    // Reset all bars
    strengthBars.forEach(bar => {
        bar.style.backgroundColor = '#e9ecef';
        bar.style.width = '0%';
    });
    
    if (password.length === 0) return;
    
    // Very weak
    if (password.length > 0) {
        strengthBars[0].style.backgroundColor = '#ff6b6b';
        strengthBars[0].style.width = '33%';
    }
    
    // Weak
    if (password.length >= 6) {
        strengthBars[1].style.backgroundColor = '#ffd166';
        strengthBars[1].style.width = '66%';
    }
    
    // Strong
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        strengthBars[2].style.backgroundColor = '#06d6a0';
        strengthBars[2].style.width = '100%';
    }
}
