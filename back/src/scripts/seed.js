/**
 * Database Seed Script
 * 
 * This script populates the database with sample data for testing and development.
 * 
 * Usage:
 *   node src/scripts/seed.js
 * 
 * Make sure MongoDB is running before executing this script.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const User = require("../models/User");
const Goal = require("../models/Goal");
const Action = require("../models/Action");
const Task = require("../models/Task");

const connectDatabase = async (mongoUri) => {
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected for seeding");
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Goal.deleteMany({});
    await Action.deleteMany({});
    await Task.deleteMany({});

    // Create sample users
    console.log("Creating sample users...");
    const users = await User.create([
      {
        name: "Admin User",
        email: "ravichovatiya@gmail.com",
        password: "Ravi@123",
        role: "admin",
      },
      {
        name: "Manager User",
        email: "manager@example.com",
        password: "manager123",
        role: "manager",
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: "john123",
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "jane123",
        role: "user",
      },
      {
        name: "Bob Wilson",
        email: "bob@example.com",
        password: "bob123",
        role: "user",
      },
    ]);

    console.log(`✓ Created ${users.length} users`);

    // Create sample goals
    console.log("Creating sample goals...");
    const goals = await Goal.create([
      {
        name: "25 Students Admission",
        description: "Achieve 25 new student admissions for this academic year.",
        startDate: new Date("2025-07-01"),
        deadline: new Date("2025-10-31"),
        ownerId: users[0]._id,
        responsibleId: users[1]._id,
        status: "in_progress",
        priority: "high",
      },
      {
        name: "Launch New Website",
        description: "Redesign and launch the company website with modern stack.",
        startDate: new Date("2025-08-01"),
        deadline: new Date("2025-11-30"),
        ownerId: users[0]._id,
        responsibleId: users[2]._id,
        status: "in_progress",
        priority: "medium",
      },
      {
        name: "Improve Customer Service",
        description: "Enhance customer service processes and training.",
        startDate: new Date("2025-09-01"),
        deadline: new Date("2025-12-31"),
        ownerId: users[1]._id,
        responsibleId: users[3]._id,
        status: "todo",
        priority: "high",
      },
      {
        name: "Expand Product Line",
        description: "Develop and launch 3 new product variants.",
        startDate: new Date("2025-10-01"),
        deadline: new Date("2026-01-31"),
        ownerId: users[1]._id,
        responsibleId: users[4]._id,
        status: "pending",
        priority: "medium",
      },
    ]);

    console.log(`✓ Created ${goals.length} goals`);

    // Create sample actions
    console.log("Creating sample actions...");
    const actions = await Action.create([
      {
        goalId: goals[0]._id,
        name: "Pamphlets Distribution",
        description: "Design, print, and distribute pamphlets across the city.",
        startDate: new Date("2025-09-01"),
        deadline: new Date("2025-10-05"),
        ownerId: users[1]._id,
        assignedUserIds: [users[1]._id, users[2]._id],
        priority: "high",
        status: "in_progress",
      },
      {
        goalId: goals[0]._id,
        name: "Newspaper Ads",
        description: "Place ads in top local newspapers.",
        startDate: new Date("2025-09-10"),
        deadline: new Date("2025-10-07"),
        ownerId: users[3]._id,
        assignedUserIds: [users[3]._id, users[4]._id],
        priority: "medium",
        status: "pending",
      },
      {
        goalId: goals[1]._id,
        name: "Design New Homepage",
        description: "Create modern, responsive homepage design.",
        startDate: new Date("2025-08-01"),
        deadline: new Date("2025-09-15"),
        ownerId: users[2]._id,
        assignedUserIds: [users[2]._id],
        priority: "high",
        status: "in_progress",
      },
      {
        goalId: goals[1]._id,
        name: "Backend API Development",
        description: "Develop RESTful APIs for website functionality.",
        startDate: new Date("2025-08-15"),
        deadline: new Date("2025-10-15"),
        ownerId: users[2]._id,
        assignedUserIds: [users[2]._id, users[4]._id],
        priority: "high",
        status: "in_progress",
      },
      {
        goalId: goals[2]._id,
        name: "Create Training Program",
        description: "Develop comprehensive customer service training.",
        startDate: new Date("2025-09-01"),
        deadline: new Date("2025-10-01"),
        ownerId: users[3]._id,
        assignedUserIds: [users[3]._id],
        priority: "high",
        status: "todo",
      },
    ]);

    console.log(`✓ Created ${actions.length} actions`);

    // Create sample tasks
    console.log("Creating sample tasks...");
    const tasks = await Task.create([
      {
        actionId: actions[0]._id,
        name: "Create content for pamphlets",
        description: "Write copy, headlines, and call-to-action for pamphlets.",
        startDate: new Date("2025-09-01"),
        deadline: new Date("2025-09-30"),
        assignedUserId: users[1]._id,
      
        priority: "high",
        status: "completed",
        completedAt: new Date("2025-09-28"),
        notes: "Content approved by Admin on Sept 28.",
        order: 0,
      },
      {
        actionId: actions[0]._id,
        name: "Design & Print pamphlets",
        description: "Graphic design and bulk printing at vendor.",
        startDate: new Date("2025-09-29"),
        deadline: new Date("2025-10-02"),
        assignedUserId: users[2]._id,
        priority: "high",
        status: "in_progress",
        notes: "",
        order: 1,
      },
      {
        actionId: actions[0]._id,
        name: "Distribution plan",
        description: "Plan routes and assign teams for distribution.",
        startDate: new Date("2025-10-01"),
        deadline: new Date("2025-10-03"),
        assignedUserId: users[0]._id,
        priority: "medium",
        status: "todo",
        notes: "",
        order: 2,
      },
      {
        actionId: actions[2]._id,
        name: "Wireframing",
        description: "Create wireframes for new homepage.",
        startDate: new Date("2025-08-01"),
        deadline: new Date("2025-08-15"),
        assignedUserId: users[2]._id,
        priority: "high",
        status: "completed",
        completedAt: new Date("2025-08-14"),
        notes: "Approved by Manager",
        order: 0,
      },
      {
        actionId: actions[2]._id,
        name: "Visual Design",
        description: "Create detailed visual design and mockups.",
        startDate: new Date("2025-08-16"),
        deadline: new Date("2025-09-15"),
        assignedUserId: users[2]._id,
        priority: "high",
        status: "in_progress",
        notes: "",
        order: 1,
      },
      {
        actionId: actions[3]._id,
        name: "Database Schema Design",
        description: "Design database schema and create migrations.",
        startDate: new Date("2025-08-15"),
        deadline: new Date("2025-09-01"),
        assignedUserId: users[4]._id,
        priority: "high",
        status: "in_progress",
        notes: "",
        order: 0,
      },
      {
        actionId: actions[3]._id,
        name: "API Endpoints Implementation",
        description: "Implement all required API endpoints.",
        startDate: new Date("2025-09-02"),
        deadline: new Date("2025-10-01"),
        assignedUserId: users[2]._id,
        priority: "high",
        status: "in_progress",
        notes: "",
        order: 1,
      },
      {
        actionId: actions[3]._id,
        name: "API Testing and Documentation",
        description: "Test APIs and create comprehensive documentation.",
        startDate: new Date("2025-10-02"),
        deadline: new Date("2025-10-15"),
        assignedUserId: users[4]._id,
        priority: "medium",
        status: "todo",
        notes: "",
        order: 2,
      },
    ]);

    console.log(`✓ Created ${tasks.length} tasks`);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\nTest Credentials:");
    console.log("Admin - admin@example.com / admin123");
    console.log("Manager - manager@example.com / manager123");
    console.log("User - john@example.com / john123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Execute seeding
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("Error: MONGO_URI environment variable is not set");
  process.exit(1);
}

connectDatabase(mongoUri).then(() => {
  seedDatabase();
});
