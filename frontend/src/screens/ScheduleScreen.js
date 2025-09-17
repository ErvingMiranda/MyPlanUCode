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
  Modal,
  Portal,
  TextInput,
  List,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scheduleService } from '../services/scheduleService';

const ScheduleScreen = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  const [newClass, setNewClass] = useState({
    course_name: '',
    location: '',
    start_time: '',
    end_time: '',
    day_of_week: 0,
  });

  const daysOfWeek = [
    { key: 0, label: 'Domingo' },
    { key: 1, label: 'Lunes' },
    { key: 2, label: 'Martes' },
    { key: 3, label: 'Miércoles' },
    { key: 4, label: 'Jueves' },
    { key: 5, label: 'Viernes' },
    { key: 6, label: 'Sábado' },
  ];

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getWeeklySchedule();
      setSchedule(data);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedule();
    setRefreshing(false);
  };

  const createClass = async () => {
    if (!newClass.course_name.trim() || !newClass.start_time || !newClass.end_time) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const createdClass = await scheduleService.createClass(newClass);
      // Update schedule state
      const day = daysOfWeek[newClass.day_of_week].label.toLowerCase();
      const currentDaySchedule = schedule[day] || [];
      setSchedule({
        ...schedule,
        [day]: [...currentDaySchedule, createdClass],
      });
      
      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la clase');
    }
  };

  const resetForm = () => {
    setNewClass({
      course_name: '',
      location: '',
      start_time: '',
      end_time: '',
      day_of_week: 0,
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentDay = () => {
    const today = new Date().getDay();
    return daysOfWeek[today].label.toLowerCase();
  };

  const renderDaySchedule = (day, dayLabel) => {
    const daySchedule = schedule[day] || [];
    const isToday = day === getCurrentDay();

    return (
      <Card key={day} style={[styles.dayCard, isToday && styles.todayCard]}>
        <Card.Content>
          <View style={styles.dayHeader}>
            <Title style={[styles.dayTitle, isToday && styles.todayTitle]}>
              {dayLabel}
              {isToday && <Text style={styles.todayIndicator}> (Hoy)</Text>}
            </Title>
            <Button
              mode="text"
              onPress={() => {
                setSelectedDay(daysOfWeek.find(d => d.label.toLowerCase() === day)?.key || 0);
                setNewClass({ ...newClass, day_of_week: daysOfWeek.find(d => d.label.toLowerCase() === day)?.key || 0 });
                setModalVisible(true);
              }}
              icon="add"
              compact
            >
              Agregar
            </Button>
          </View>

          {daySchedule.length === 0 ? (
            <Text style={styles.noClassesText}>Sin clases programadas</Text>
          ) : (
            daySchedule
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((classItem, index) => (
                <View key={index} style={styles.classItem}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.classTime}>
                      {formatTime(classItem.start_time)}
                    </Text>
                    <Text style={styles.classTime}>
                      {formatTime(classItem.end_time)}
                    </Text>
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.course_name}</Text>
                    {classItem.location && (
                      <Text style={styles.classLocation}>
                        <Icon name="place" size={16} color="#666" />
                        {' '}{classItem.location}
                      </Text>
                    )}
                  </View>
                </View>
              ))
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Horario</Title>
        <Text style={styles.subtitle}>Semana actual</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {daysOfWeek.slice(1, 6).map((day) => // Lunes a Viernes
          renderDaySchedule(day.label.toLowerCase(), day.label)
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setModalVisible(true)}
        label="Agregar clase"
      />

      {/* Add Class Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            resetForm();
          }}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Nueva Clase</Title>
          
          <TextInput
            label="Nombre del curso *"
            value={newClass.course_name}
            onChangeText={(text) => setNewClass({...newClass, course_name: text})}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Ubicación"
            value={newClass.location}
            onChangeText={(text) => setNewClass({...newClass, location: text})}
            style={styles.input}
            mode="outlined"
            placeholder="Aula 101, Edificio A"
          />

          <View style={styles.row}>
            <TextInput
              label="Hora inicio *"
              value={newClass.start_time}
              onChangeText={(text) => setNewClass({...newClass, start_time: text})}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              placeholder="08:00"
            />
            
            <TextInput
              label="Hora fin *"
              value={newClass.end_time}
              onChangeText={(text) => setNewClass({...newClass, end_time: text})}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              placeholder="10:00"
            />
          </View>

          <View style={styles.daySelector}>
            <Text style={styles.dayLabel}>Día de la semana:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dayButtons}>
                {daysOfWeek.slice(1, 6).map((day) => (
                  <Button
                    key={day.key}
                    mode={newClass.day_of_week === day.key ? 'contained' : 'outlined'}
                    onPress={() => setNewClass({...newClass, day_of_week: day.key})}
                    style={styles.dayButton}
                    compact
                  >
                    {day.label.substring(0, 3)}
                  </Button>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={createClass}
              style={styles.modalButton}
            >
              Crear Clase
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayCard: {
    marginBottom: 15,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  todayTitle: {
    color: '#6200ee',
  },
  todayIndicator: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6200ee',
  },
  noClassesText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    width: 80,
    alignItems: 'center',
  },
  classTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  classInfo: {
    flex: 1,
    marginLeft: 20,
  },
  className: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  classLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
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
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  daySelector: {
    marginBottom: 20,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  dayButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    minWidth: 60,
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

export default ScheduleScreen;