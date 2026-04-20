import { Routes, Route, Navigate } from 'react-router-dom';
import Layout           from './components/layout/Layout.jsx';
import Dashboard        from './pages/Dashboard.jsx';
import Clients          from './pages/Clients.jsx';
import ClientDetail     from './pages/ClientDetail.jsx';
import ProjectDetail    from './pages/ProjectDetail.jsx';
import ProjectFormPage  from './pages/ProjectFormPage.jsx';
import Categories       from './pages/Categories.jsx';
import ServiceTypes     from './pages/ServiceTypes.jsx';
import Employees        from './pages/Employees.jsx';
import Reports          from './pages/Reports.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index                      element={<Dashboard />} />
        <Route path="clients"             element={<Clients />} />
        <Route path="clients/:id"         element={<ClientDetail />} />
        <Route path="projects/new"        element={<ProjectFormPage />} />
        <Route path="projects/:id"        element={<ProjectDetail />} />
        <Route path="projects/:id/edit"   element={<ProjectFormPage />} />
        <Route path="categories"          element={<Categories />} />
        <Route path="service-types"       element={<ServiceTypes />} />
        <Route path="employees"           element={<Employees />} />
        <Route path="reports"             element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
