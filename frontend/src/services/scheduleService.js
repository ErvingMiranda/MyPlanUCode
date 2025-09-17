import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8000';

class ScheduleService {
  async getWeeklySchedule() {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/schedule/weekly`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch schedule');
      }
    } catch (error) {
      console.error('Get weekly schedule error:', error);
      // Fallback to local storage for development/offline mode
      return this.getScheduleFromStorage();
    }
  }

  async getTodaySchedule() {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/schedule/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch today schedule');
      }
    } catch (error) {
      console.error('Get today schedule error:', error);
      // Fallback to local storage
      const weeklySchedule = await this.getScheduleFromStorage();
      const today = new Date().getDay();
      const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const todayName = dayNames[today];
      return weeklySchedule[todayName] || [];
    }
  }

  async createClass(classData) {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/schedule/classes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create class');
      }
    } catch (error) {
      console.error('Create class error:', error);
      // Fallback to local storage
      return this.createClassInStorage(classData);
    }
  }

  async updateClass(classId, updates) {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/schedule/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to update class');
      }
    } catch (error) {
      console.error('Update class error:', error);
      // Fallback to local storage
      return this.updateClassInStorage(classId, updates);
    }
  }

  async deleteClass(classId) {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/schedule/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Failed to delete class');
      }
    } catch (error) {
      console.error('Delete class error:', error);
      // Fallback to local storage
      return this.deleteClassFromStorage(classId);
    }
  }

  // Local storage fallback methods
  async getScheduleFromStorage() {
    try {
      const scheduleJson = await AsyncStorage.getItem('schedule');
      return scheduleJson ? JSON.parse(scheduleJson) : this.getDefaultSchedule();
    } catch (error) {
      console.error('Get schedule from storage error:', error);
      return this.getDefaultSchedule();
    }
  }

  async createClassInStorage(classData) {
    try {
      const schedule = await this.getScheduleFromStorage();
      const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const dayName = dayNames[classData.day_of_week];
      
      const newClass = {
        id: Date.now(),
        ...classData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!schedule[dayName]) {
        schedule[dayName] = [];
      }
      
      schedule[dayName].push(newClass);
      await AsyncStorage.setItem('schedule', JSON.stringify(schedule));
      return newClass;
    } catch (error) {
      console.error('Create class in storage error:', error);
      throw error;
    }
  }

  async updateClassInStorage(classId, updates) {
    try {
      const schedule = await this.getScheduleFromStorage();
      let updatedClass = null;
      
      // Find and update the class in the appropriate day
      Object.keys(schedule).forEach(day => {
        const classIndex = schedule[day].findIndex(cls => cls.id === classId);
        if (classIndex !== -1) {
          schedule[day][classIndex] = {
            ...schedule[day][classIndex],
            ...updates,
            updated_at: new Date().toISOString(),
          };
          updatedClass = schedule[day][classIndex];
        }
      });

      if (updatedClass) {
        await AsyncStorage.setItem('schedule', JSON.stringify(schedule));
        return updatedClass;
      } else {
        throw new Error('Class not found');
      }
    } catch (error) {
      console.error('Update class in storage error:', error);
      throw error;
    }
  }

  async deleteClassFromStorage(classId) {
    try {
      const schedule = await this.getScheduleFromStorage();
      let found = false;
      
      // Find and remove the class from the appropriate day
      Object.keys(schedule).forEach(day => {
        const originalLength = schedule[day].length;
        schedule[day] = schedule[day].filter(cls => cls.id !== classId);
        if (schedule[day].length < originalLength) {
          found = true;
        }
      });

      if (found) {
        await AsyncStorage.setItem('schedule', JSON.stringify(schedule));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Delete class from storage error:', error);
      return false;
    }
  }

  getDefaultSchedule() {
    return {
      lunes: [
        {
          id: 1,
          course_name: 'Matemáticas I',
          location: 'Aula 201',
          start_time: '08:00',
          end_time: '10:00',
          day_of_week: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          course_name: 'Historia Universal',
          location: 'Aula 105',
          start_time: '10:30',
          end_time: '12:00',
          day_of_week: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      martes: [
        {
          id: 3,
          course_name: 'Física I',
          location: 'Laboratorio A',
          start_time: '09:00',
          end_time: '11:00',
          day_of_week: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      miércoles: [
        {
          id: 4,
          course_name: 'Literatura Española',
          location: 'Aula 301',
          start_time: '08:30',
          end_time: '10:00',
          day_of_week: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          course_name: 'Matemáticas I',
          location: 'Aula 201',
          start_time: '14:00',
          end_time: '16:00',
          day_of_week: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      jueves: [
        {
          id: 6,
          course_name: 'Química General',
          location: 'Laboratorio B',
          start_time: '10:00',
          end_time: '12:00',
          day_of_week: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      viernes: [
        {
          id: 7,
          course_name: 'Inglés I',
          location: 'Aula 102',
          start_time: '08:00',
          end_time: '09:30',
          day_of_week: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      sábado: [],
      domingo: [],
    };
  }
}

export const scheduleService = new ScheduleService();