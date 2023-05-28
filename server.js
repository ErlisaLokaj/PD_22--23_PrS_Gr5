const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');
const bcrypt = require('bcrypt');
let stream = require( './public/stream' );
let path = require( 'path' );
//let favicon = require( 'serve-favicon');


// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Ushtrime1',
});

// Connect to MySQL
connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL:', error);
    return;
  }
  console.log('Connected to MySQL database');
});

// Serve static files
app.use(express.static('public'));

// Route to serve 'video.html' located outside the 'public' directory
app.get('/video', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'videocall.html'));
});
// video call
app.get( '/', ( req, res ) => {
    res.sendFile( './public/videocall.html' );
} );


io.of( '/stream' ).on( 'connection', stream );
//end of video call


// Parse JSON body
app.use(express.json());
// DECLARING ARRAY OF users
const users = {};
// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected');
 // SERVER FUNCTION TO RESPONSE NEW USER
 socket.on('new-user-joined', user_name =>{
  users[socket.id] = user_name;
  socket.broadcast.emit('user-joined', {new_user_name: users[socket.id], new_user_id: socket.id});
  io.to(socket.id).emit('current_active_users_list', {active_user: users, my_id: socket.id});
});   // SERVER FUNCTION TO HANDLE MESSAGES
socket.on('message-sended', message_sended =>{
  socket.broadcast.emit('message-received', {message: message_sended, sender_name: users[socket.id], sender_id: socket.id});
});

// SERVER FUNCTION TO HANDLE PRIVATE MESSAGES
socket.on('pvt-message-sended', data =>{
  io.to(data.to).emit('pvt_message_received', {message_received: data.message, received_from: socket.id});
});

// SERVER FUNCTION ON DISCONNECTION OF USER
socket.on('disconnect', message =>{
  socket.broadcast.emit('user-left', {left_user_name: users[socket.id], left_user_id: socket.id});
  delete users[socket.id];
});


  // Retrieve initial student data
  const selectQuery = 'SELECT * FROM Students';
  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Error retrieving student data:', error);
      return;
    }
    const studentsData = results;
    socket.emit('studentData', studentsData);
  });

  // Handle adding a student
  socket.on('addStudent', (student) => {
    const { id, name, lastname, email } = student;

    const insertQuery = 'INSERT INTO Students (ID, Name, Lastname, Email) VALUES (?, ?, ?, ?)';

    connection.query(insertQuery, [id, name, lastname, email], (error, results) => {
      if (error) {
        console.error('Error adding student:', error);
        return;
      }
      console.log('Student added:', results.insertId);

      // Send updated student data to all clients
      connection.query('SELECT * FROM Students', (error, results) => {
        if (error) {
          console.error('Error retrieving updated student data:', error);
          return;
        }
        const studentsData = results;
        io.emit('studentData', studentsData);
      });
    });
  });

  // Handle adding a professor
  socket.on('addProfessor', (professor) => {
    const { id, username, password } = professor;
  
    const insertQuery = 'INSERT INTO professor (ID, Username, Password) VALUES (?, ?, ?)';
  
    connection.query(insertQuery, [id, username, password], (error, results) => {
      if (error) {
        console.error('Error adding professor:', error);
        return;
      }
      console.log('Professor added:', results.insertId);
  
 
    });
  });

  //handle student enrollment
  
  socket.on('enrollStudents', (enrollmentData) => {
    const { subjectId, studentIds } = enrollmentData;
  
    // Check if the students are already enrolled in the subject
    const selectQuery = 'SELECT Student_id FROM Subject_Students WHERE Subject_id = ? AND Student_id IN (?)';
    connection.query(selectQuery, [subjectId, studentIds], (error, results) => {
      if (error) {
        console.error('Error checking existing enrollments:', error);
        return;
      }
  
      const enrolledStudentIds = results.map((Subject_Students) => Subject_Students.Student_id);
      const newStudentIds = studentIds.filter((studentId) => !enrolledStudentIds.includes(studentId));
  
      // Prepare the enrollment data as an array of arrays for bulk insert
      const enrollments = newStudentIds.map((studentId) => [subjectId, studentId]);
  
      const insertQuery = 'INSERT INTO Subject_Students (Subject_id, Student_id) VALUES ?';
      connection.query(insertQuery, [enrollments], (error, results) => {
        if (error) {
          console.error('Error enrolling students:', error);
          return;
        }
  
        console.log('Students enrolled in subject:', results.affectedRows);
  
    
      });
    });
  });
  

  // Handle searching for students
