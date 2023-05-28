
document.addEventListener('DOMContentLoaded', () => {
  // Connect to the server
  const socket = io();
  
  // Global variable for storing student data
  let studentsData = [];
  
  // Handle form submission for adding a student
  document.getElementById('addStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentIdInput = document.getElementById('studentID');
    const studentNameInput = document.getElementById('studentName');
    const studentLastnameInput = document.getElementById('studentLastname');
    const studentEmailInput = document.getElementById('studentEmail');
  
    const id = studentIdInput.value.trim();
    const name = studentNameInput.value.trim();
    const lastname = studentLastnameInput.value.trim();
    const email = studentEmailInput.value.trim();
  
    // Create a new student object
    const newStudent = {
      id: id,
      name: name,
      lastname: lastname,
      email: email,
    };
  
    // Add the new student to the database via the server
    socket.emit('addStudent', newStudent);
  
    // Clear the input fields
    studentIdInput.value = '';
    studentNameInput.value = '';
    studentLastnameInput.value = '';
    studentEmailInput.value = '';
  });
  
  // Receive updated student data from the server
  socket.on('studentData', (data) => {
    studentsData = data; // Update the studentsData array
    // Do something with the updated data (e.g., update the UI)
  });
  document.getElementById('searchButton').addEventListener('click', (e) => {
    e.preventDefault();
    const searchIdInput = document.getElementById('searchIdInput').value.trim();
    const searchNameInput = document.getElementById('searchNameInput').value.trim();
  
    // Parse the search input to check for student ID and name
    const searchCriteria = {
      studentId: isNaN(searchIdInput) ? null : parseInt(searchIdInput),
      name: searchNameInput || null,
    };
  
    // Search for students via the server
    socket.emit('searchStudents', searchCriteria);
  });
  
  
  socket.on('searchResults', (results) => {
    if (results.length > 0) {
      clearResults();
      results.forEach((student) => {
        displayStudentInfo(student);
      });
    } else {
      displayNoResults();
    }
  });
  
  // Display student information and grades
  function displayStudentInfo(student) {
    const resultDiv = document.getElementById('result');
  
    let studentHTML = `
      <div class="student">
        <h3>ID: ${student.ID}</h3>
        <h3>Name: ${student.Name} ${student.Lastname}</h3>
        <p>Email: ${student.Email}</p>
      </div>
    `;
  
    // Add grades information
    if (student.grades && student.grades.length > 0) {
      studentHTML += '<div class= "student"><h3>Grades:</h3';
      studentHTML += '<ol class="gradeList">';
      student.grades.forEach((grade) => {
        studentHTML += `<li>Subject: ${grade.SubjectName}, Grade: ${grade.Grade}</li>`;
      });
      studentHTML += '</ol> </div>';
    }
  
    resultDiv.innerHTML += studentHTML;
  }
  
  // Display message when no results are found
  function displayNoResults() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<p>No matching students found.</p>';
  }
  
  // Clear the result display
  function clearResults() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
  }
  
  // Add a subject input field
  function addSubjectInput() {
    const subjectsContainer = document.getElementById('subjectsContainer');
  
    const subjectInputHTML = `
      <div class="subjectInput">
        <input type="text" class="subjectName" placeholder="Subject Name" required />
        <input type="number" class="subjectGrade" placeholder="Grade" required />
      </div>
    `;
  
    subjectsContainer.insertAdjacentHTML('beforeend', subjectInputHTML);
  }
  
  // Calculate the average grade
  function calculateAverageGrade(grades) {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((total, grade) => total + grade, 0);
    return sum / grades.length;
  }
  
  // Get the highest grade
  function getHighestGrade(grades) {
    if (grades.length === 0) return 0;
    return Math.max(...grades);
  }
  
  // Get the lowest grade
  function getLowestGrade(grades) {
    if (grades.length === 0) return 0;
    return Math.min(...grades);
  }
  // Receive overall grade statistics from the server
  socket.on('overallGradeStatistics', (statistics) => {
    const averageGradeElement = document.getElementById('averageGrade');
    const minGradeElement = document.getElementById('minGrade');
    const maxGradeElement = document.getElementById('maxGrade');
  
    // Update the UI with the received statistics
    averageGradeElement.textContent = statistics.averageGrade ? statistics.averageGrade.toFixed(2) : 'N/A';
    minGradeElement.textContent = statistics.minGrade ? statistics.minGrade.toFixed(2) : 'N/A';
    maxGradeElement.textContent = statistics.maxGrade ? statistics.maxGrade.toFixed(2) : 'N/A';
  });
  
  // Request overall grade statistics when the page loads
  socket.emit('getOverallGradeStatistics');
  });
  
  