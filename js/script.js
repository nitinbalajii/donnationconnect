// DOM Elements
const themeToggle = document.getElementById("themeToggle")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileMenu = document.getElementById("mobileMenu")
const currentYearElements = document.querySelectorAll(".current-year")
const donationForm = document.querySelector(".donation-form")
const loginForm = document.getElementById("loginForm")
const signupForm = document.getElementById("signupForm")
const tabButtons = document.querySelectorAll(".tab-btn")
const uploadBoxes = document.querySelectorAll(".upload-box")
const searchInput = document.querySelector(".search-box input")
const shelterCards = document.querySelectorAll(".shelter-cards .card")

// Set current year in footer
if (currentYearElements.length > 0) {
  const currentYear = new Date().getFullYear()
  currentYearElements.forEach((element) => {
    element.textContent = currentYear
  })
}

// Theme Toggle
if (themeToggle) {
  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem("theme")
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  // Apply dark mode if saved or preferred
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark-mode")
    updateThemeIcon(true)
  }

  themeToggle.addEventListener("click", () => {
    const isDarkMode = document.documentElement.classList.toggle("dark-mode")
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
    updateThemeIcon(isDarkMode)
  })
}

function updateThemeIcon(isDarkMode) {
  const icon = themeToggle.querySelector("i")
  if (icon) {
    if (isDarkMode) {
      icon.classList.remove("fa-moon")
      icon.classList.add("fa-sun")
    } else {
      icon.classList.remove("fa-sun")
      icon.classList.add("fa-moon")
    }
  }
}

// Mobile Menu Toggle
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active")

    // Change icon based on menu state
    const icon = mobileMenuBtn.querySelector("i")
    if (mobileMenu.classList.contains("active")) {
      icon.classList.remove("fa-bars")
      icon.classList.add("fa-times")
    } else {
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    }
  })
}

// Upload Box Functionality
if (uploadBoxes.length > 0) {
  uploadBoxes.forEach((box) => {
    box.addEventListener("click", () => {
      // In a real application, this would open a file picker
      alert("This would open a file picker in a real application.")
    })
  })
}

// Form Submission
if (donationForm) {
  donationForm.addEventListener("submit", (e) => {
    e.preventDefault()
    showFormMessage("Your donation has been submitted successfully!", "success")
  })
}

// Tab Functionality
if (tabButtons.length > 0) {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get the target tab
      const target = button.getAttribute("data-tab")

      // Remove active class from all buttons and panes
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active")
      })

      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active")
      })

      // Add active class to clicked button and target pane
      button.classList.add("active")
      document.getElementById(target).classList.add("active")
    })
  })
}

// Search functionality for Shelters page
if (searchInput && shelterCards.length > 0) {
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim()

    shelterCards.forEach((card) => {
      const shelterName = card.querySelector("h3").textContent.toLowerCase()
      const shelterLocation = card.querySelector(".location span").textContent.toLowerCase()
      const shelterDescription = card.querySelector("p").textContent.toLowerCase()

      if (
        shelterName.includes(searchTerm) ||
        shelterLocation.includes(searchTerm) ||
        shelterDescription.includes(searchTerm)
      ) {
        card.style.display = "block"
      } else {
        card.style.display = "none"
      }
    })
  })
}

// Form validation for login and signup
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    if (!email || !password) {
      showFormMessage("Please fill in all fields.", "error")
      return
    }

    try {
      // Show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = 'Logging in...'
      submitBtn.disabled = true

      // Call API
      const response = await API.auth.login(email, password)

      if (response.success) {
        showFormMessage("Login successful! Redirecting...", "success")
        setTimeout(() => {
          window.location.href = "index.html"
        }, 1000)
      }
    } catch (error) {
      showFormMessage(error.message || "Login failed. Please try again.", "error")
      const submitBtn = loginForm.querySelector('button[type="submit"]')
      submitBtn.textContent = 'Log In'
      submitBtn.disabled = false
    }
  })
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const role = document.getElementById("role")?.value || 'donor'

    if (!name || !email || !password || !confirmPassword) {
      showFormMessage("Please fill in all fields.", "error")
      return
    }

    if (password !== confirmPassword) {
      showFormMessage("Passwords do not match.", "error")
      return
    }

    try {
      // Show loading state
      const submitBtn = signupForm.querySelector('button[type="submit"]')
      submitBtn.textContent = 'Creating account...'
      submitBtn.disabled = true

      // Call API
      const response = await API.auth.register({
        name,
        email,
        password,
        role
      })

      if (response.success) {
        showFormMessage("Account created successfully! Redirecting...", "success")
        setTimeout(() => {
          window.location.href = "login.html"
        }, 1500)
      }
    } catch (error) {
      showFormMessage(error.message || "Registration failed. Please try again.", "error")
      const submitBtn = signupForm.querySelector('button[type="submit"]')
      submitBtn.textContent = 'Sign Up'
      submitBtn.disabled = false
    }
  })
}

// Show form message
function showFormMessage(message, type) {
  const formMessage = document.querySelector(".form-message")
  if (formMessage) {
    formMessage.textContent = message
    formMessage.className = "form-message"
    formMessage.classList.add(type)

    // Scroll to message
    formMessage.scrollIntoView({ behavior: "smooth", block: "center" })
  }
}

// Animate elements when they come into view
const animateOnScroll = () => {
  const elements = document.querySelectorAll(".card, .step, .section-header, .stat-card, .team-member, .partner")

  elements.forEach((element) => {
    const elementPosition = element.getBoundingClientRect().top
    const screenPosition = window.innerHeight / 1.2

    if (elementPosition < screenPosition) {
      element.style.opacity = "1"
      element.style.transform = "translateY(0)"
    }
  })
}

// Set initial styles for animation
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".card, .step, .section-header, .stat-card, .team-member, .partner")

  elements.forEach((element) => {
    element.style.opacity = "0"
    element.style.transform = "translateY(20px)"
    element.style.transition = "opacity 0.5s ease, transform 0.5s ease"
  })

  // Trigger animation for elements already in view
  animateOnScroll()

  // Add scroll event listener
  window.addEventListener("scroll", animateOnScroll)
})
