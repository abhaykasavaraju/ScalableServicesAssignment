const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
app.use(express.json());

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Opentext1',
    database: 'learning_platform'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Add assignments for a course
app.post('/assignments/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    const { assignmentDescription, startDate, endDate } = req.body;

    if (!assignmentDescription || !startDate || !endDate) {
        return res.status(400).send('Missing required fields in the request body');
    }

    try {
        // Fetch students from the API
        const response = await axios.get(`http://localhost:8081/api/getStudentsInCourse/${courseId}`);
        const students = response.data;

        if (!students.length) {
            return res.status(404).send('No students found for the given course');
        }

        // Insert entries into the assignments table
        const insertPromises = students.map(student => {
            if (student.enrollmentStatus === 'ENROLLED' && student.coursePaymentStatus) {
                const sql = `
                    INSERT INTO assignments (
                        student_id, course_id, assignment_description, start_date, end_date
                    ) VALUES (?, ?, ?, ?, ?)
                `;
                const values = [
                    student.username, // Student username
                    student.courseId, // Course ID
                    assignmentDescription,
                    startDate,
                    endDate
                ];

                return new Promise((resolve, reject) => {
                    db.query(sql, values, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }
        });

        await Promise.all(insertPromises);
        res.send('Assignments added successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while adding assignments');
    }
});

// Get assignments by course
app.get('/assignments/course/:courseId', (req, res) => {
    const courseId = req.params.courseId;

    const sql = `
        SELECT * FROM assignments
        WHERE course_id = ?
    `;
    db.query(sql, [courseId], (err, results) => {
        if (err) {
            console.error('Error fetching assignments:', err);
            return res.status(500).send('An error occurred while fetching assignments');
        }
        res.json(results);
    });
});

// Get assignments by student
app.get('/assignments/student/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    const sql = `
        SELECT * FROM assignments
        WHERE student_id = ?
    `;
    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching assignments:', err);
            return res.status(500).send('An error occurred while fetching assignments');
        }
        res.json(results);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Assignments microservice running on port 3000');
});
