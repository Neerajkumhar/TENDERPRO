import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import TenderDashboard from './pages/TenderDashboard'
import TenderManagement from './pages/TenderManagement'
import ClientManagement from './pages/ClientManagement'
import ProjectManagement from './pages/ProjectManagement'
import ProjectDetails from './pages/ProjectDetails'
import Reports from './pages/Reports'
import FinancialManagement from './pages/FinancialManagement'
import TeamManagement from './pages/TeamManagement'
import Settings from './pages/Settings'
import CreateTender from './pages/CreateTender'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ClientDetails from './pages/ClientDetails'
import MemberDetails from './pages/MemberDetails'
import AssignmentDetails from './pages/AssignmentDetails'
import TaskManagement from './pages/TaskManagement'
import ProjectPage from './pages/ProjectPage'
import Invoices from './pages/Invoices'
import Payments from './pages/Payments'
import Expenses from './pages/Expenses'
import Budget from './pages/Budget'
import Team from './pages/Team'
import CalendarPage from './pages/Calendar'
import CreateProject from './pages/CreateProject'
import MemberDashboard from './pages/MemberDashboard'
import Attendance from './pages/Attendance'
import TeamAttendance from './pages/TeamAttendance'
import Messages from './pages/Messages'
import FinanceReports from './pages/FinanceReports'
import InstallationChallan from './pages/InstallationChallan'
import DeliveryChallan from './pages/DeliveryChallan'
import TenderDetails from './pages/TenderDetails'
import TaskDetails from './pages/TaskDetails'
import InvoiceDetails from './pages/InvoiceDetails'
import ExpenseDetails from './pages/ExpenseDetails'

