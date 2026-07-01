import { createBrowserRouter } from "react-router-dom";
import Login from "./layouts/login";
import Dashboard from "./layouts/DashboardLayout";
import Asosiy from "./layouts/Dashboard";
import Oqituvchilar from "./layouts/Teachers";
import Sinflar from "./layouts/Groups";
import GroupDetails from "./layouts/GroupDetails";
import HomeworkCreate from "./layouts/HomeworkCreate";
import HomeworkDetails from "./layouts/HomeworkDetails";
import HomeworkReview from "./layouts/HomeworkReview";
import ExamCreate from "./layouts/ExamCreate";
import ExamDetails from "./layouts/ExamDetails";
import ExamReview from "./layouts/ExamReview";
import Sovgalar from "./layouts/Gifts";
import Boshqarish from "./layouts/Management";
import Talabalar from "./layouts/Students";
import ProtectRoute from "./components/ProtectRoute";
import StudentLayout from "./layouts/StudentLayout";
import StudentGroups from "./layouts/student/StudentGroups";
import StudentLessons from "./layouts/student/StudentLessons";
import StudentLessonDetail from "./layouts/student/StudentLessonDetail";
import StudentPlaceholder from "./layouts/student/StudentPlaceholder";
import TeacherLayout from "./layouts/TeacherLayout";
import TeacherGroups from "./layouts/teacher/TeacherGroups";
import TeacherProfile from "./layouts/teacher/TeacherProfile";
import TeacherPlannedGroups from "./layouts/teacher/TeacherPlannedGroups";
import {
  Kurslar,
  Xonalar,
  Hodimlar,
  Filiallar,
  Sabablar,
} from "./layouts/ManagementPages";

export const route = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectRoute>
        <Dashboard />
      </ProtectRoute>
    ),
    children: [
      {
        index: true,
        element: <Asosiy />,
      },
      {
        path: "/dashboard/o'qituvcilar",
        element: <Oqituvchilar />,
      },
      {
        path: "/dashboard/sinflar",
        element: <Sinflar />,
      },
      {
        path: "/dashboard/sinflar/:id",
        element: <GroupDetails />,
      },
      {
        path: "/dashboard/groups/:id/homework/create",
        element: <HomeworkCreate />,
      },
      {
        path: "/dashboard/groups/:groupId/homework/:homeworkId",
        element: <HomeworkDetails />,
      },
      {
        path: "/dashboard/groups/:groupId/homework/:homeworkId/student/:studentId/review",
        element: <HomeworkReview />,
      },
      {
        path: "/dashboard/groups/:id/exam/create",
        element: <ExamCreate />,
      },
      {
        path: "/dashboard/groups/:groupId/exams/:examId",
        element: <ExamDetails />,
      },
      {
        path: "/dashboard/groups/:groupId/exams/:examId/student/:studentId/review",
        element: <ExamReview />,
      },
      {
        path: "/dashboard/talabalar",
        element: <Talabalar />,
      },
      {
        path: "/dashboard/sovg'alar",
        element: <Sovgalar />,
      },
      {
        path: "/dashboard/boshqarish",
        element: <Boshqarish />,
        children: [
          { path: "kurslar",  element: <Kurslar /> },
          { path: "xonalar",  element: <Xonalar /> },
          { path: "hodimlar", element: <Hodimlar /> },
          { path: "filiallar", element: <Filiallar /> },
          { path: "sabablar", element: <Sabablar /> },
        ],
      },
    ],
  },
  {
    path: "/student",
    element: (
      <ProtectRoute role="student">
        <StudentLayout />
      </ProtectRoute>
    ),
    children: [
      { index: true, element: <StudentGroups /> },
      { path: "bosh-sahifa", element: <StudentPlaceholder title="Bosh sahifa" /> },
      { path: "tolovlarim", element: <StudentPlaceholder title="To'lovlarim" /> },
      { path: "guruhlarim", element: <StudentGroups /> },
      { path: "guruhlarim/:groupId", element: <StudentLessons /> },
      { path: "guruhlarim/:groupId/:lessonId", element: <StudentLessonDetail /> },
      { path: "korsatgichlarim", element: <StudentPlaceholder title="Ko'rsatgichlarim" /> },
      { path: "reyting", element: <StudentPlaceholder title="Reyting" /> },
      { path: "dokon", element: <StudentPlaceholder title="Do`kon" /> },
      { path: "qoshimcha-darslar", element: <StudentPlaceholder title="Qo'shimcha darslar" /> },
      { path: "sozlamalar", element: <StudentPlaceholder title="Sozlamalar" /> },
    ],
  },
  {
    path: "/teacher",
    element: (
      <ProtectRoute role="teacher">
        <TeacherLayout />
      </ProtectRoute>
    ),
    children: [
      { index: true, element: <TeacherGroups /> },
      { path: "guruhlar", element: <TeacherGroups /> },
      { path: "guruhlar/:id", element: <GroupDetails /> },
      { path: "guruhlar/:id/homework/create", element: <HomeworkCreate /> },
      { path: "guruhlar/:groupId/homework/:homeworkId", element: <HomeworkDetails /> },
      { path: "guruhlar/:groupId/homework/:homeworkId/student/:studentId/review", element: <HomeworkReview /> },
      { path: "guruhlar/:id/exam/create", element: <ExamCreate /> },
      { path: "guruhlar/:groupId/exams/:examId", element: <ExamDetails /> },
      { path: "guruhlar/:groupId/exams/:examId/student/:studentId/review", element: <ExamReview /> },
      { path: "planned-groups", element: <TeacherPlannedGroups /> },
      { path: "yigilayotgan", element: <TeacherPlannedGroups /> },
      { path: "profil", element: <TeacherProfile /> },
    ],
  },
]);
