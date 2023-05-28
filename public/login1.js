// Connect to the server
const socket = io();

// Handle form submission for admin login
document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const adminUsernameInput = document.getElementById('adminUsername');
  const adminPasswordInput = document.getElementById('adminPassword');

  const username = adminUsernameInput.value.trim();
  const password = adminPasswordInput.value.trim();

  // Send admin login credentials to the server for authentication
  socket.emit('adminLogin', { username, password });

  // Clear the input fields
  adminUsernameInput.value = '';
  adminPasswordInput.value = '';
});

// Receive login response from the server
socket.on('loginResponse', (response) => {
  if (response.success) {
    // Redirect to the admin's dashboard page
    window.location.href = 'admindashboard.html';
    return false;
  } else {
    // Display login error message
    console.log('Login failed:', response.message);
  }
});



connection.query(selectQuery, [username], (error, results) => {
  if (error) {
    console.error('Error retrieving admin data:', error);
    socket.emit('loginResponse', { success: false, message: 'Invalid credentials' });
    return;
  }
  
  if (results.length === 0) {
    socket.emit('loginResponse', { success: false, message: 'Invalid credentials' });
    return;
  }
  
  const professor = results[0];
  
  // Compare the provided password with the stored password
  if (password === admin.Password) {
    // Successful login
    socket.emit('loginResponse', { success: true, message: 'Admin login successful', subjects: results });
  } else {
    // Invalid password
    socket.emit('loginResponse', { success: false, message: 'Invalid credentials' });
  }
});

socket.on('loginResponse', (response) => {
  if (response.success) {
    const adminId = response.subjects[0].Admin_id; 
    window.location.href = `admindashboard.html?adminId=${adminId}`;
  } else {
    // Display login error message
    console.log('Login failed:', response.message);
  }
});
