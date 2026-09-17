const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

function readDatabase() {
  if (!fs.existsSync(dbPath)) return { users: [], plans: [], mealLibrary: [] };
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDatabase(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function signUp(name, email, password) {
  const db = readDatabase();
  const cleanedName = String(name || '').trim();
  const emailValue = normalizeEmail(email);
  const passwordValue = String(password || '').trim();

  if (!cleanedName || !emailValue || !passwordValue) {
    return { ok: false, message: 'Name, email and password are required' };
  }

  if (passwordValue.length < 4) {
    return { ok: false, message: 'Password must be at least 4 characters' };
  }

  const existing = db.users.find(user => user.email === emailValue);
  if (existing) return { ok: false, message: 'User already exists' };

  const user = {
    id: Date.now().toString(),
    name: cleanedName,
    email: emailValue,
    password: passwordValue,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDatabase(db);

  return { ok: true, user };
}

function signIn(email, password) {
  const db = readDatabase();
  const emailValue = normalizeEmail(email);
  const passwordValue = String(password || '').trim();

  if (!emailValue || !passwordValue) {
    return { ok: false, message: 'Email and password are required' };
  }

  const user = db.users.find(item => item.email === emailValue && item.password === passwordValue);
  if (!user) return { ok: false, message: 'Invalid email or password' };

  return { ok: true, user };
}

function savePlan(userEmail, goal, meals) {
  const db = readDatabase();
  const emailValue = normalizeEmail(userEmail);
  const safeGoal = String(goal || 'healthy weight').trim();
  const safeMeals = Array.isArray(meals) ? meals : [];

  if (!emailValue || !safeGoal) {
    return { ok: false, message: 'Plan requires a valid user and goal' };
  }

  const now = new Date().toISOString();
  db.plans.push({
    userEmail: emailValue,
    goal: safeGoal,
    meals: safeMeals,
    createdAt: now
  });

  writeDatabase(db);
  return { ok: true, message: 'Plan saved successfully' };
}

module.exports = { readDatabase, signUp, signIn, savePlan };
