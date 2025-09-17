import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8000';

class TaskService {
  async getTasks(filter = 'all') {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/tasks?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Get tasks error:', error);
      // Fallback to local storage for development/offline mode
      return this.getTasksFromStorage(filter);
    }
  }

  async getTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/tasks/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch today tasks');
      }
    } catch (error) {
      console.error('Get today tasks error:', error);
      // Fallback to local storage
      const allTasks = await this.getTasksFromStorage();
      return allTasks.filter(task => 
        task.due_date === today || (!task.due_date && !task.completed)
      ).slice(0, 5);
    }
  }

  async createTask(taskData) {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Create task error:', error);
      // Fallback to local storage
      return this.createTaskInStorage(taskData);
    }
  }

  async updateTask(taskId, updates) {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
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
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Update task error:', error);
      // Fallback to local storage
      return this.updateTaskInStorage(taskId, updates);
    }
  }

  async deleteTask(taskId) {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      // Fallback to local storage
      return this.deleteTaskFromStorage(taskId);
    }
  }

  async getTaskStats() {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}/tasks/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to get task stats');
      }
    } catch (error) {
      console.error('Get task stats error:', error);
      // Fallback calculation
      const tasks = await this.getTasksFromStorage();
      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        pendingTasks: tasks.filter(t => !t.completed).length,
        upcomingClasses: 0,
      };
    }
  }

  // Local storage fallback methods
  async getTasksFromStorage(filter = 'all') {
    try {
      const tasksJson = await AsyncStorage.getItem('tasks');
      const tasks = tasksJson ? JSON.parse(tasksJson) : this.getDefaultTasks();
      
      switch (filter) {
        case 'pending':
          return tasks.filter(task => !task.completed);
        case 'completed':
          return tasks.filter(task => task.completed);
        case 'high':
          return tasks.filter(task => task.priority === 'high');
        default:
          return tasks;
      }
    } catch (error) {
      console.error('Get tasks from storage error:', error);
      return this.getDefaultTasks();
    }
  }

  async createTaskInStorage(taskData) {
    try {
      const tasks = await this.getTasksFromStorage();
      const newTask = {
        id: Date.now(),
        ...taskData,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const updatedTasks = [newTask, ...tasks];
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      return newTask;
    } catch (error) {
      console.error('Create task in storage error:', error);
      throw error;
    }
  }

  async updateTaskInStorage(taskId, updates) {
    try {
      const tasks = await this.getTasksFromStorage();
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        return tasks[taskIndex];
      } else {
        throw new Error('Task not found');
      }
    } catch (error) {
      console.error('Update task in storage error:', error);
      throw error;
    }
  }

  async deleteTaskFromStorage(taskId) {
    try {
      const tasks = await this.getTasksFromStorage();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      await AsyncStorage.setItem('tasks', JSON.stringify(filteredTasks));
      return true;
    } catch (error) {
      console.error('Delete task from storage error:', error);
      return false;
    }
  }

  getDefaultTasks() {
    return [
      {
        id: 1,
        title: 'Estudiar para examen de matemáticas',
        description: 'Repasar capítulos 1-5 del libro de cálculo',
        subject: 'Matemáticas',
        priority: 'high',
        due_date: new Date().toISOString().split('T')[0],
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Entregar ensayo de historia',
        description: 'Ensayo sobre la revolución industrial',
        subject: 'Historia',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Leer capítulo 3 de literatura',
        description: 'Lectura obligatoria para la clase',
        subject: 'Literatura',
        priority: 'low',
        due_date: null,
        completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export const taskService = new TaskService();