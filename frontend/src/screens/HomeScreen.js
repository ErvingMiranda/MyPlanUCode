import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Title,
  Card,
  Button,
  Text,
  FAB,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { taskService } from '../services/taskService';
import { scheduleService } from '../services/scheduleService';

const HomeScreen = ({ navigation }) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    upcomingClasses: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasks, schedule, taskStats] = await Promise.all([
        taskService.getTodayTasks(),
        scheduleService.getTodaySchedule(),
        taskService.getTaskStats(),
      ]);

      setTodayTasks(tasks);
      setTodaySchedule(schedule);
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.greeting}>{getGreeting()}</Title>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, styles.primaryCard]}>
            <Card.Content>
              <View style={styles.statContent}>
                <Icon name="assignment" size={30} color="#fff" />
                <View>
                  <Text style={styles.statNumber}>{stats.totalTasks}</Text>
                  <Text style={styles.statLabel}>Tareas Total</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.successCard]}>
            <Card.Content>
              <View style={styles.statContent}>
                <Icon name="check-circle" size={30} color="#fff" />
                <View>
                  <Text style={styles.statNumber}>{stats.completedTasks}</Text>
                  <Text style={styles.statLabel}>Completadas</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Today's Tasks */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Tareas de Hoy</Title>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Tasks')}
                compact
              >
                Ver todas
              </Button>
            </View>
            
            {todayTasks.length === 0 ? (
              <Text style={styles.emptyText}>No hay tareas para hoy 🎉</Text>
            ) : (
              todayTasks.slice(0, 3).map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskSubject}>{task.subject}</Text>
                  </View>
                  <Chip
                    mode={task.priority === 'high' ? 'flat' : 'outlined'}
                    textStyle={{ fontSize: 12 }}
                    style={[
                      styles.priorityChip,
                      task.priority === 'high' && styles.highPriority,
                    ]}
                  >
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  </Chip>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Today's Schedule */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Horario de Hoy</Title>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Schedule')}
                compact
              >
                Ver horario
              </Button>
            </View>
            
            {todaySchedule.length === 0 ? (
              <Text style={styles.emptyText}>No hay clases programadas</Text>
            ) : (
              todaySchedule.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.scheduleItem}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.scheduleTime}>
                      {formatTime(item.start_time)}
                    </Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleCourse}>{item.course_name}</Text>
                    <Text style={styles.scheduleLocation}>{item.location}</Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => navigation.navigate('Tasks', { screen: 'AddTask' })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
  },
  primaryCard: {
    backgroundColor: '#6200ee',
  },
  successCard: {
    backgroundColor: '#4caf50',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  sectionCard: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  taskSubject: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  priorityChip: {
    height: 28,
  },
  highPriority: {
    backgroundColor: '#ffebee',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    width: 80,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 15,
  },
  scheduleCourse: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scheduleLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default HomeScreen;