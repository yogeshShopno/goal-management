const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

// Test users (you need to create these in your database first)
const testData = {
  adminA: {
    email: "admin-a@test.com",
    password: "password123",
    token: null,
    id: null,
  },
  adminB: {
    email: "admin-b@test.com",
    password: "password123",
    token: null,
    id: null,
  },
  staffA1: {
    email: "staff-a1@test.com",
    password: "password123",
    token: null,
    id: null,
  },
  staffB1: {
    email: "staff-b1@test.com",
    password: "password123",
    token: null,
    id: null,
  },
};

const axiosInstance = axios.create({
  baseURL: API_BASE,
  validateStatus: () => true, // Don't throw on any status code
});

async function login(email, password, label) {
  try {
    console.log(`\n📝 Logging in as ${label} (${email})...`);
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    if (response.status !== 200) {
      console.log(`❌ Login failed: ${response.data?.message || response.status}`);
      return null;
    }

    const token = response.data.data.token;
    const userId = response.data.data.user._id;
    console.log(`✅ Login successful for ${label}`);
    return { token, userId };
  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
    return null;
  }
}

async function testGoalAccess() {
  console.log("\n\n=== TESTING GOAL ACCESS CONTROL ===\n");

  // Login all users
  for (const [key, user] of Object.entries(testData)) {
    const result = await login(user.email, user.password, key);
    if (result) {
      testData[key].token = result.token;
      testData[key].id = result.userId;
    }
  }

  // Test 1: Admin A tries to view all goals
  console.log("\n🧪 Test 1: Admin A views goals");
  const adminAGoals = await axiosInstance.get("/goals", {
    headers: { Authorization: `Bearer ${testData.adminA.token}` },
  });
  console.log(`Status: ${adminAGoals.status}`);
  console.log(`Goals count: ${adminAGoals.data?.data?.length || 0}`);

  // Test 2: Admin B tries to view all goals (should be different from Admin A)
  console.log("\n🧪 Test 2: Admin B views goals");
  const adminBGoals = await axiosInstance.get("/goals", {
    headers: { Authorization: `Bearer ${testData.adminB.token}` },
  });
  console.log(`Status: ${adminBGoals.status}`);
  console.log(`Goals count: ${adminBGoals.data?.data?.length || 0}`);

  // Compare goals visible to Admin A vs Admin B
  const adminAGoalIds = adminAGoals.data?.data?.map((g) => g._id) || [];
  const adminBGoalIds = adminBGoals.data?.data?.map((g) => g._id) || [];
  const commonGoals = adminAGoalIds.filter((id) => adminBGoalIds.includes(id));

  console.log(`\n📊 Admin A goals: ${adminAGoalIds.length}`);
  console.log(`📊 Admin B goals: ${adminBGoalIds.length}`);
  console.log(`📊 Common goals: ${commonGoals.length}`);

  if (commonGoals.length === 0) {
    console.log(
      "✅ PASS: Admin A and Admin B see different goals (no overlap)"
    );
  } else {
    console.log(
      "❌ FAIL: Admin A and Admin B share visible goals (they should be isolated)"
    );
  }

  // Test 3: Query parameter bypass - Admin A tries to view Admin B's goals by parameter
  console.log("\n🧪 Test 3: Admin A tries parameter bypass (get Admin B's goal)");
  if (adminBGoalIds.length > 0) {
    const targetGoalId = adminBGoalIds[0];
    const bypassAttempt = await axiosInstance.get("/goals", {
      params: { ownerId: targetGoalId }, // This should now be ignored
      headers: { Authorization: `Bearer ${testData.adminA.token}` },
    });
    console.log(`Status: ${bypassAttempt.status}`);

    const hasTargetGoal = bypassAttempt.data?.data?.some(
      (g) => g._id === targetGoalId
    );
    if (!hasTargetGoal) {
      console.log("✅ PASS: Query parameter bypass blocked");
    } else {
      console.log("❌ FAIL: Query parameter bypass still possible");
    }
  } else {
    console.log("⏭️  SKIP: No Admin B goals to test bypass");
  }

  // Test 4: Staff A1 tries to view Staff B1's tasks (different admin)
  console.log("\n🧪 Test 4: Staff A1 tries to view Staff B1's assigned tasks");
  // This would require creating tasks first, so we'll just check task fetch
  const staffA1Tasks = await axiosInstance.get("/tasks", {
    headers: { Authorization: `Bearer ${testData.staffA1.token}` },
  });
  console.log(`Status: ${staffA1Tasks.status}`);
  console.log(`Tasks visible to Staff A1: ${staffA1Tasks.data?.data?.length || 0}`);
}

async function testCreateGoalAuth() {
  console.log("\n\n=== TESTING GOAL CREATION AUTHORIZATION ===\n");

  // Test: Admin A tries to create goal for Admin B
  console.log("\n🧪 Test: Admin A tries to create goal with Admin B as owner");
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const invalidCreate = await axiosInstance.post(
    "/goals",
    {
      name: "Test Goal",
      description: "Test",
      startDate: today,
      deadline: tomorrow,
      ownerId: testData.adminB.id, // Try to assign to Admin B
      responsibleId: testData.adminA.id,
      status: "todo",
      priority: "medium",
    },
    {
      headers: { Authorization: `Bearer ${testData.adminA.token}` },
    }
  );

  console.log(`Status: ${invalidCreate.status}`);
  if (invalidCreate.status === 403) {
    console.log(`✅ PASS: Creation blocked with message: ${invalidCreate.data?.message}`);
  } else if (invalidCreate.status === 201) {
    console.log("❌ FAIL: Admin A was able to create goal for Admin B");
  } else {
    console.log(`⚠️  Unexpected status: ${invalidCreate.status}`);
  }
}

async function runTests() {
  console.log("🚀 Starting Access Control Tests...");
  console.log("⏳ Note: This test requires test users to exist in the database");

  try {
    await testGoalAccess();
    await testCreateGoalAuth();

    console.log("\n\n✨ Tests completed! Check results above.");
  } catch (error) {
    console.error("💥 Test error:", error.message);
  }

  process.exit(0);
}

// Run tests
runTests();
