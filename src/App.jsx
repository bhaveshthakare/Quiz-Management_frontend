import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import StudentLayout from './layouts/StudentLayout'
import AdminLayout from './layouts/AdminLayout'
import Landing from './pages/Landing'
import BrowseQuizzes from './pages/BrowseQuizzes'
import QuizDetails from './pages/QuizDetails'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentQuizList from './pages/student/StudentQuizList'
import Attempt from './pages/student/Attempt'
import Result from './pages/student/Result'
import History from './pages/student/History'
import Leaderboard from './pages/student/Leaderboard'
import Notifications from './pages/Notifications'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageQuizzes from './pages/admin/ManageQuizzes'
import QuizForm from './pages/admin/QuizForm'
import ManageQuestions from './pages/admin/ManageQuestions'
import ManageUsers from './pages/admin/ManageUsers'
import ManageCategories from './pages/admin/ManageCategories'
import AdminAttempts from './pages/admin/AdminAttempts'
import AdminAnalytics from './pages/admin/AdminAnalytics'

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
      <p className="text-7xl font-extrabold text-primary-600">404</p>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quizzes" element={<BrowseQuizzes />} />
        <Route path="/quizzes/:id" element={<QuizDetails />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute roles={['STUDENT']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/quizzes" element={<StudentQuizList />} />
            <Route path="/student/attempt/:quizId/:attemptId" element={<Attempt />} />
            <Route path="/student/result/:id" element={<Result />} />
            <Route path="/student/history" element={<History />} />
            <Route path="/student/leaderboard" element={<Leaderboard />} />
            <Route path="/student/notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/quizzes" element={<ManageQuizzes />} />
            <Route path="/admin/quizzes/new" element={<QuizForm />} />
            <Route path="/admin/quizzes/:id/edit" element={<QuizForm />} />
            <Route path="/admin/quizzes/:id/questions" element={<ManageQuestions />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/attempts" element={<AdminAttempts />} />
            <Route path="/admin/attempts/:id" element={<Result admin />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}