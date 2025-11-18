// This is the code for Frontend/script.js

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // CRITICAL: CHANGE THIS URL TO YOUR REAL RENDER BACKEND URL
    // =================================================================
    const API_URL = 'https://fabe-e-commerce-store.onrender.com';

    // Get all the necessary elements from the HTML
    const userForm = document.getElementById('userForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const userIdInput = document.getElementById('userId'); // The hidden input
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const userTableBody = document.querySelector('#userTable tbody');

    // --- FUNCTION to fetch all users and display them in the table (READ) ---
    const fetchUsers = async () => {
        try {
            const response = await fetch(API_URL);
            const users = await response.json();

            // Clear the table body before adding new rows
            userTableBody.innerHTML = '';

            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td class="d-flex justify-content-center">
                        <button class="btn btn-warning btn-sm mr-2 edit-btn" data-id="${user._id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${user._id}">Delete</button>
                    </td>
                `;
                userTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // --- FUNCTION to reset the form to its initial state ---
    const resetForm = () => {
        userForm.reset(); // Clears name and email inputs
        userIdInput.value = ''; // Clears the hidden ID
        saveBtn.textContent = 'Add User'; // Reset button text
        cancelBtn.classList.add('d-none'); // Hide the cancel button
    };

    // --- EVENT LISTENER for the main form submission (CREATE and UPDATE) ---
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from reloading the page

        const name = nameInput.value;
        const email = emailInput.value;
        const userId = userIdInput.value;

        const isUpdating = !!userId; // If userId exists, we are updating

        const url = isUpdating ? `${API_URL}/${userId}` : API_URL;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                resetForm();
                fetchUsers(); // Refresh the table with the new data
            } else {
                console.error('Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    });

    // --- EVENT LISTENER for clicks on the table body (for Edit and Delete buttons) ---
    userTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        // --- DELETE User ---
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this user?')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        fetchUsers(); // Refresh the table
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                }
            }
        }

        // --- EDIT User (Prepare the form for editing) ---
        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`${API_URL}/${id}`);
                const user = await response.json();
                
                // Populate the form with the user's data
                nameInput.value = user.name;
                emailInput.value = user.email;
                userIdInput.value = user._id; // Set the hidden ID

                // Update UI for editing mode
                saveBtn.textContent = 'Update User';
                cancelBtn.classList.remove('d-none'); // Show the cancel button
                window.scrollTo(0, 0); // Scroll to the top of the page to see the form
            } catch (error) {
                console.error('Error fetching user for edit:', error);
            }
        }
    });

    // --- EVENT LISTENER for the Cancel button ---
    cancelBtn.addEventListener('click', resetForm);

    // --- INITIAL FETCH ---
    // Fetch and display all users when the page first loads.
    fetchUsers();
});