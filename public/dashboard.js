// Connect to the server
const socket = io();

// Global variable for storing subject data
let subjectsData = [];

// Handle the initial loading of the dashboard page
document.addEventListener('DOMContentLoaded', () => {
  // Fetch and display the subjects
  fetchSubjects();
});

// Fetch the subjects from the server
function fetchSubjects() {
  socket.emit('getSubjects');
}

// Handle the response for subjects from the server
socket.on('subjectData', (data) => {
  subjectsData = data;
  displaySubjects(subjectsData);
});

// Display the subjects in the subject list
function displaySubjects(subjects) {
  const subjectList = document.getElementById('subjectList');
  subjectList.innerHTML = '';

  const subjectTemplate = document.getElementById('subjectTemplate');

  subjects.forEach((subject) => {
    const subjectContainer = subjectTemplate.content.cloneNode(true);
    const summary = subjectContainer.querySelector('summary');
    const details = subjectContainer.querySelector('.subject');

    summary.textContent = subject.Name;
    details.dataset.subjectId = subject.ID;

    subjectList.appendChild(subjectContainer);

    // Add click event listener to the subject details
    details.addEventListener('click', () => {
      const subjectId = details.dataset.subjectId;

      // Check if the student list already exists
      const studentList = subjectContainer.querySelector('.student-list');

      if (studentList.innerHTML.trim() !== '') {
        // Toggle the visibility of the student list
        studentList.style.display = (studentList.style.display === 'none') ? 'block' : 'none';
      } else {
        // Fetch and display the students for the selected subject
        fetchStudentsBySubject(subjectId)
          .then(students => {
            // Display the students for the subject
            displayStudents(students, studentList);
          })
          .catch(error => {
            console.error('Error fetching students:', error);
          });
      }
    });
  });
}

// Handle the click event on a subject
document.addEventListener('click', (event) => {
  const subject = event.target.closest('.subject');
  if (!subject) return; // Return if the clicked element is not a subject

  const subjectId = subject.dataset.subjectId;
  console.log('Selected subject ID:', subjectId);

  // Get the student list element
  let studentList = subject.nextElementSibling;

  // Check if the student list already exists
  const studentListExists = studentList !== null && studentList.classList.contains('student-list');

  // Toggle the visibility of the student list
  if (studentListExists) {
    if (studentList.style.display === 'none') {
      studentList.style.display = 'block';
    } else {
      studentList.style.display = 'none';
    }
  } else {
    // Fetch and display the students for the selected subject
    fetchStudentsBySubject(subjectId)
      .then(students => {
        // Create the student list element
        studentList = document.createElement('div');
        studentList.classList.add('student-list');

        // Append the student list after the subject container
        subject.parentElement.appendChild(studentList);

        // Display the students for the subject
        displayStudents(students, studentList);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
      });
  }
});

// Fetch students by subject from the server
function fetchStudentsBySubject(subjectId) {
  return new Promise((resolve, reject) => {
    socket.emit('getStudentsBySubject', subjectId);
    socket.on('studentsBySubjectData', (students) => {
      resolve(students);
    });
    socket.on('studentsBySubjectError', (error) => {
      reject(error);
    });
  });
}

// Handle the click event on a student
document.addEventListener('click', (event) => {
  const studentElement = event.target.closest('.student');
  if (!studentElement) return; // Return if the clicked element is not a student

  const studentId = studentElement.dataset.studentId;

  // Get the closest subject element
  const subjectElement = studentElement.closest('.subject');
  if (!subjectElement) return; // Return if the subject element is not found

  const subjectId = subjectElement.dataset.subjectId;

  // Check if the student already has a grade for the subject
  const gradeElement = studentElement.querySelector('.student-grade');
  const existingGrade = gradeElement.textContent.trim();

  if (existingGrade !== "-") {
    // Show an alert with the existing grade
    alert(`This student for this subject already has a grade, and it is: ${existingGrade}`);
  } else {
    // Show the grade form for the selected student
    showGradeForm(studentElement, studentId);
  }
});

