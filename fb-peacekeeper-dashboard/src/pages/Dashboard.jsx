import React from 'react';
import Hero from '../components/Hero';
import WorkflowDiagram from '../components/WorkflowDiagram';
import DashboardCards from '../components/DashboardCards';

const Dashboard = ({ onNavigate }) => {
  return (
    <div className="space-y-8 pb-20">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Workflow Visualization */}
      <WorkflowDiagram />

      {/* 3. Navigation Cards */}
      <div className="pt-8">
          <DashboardCards onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default Dashboard;
