# KAL Engineering Services - Internal Management Application

A modern, full-featured internal web application for KAL Engineering Services Ltd, built with React, TypeScript, Firebase, Tailwind CSS, and Framer Motion.

<!-- ![KAL Engineering](public/favicon.svg) -->

## 🚀 Features

### Core Modules
- **Dashboard** - Overview with stats, charts, and recent activity
- **Task Management** - Create, assign, track tasks with priorities and deadlines
- **Project Management** - Manage projects with timelines, budgets, and team members
- **Expenditure Tracking** - Track and approve company expenditures
- **Budget Management** - Create and monitor project/department budgets
- **Document Management** - Upload, organize, and share files with Firebase Storage
- **Team Management** - View and manage team members
- **Reports** - Generate various reports (tasks, projects, finance, audit)
- **Audit Logs** - Track all system activities for compliance
- **Asset Management** - Inventory and asset tracking
- **User Administration** - Manage users, roles, and permissions

### User Roles
- **Admin** - Full system access
- **Project Manager** - Project and task management
- **Technical Team** - Task execution and updates
- **Finance** - Expenditure and budget management
- **Finance Officer** - Financial oversight
- **Auditor** - Read-only access for compliance review

### Technical Features
- 🔐 Firebase Authentication (Email/Password)
- 🗄️ Firestore Database with real-time updates
- 📁 Firebase Storage for file uploads
- 🎨 Modern UI with Tailwind CSS
- ✨ Smooth animations with Framer Motion
- 📱 Mobile-responsive design
- 📊 Interactive charts with Chart.js
- 🔔 Toast notifications
- 🛡️ Role-based access control

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account with a project set up

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KalBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database
   - Enable Storage
   - Go to Project Settings > Your apps > Add web app
   - Copy the configuration values

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components (sidebar, header)
│   └── tasks/           # Task-specific components
├── config/
│   └── firebase.ts      # Firebase configuration
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── pages/
│   ├── auth/            # Authentication pages
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Tasks.tsx        # Task management
│   ├── Projects.tsx     # Project management
│   ├── Expenditures.tsx # Expenditure tracking
│   ├── Budgets.tsx      # Budget management
│   ├── Documents.tsx    # Document management
│   ├── Team.tsx         # Team directory
│   ├── Reports.tsx      # Report generation
│   ├── AuditLogs.tsx    # Audit trail
│   ├── Assets.tsx       # Asset management
│   ├── Settings.tsx     # User settings
│   ├── Profile.tsx      # User profile
│   └── AdminUsers.tsx   # User administration
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 Firestore Collections Structure

```
users/
  {userId}/
    - email, displayName, role, department, etc.

tasks/
  {taskId}/
    - title, description, status, priority, assigneeId, etc.

projects/
  {projectId}/
    - name, description, status, budget, timeline, etc.

expenditures/
  {expenditureId}/
    - description, amount, category, status, etc.

budgets/
  {budgetId}/
    - projectId, totalAmount, allocatedAmount, etc.

documents/
  {documentId}/
    - name, type, url, uploadedBy, etc.

assets/
  {assetId}/
    - name, category, status, location, etc.

auditLogs/
  {logId}/
    - action, entityType, entityId, userId, timestamp, etc.
```

## 🔒 Security Rules

Make sure to configure Firestore and Storage security rules appropriately for production. Example rules are provided in the Firebase Console templates.

## 🎨 Customization

### Theme Colors
The app uses Tailwind CSS with custom color palette defined in `tailwind.config.js`:
- Primary: Blue shades
- Secondary: Slate shades
- Accent: Yellow shades

### Adding New Features
1. Create new type definitions in `src/types/index.ts`
2. Create the page component in `src/pages/`
3. Add the route in `src/App.tsx`
4. Add navigation link in `src/components/layout/Layout.tsx`

## 🚧 Pending Features

- [ ] Email notifications
- [ ] Push notifications
- [ ] Two-factor authentication
- [ ] Gantt chart view for projects
- [ ] Resource allocation
- [ ] Advanced reporting with PDF export
- [ ] Integration with external services (Odoo, Google Drive)
- [ ] Mobile app (React Native)

## 📝 License

This project is proprietary software for KAL Engineering Services Ltd.

## 👥 Support

For support, please contact the IT department at KAL Engineering Services Ltd.
