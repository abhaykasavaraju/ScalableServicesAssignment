const express = require('express');
const app = express();

app.use(express.json());

// Mock response for course1
app.get('/api/getStudentsInCourse/:courseId', (req, res) => {
    const { courseId } = req.params;

    // Simulated response
    if (courseId === 'course1') {
        return res.json([
            {
                username: "student1",
                courseId: "course1",
                enrollmentStatus: "ENROLLED",
                coursePaymentStatus: true,
                discontinueReason: null
            },
            {
                username: "student2",
                courseId: "course1",
                enrollmentStatus: "ENROLLED",
                coursePaymentStatus: true,
                discontinueReason: null
            },
            {
                username: "student3",
                courseId: "course1",
                enrollmentStatus: "DISCONTINUED",
                coursePaymentStatus: false,
                discontinueReason: "Personal reasons"
            }
        ]);
    }

    // Default response for other courses
    res.status(404).json({ message: "Course not found or no students enrolled" });
});

// Start the mock server
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Mock service running on port ${PORT}`);
});
