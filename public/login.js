// Connect to the server
const socket = io();

// Handle form submission for professor login
document.getElementById('professorLoginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const professorUsernameInput = document.getElementById('professorUsername');
  const professorPasswordInput = document.getElementById('professorPassword');

  const username = professorUsernameInput.value.trim();
  const password = professorPasswordInput.value.trim();

  // Send professor login credentials to the server for authentication
  socket.emit('professorLogin', { username, password });

  // Clear the input fields
  professorUsernameInput.value = '';
  professorPasswordInput.value = '';
});

// Receive login response from the server
socket.on('loginResponse', (response) => {
  if (response.success) {
    // Redirect to the professor's dashboard or subject list page
    window.location.href = 'dashboard.html';
    return false;
  } else {
    // Display login error message
    console.log('Login failed:', response.message);
  }
});
