require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = (
  process.env.MONGO_URI ||
  `mongodb://127.0.0.1:27017/${process.env.SERVICE_NAME || "axion"}`
).replace(/^mongodb:\/\/localhost\//, "mongodb://127.0.0.1/");

mongoose.set("strictQuery", true);

const User = require("./managers/entities/user/user.mongoModel");
const School = require("./managers/entities/school/school.mongoModel");
const Grade = require("./managers/entities/grade/grade.mongoModel");
const Classroom = require("./managers/entities/classroom/classroom.mongoModel");
const Student = require("./managers/entities/student/student.mongoModel");

const COMMON_PASSWORD = "password123";

function generateCardId(dateOfBirth) {
  const d = new Date(dateOfBirth);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const base = `${y}${m}${day}`;
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const r = () => chars[Math.floor(Math.random() * chars.length)];
  return base + r() + r();
}

const SCHOOLS_SEED = [
  {
    school: {
      name: "Test High School",
      address: "123 Education St, Test City",
      phone: "1234567890",
      email: "contact@testhigh.edu",
      principalName: "Jane Principal",
      establishedYear: 2020,
    },
    schoolAdmin: {
      username: "schooladmin1",
      email: "schooladmin1@test.com",
      password: COMMON_PASSWORD,
      role: "school_admin",
    },
    grades: [
      { name: "Grade 10", sortOrder: 10 },
      { name: "Grade 11", sortOrder: 11 },
    ],
    classrooms: [
      {
        name: "Class 10-A",
        gradeLabel: "10",
        section: "A",
        roomNumber: "101",
        capacity: 30,
        resources: ["Projector", "Whiteboard"],
      },
      {
        name: "Class 10-B",
        gradeLabel: "10",
        section: "B",
        roomNumber: "102",
        capacity: 28,
        resources: ["Whiteboard"],
      },
      {
        name: "Class 11-A",
        gradeLabel: "11",
        section: "A",
        roomNumber: "201",
        capacity: 30,
        resources: ["Projector", "Whiteboard", "Lab"],
      },
    ],
    staff: [
      {
        username: "teacher1_s1",
        email: "teacher1@testhigh.edu",
        password: COMMON_PASSWORD,
        role: "teacher",
        assignToClassrooms: [0, 1],
      },
      {
        username: "teacher2_s1",
        email: "teacher2@testhigh.edu",
        password: COMMON_PASSWORD,
        role: "teacher",
        assignToClassrooms: [2],
      },
      {
        username: "cafeteria_s1",
        email: "cafeteria@testhigh.edu",
        password: COMMON_PASSWORD,
        role: "cafeteria_staff",
      },
      {
        username: "security_s1",
        email: "security@testhigh.edu",
        password: COMMON_PASSWORD,
        role: "security",
      },
      {
        username: "hr_s1",
        email: "hr@testhigh.edu",
        password: COMMON_PASSWORD,
        role: "hr",
      },
    ],
    students: [
      {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("2010-05-15"),
        email: "john.doe@testhigh.edu",
        guardianName: "Jane Doe",
        guardianEmail: "jane.doe@test.com",
      },
      {
        firstName: "Alice",
        lastName: "Smith",
        dateOfBirth: new Date("2010-08-20"),
        email: "alice.smith@testhigh.edu",
        guardianName: "Bob Smith",
        guardianEmail: "bob@test.com",
      },
      {
        firstName: "Eve",
        lastName: "Brown",
        dateOfBirth: new Date("2009-03-10"),
        email: "eve.brown@testhigh.edu",
        guardianName: "Chris Brown",
        guardianEmail: "chris@test.com",
      },
    ],
  },
  {
    school: {
      name: "Riverside Academy",
      address: "456 River Rd, Riverside",
      phone: "9876543210",
      email: "info@riverside.edu",
      principalName: "John Director",
      establishedYear: 2018,
    },
    schoolAdmin: {
      username: "schooladmin2",
      email: "schooladmin2@test.com",
      password: COMMON_PASSWORD,
      role: "school_admin",
    },
    grades: [
      { name: "Grade 9", sortOrder: 9 },
      { name: "Grade 10", sortOrder: 10 },
    ],
    classrooms: [
      {
        name: "9-A",
        gradeLabel: "9",
        section: "A",
        roomNumber: "R101",
        capacity: 25,
        resources: ["Whiteboard"],
      },
      {
        name: "10-A",
        gradeLabel: "10",
        section: "A",
        roomNumber: "R201",
        capacity: 28,
        resources: ["Projector", "Whiteboard"],
      },
    ],
    staff: [
      {
        username: "teacher1_s2",
        email: "teacher1@riverside.edu",
        password: COMMON_PASSWORD,
        role: "teacher",
        assignToClassrooms: [0],
      },
      {
        username: "teacher2_s2",
        email: "teacher2@riverside.edu",
        password: COMMON_PASSWORD,
        role: "teacher",
        assignToClassrooms: [1],
      },
      {
        username: "cafeteria_s2",
        email: "cafeteria@riverside.edu",
        password: COMMON_PASSWORD,
        role: "cafeteria_staff",
      },
      {
        username: "security_s2",
        email: "security@riverside.edu",
        password: COMMON_PASSWORD,
        role: "security",
      },
      {
        username: "hr_s2",
        email: "hr@riverside.edu",
        password: COMMON_PASSWORD,
        role: "hr",
      },
    ],
    students: [
      {
        firstName: "Mike",
        lastName: "Wilson",
        dateOfBirth: new Date("2011-01-12"),
        email: "mike.wilson@riverside.edu",
        guardianName: "Sarah Wilson",
        guardianEmail: "sarah@test.com",
      },
      {
        firstName: "Lily",
        lastName: "Davis",
        dateOfBirth: new Date("2010-11-05"),
        email: "lily.davis@riverside.edu",
        guardianName: "Tom Davis",
        guardianEmail: "tom@test.com",
      },
    ],
  },
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }

  try {
    let superadmin = await User.findOne({ email: "superadmin@test.com" });
    if (!superadmin) {
      superadmin = await User.create({
        username: "superadmin",
        email: "superadmin@test.com",
        password: COMMON_PASSWORD,
        role: "superadmin",
      });
      console.log("Created superadmin:", superadmin.email);
    } else {
      console.log("Superadmin already exists:", superadmin.email);
    }

    const created = {
      schools: [],
      schoolAdmins: [],
      grades: [],
      classrooms: [],
      staff: [],
      students: [],
    };

    for (let s = 0; s < SCHOOLS_SEED.length; s++) {
      const config = SCHOOLS_SEED[s];
      const schoolKey = `school_${s + 1}`;

      let school = await School.findOne({ email: config.school.email });
      if (!school) {
        school = await School.create({
          ...config.school,
          createdBy: superadmin._id,
        });
        console.log(`[${schoolKey}] Created school:`, school.name);
      } else {
        console.log(`[${schoolKey}] School already exists:`, school.name);
      }
      created.schools.push(school);

      let schoolAdmin = await User.findOne({ email: config.schoolAdmin.email });
      if (!schoolAdmin) {
        schoolAdmin = await User.create({
          ...config.schoolAdmin,
          schoolId: school._id,
        });
        console.log(`[${schoolKey}] Created school admin:`, schoolAdmin.email);
      } else {
        console.log(
          `[${schoolKey}] School admin already exists:`,
          schoolAdmin.email,
        );
      }
      created.schoolAdmins.push(schoolAdmin);

      const gradeDocs = [];
      for (const g of config.grades) {
        let grade = await Grade.findOne({ schoolId: school._id, name: g.name });
        if (!grade) {
          grade = await Grade.create({
            name: g.name,
            schoolId: school._id,
            sortOrder: g.sortOrder,
            createdBy: superadmin._id,
          });
          console.log(`[${schoolKey}] Created grade:`, grade.name);
        }
        gradeDocs.push(grade);
      }
      created.grades.push(...gradeDocs);

      const classroomDocs = [];
      for (let c = 0; c < config.classrooms.length; c++) {
        const cl = config.classrooms[c];
        const gradeDoc =
          gradeDocs.find((gr) => gr.name.includes(cl.gradeLabel)) ||
          gradeDocs[0];
        let classroom = await Classroom.findOne({
          schoolId: school._id,
          name: cl.name,
        });
        if (!classroom) {
          classroom = await Classroom.create({
            name: cl.name,
            schoolId: school._id,
            gradeId: gradeDoc._id,
            capacity: cl.capacity,
            grade: cl.gradeLabel,
            section: cl.section,
            roomNumber: cl.roomNumber,
            resources: cl.resources || [],
            createdBy: superadmin._id,
          });
          console.log(`[${schoolKey}] Created classroom:`, classroom.name);
        }
        classroomDocs.push(classroom);
      }
      created.classrooms.push(...classroomDocs);

      for (const st of config.staff) {
        const { assignToClassrooms, ...userFields } = st;
        let user = await User.findOne({ email: userFields.email });
        if (!user) {
          const assignedIds = Array.isArray(assignToClassrooms)
            ? assignToClassrooms.map((i) => classroomDocs[i]._id)
            : [];
          user = await User.create({
            username: userFields.username,
            email: userFields.email,
            password: userFields.password,
            role: userFields.role,
            schoolId: school._id,
            assignedClassroomIds: assignedIds,
          });
          console.log(
            `[${schoolKey}] Created staff:`,
            user.email,
            `(${user.role})`,
          );
        }
        created.staff.push(user);
      }

      for (let i = 0; i < config.students.length; i++) {
        const stu = config.students[i];
        const classroom = classroomDocs[i % classroomDocs.length];
        let student = await Student.findOne({
          schoolId: school._id,
          email: stu.email,
        });
        if (!student) {
          const cardId = generateCardId(stu.dateOfBirth);
          student = await Student.create({
            ...stu,
            cardId,
            schoolId: school._id,
            classroomId: classroom._id,
            createdBy: superadmin._id,
          });
          await Classroom.findByIdAndUpdate(classroom._id, {
            $inc: { currentEnrollment: 1 },
          });
          console.log(`[${schoolKey}] Created student:`, student.cardId);
        }
        created.students.push(student);
      }
    }

    console.log("\n--- Seed complete. Use these to test ---\n");
    console.log("Superadmin:");
    console.log("  email: superadmin@test.com");
    console.log("  password:", COMMON_PASSWORD);
    console.log("\nSchool 1 (Test High School):");
    console.log("  school admin: schooladmin1@test.com /", COMMON_PASSWORD);
    console.log("  schoolId:", created.schools[0]._id.toString());
    console.log("  teachers: teacher1@testhigh.edu, teacher2@testhigh.edu");
    console.log(
      "  cafeteria: cafeteria@testhigh.edu | security: security@testhigh.edu | hr: hr@testhigh.edu",
    );
    console.log("\nSchool 2 (Riverside Academy):");
    console.log("  school admin: schooladmin2@test.com /", COMMON_PASSWORD);
    console.log("  schoolId:", created.schools[1]._id.toString());
    console.log("  teachers: teacher1@riverside.edu, teacher2@riverside.edu");
    console.log(
      "  cafeteria: cafeteria@riverside.edu | security: security@riverside.edu | hr: hr@riverside.edu",
    );
    console.log("\nAll staff passwords:", COMMON_PASSWORD);
    console.log("");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

run();
