// Donation Forms Handler
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in for donation forms
    const donateItemsForm = document.querySelector('.donation-form');
    const donateFoodForms = document.querySelectorAll('[id$="DonationForm"]');

    // Protect donation pages - require login
    if (donateItemsForm || donateFoodForms.length > 0) {
        if (!UserState.isLoggedIn()) {
            showMessage('Please login to create a donation', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
    }

    // Handle Item Donation Form
    if (donateItemsForm && window.location.pathname.includes('donate-items')) {
        // Add hidden file input for photos
        const photoUploadContainer = document.querySelector('.photo-upload');
        if (photoUploadContainer) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.id = 'photoInput';
            photoUploadContainer.appendChild(fileInput);

            let selectedFiles = [];

            // Handle upload box click
            const uploadBox = document.querySelector('.upload-box');
            if (uploadBox) {
                uploadBox.addEventListener('click', () => {
                    fileInput.click();
                });
            }

            // Handle file selection
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);

                if (selectedFiles.length + files.length > 4) {
                    showMessage('You can upload maximum 4 photos', 'error');
                    return;
                }

                selectedFiles = [...selectedFiles, ...files];
                displaySelectedPhotos();
            });

            function displaySelectedPhotos() {
                const container = document.querySelector('.photo-upload');
                container.innerHTML = '';

                // Add existing photos
                selectedFiles.forEach((file, index) => {
                    const photoBox = document.createElement('div');
                    photoBox.className = 'upload-box';
                    photoBox.style.position = 'relative';
                    photoBox.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
                    photoBox.style.backgroundSize = 'cover';
                    photoBox.style.backgroundPosition = 'center';

                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '&times;';
                    removeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(255,0,0,0.8);
            color: white;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
          `;
                    removeBtn.onclick = (e) => {
                        e.stopPropagation();
                        selectedFiles.splice(index, 1);
                        displaySelectedPhotos();
                    };

                    photoBox.appendChild(removeBtn);
                    container.appendChild(photoBox);
                });

                // Add upload box if less than 4 photos
                if (selectedFiles.length < 4) {
                    const uploadBox = document.createElement('div');
                    uploadBox.className = 'upload-box';
                    uploadBox.innerHTML = `
            <i class="fas fa-plus"></i>
            <span>Add Photo</span>
          `;
                    uploadBox.onclick = () => fileInput.click();
                    container.appendChild(uploadBox);
                }
            }

            // Handle form submission
            donateItemsForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Get form values
                const title = document.getElementById('title').value;
                const category = document.getElementById('category').value;
                const condition = document.getElementById('condition').value;
                const description = document.getElementById('description').value;
                const pickupAvailability = document.querySelector('input[name="pickup"]:checked').value;
                const address = document.getElementById('address').value;
                const city = document.getElementById('city').value;
                const state = document.getElementById('state').value;
                const zipCode = document.getElementById('zip').value;

                // Validation
                if (!title || !category || !condition || !description || !address || !city || !state || !zipCode) {
                    showMessage('Please fill in all required fields', 'error');
                    return;
                }

                try {
                    // Show loading
                    const submitBtn = donateItemsForm.querySelector('button[type="submit"]');
                    submitBtn.textContent = 'Submitting...';
                    submitBtn.disabled = true;

                    // Upload images first if any
                    let imageUrls = [];
                    if (selectedFiles.length > 0) {
                        showMessage('Uploading images...', 'success');
                        const uploadResponse = await API.upload.multiple(selectedFiles);
                        if (uploadResponse.success) {
                            imageUrls = uploadResponse.data;
                        }
                    }

                    // Create donation
                    const donationData = {
                        type: 'item',
                        title,
                        category,
                        condition,
                        description,
                        pickupAvailability,
                        pickupAddress: {
                            street: address,
                            city,
                            state,
                            zipCode
                        },
                        images: imageUrls
                    };

                    const response = await API.donations.create(donationData);

                    if (response.success) {
                        showMessage('Donation created successfully! Redirecting...', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    }
                } catch (error) {
                    showMessage(error.message || 'Failed to create donation', 'error');
                    const submitBtn = donateItemsForm.querySelector('button[type="submit"]');
                    submitBtn.textContent = 'Submit Donation';
                    submitBtn.disabled = false;
                }
            });
        }
    }

    // Handle Food Donation Forms (3 tabs)
    const foodDonationForms = document.querySelectorAll('#individual .donation-form, #event .donation-form, #business .donation-form');

    if (foodDonationForms.length > 0) {
        foodDonationForms.forEach((form, index) => {
            const tabType = ['individual', 'event', 'business'][index];

            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Common fields
                const foodType = form.querySelector('#food-type')?.value || form.querySelector('#event-food-type')?.value || 'other';
                const description = form.querySelector('#food-description')?.value || form.querySelector('#event-description')?.value || form.querySelector('#business-description')?.value;
                const address = form.querySelector('#address')?.value || form.querySelector('#event-address')?.value || form.querySelector('#business-address')?.value;
                const city = form.querySelector('#city')?.value || form.querySelector('#event-city')?.value || form.querySelector('#business-city')?.value;
                const state = form.querySelector('#state')?.value || form.querySelector('#event-state')?.value || form.querySelector('#business-state')?.value;
                const zipCode = form.querySelector('#zip')?.value || form.querySelector('#event-zip')?.value || form.querySelector('#business-zip')?.value;

                // Dietary information (for individual tab)
                const dietaryInfo = {
                    vegetarian: form.querySelector('#vegetarian')?.checked || false,
                    vegan: form.querySelector('#vegan')?.checked || false,
                    glutenFree: form.querySelector('#gluten-free')?.checked || false,
                    dairyFree: form.querySelector('#dairy-free')?.checked || false,
                    nutFree: form.querySelector('#nut-free')?.checked || false
                };

                // Validation
                if (!description || !address || !city || !state || !zipCode) {
                    showMessage('Please fill in all required fields', 'error');
                    return;
                }

                try {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    submitBtn.textContent = 'Submitting...';
                    submitBtn.disabled = true;

                    // Build donation data
                    const donationData = {
                        type: 'food',
                        title: `Food Donation - ${foodType}`,
                        description,
                        category: 'food',
                        pickupAddress: {
                            street: address,
                            city,
                            state,
                            zipCode
                        },
                        foodDetails: {
                            foodType,
                            dietaryInfo
                        }
                    };

                    // Add event-specific fields
                    if (tabType === 'event') {
                        const eventName = form.querySelector('#event-name')?.value;
                        const eventDate = form.querySelector('#event-date')?.value;
                        const servings = form.querySelector('#servings')?.value;

                        donationData.title = `Event Food - ${eventName || 'Event'}`;
                        donationData.foodDetails.servings = parseInt(servings) || 0;
                        donationData.notes = `Event: ${eventName}, Date: ${eventDate}`;
                    }

                    // Add business-specific fields
                    if (tabType === 'business') {
                        const businessName = form.querySelector('#business-name')?.value;
                        const contactPerson = form.querySelector('#contact-person')?.value;
                        const phone = form.querySelector('#business-phone')?.value;

                        donationData.title = `Business Partnership - ${businessName || 'Business'}`;
                        donationData.notes = `Business: ${businessName}, Contact: ${contactPerson}, Phone: ${phone}`;
                    }

                    const response = await API.donations.create(donationData);

                    if (response.success) {
                        showMessage('Food donation created successfully! Redirecting...', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    }
                } catch (error) {
                    showMessage(error.message || 'Failed to create donation', 'error');
                    const submitBtn = form.querySelector('button[type="submit"]');
                    submitBtn.textContent = 'Submit Donation';
                    submitBtn.disabled = false;
                }
            });
        });
    }
});
