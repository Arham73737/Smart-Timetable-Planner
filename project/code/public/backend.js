// Core Entities
class Classroom {
  #id;
  #capacity;
  constructor(id, capacity) {
    this.#id = id;
    this.#capacity = capacity;
  }
  get id() {
    return this.#id;
  }
  get capacity() {
    return this.#capacity;
  }
}

class Instructor {
  #id;
  #name;
  constructor(id, name) {
    this.#id = id;
    this.#name = name;
    this.courses = new Set();
  }
  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }
}

class Student {
  #id;
  #name;
  constructor(id, name) {
    this.#id = id;
    this.#name = name;
    this.courses = new Set(); // Courses assigned to the student
  }
  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }
}

class Course {
  #id;
  #name;
  #credits;
  #students;
  #instructor;
  #slotClassroomMap = {};
  #slots = new Set();
  constructor(id, name, credits, students, instructor) {
    this.#id = id;
    this.#name = name;
    this.#credits = credits;
    this.#students = students;
    for (const student of this.#students) student.courses.add(this);
    this.#instructor = instructor;
    instructor.courses.add(this);
  }
  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get credits() {
    return this.#credits;
  }

  get students() {
    return [...this.#students];
  }

  get instructor() {
    return this.#instructor;
  }

  get slotClassroomMap() {
    return { ...this.#slotClassroomMap };
  }

  get slots() {
    return new Set(this.#slots);
  }

  isClassroomAvailable(slot, classroom) {
    for (const course of slot.courses) {
      if (Object.values(course.slotClassroomMap).includes(classroom))
        return false;
    }
    return true;
  }

  assignClassroom(slot, classroom) {
    // check if we dont have this slot
    if (!this.#slots.has(slot)) {
      throw new Error(`No such slot for this course`);
    }
    if (!this.isClassroomAvailable(slot, classroom)) return false;
    this.#slotClassroomMap[slot] = classroom;
    return true;
  }

  isSlotAvailable(slot) {
    // students other courses in same slot conflict checking
    for (const student of this.#students) {
      for (const course of student.courses) {
        if (course.slots.has(slot)) return false;
      }
    }
    // instructor's other courses in same slot conflict checking
    for (const course of this.#instructor.courses) {
      if (course.slots.has(slot)) return false;
    }
    return true;
  }

  assignSlot(slot) {
    // check if we already have this slot
    if (this.#slots.has(slot)) return false;
    if (!this.isSlotAvailable(slot)) return false;
    // add backreference of this course to this slot
    slot.courses.add(this);
    this.#slots.add(slot);
    return true;
  }

  removeSlot(slot) {
    // check if we dont have this slot
    if (!this.#slots.has(slot)) {
      return false;
    }
    // remove backreference of this course from this slot
    slot.courses.delete(this);
    this.#slots.delete(slot);
    delete this.#slotClassroomMap[slot];
    return true;
  }
}

class Department {
  #id;
  #name;
  #classrooms;
  #instructors;
  #students;
  #courses;
  constructor(id, name, classrooms, instructors, students, courses) {
    this.#id = id;
    this.#name = name;
    this.#classrooms = classrooms;
    this.#instructors = instructors;
    this.#students = students;
    this.#courses = courses;
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get classrooms() {
    return this.#classrooms;
  }
  get instructors() {
    return this.#instructors;
  }
  get students() {
    return this.#students;
  }
  get courses() {
    return this.#courses;
  }
}

class Program {
  #id;
  #name;
  #departments;
  constructor(id, name, departments) {
    this.#id = id;
    this.#name = name;
    this.#departments = departments;
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get departments() {
    return this.#departments;
  }
}

class Slot {
  #day;
  #hour;
  constructor(day, hour) {
    this.#day = day;
    this.#hour = hour;
    this.courses = new Set();
  }
  get day() {
    return this.#day;
  }
  get hour() {
    return this.#hour;
  }
}

class Session {
  #id;
  #name;
  #programs;
  #slots;
  #allCoursesById = {};
  #allClassroomsById = {};
  constructor(id, name, programs) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    this.#id = id;
    this.#name = name;
    this.#programs = programs;
    this.#slots = days.map((day) => hours.map((hour) => new Slot(day, hour)));
    for (const program of this.#programs) {
      for (const dept of program.departments) {
        for (const course of dept.courses) {
          this.#allCoursesById[course.id] = course;
        }
        for (const classroom of dept.classrooms) {
          this.#allClassroomsById[classroom.id] = classroom;
        }
      }
    }
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get programs() {
    return this.#programs;
  }

  get slots() {
    return this.#slots;
  }
  get allCoursesById() {
    return { ...this.#allCoursesById };
  }
  get allClassroomsById() {
    return { ...this.#allClassroomsById };
  }
}

function createSessionFromJson(json) {
  // Parse JSON if it's a string
  const data = typeof json === "string" ? JSON.parse(json) : json;

  // Validate required fields
  if (!data.id || !data.name || !Array.isArray(data.programs)) {
    throw new Error("Invalid session data: missing id, name, or programs");
  }

  // Maps to track entities and check for duplicate IDs
  const idMaps = {
    classrooms: new Map(),
    instructors: new Map(),
    students: new Map(),
    courses: new Map(),
  };

  // Process programs
  const programs = [];
  for (const programData of data.programs) {
    // Validate program data
    if (
      !programData.id ||
      !programData.name ||
      !Array.isArray(programData.departments)
    ) {
      throw new Error(`Invalid program data: ${JSON.stringify(programData)}`);
    }

    // Process departments
    const departments = [];
    for (const deptData of programData.departments) {
      // Validate department data
      if (
        !deptData.id ||
        !deptData.name ||
        !Array.isArray(deptData.classrooms) ||
        !Array.isArray(deptData.instructors) ||
        !Array.isArray(deptData.students) ||
        !Array.isArray(deptData.courses)
      ) {
        throw new Error(`Invalid department data: ${JSON.stringify(deptData)}`);
      }

      // Process classrooms
      const classrooms = [];
      for (const classroomData of deptData.classrooms) {
        // Validate classroom data
        if (!classroomData.id || classroomData.capacity === undefined) {
          throw new Error(
            `Invalid classroom data: ${JSON.stringify(classroomData)}`,
          );
        }

        // Check classroom ID uniqueness
        if (idMaps.classrooms.has(classroomData.id)) {
          throw new Error(`Duplicate classroom ID: ${classroomData.id}`);
        }

        // Create classroom instance
        const classroom = new Classroom(
          classroomData.id,
          classroomData.capacity,
        );
        idMaps.classrooms.set(classroomData.id, classroom);
        classrooms.push(classroom);
      }

      // Process instructors
      const instructors = [];
      for (const instructorData of deptData.instructors) {
        // Validate instructor data
        if (!instructorData.id || !instructorData.name) {
          throw new Error(
            `Invalid instructor data: ${JSON.stringify(instructorData)}`,
          );
        }

        // Check instructor ID uniqueness
        if (idMaps.instructors.has(instructorData.id)) {
          throw new Error(`Duplicate instructor ID: ${instructorData.id}`);
        }

        // Create instructor instance
        const instructor = new Instructor(
          instructorData.id,
          instructorData.name,
        );
        idMaps.instructors.set(instructorData.id, instructor);
        instructors.push(instructor);
      }

      // Process students
      const students = [];
      for (const studentData of deptData.students) {
        // Validate student data
        if (!studentData.id || !studentData.name) {
          throw new Error(
            `Invalid student data: ${JSON.stringify(studentData)}`,
          );
        }

        // Check student ID uniqueness
        if (idMaps.students.has(studentData.id)) {
          throw new Error(`Duplicate student ID: ${studentData.id}`);
        }

        // Create student instance
        const student = new Student(studentData.id, studentData.name);
        idMaps.students.set(studentData.id, student);
        students.push(student);
      }

      // Validate course data before creating instances
      for (const courseData of deptData.courses) {
        // Validate course data
        if (
          !courseData.id ||
          !courseData.name ||
          courseData.credits === undefined ||
          !Array.isArray(courseData.studentIds) ||
          !courseData.instructorId
        ) {
          throw new Error(`Invalid course data: ${JSON.stringify(courseData)}`);
        }

        // Check course ID uniqueness
        if (idMaps.courses.has(courseData.id)) {
          throw new Error(`Duplicate course ID: ${courseData.id}`);
        }

        // Check instructor existence and department membership
        const instructor = idMaps.instructors.get(courseData.instructorId);
        if (!instructor) {
          throw new Error(
            `Instructor not found with ID: ${courseData.instructorId}`,
          );
        }
        if (!instructors.includes(instructor)) {
          throw new Error(
            `Instructor ${courseData.instructorId} is not part of department ${deptData.id}`,
          );
        }

        // Check student existence and department membership
        for (const studentId of courseData.studentIds) {
          const student = idMaps.students.get(studentId);
          if (!student) {
            throw new Error(`Student not found with ID: ${studentId}`);
          }
          if (!students.includes(student)) {
            throw new Error(
              `Student ${studentId} is not part of department ${deptData.id}`,
            );
          }
        }
      }

      // Create course instances
      const courses = [];
      for (const courseData of deptData.courses) {
        const instructor = idMaps.instructors.get(courseData.instructorId);
        const courseStudents = courseData.studentIds.map((id) =>
          idMaps.students.get(id),
        );

        // Create course instance
        const course = new Course(
          courseData.id,
          courseData.name,
          courseData.credits,
          courseStudents,
          instructor,
        );

        idMaps.courses.set(courseData.id, course);
        courses.push(course);
      }

      // Create department instance
      const department = new Department(
        deptData.id,
        deptData.name,
        classrooms,
        instructors,
        students,
        courses,
      );
      departments.push(department);
    }

    // Create program instance
    const program = new Program(programData.id, programData.name, departments);
    programs.push(program);
  }

  // Create and return session instance
  const session = new Session(data.id, data.name, programs);
  return session;
}
