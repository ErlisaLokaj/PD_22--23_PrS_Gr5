document.addEventListener('DOMContentLoaded', () => {
    // Connect to the server
    const socket = io();
    
    // Global variable for storing student data
    let professorData = [];

// Handle form submission for adding a professor
document.getElementById('addProfessorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const professorIdInput = document.getElementById('professorID');
    const professorUsernameInput = document.getElementById('professorUsername');
    const professorPasswordInput = document.getElementById('professorPassword');
  
    const id = professorIdInput.value.trim();
    const username = professorUsernameInput.value.trim();
    const password = professorPasswordInput.value.trim();
  
    // Create a new professor object
    const newProfessor = {
      id: id,
      username: username,
      password: password,
    };
  
    // Add the new professor to the database via the server
    socket.emit('addProfessor', newProfessor);
  
    // Clear the input fields
    professorIdInput.value = '';
    professorUsernameInput.value = '';
    professorPasswordInput.value = '';
  });
  
  // Receive updated professor data from the server
  socket.on('professorData', (data1) => {
    professorsData = data1; // Update the professorsData array
    // Do something with the updated data (e.g., update the UI)
  });
// Handle form submission for enrolling students
// Handle form submission for enrolling students
document.getElementById('enrollStudentsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const subjectIdInput = document.getElementById('subjectId');
    const studentIdsInput = document.getElementById('studentIds');
  
    const subjectId = subjectIdInput.value.trim();
    const studentIds = studentIdsInput.value
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '');
  
    // Create an enrollment object
    const enrollmentData = {
      subjectId: subjectId,
      studentIds: studentIds,
    };
  
    // Enroll the students in the subject via the server
    socket.emit('enrollStudents', enrollmentData);
  
    // Clear the input fields
    subjectIdInput.value = '';
    studentIdsInput.value = '';
  });

  


});

