// Fills MongoDB with demo data:  npm run seed
// WARNING: it deletes existing users, projects, applications and notifications first.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Project.deleteMany(), Application.deleteMany(), Notification.deleteMany()]);

  const passwordHash = await bcrypt.hash('Password123', 10);
  const mk = (data) => ({ passwordHash, ...data });

  const f = await User.insertMany([
    mk({ name: 'Aarav Sharma', email: 'freelancer1@flexi.dev', role: 'freelancer', headline: 'React & Next.js Developer', bio: 'I build fast, accessible web apps for startups. Four years of shipping React front-ends with clean component architecture.', skills: ['React', 'JavaScript', 'CSS', 'Next.js'], experience: 4, hourlyRate: 28, availability: 'available', location: 'Nagpur, India', education: 'B.Tech Computer Science', portfolio: [{ title: 'GitHub', url: 'https://github.com' }] }),
    mk({ name: 'Priya Nair', email: 'freelancer2@flexi.dev', role: 'freelancer', headline: 'Product & UI/UX Designer', bio: 'Designer focused on simple flows and strong visual systems. I turn messy ideas into clickable prototypes.', skills: ['Figma', 'UI Design', 'Prototyping', 'Branding'], experience: 5, hourlyRate: 35, availability: 'available', location: 'Pune, India', education: 'B.Des Interaction Design', portfolio: [{ title: 'Behance', url: 'https://www.behance.net' }] }),
    mk({ name: 'Rohan Mehta', email: 'freelancer3@flexi.dev', role: 'freelancer', headline: 'Node.js & MongoDB Backend Engineer', bio: 'I design REST APIs, authentication and databases that stay fast as products grow.', skills: ['Node.js', 'Express', 'MongoDB', 'JWT'], experience: 6, hourlyRate: 40, availability: 'busy', location: 'Mumbai, India', education: 'M.Sc Information Technology' }),
    mk({ name: 'Sneha Kulkarni', email: 'freelancer4@flexi.dev', role: 'freelancer', headline: 'Data Analyst & ML Engineer', bio: 'Python, dashboards and machine-learning models that answer real business questions.', skills: ['Python', 'Pandas', 'Machine Learning', 'SQL'], experience: 3, hourlyRate: 32, availability: 'available', location: 'Nagpur, India' }),
    mk({ name: 'Imran Shaikh', email: 'freelancer5@flexi.dev', role: 'freelancer', headline: 'SEO & Performance Marketer', bio: 'Search-led growth for small businesses: audits, content plans and paid campaigns that pay back.', skills: ['SEO', 'Google Ads', 'Content Strategy', 'Analytics'], experience: 4, hourlyRate: 22, availability: 'available', location: 'Hyderabad, India' }),
    mk({ name: 'Neha Verma', email: 'freelancer6@flexi.dev', role: 'freelancer', headline: 'Motion Designer & Video Editor', bio: 'Product explainers, reels and brand animations with clear storytelling.', skills: ['After Effects', 'Premiere Pro', 'Illustrator', 'Storyboarding'], experience: 2, hourlyRate: 18, availability: 'unavailable', location: 'Delhi, India' }),
  ]);

  const c = await User.insertMany([
    mk({ name: 'Kavya Iyer', email: 'client1@flexi.dev', role: 'client', company: 'GreenCart Organics', bio: 'Founder of an organic grocery delivery startup.', location: 'Bengaluru, India' }),
    mk({ name: 'Arjun Patel', email: 'client2@flexi.dev', role: 'client', company: 'TechNova Labs', bio: 'Product lead at a SaaS analytics company.', location: 'Ahmedabad, India' }),
  ]);

  const p = await Project.insertMany([
    { title: 'Build a React storefront for organic groceries', description: 'We need a responsive React storefront with product listing, cart and checkout screens connected to our existing API.', category: 'Web Development', requiredSkills: ['React', 'CSS', 'JavaScript'], budget: 1200, deadline: days(30), clientId: c[0]._id },
    { title: 'Logo and brand kit for a new tea brand', description: 'Looking for a designer to create a logo, colour palette, typography and social media templates for a premium tea label.', category: 'Graphic Design', requiredSkills: ['Branding', 'Illustrator'], budget: 450, deadline: days(21), clientId: c[0]._id },
    { title: 'Mobile app UI design for delivery tracking', description: 'Design 12 mobile screens (onboarding, live tracking, order history) with a clickable Figma prototype.', category: 'UI/UX Design', requiredSkills: ['Figma', 'UI Design', 'Prototyping'], budget: 900, deadline: days(25), clientId: c[0]._id },
    { title: 'REST API with JWT auth for analytics dashboard', description: 'Create a Node.js + Express + MongoDB API with authentication, role-based access and pagination for our analytics product.', category: 'Web Development', requiredSkills: ['Node.js', 'Express', 'MongoDB'], budget: 1800, deadline: days(40), clientId: c[1]._id },
    { title: 'Customer churn prediction model', description: 'Use our CSV export to train and evaluate a churn prediction model and deliver a short report with findings.', category: 'Data & AI', requiredSkills: ['Python', 'Machine Learning', 'Pandas'], budget: 1500, deadline: days(35), clientId: c[1]._id },
    { title: 'SEO audit and 3-month content plan', description: 'Full technical SEO audit of our marketing site plus a prioritised three month content and keyword plan.', category: 'Digital Marketing', requiredSkills: ['SEO', 'Content Strategy'], budget: 700, deadline: days(18), clientId: c[1]._id },
    { title: '60-second product explainer animation', description: 'Need a polished 60 second animated explainer video for our SaaS landing page, script already prepared.', category: 'Video & Animation', requiredSkills: ['After Effects', 'Storyboarding'], budget: 800, deadline: days(28), clientId: c[1]._id },
    { title: 'Landing page redesign (completed example)', description: 'Redesign of the marketing landing page with improved conversion flow and new hero section.', category: 'Web Development', requiredSkills: ['React', 'CSS'], budget: 600, deadline: days(5), clientId: c[0]._id, status: 'completed', hiredFreelancerId: f[0]._id },
    { title: 'Admin dashboard in React (in progress example)', description: 'Admin dashboard with charts, tables and filters for the operations team, built in React.', category: 'Web Development', requiredSkills: ['React', 'JavaScript'], budget: 1400, deadline: days(20), clientId: c[1]._id, status: 'in-progress', hiredFreelancerId: f[0]._id },
  ]);

  await Application.insertMany([
    { projectId: p[0]._id, freelancerId: f[0]._id, proposal: 'I have built three React storefronts. I can deliver the listing, cart and checkout screens in two weeks with tests.', proposedBudget: 1100 },
    { projectId: p[3]._id, freelancerId: f[2]._id, proposal: 'Backend is my daily work. I will deliver a documented API with JWT auth, roles and pagination.', proposedBudget: 1700 },
    { projectId: p[2]._id, freelancerId: f[1]._id, proposal: 'I will deliver all 12 screens plus a clickable Figma prototype and a small design system.', proposedBudget: 850 },
    { projectId: p[4]._id, freelancerId: f[3]._id, proposal: 'I will clean the data, compare three models and give you a clear report with next steps.', proposedBudget: 1400 },
    { projectId: p[7]._id, freelancerId: f[0]._id, proposal: 'Happy to redesign the landing page with a focus on conversions.', proposedBudget: 600, status: 'accepted' },
    { projectId: p[8]._id, freelancerId: f[0]._id, proposal: 'I can build the admin dashboard using React and a chart library.', proposedBudget: 1400, status: 'accepted' },
  ]);

  await Notification.insertMany([
    { userId: f[0]._id, message: 'You were hired for "Admin dashboard in React (in progress example)"! 🎉', link: '/my-projects' },
    { userId: c[0]._id, message: 'Aarav Sharma applied to "Build a React storefront for organic groceries".', link: `/projects/${p[0]._id}/applications` },
  ]);

  console.log('Seed complete. Demo logins (password: Password123):');
  console.log('  Freelancer: freelancer1@flexi.dev');
  console.log('  Client:     client1@flexi.dev');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
