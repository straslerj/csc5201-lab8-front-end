// app.js
// Function to add a new user
function addUser() {
    const nameInput = document.getElementById('name');
    const locationInput = document.getElementById('location');

    const name = nameInput.value.trim();
    const location = locationInput.value.trim();

    console.log('Name:', name);
    console.log('Location:', location);

    if (!name || !location) {
        alert('Name and Location are required');
        return;
    }

    fetch('http://20.242.169.23:8000/add_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, location }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Response:', data);
            if (data.message) {
                alert(data.message);
                // Optionally, clear the form fields
                nameInput.value = '';
                locationInput.value = '';
                // Fetch and render updated user list
                fetchUsers();
                // Fetch and update live information
                fetchLiveUpdates();
            }
        })
        .catch(error => {
            console.error('Error adding user:', error);
            alert('An error occurred while adding the user');
        });
}

// Function to fetch and render the user list
function fetchUsers() {
    fetch('http://20.242.169.23:8000/get_users')
        .then(response => response.json())
        .then(data => {
            const userTableBody = document.getElementById('userTableBody');
            userTableBody.innerHTML = ''; // Clear existing rows

            data.users.forEach(user => {
                const row = document.createElement('tr');
                row.id = `userRow_${user._id}`;

                const columns = ['name', 'location', 'distance_to_milwaukee'];
                columns.forEach(column => {
                    const cell = document.createElement('td');
                    cell.textContent = user[column];
                    row.appendChild(cell);
                });

                // Add data-user-id attribute to store the UserID
                row.setAttribute('data-user-id', user._id);

                // Add delete button to Action column
                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'btn btn-danger';
                deleteButton.textContent = 'Delete';

                // Set UserID as a data attribute for both the row and the button
                row.setAttribute('data-user-id', user._id);
                deleteButton.setAttribute('data-user-id', user._id);

                // Use a function to handle the click event
                deleteButton.onclick = function () {
                    deleteUser(user._id);
                };

                deleteCell.appendChild(deleteButton);
                row.appendChild(deleteCell);

                userTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            alert('An error occurred while fetching the user list');
        });
}

function deleteUser(user_id) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`http://20.242.169.23:8000/delete_user/${user_id}`, {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // User deleted successfully, update the table
                    const row = document.getElementById(`userRow_${user_id}`);
                    if (row) {
                        row.remove();
                    }
                } else {
                    alert(data.message || 'Failed to delete user');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('An error occurred while deleting the user');
            });
        fetchLiveUpdates();

    }
}


// Function to fetch and update live information
function fetchLiveUpdates() {
    fetch('http://20.242.169.23:8000/closest_person')
        .then(response => response.json())
        .then(data => {
            const liveUpdatesTableBody = document.getElementById('liveUpdatesTableBody');
            let row = liveUpdatesTableBody.querySelector('tr');

            // If there's no row, create one
            if (!row) {
                row = document.createElement('tr');
                liveUpdatesTableBody.appendChild(row);
            }

            const columns = ['closest_user'];
            columns.forEach(column => {
                const cell = row.querySelector(`td[data-column="${column}"]`);

                // If there's no cell, create one
                if (!cell) {
                    const newCell = document.createElement('td');
                    newCell.setAttribute('data-column', column);
                    row.appendChild(newCell);
                }

                // Update the text content of the cell
                row.querySelector(`td[data-column="${column}"]`).textContent = data[column].name;
            });
        })
        .catch(error => {
            console.error('Error fetching closest person:', error);
        });

    fetch('http://20.242.169.23:8000/furthest_person')
        .then(response => response.json())
        .then(data => {
            const liveUpdatesTableBody = document.getElementById('liveUpdatesTableBody');
            let row = liveUpdatesTableBody.querySelector('tr');

            // If there's no row, create one
            if (!row) {
                row = document.createElement('tr');
                liveUpdatesTableBody.appendChild(row);
            }

            const column = 'furthest_user';
            const cell = row.querySelector(`td[data-column="${column}"]`);

            // If there's no cell, create one
            if (!cell) {
                const newCell = document.createElement('td');
                newCell.setAttribute('data-column', column);
                row.appendChild(newCell);
            }

            // Update the text content of the cell
            row.querySelector(`td[data-column="${column}"]`).textContent = data[column].name;
        })
        .catch(error => {
            console.error('Error fetching furthest person:', error);
        });
}

// Fetch and render initial user list on page load
fetchUsers();
fetchLiveUpdates();