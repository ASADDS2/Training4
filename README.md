# VetCare - Veterinary Management System

A comprehensive web application for veterinary clinic management, featuring user authentication, role-based access control, and appointment scheduling.

## 🚀 Features

### Authentication & Authorization
- **User Registration**: New customers can register with email validation
- **User Login**: Secure authentication with remember me functionality
- **Role-Based Access**: Different dashboards for administrators and customers
- **Session Management**: Persistent login sessions with localStorage
- **Password Security**: Password visibility toggle and strength validation

### Admin Dashboard
- **Pet Management**: Add, edit, and delete pet records
- **Data Visualization**: View total pets count and manage pet information
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Real-time Updates**: Immediate UI updates after data changes

### Customer Dashboard
- **Appointment Scheduling**: Book veterinary appointments
- **Appointment Management**: Edit and cancel existing appointments
- **Service Selection**: Choose from various veterinary services
- **Status Tracking**: Monitor appointment status

### Technical Features
- **Modular Architecture**: Separated authentication and routing modules
- **API Integration**: RESTful API communication with JSON Server
- **Responsive Design**: Mobile-friendly interface
- **Notification System**: User feedback for all actions
- **Form Validation**: Client-side and server-side validation

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Vite
- **Backend**: JSON Server (REST API)
- **Authentication**: Custom JWT-like session management
- **Routing**: Custom SPA router implementation

## 📁 Project Structure

```
training-semana4/
├── src/
│   ├── js/
│   │   ├── auth.js          # Authentication service
│   │   ├── router.js         # Application router
│   │   ├── main.js          # Endpoint configuration
│   │   ├── login.js         # Login page logic
│   │   ├── register.js      # Registration page logic
│   │   ├── dashboard.js     # Admin dashboard
│   │   └── dashboardCustomer.js # Customer dashboard
│   ├── views/
│   │   ├── login.html       # Login page
│   │   ├── register.html    # Registration page
│   │   ├── dashboard.html   # Admin dashboard
│   │   └── dashboardCustomer.html # Customer dashboard
│   └── css/
│       └── styles.css       # Application styles
├── public/
│   └── database.json        # JSON Server database
├── index.html              # Main entry point
├── package.json            # Dependencies
└── vite.config.js         # Vite configuration
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd training-semana4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Start JSON Server (in a separate terminal)**
   ```bash
   npx json-server --watch public/database.json --port 3000
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - The API will be available at `http://localhost:3000`

## 🔐 Authentication System

### AuthService Module (`auth.js`)
The authentication system provides:

- **User Registration**: Email validation and duplicate checking
- **User Login**: Credential validation against database
- **Session Management**: localStorage-based session persistence
- **Role-Based Access**: Admin and customer role differentiation
- **Security Features**: Password validation and email format checking

### Key Methods:
- `login(email, password, rememberMe)`: Authenticate user
- `register(userData)`: Register new user
- `logout()`: Clear session and redirect
- `isUserAuthenticated()`: Check authentication status
- `isAdmin()` / `isCustomer()`: Role checking

## 🛣️ Routing System

### Router Module (`router.js`)
The routing system provides:

- **SPA Navigation**: Single Page Application routing
- **Route Protection**: Authentication-based route guards
- **Role-Based Routing**: Different routes for different user types
- **History Management**: Browser back/forward support
- **Dynamic Navigation**: Programmatic route changes

### Route Configuration:
- **Public Routes**: `/`, `/login`, `/register`
- **Protected Routes**: `/dashboard` (admin), `/dashboard-customer` (customer)
- **API Routes**: `/api/users`, `/api/pets`, `/api/appointments`

## 👥 User Roles

### Administrator
- **Access**: Full system access
- **Features**: Pet management, user management
- **Dashboard**: Admin dashboard with pet CRUD operations
- **Credentials**: 
  - `admin@vetcare.com` / `admin123`
  - `administrador@vetcare.com` / `admin123`
  - `vet@vetcare.com` / `vet123`

### Customer
- **Access**: Limited to appointment management
- **Features**: Schedule appointments, view personal data
- **Dashboard**: Customer dashboard with appointment scheduling
- **Registration**: Open registration for new customers

## 📊 API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users?email={email}` - Get user by email
- `POST /users` - Create new user

### Pets
- `GET /pets` - Get all pets
- `POST /pets` - Create new pet
- `PUT /pets/{id}` - Update pet
- `DELETE /pets/{id}` - Delete pet

### Appointments
- `GET /appointments` - Get all appointments
- `POST /appointments` - Create new appointment
- `PUT /appointments/{id}` - Update appointment
- `DELETE /appointments/{id}` - Delete appointment

## 🎨 UI Components

### Notifications
- Success notifications (green)
- Error notifications (red)
- Info notifications (blue)
- Auto-dismiss after 3 seconds

### Modals
- Add/Edit forms for pets and appointments
- Responsive design
- Click outside to close
- Form validation

### Forms
- Real-time validation
- Password strength checking
- Email format validation
- Required field validation

## 🔒 Security Features

- **Input Validation**: Client-side and server-side validation
- **Session Security**: Secure session management
- **Role-Based Access**: Route protection based on user roles
- **Password Security**: Minimum length requirements
- **Email Validation**: Proper email format checking

## 🚀 Development

### Adding New Features
1. Create new JavaScript modules in `src/js/`
2. Add routes in `router.js`
3. Create corresponding HTML views
4. Update authentication if needed

### Code Style
- Use ES6+ features
- Follow modular architecture
- Implement proper error handling
- Add comprehensive comments

## 📝 Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🚨 Troubleshooting

### Login Issues
If you're having trouble logging in:

1. **Check if servers are running:**
   - JSON Server should be on port 3000
   - Vite Dev Server should be on port 5173

2. **Use the test page:**
   - Visit `http://localhost:5173/test-login.html`
   - This will help diagnose connection issues

3. **Clear browser cache:**
   - Press F12 to open developer tools
   - Right-click refresh button and select "Empty Cache and Hard Reload"

4. **Check console for errors:**
   - Press F12 and check the Console tab for error messages

### Common Issues

**"Cannot connect to API"**
- Make sure JSON Server is running: `npm run server`
- Check if port 3000 is available

**"Login form not working"**
- Check browser console for JavaScript errors
- Ensure all files are loading correctly
- Try the test page to verify functionality

**"Data not saving"**
- Verify JSON Server is running
- Check if database.json is writable
- Look for CORS errors in console

### Quick Start
1. Start both servers manually:
   ```bash
   # Terminal 1: Start JSON Server
   npm run server
   
   # Terminal 2: Start Vite Dev Server
   npm run dev
   ```
2. Visit `http://localhost:5173` to access the application
3. Try logging in with test credentials

## 🆘 Support

For support or questions, please contact the development team.

---

**VetCare** - Making veterinary management simple and efficient. 