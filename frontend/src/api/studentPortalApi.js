import { apiRequest } from './config';

export const getStudentProfile = async () => (await apiRequest('/student/profile')).data;

export const getSelfSchedule = async () => (await apiRequest('/student/schedule')).data;

export const createSelfSchedule = async (scheduleData) =>
  apiRequest('/student/schedule', {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  });

export const deleteSelfSchedule = async (id) =>
  apiRequest(`/student/schedule/${id}`, {
    method: 'DELETE',
  });

export const getAcademicResults = async () => (await apiRequest('/student/results')).data;

export const getExamSchedules = async () => (await apiRequest('/student/exam-schedules')).data;

export const getNotifications = async () => (await apiRequest('/student/notifications')).data;

export const markNotificationRead = async (id) =>
  apiRequest(`/student/notifications/${id}/read`, {
    method: 'PATCH',
  });

export const getAnnouncements = async () => (await apiRequest('/student/announcements')).data;

export const sendTeacherNotification = async (data) =>
  apiRequest('/student/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const createExamSchedule = async (data) =>
  apiRequest('/student/exam-schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
