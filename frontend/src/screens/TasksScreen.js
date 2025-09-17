import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Title,
  Card,
  Button,
  Text,
  FAB,
  Chip,
  List,
  Checkbox,
  Modal,
  Portal,
  TextInput,
  Menu,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { taskService } from '../services/taskService';

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  
  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'medium',
    due_date: '',
  });

  const filters = {
    all: 'Todas',
    pending: 'Pendientes',
    completed: 'Completadas',
    high: 'Prioridad Alta',
  };

  useEffect(() => {
    loadTasks();
  }, [currentFilter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getTasks(currentFilter);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const toggleTaskComplete = async (taskId, completed) => {
    try {
      await taskService.updateTask(taskId, { completed: !completed });
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !completed }
          : task
      ));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    try {
      const createdTask = await taskService.createTask(newTask);
      setTasks([createdTask, ...tasks]);
      setModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        subject: '',
        priority: 'medium',
        due_date: '',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la tarea');
    }
  };

  const deleteTask = async (taskId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(taskId);
              setTasks(tasks.filter(task => task.id !== taskId));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const filteredTasks = tasks.filter(task => {
    switch (currentFilter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      case 'high': return task.priority === 'high';
      default: return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Tareas</Title>
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterMenuVisible(true)}
              icon="filter-list"
              compact
            >
              {filters[currentFilter]}
            </Button>
          }
        >
          {Object.entries(filters).map(([key, label]) => (
            <Menu.Item
              key={key}
              onPress={() => {
                setCurrentFilter(key);
                setFilterMenuVisible(false);
              }}
              title={label}
            />
          ))}
        </Menu>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <Icon name="assignment" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No hay tareas</Text>
                <Text style={styles.emptySubtext}>
                  Toca el botón + para agregar una nueva tarea
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content>
                <View style={styles.taskHeader}>
                  <Checkbox
                    status={task.completed ? 'checked' : 'unchecked'}
                    onPress={() => toggleTaskComplete(task.id, task.completed)}
                  />
                  <View style={styles.taskInfo}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.completedTask,
                      ]}
                    >
                      {task.title}
                    </Text>
                    {task.subject && (
                      <Text style={styles.taskSubject}>{task.subject}</Text>
                    )}
                    {task.description && (
                      <Text style={styles.taskDescription}>
                        {task.description}
                      </Text>
                    )}
                  </View>
                  <Button
                    mode="text"
                    onPress={() => deleteTask(task.id)}
                    textColor="#f44336"
                    compact
                  >
                    <Icon name="delete" size={20} />
                  </Button>
                </View>
                
                <View style={styles.taskFooter}>
                  <Chip
                    mode="outlined"
                    textStyle={{
                      color: getPriorityColor(task.priority),
                      fontSize: 12,
                    }}
                    style={[
                      styles.priorityChip,
                      { borderColor: getPriorityColor(task.priority) },
                    ]}
                  >
                    {getPriorityLabel(task.priority)}
                  </Chip>
                  
                  {task.due_date && (
                    <Text style={styles.dueDate}>
                      Vence: {formatDate(task.due_date)}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setModalVisible(true)}
      />

      {/* Add Task Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Nueva Tarea</Title>
          
          <TextInput
            label="Título *"
            value={newTask.title}
            onChangeText={(text) => setNewTask({...newTask, title: text})}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Materia"
            value={newTask.subject}
            onChangeText={(text) => setNewTask({...newTask, subject: text})}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Descripción"
            value={newTask.description}
            onChangeText={(text) => setNewTask({...newTask, description: text})}
            multiline
            numberOfLines={3}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Fecha de entrega (YYYY-MM-DD)"
            value={newTask.due_date}
            onChangeText={(text) => setNewTask({...newTask, due_date: text})}
            style={styles.input}
            mode="outlined"
            placeholder="2024-12-31"
          />

          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Prioridad:</Text>
            <View style={styles.priorityButtons}>
              {['low', 'medium', 'high'].map((priority) => (
                <Button
                  key={priority}
                  mode={newTask.priority === priority ? 'contained' : 'outlined'}
                  onPress={() => setNewTask({...newTask, priority})}
                  style={styles.priorityButton}
                  compact
                >
                  {getPriorityLabel(priority)}
                </Button>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={createTask}
              style={styles.modalButton}
            >
              Crear Tarea
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyCard: {
    marginTop: 50,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskSubject: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
    marginTop: 2,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priorityChip: {
    height: 28,
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  priorityContainer: {
    marginBottom: 20,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default TasksScreen;