import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginView } from './components/LoginView';
import { FloatingAiRobot } from './components/FloatingAiRobot';

// Views
import { DashboardView } from './components/views/DashboardView';
import { InvestigationQueueView } from './components/views/InvestigationQueueView';
import { ProjectDetailView } from './components/views/ProjectDetailView';
import { ProjectsView } from './components/views/ProjectsView';
import { FinancialPhysicalRealityView } from './components/views/FinancialPhysicalRealityView';
import { CostAnomalyView } from './components/views/CostAnomalyView';
import { DuplicateRadarView } from './components/views/DuplicateRadarView';
import { GeospatialMapView } from './components/views/GeospatialMapView';
import { DelayPredictionsView } from './components/views/DelayPredictionsView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { AiChartBotView } from './components/views/AiChartBotView';
import { ComplianceView } from './components/views/ComplianceView';
import { DataQualityView } from './components/views/DataQualityView';
import { AuditTrailView } from './components/views/AuditTrailView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';

const MainLayout: React.FC = () => {
  const { isLoggedIn, activeRoute, selectedProjectId } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const renderCurrentView = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'queue':
        return <InvestigationQueueView />;
      case 'project-detail':
        return <ProjectDetailView projectId={selectedProjectId || 'MPL-1024'} />;
      case 'projects':
        return <ProjectsView />;
      case 'reality':
        return <FinancialPhysicalRealityView />;
      case 'cost-anomaly':
        return <CostAnomalyView />;
      case 'duplicates':
        return <DuplicateRadarView />;
      case 'map':
        return <GeospatialMapView />;
      case 'predictions':
        return <DelayPredictionsView />;
      case 'ai-assistant':
        return <AiAssistantView />;
      case 'ai-chart-bot':
        return <AiChartBotView />;
      case 'compliance':
        return <ComplianceView />;
      case 'data-quality':
        return <DataQualityView />;
      case 'audit':
        return <AuditTrailView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col font-sans theme-text antialiased transition-colors duration-200">
      {/* Top Header */}
      <Header onOpenNotifications={() => setNotificationOpen(true)} />

      {/* Main App Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4 gap-6">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Viewport */}
        <main className="flex-1 min-w-0">{renderCurrentView()}</main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Floating Autonomous AI Robot Worker */}
      <FloatingAiRobot />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
