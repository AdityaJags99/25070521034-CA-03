import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Freelancers from './pages/Freelancers';
import FreelancerProfile from './pages/FreelancerProfile';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import PostProject from './pages/PostProject';
import MyApplications from './pages/MyApplications';
import ApplicationManagement from './pages/ApplicationManagement';
import MyProjects from './pages/MyProjects';
import EditProfile from './pages/EditProfile';
import NotFound from './pages/NotFound';

// /dashboard shows the right dashboard for the logged-in role
function Dashboard() {
  const { user, loading } = useAuth();
  if (loading) return <Loader full />;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'client' ? <ClientDashboard /> : <FreelancerDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/freelancers/:id" element={<FreelancerProfile />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post-project" element={<ProtectedRoute roles={['client']}><PostProject /></ProtectedRoute>} />
        <Route path="/projects/:id/edit" element={<ProtectedRoute roles={['client']}><PostProject /></ProtectedRoute>} />
        <Route path="/projects/:id/applications" element={<ProtectedRoute roles={['client']}><ApplicationManagement /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={['freelancer']}><MyApplications /></ProtectedRoute>} />
        <Route path="/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
