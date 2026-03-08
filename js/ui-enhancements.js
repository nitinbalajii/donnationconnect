// UI Enhancements - Loading States, Modals, Notifications

// Loading Overlay
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
    overlay.innerHTML = `
    <div style="background: var(--background); padding: 2rem 3rem; border-radius: var(--radius); text-align: center;">
      <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
      <p style="font-size: 1.1rem;">${message}</p>
    </div>
  `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Confirmation Modal
function showConfirm(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
    modal.innerHTML = `
    <div style="background: var(--background); padding: 2rem; border-radius: var(--radius); max-width: 400px; width: 90%;">
      <h3 style="margin-bottom: 1rem;">Confirm Action</h3>
      <p style="margin-bottom: 2rem; color: var(--text-light);">${message}</p>
      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button class="btn btn-outline" onclick="closeConfirmModal(false)">Cancel</button>
        <button class="btn btn-primary" onclick="closeConfirmModal(true)">Confirm</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    window.closeConfirmModal = (confirmed) => {
        modal.remove();
        if (confirmed && onConfirm) onConfirm();
        if (!confirmed && onCancel) onCancel();
    };
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
  `;

    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; margin-left: auto;">×</button>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s ease-in-out infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  .fade-in {
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);

// Image Lightbox
function showImageLightbox(imageSrc) {
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
  `;
    lightbox.innerHTML = `
    <img src="${imageSrc}" style="max-width: 90%; max-height: 90%; object-fit: contain;">
    <button style="position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">×</button>
  `;
    lightbox.onclick = () => lightbox.remove();
    document.body.appendChild(lightbox);
}

// Skeleton Loader
function createSkeleton(type = 'card') {
    if (type === 'card') {
        return `
      <div class="skeleton" style="height: 200px; border-radius: var(--radius); margin-bottom: 1rem;"></div>
    `;
    } else if (type === 'text') {
        return `
      <div class="skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 0.5rem; width: 100%;"></div>
      <div class="skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 0.5rem; width: 80%;"></div>
      <div class="skeleton" style="height: 20px; border-radius: 4px; width: 60%;"></div>
    `;
    }
}

// Progress Bar
function showProgress(percentage) {
    let progressBar = document.getElementById('globalProgressBar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'globalProgressBar';
        progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: var(--primary);
      z-index: 10001;
      transition: width 0.3s ease;
    `;
        document.body.appendChild(progressBar);
    }
    progressBar.style.width = percentage + '%';

    if (percentage >= 100) {
        setTimeout(() => progressBar.remove(), 300);
    }
}

// Enhance existing showMessage function
const originalShowMessage = window.showMessage;
window.showMessage = function (message, type) {
    if (originalShowMessage) {
        originalShowMessage(message, type);
    }
    showToast(message, type);
};

// Export functions
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showConfirm = showConfirm;
window.showToast = showToast;
window.showImageLightbox = showImageLightbox;
window.createSkeleton = createSkeleton;
window.showProgress = showProgress;