function displayStudents(students, studentList) {
  studentList.innerHTML = '';

  const studentTemplate = document.getElementById('studentTemplate');

  students.forEach((student) => {
    const studentContainer = studentTemplate.content.cloneNode(true);
    const studentDiv = studentContainer.querySelector('.student');
    const studentId = student.ID;

    studentDiv.dataset.studentId = studentId;

    const idElement = studentContainer.querySelector('.student-id');
    idElement.textContent = `ID: ${student.ID}`;

    const nameElement = studentContainer.querySelector('.student-name');
    nameElement.textContent = `Name: ${student.Name}`;

    const lastnameElement = studentContainer.querySelector('.student-lastname');
    lastnameElement.textContent = `Lastname: ${student.Lastname}`;

    const emailElement = studentContainer.querySelector('.student-email');
    emailElement.textContent = `Email: ${student.Email}`;

    const gradeElement = studentContainer.querySelector('.student-grade');
    gradeElement.textContent = `${student.Grade !== undefined ? student.Grade : '-'}`;

    // Add click event listener to the studentDiv
    studentDiv.addEventListener('click', () => {
      if (student.Grade === undefined) {
        showGradeForm(studentDiv, studentId);
      } else {
        alert(`This student for this subject already has a grade, and it is: ${student.Grade !== '-' ? student.Grade : '-'}`);
      }
    });

    studentList.appendChild(studentContainer);
  });
}

function showGradeForm(studentElement, studentId) {
  const existingGradeElement = studentElement.querySelector('.student-grade');
  const existingGrade = existingGradeElement.textContent.trim();
  
  if (existingGrade !== '-' && existingGrade !== 'Grade: -' && existingGrade !== 'Grade:-' && existingGrade !== '') {
    // Show an alert with the existing grade, except for "-", "Grade: -" or "Grade:-"
    alert(`Grade is: ${existingGrade}`);
    return; // Exit the function early if the student already has a grade
  }

  const gradeForm = document.createElement('div');
  gradeForm.classList.add('grade-form');
  gradeForm.style.display = 'block';

  const gradeInput = document.createElement('input');
  gradeInput.classList.add('grade-input');
  gradeInput.type = 'text';
  gradeInput.value = existingGrade ? existingGrade.replace('Grade: ', '') : '';

  const saveGradeButton = document.createElement('button');
  saveGradeButton.classList.add('save-grade-button');
  saveGradeButton.textContent = 'Save Grade';

  gradeForm.appendChild(gradeInput);
  gradeForm.appendChild(saveGradeButton);

  saveGradeButton.addEventListener('click', () => {
    const grade = gradeInput.value;
  
    const subjectElement = studentElement.closest('.subject');
    const subjectId = subjectElement ? subjectElement.dataset.subjectId : null;
  
    if (subjectId) {
      saveGrade(studentId, subjectId, grade);
    }
  
    if (grade === '') {
      // Show the grade form if the grade is empty
      gradeForm.style.display = 'block';
    } else {
      // Show an alert for other grade values, excluding "-"
      if (existingGrade === '') {
        alert(`Grade: ${grade}`);
      }
      gradeForm.style.display = 'none';
    }
  
    // Update the grade in the existingGradeElement
    existingGradeElement.textContent = grade ? ` ${grade}` : 'Grade: -';
  });
  

  studentElement.appendChild(gradeForm);
}



function saveGrade(studentId, subjectId, grade) {
  const studentElements = document.querySelectorAll(`.student[data-student-id="${studentId}"]`);

  studentElements.forEach((studentElement) => {
    const subjectElement = studentElement.closest('.subject');
    const subjectIdAttr = subjectElement.dataset.subjectId;

    if (subjectIdAttr === subjectId) {
      const gradeElement = studentElement.querySelector('.student-grade');
      gradeElement.textContent = `Grade: ${grade}`;
    }
  });

  // Find the subject in the subjectsData array
  const subject = subjectsData.find((subject) => subject.ID === subjectId);

  if (subject) {
    // Find the student in the subject's student list
    const student = subject.students.find((student) => student.ID === studentId);

    if (student) {
      // Update the grade in the subject's student list
      student.Grade = grade;
    }
  }

  // Send the updated grade to the server
  socket.emit('saveGrade', { studentId, subjectId, grade });
}