socket.on('searchStudents', (searchInput) => {
  const { studentId, name, lastname } = searchInput;
  let query = 'SELECT * FROM Students WHERE 1=1';
  const params = [];

  if (studentId) {
    query += ' AND ID = ?';
    params.push(studentId);
  }

  if (name && lastname) {
    query += ' AND Name = ? AND Lastname = ?';
    params.push(name, lastname);
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error searching for students:', error);
      return;
    }

    // Fetch all grades for each student
    const studentIds = results.map((student) => student.ID);
    const gradeQuery = `
      SELECT grades.*, subjects.Name AS SubjectName
      FROM grades
      JOIN subjects ON grades.Subject_id = Subjects.ID
      WHERE grades.Student_id IN (?)
    `;

    connection.query(gradeQuery, [studentIds], (error, grades) => {
      if (error) {
        console.error('Error retrieving grades:', error);
        return;
      }

      // Organize the grades by student ID
      const gradesByStudentId = {};
      grades.forEach((grade) => {
        const studentId = grade.Student_id;
        if (!gradesByStudentId[studentId]) {
          gradesByStudentId[studentId] = [];
        }
        gradesByStudentId[studentId].push(grade);
      });

      // Add grades data to the student object
      results.forEach((student) => {
        const studentGrades = gradesByStudentId[student.ID] || [];
        student.grades = studentGrades;
      });

      socket.emit('searchResults', results);
    });
  });
});

// Handle professor login
socket.on('professorLogin', (credentials) => {
  const { username, password } = credentials;

  // Query the database to find the professor with the provided username
  const selectQuery = 'SELECT * FROM Professor WHERE Username = ?';
  connection.query(selectQuery, [username], (error, results) => {
    if (error) {
      console.error('Error retrieving professor data:', error);
      socket.emit('loginResponse', { success: false, message: 'Invalid credentials' });
      return;
    }

    if (results.length === 0) {
      socket.emit('loginResponse', { success: false, message: 'Invalid credentials' });
      return;
    }

    const professor = results[0];

    // Compare the provided password with the stored password
    if (password === professor.Password) {
      // Successful login
      socket.emit('loginResponse', { success: true, message: 'Professor login successful' });
    } else {
      // Invalid password
      socket.emit('loginResponse', { success: false, message: 'Invalid credentials' });
    }
  });
});
// Handle admin login
socket.on('adminLogin', (credentials) => {
  const { username, password } = credentials;

  // Query the database to find the professor with the provided username
  const selectQuery = 'SELECT * FROM Admin WHERE Username = ?';
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

    const admin = results[0];

    // Compare the provided password with the stored password
    if (password === admin.Password) {
      // Successful login
      socket.emit('loginResponse', { success: true, message: 'Admin login successful' });
    } else {
      // Invalid password
      socket.emit('loginResponse', { success: false, message: 'Invalid credentials' });
    }
  });
});
// Handle getting subjects
socket.on('getSubjects', () => {
  const selectQuery = 'SELECT * FROM Subjects';
  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Error retrieving subject data:', error);
      return;
    }
    const subjectsData = results;
    socket.emit('subjectData', subjectsData);
  });
});
// Handle getting students by subject
socket.on('getStudentsBySubject', (subjectId) => {
  console.log('Received subject ID:', subjectId);

  const selectQuery = 'SELECT Students.* FROM Students JOIN Subject_Students ON Students.ID = Subject_Students.Student_id WHERE Subject_Students.Subject_id = ?';
  console.log('Query:', selectQuery);

  connection.query(selectQuery, [subjectId], (error, results) => {
    if (error) {
      console.error('Error retrieving students by subject:', error);
      return;
    }
    const studentsData = results;
    console.log('Students data:', results);
    console.log('Emitting studentsBySubjectData:', studentsData);
    socket.emit('studentsBySubjectData', studentsData);
  });
});



// Handle saving grades
socket.on('saveGrade', (data) => {
  const { studentId, subjectId, grade } = data;
  console.log('Subject ID:', subjectId);
  const insertQuery = 'INSERT INTO Grades (ID, Subject_id, Student_id, Grade) VALUES (?, ?, ?, ?)';
  connection.query(insertQuery, [null, subjectId, studentId, grade], (error) => {
    if (error) {
      console.error('Error saving grade:', error);
      return;
    }

    // Emit the updated grade back to the client
    io.emit('gradeSaved', { subjectId, studentId, grade });
  });
});
  // Handle getting overall grade statistics for all students
  socket.on('getOverallGradeStatistics', () => {
    const selectQuery = 'SELECT AVG(CAST(Grade AS DECIMAL(10,1))) AS averageGrade, MIN(CAST(Grade AS DECIMAL(10,2))) AS minGrade, MAX(CAST(Grade AS DECIMAL(10,2))) AS maxGrade FROM grades WHERE Grade IS NOT NULL';
    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error('Error retrieving overall grade statistics:', error);
        return;
      }
      const statistics = results[0];
      socket.emit('overallGradeStatistics', statistics);
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


// Start the server
const port = 3000;
http.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
