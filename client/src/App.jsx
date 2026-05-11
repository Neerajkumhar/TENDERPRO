import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import TenderManagement from './pages/TenderManagement'
import ClientManagement from './pages/ClientManagement'
import ProjectManagement from './pages/ProjectManagement'
import ProjectDetails from './pages/ProjectDetails'
import Reports from './pages/Reports'
import FinancialManagement from './pages/FinancialManagement'
import TeamManagement from './pages/TeamManagement'
import Settings from './pages/Settings'
import CreateTender from './pages/CreateTender'

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [editTenderData, setEditTenderData] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [clients, setClients] = useState([
    { id: '1001', name: 'Acme Corp', industry: 'Industry', status: 'Active', manager: 'John Doe', date: '12/3/2023', value: '$1000.00' },
    { id: '1002', name: 'Global Industries', industry: 'Lead Processes', status: 'Lead', manager: 'John Dove', date: '12/3/2023', value: '$1000.00' },
    { id: '1003', name: 'Rajasthan Govt', industry: 'Industry', status: 'Lead', manager: 'John Doe', date: '12/3/2023', value: '$350.00' },
    { id: '1004', name: 'TechSolutions', industry: 'Technology', status: 'Pending', manager: 'John Doe', date: '12/3/2023', value: '$200.00' },
    { id: '1005', name: 'Public Works Dept', industry: 'Infrastructure', status: 'Active', manager: 'John Done', date: '12/3/2023', value: '$500.00' },
  ]);
  const [tenders, setTenders] = useState([
    { id: '201', title: 'Infrastructure Development Jaipur', client: 'Rajasthan Govt', contact: 'Jama Project', status: 'Submission in Progress', due: '25 mins ago', value: '₹120,00', description: 'Internal infrastructure development project for corporate office.' },
    { id: '202', title: 'Tender Mute Ruter', client: 'Tender Management', contact: 'Jama Project', status: 'Under Evaluation', due: '25 mins ago', value: '₹150,00', description: 'Network routing equipment supply and installation.' },
    { id: '203', title: 'Tender Mute Ruter', client: 'Tender Management', contact: 'Jama Project', status: 'Awarded', due: '25 mins ago', value: '₹150,00', description: 'Wireless infrastructure for university campus.' },
    { id: '204', title: 'Tender Mute Client', client: 'Tender Mate Client', contact: 'Jama Project', status: 'Lost', due: '25 mins ago', value: '₹100,00', description: 'Cloud migration services for healthcare provider.' },
  ]);

  const handleSaveTender = (tenderData) => {
    if (tenderData.id) {
      // Update
      setTenders(tenders.map(t => t.id === tenderData.id ? { ...t, ...tenderData } : t));
    } else {
      // Create
      const newTender = {
        ...tenderData,
        id: (Math.max(...tenders.map(t => parseInt(t.id))) + 1).toString(),
        due: 'Just now',
        contact: 'New Lead'
      };
      setTenders([newTender, ...tenders]);
    }
    setActiveTab('Tender Management');
    setEditTenderData(null);
  };

  const handleProjectClick = (id) => {
    setSelectedProjectId(id);
    setActiveTab('Project Details');
  };

  const handleBackToProjects = () => {
    setActiveTab('Project Management');
    setSelectedProjectId(null);
  };

  const handleBackToTenders = () => {
    setActiveTab('Tender Management');
    setEditTenderData(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 w-full">
        <Header 
          onCreateTender={() => { setEditTenderData(null); setActiveTab('Create Tender'); }} 
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'Dashboard' && <Dashboard />}
          {activeTab === 'Tender Management' && (
            <TenderManagement 
              tenders={tenders}
              setTenders={setTenders}
              onView={(id) => {
                setSelectedProjectId(id);
                setActiveTab('Project Details');
              }} 
              onEdit={(tender) => {
                setEditTenderData(tender);
                setActiveTab('Edit Tender');
              }}
              onCreate={() => {
                setEditTenderData(null);
                setActiveTab('Create Tender');
              }}
            />
          )}
          {activeTab === 'Client Management' && (
            <ClientManagement clients={clients} setClients={setClients} />
          )}
          {activeTab === 'Project Management' && (
            <ProjectManagement 
              onProjectClick={handleProjectClick} 
              onCreateTender={() => { setEditTenderData(null); setActiveTab('Create Tender'); }}
            />
          )}
          {(activeTab === 'Create Tender' || activeTab === 'Edit Tender') && (
            <CreateTender 
              onCancel={handleBackToTenders} 
              initialData={editTenderData} 
              onSave={handleSaveTender}
              clients={clients}
            />
          )}
          {activeTab === 'Project Details' && (
            <ProjectDetails 
              projectId={selectedProjectId} 
              onBack={handleBackToProjects} 
            />
          )}
          {activeTab === 'Financial Management' && <FinancialManagement />}
          {activeTab === 'Team Management' && <TeamManagement />}
          {activeTab === 'Reports' && <Reports />}
          {activeTab === 'Settings' && <Settings />}
          {!['Dashboard', 'Tender Management', 'Client Management', 'Project Management', 'Project Details', 'Financial Management', 'Team Management', 'Reports', 'Settings', 'Create Tender', 'Edit Tender'].includes(activeTab) && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <h2 className="text-2xl font-bold">{activeTab} Page</h2>
                <p>This page is under construction.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