function App() {
  const checkUrlAuth = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');
    if (urlToken && urlUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser));
        // Only accept non-Admin users on the client side to avoid loops
        if (parsedUser.role !== 'Admin') {
          localStorage.setItem('token', urlToken);
          localStorage.setItem('user', JSON.stringify(parsedUser));
          
          // Clear query parameters from address bar to keep URL clean
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          return { token: urlToken, user: parsedUser };
        }
      } catch (e) {
        console.error("Failed to parse user redirect query parameters:", e);
      }
    }
    return null;
  };

  const urlAuth = checkUrlAuth();
  const initialToken = urlAuth ? urlAuth.token : localStorage.getItem('token');
  const initialUser = urlAuth ? urlAuth.user : JSON.parse(localStorage.getItem('user') || '{}');

  const getDefaultTabForRole = (role) => {
    switch (role) {
      case 'Tender Manager': return 'Tender Dashboard';
      case 'Project Manager': return 'Dashboard';
      case 'Finance Manager': return 'Financial Management';
      case 'Core Team': return 'Member Dashboard';
      case 'Admin': return 'Dashboard';
      default: return 'Dashboard';
    }
  };

  const getInitialTab = () => {
    // First-time entry: land on role-specific dashboard when available.
    // On refresh/subsequent loads, prefer the saved `activeTab` so the
    // user stays on the same page after a reload.
    const savedTab = localStorage.getItem('activeTab');
    const hasVisited = (typeof window !== 'undefined') && sessionStorage.getItem('hasVisited');

    if (!hasVisited) {
      if (typeof window !== 'undefined') sessionStorage.setItem('hasVisited', 'true');
      if (initialUser?.role) return getDefaultTabForRole(initialUser.role);
      return savedTab || 'Dashboard';
    }

    // Subsequent loads: restore last saved tab, else fall back to role/dashboard.
    return savedTab || (initialUser?.role ? getDefaultTabForRole(initialUser.role) : 'Dashboard');
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken);
  const [user, setUser] = useState(initialUser);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const [previousTab, setPreviousTab] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [selectedTenderId, setSelectedTenderId] = useState(null)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [selectedExpenseId, setSelectedExpenseId] = useState(() => localStorage.getItem('selectedExpenseId') || null)
  const [tenders, setTenders] = useState([])
  const [clients, setClients] = useState([])
  const [departments, setDepartments] = useState([])
  const [members, setMembers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [editTenderData, setEditTenderData] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      const token = localStorage.getItem('token');
      // Clear client-side local storage first so we don't end up in redirect loops
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const encodedUser = encodeURIComponent(JSON.stringify(user));
      window.location.href = `http://localhost:5174/?token=${token}&user=${encodedUser}`;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTenders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tenders');
      if (response.ok) {
        const data = await response.json();
        setTenders(data);
      }
    } catch (error) {
      console.error('Error fetching tenders:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchTenders();
    fetchClients();
    fetchAssignments();
    fetchMembers();
  }, []);

  const handleSaveTender = async (tenderData) => {
    try {
      const url = tenderData.id
        ? `http://localhost:5000/api/tenders/${tenderData.id}`
        : 'http://localhost:5000/api/tenders';
      const method = tenderData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenderData)
      });

      if (response.ok) {
        fetchTenders();
        handleBackToTenders();
      }
    } catch (error) {
      console.error('Error saving tender:', error);
    }
  };

  const handleProjectClick = (id) => {
    setPreviousTab(activeTab);
    setSelectedProjectId(id);
    setActiveTab('Project Details');
  };

  const handleTenderClick = (id) => {
    setPreviousTab(activeTab);
    setSelectedTenderId(id);
    setActiveTab('Tender Details');
  };

  const handleTaskClick = (id) => {
    setPreviousTab(activeTab);
    setSelectedTaskId(id);
    setActiveTab('Task Details');
  };

  const handleInvoiceClick = (id) => {
    setPreviousTab(activeTab);
    setSelectedInvoiceId(id);
    setActiveTab('Invoice Details');
  };

  const handleBackToInvoices = () => {
    if (previousTab) {
      setActiveTab(previousTab);
      setPreviousTab(null);
    } else {
      setActiveTab('Financial Management');
    }
    setSelectedInvoiceId(null);
  };

  const handleBackToTendersDetail = () => {
    if (previousTab) {
      setActiveTab(previousTab);
      setPreviousTab(null);
    } else {
      setActiveTab('Tender Management');
    }
    setSelectedTenderId(null);
  };

  const handleClientClick = (id) => {
    setSelectedClientId(id);
    setActiveTab('Client Details');
  };

  const handleAssignmentClick = (id) => {
    setSelectedAssignmentId(id);
    setActiveTab('Assignment Details');
  };

  const handleBackToProjects = () => {
    if (previousTab) {
      setActiveTab(previousTab);
      setPreviousTab(null);
    } else {
      setActiveTab('Project Management');
    }
    setSelectedProjectId(null);
  };

  const handleBackToTenders = () => {
    setActiveTab('Tender Management');
    setEditTenderData(null);
  };

  const handleLogout = async () => {
    const activeUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (activeUser?.sessionId) {
      try {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: activeUser.sessionId }),
        });
      } catch (err) {
        console.error('Error logging out dashboard session:', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser({});
  };

  const handleLoginSuccess = (userData) => {
    const userObj = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      departmentId: userData.departmentId,
      sessionId: userData.sessionId,
      createdAt: userData.createdAt
    };
    if (userData.role === 'Admin') {
      // Clear client-side local storage first so we don't end up in redirect loops
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const encodedUser = encodeURIComponent(JSON.stringify(userObj));
      window.location.href = `http://localhost:5174/?token=${userData.token}&user=${encodedUser}`;
      return;
    }
    setUser(userObj);
    setIsAuthenticated(true);
    setActiveTab(getDefaultTabForRole(userData.role));
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden print:h-auto print:overflow-visible print:bg-white">
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
        userRole={user.role}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 w-full h-full overflow-hidden print:overflow-visible">
        <Header
          onCreateTender={() => { setEditTenderData(null); setActiveTab('Create Tender'); }}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onProfileClick={() => setActiveTab('Profile')}
          user={user} 
          onOpenMessages={() => setIsMessagesOpen(!isMessagesOpen)}
          onLogout={handleLogout} 
        />

        <main className="flex-1 overflow-y-auto print:overflow-visible">

          {activeTab === 'Dashboard' && (
            <Dashboard
              user={user}
              assignments={assignments}
              members={members}
              onProjectClick={handleProjectClick}
            />
          )}
          {activeTab === 'Member Dashboard' && (
            <MemberDashboard user={user} />
          )}
          {activeTab === 'Calendar' && <CalendarPage />}
           {activeTab === 'Tender Dashboard' && (
            <TenderDashboard 
              tenders={tenders}
              setTenders={setTenders}
              clients={clients}
              onView={handleTenderClick}
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
          {activeTab === 'Tender Management' && (
            <TenderManagement
              tenders={tenders}
              setTenders={setTenders}
              clients={clients}
              onView={handleTenderClick}
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
            <ClientManagement
              clients={clients}
              setClients={setClients}
              onView={(id) => {
                setSelectedClientId(id);
                setActiveTab('Client Details');
              }}
            />
          )}
          {activeTab === 'Client Details' && (
            <ClientDetails
              clientId={selectedClientId}
              onBack={() => {
                setActiveTab('Client Management');
                setSelectedClientId(null);
              }}
            />
          )}
          {activeTab === 'Project Management' && (
            <ProjectManagement
              onProjectClick={handleProjectClick}
              onAssignmentClick={handleAssignmentClick}
              onCreateTender={() => { setEditTenderData(null); setActiveTab('Create Tender'); }}
              onCreateProject={() => setActiveTab('Create Project')}
              tenders={tenders}
              departments={departments}
              members={members}
              assignments={assignments}
              fetchAssignments={fetchAssignments}
            />
          )}
          {activeTab === 'Create Project' && (
            <CreateProject
              onCancel={() => {
                setActiveTab(user.role === 'Admin' ? 'Project Management' : 'Projects');
              }}
              onSave={async (data) => {
                try {
                  const pmMember = members.find(m => m.id === data.teamAssignments.projectManager);
                  const deptId = pmMember ? pmMember.departmentId : null;

                  if (!deptId) {
                    alert('Error: Selected Project Manager must belong to a department.');
                    return;
                  }

                  const payload = {
                    title: data.title || null,
                    tenderId: data.tenderId,
                    departmentId: deptId,
                    assigneeId: data.teamAssignments.projectManager || null,
                    description: data.description || 'No description provided.',
                    priority: ['Low', 'Medium', 'High'].includes(data.priority) ? data.priority : 'Medium',
                    deadline: data.endDate || null,
                    status: data.status === 'In Progress' ? 'In Progress' : 'Pending'
                  };

                  const response = await fetch('http://localhost:5000/api/assignments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });

                  if (response.ok) {
                    await fetchAssignments();
                    alert('Project initialized successfully!');
                    setActiveTab(user.role === 'Admin' ? 'Project Management' : 'Projects');
                  } else {
                    const err = await response.json();
                    alert(`Failed to save project: ${err.message}`);
                  }
                } catch (err) {
                  console.error('Error saving project:', err);
                  alert('Network error occurred while saving the project.');
                }
              }}
              clients={clients}
              tenders={tenders.filter(t => t.status === 'Registered' || t.status === 'Active')}
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
              assignments={assignments}
              fetchAssignments={fetchAssignments}
              user={members.find(m => m.email === user.email) || user}
              members={members}
            />
          )}
          {activeTab === 'Tender Details' && (
            <TenderDetails
              tenderId={selectedTenderId}
              onBack={handleBackToTendersDetail}
              onEdit={(tender) => {
                setEditTenderData(tender);
                setActiveTab('Edit Tender');
              }}
              user={members.find(m => m.email === user.email) || user}
              members={members}
            />
          )}
          {activeTab === 'Assignment Details' && (
            <AssignmentDetails
              assignmentId={selectedAssignmentId}
              onBack={handleBackToProjects}
              tenders={tenders}
              departments={departments}
              members={members}
              fetchAssignments={fetchAssignments}
            />
          )}
          {activeTab === 'Invoice Details' && (
            <InvoiceDetails
              invoiceId={selectedInvoiceId}
              onBack={handleBackToInvoices}
            />
          )}
          {activeTab === 'Financial Management' && <FinancialManagement onInvoiceClick={handleInvoiceClick} />}
          {activeTab === 'Invoices' && <Invoices onInvoiceClick={handleInvoiceClick} />}
          {activeTab === 'Payments' && <Payments />}
          {activeTab === 'Expenses' && <Expenses onViewExpense={(id) => { setSelectedExpenseId(id); localStorage.setItem('selectedExpenseId', id); setActiveTab('Expense Details'); }} />}
          {activeTab === 'Expense Details' && <ExpenseDetails expenseId={selectedExpenseId} onBack={() => setActiveTab('Expenses')} />}
          {activeTab === 'Installation Challan' && <InstallationChallan />}
          {activeTab === 'Delivery Challan' && <DeliveryChallan />}
          {activeTab === 'Budget' && <Budget />}
          {activeTab === 'Team Management' && (
            (user.role === 'Project Manager' || user.role === 'Core Team') ? (
              <Team
                user={members.find(m => m.email === user.email) || user}
                members={members}
                departments={departments}
              />
            ) : (
              <TeamManagement
                departments={departments}
                fetchDepartments={fetchDepartments}
                onMemberClick={(id) => {
                  setSelectedMemberId(id);
                  setActiveTab('Member Profile');
                }}
              />
            )
          )}
          {activeTab === 'Member Profile' && (
            <MemberDetails
              memberId={selectedMemberId}
              onBack={() => {
                setActiveTab('Team Management');
                setSelectedMemberId(null);
              }}
              departments={departments}
            />
          )}
          {activeTab === 'Reports' && <Reports />}
          {activeTab === 'Finance Reports' && <Reports />}
          {activeTab === 'Tasks' && (
            <TaskManagement
              user={members.find(m => m.email === user.email) || user}
              members={members}
              onView={handleTaskClick}
              assignments={assignments}
              tenders={tenders}
            />
          )}
          {activeTab === 'Task Details' && (
            <TaskDetails
              taskId={selectedTaskId}
              user={user}
              members={members}
              onBack={() => {
                if (previousTab) {
                  setActiveTab(previousTab);
                  setPreviousTab(null);
                } else {
                  setActiveTab('Tasks');
                }
                setSelectedTaskId(null);
              }}
            />
          )}
          {activeTab === 'Attendance' && (
            <Attendance user={user} />
          )}
          {activeTab === 'Team Attendance' && (
            <TeamAttendance user={user} />
          )}

          {activeTab === 'Projects' && (
            <ProjectPage
              onProjectClick={handleProjectClick}
              assignments={assignments}
              user={members.find(m => m.email === user.email) || user}
              members={members}
              onCreateProject={() => setActiveTab('Create Project')}
              fetchAssignments={fetchAssignments}
            />
          )}
          {activeTab === 'Messages' && (
            <Messages user={user} members={members} />
          )}
          {activeTab === 'Settings' && <Settings />}
          {activeTab === 'Profile' && (
            <Profile
              user={members.find(m => m.email === user.email) || user}
              onLogout={handleLogout}
              departments={departments}
            />
          )}
          {!['Dashboard', 'Bids', 'Calendar', 'Tender Dashboard', 'Tender Management', 'Client Management', 'Client Details', 'Project Management', 'Project Details', 'Financial Management', 'Invoices', 'Invoice Details', 'Payments', 'Expenses', 'Expense Details', 'Budget', 'Team Management', 'Member Profile', 'Projects', 'Reports', 'Settings', 'Create Tender', 'Edit Tender', 'Profile', 'Member Dashboard', 'Task Management', 'Tasks', 'Create Project', 'Project Team', 'Attendance', 'Team Attendance', 'Messages', 'Finance Reports', 'Installation Challan', 'Delivery Challan', 'Tender Details', 'Task Details'].includes(activeTab) && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <h2 className="text-2xl font-bold">{activeTab} Page</h2>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Messages Popup Modal */}
      {isMessagesOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90]" onClick={() => setIsMessagesOpen(false)}></div>
          <Messages 
            user={user} 
            members={members} 
            isPopup={true} 
            onClose={() => setIsMessagesOpen(false)} 
          />
        </>
      )}

    </div>
  )
}

export default App
