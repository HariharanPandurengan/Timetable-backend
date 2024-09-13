const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')

const app = express()
app.use(cors());
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/ttGen');

const db = mongoose.connection;
// Check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
    console.error(err);
});

// Function to hash the password
const hashPassword = async (password) => {
    try {
        const saltRounds = 10; // Number of salt rounds for bcrypt hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password');
    }
};

// Function to compare the password with its hash
const comparePassword = async (password, hashedPassword) => {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        throw new Error('Error comparing password');
    }
};

const TeachersListSchema = new mongoose.Schema({
    Name : String,
    Email : String,
    ID : Number,
    Subjects : Array,
}, { collection: 'TeachersList' }); 
// Define a model
const TeachersListSchemaModel = mongoose.model('TeachersList', TeachersListSchema);

const SubjectsListSchema = new mongoose.Schema({
    Subjects : Array,
    Sections : Object
}, { collection: 'SubjectsList' }); 
// Define a model
const SubjectsListSchemaModel = mongoose.model('SubjectsList', SubjectsListSchema);

const TTSchema = new mongoose.Schema({
    Timetable : Object,
}, { collection: 'Timetable' }); 
// Define a model
const TTSchemaModel = mongoose.model('Timetable', TTSchema);

app.get('/getTeachers', async (req, res) => {
    try {
        const teachers = await TeachersListSchemaModel.find();
        res.json({teachers})            
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/checkTeacherID', async (req, res) => {

    const { TeacherID } = req.body;

    const teacher = await TeachersListSchemaModel.findOne({ ID : TeacherID });

    if (teacher) {
        res.json({ message: 'ID already exist' });
    } 
    else{
        res.json({ message: 'ID not exist' });
    }

});

app.post('/createTeacher', async (req, res) => {

    const { TeacherDetails } = req.body;

    const newTeacher = new TeachersListSchemaModel({
        Name : TeacherDetails.Name,
        Email : TeacherDetails.Email,
        ID : TeacherDetails.ID,
        Subjects : TeacherDetails.Subjects,
    });

    newTeacher.save()
    .then(() => {
        res.json({ message: 'Teacher added successfully' });
    })
    .catch(err => {
        res.status(500).json({ error: err.message });
    });
    
});

app.post('/deleteTeacher', async (req, res) => {
    const { TeacherID } = req.body;

    const teacher = await TeachersListSchemaModel.deleteOne({ ID: TeacherID });

    if (teacher.deletedCount > 0) {
        res.json({ message: 'Teacher Deleted Successfully' });
    } else {
        res.status(404).json({ message: 'Teacher Not Found or Already Deleted' });
    }
});

app.post('/subjectsList', async (req, res) => {
    const { subjectsList11and12 , sections } = req.body;

    const list = await SubjectsListSchemaModel.findOne({ "Subjects" : { $exists: true }  });

    if (list) {
        SubjectsListSchemaModel.updateOne(
            { "Subjects" : { $exists: true } },
            { $set: { Subjects: subjectsList11and12 , Sections : sections} }
        ).then(() => {
            res.status(200).json({ message: 'Subjects list updated successfully' });
        }).catch(error => {
            res.status(500).json({ message: 'Error updating subjects list', error: error });
        });
    } else {

        const newSubjectList = new SubjectsListSchemaModel({
            Subjects: subjectsList11and12,
            Sections : sections
        });

        newSubjectList.save()
            .then(() => {
                res.status(200).json({ message: 'Subjects list created successfully' });
            }).catch(error => {
                res.status(500).json({ message: 'Error creating subjects list', error: error });
            });
    }
});

app.get('/getSubjectsList', async (req, res) => {
    try {
        const subs = await SubjectsListSchemaModel.find();
        res.json({subs})            
    } catch (error) {
        console.error('Error fetching subjectsList:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/SaveTimetable', async (req, res) => {

    const { finalOut } = req.body;
    const TT = await TTSchemaModel.findOne({ "Timetable" : { $exists: true }  });

    if(!TT){
        const newTT = new TTSchemaModel({
            Timetable : finalOut,
        });
    
        newTT.save()
        .then(() => {
            res.json({ message: 'Time Table updated successfully' });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
    }
    else{
        TTSchemaModel.updateOne(
            { "Timetable" : { $exists: true } },
            { $set: { Timetable: finalOut} }
        ).then(() => {
            res.status(200).json({ message: 'Time Table updated successfully' });
        }).catch(error => {
            res.status(500).json({ message: 'Error updating subjects list', error: error });
        });
    }
    
});

app.get('/getTT', async (req, res) => {
    try {
        const tt = await TTSchemaModel.find();
        res.json({tt})            
    } catch (error) {
        console.error('Error fetching subjectsList:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(3001, () => {
    console.log("server is running")
})