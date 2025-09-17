import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Title,
  Card,
  Button,
  Text,
  List,
  Switch,
  TextInput,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    reminderTime: 30,
    autoSync: true,
    weekStartsOn: 'monday',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    loadUserData();
    loadPreferences();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditForm({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('preferences');
      if (savedPreferences) {
        setPreferences({
          ...preferences,
          ...JSON.parse(savedPreferences),
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (newPreferences) => {
    try {
      await AsyncStorage.setItem('preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    }
  };

  const updatePreference = (key, value) => {
    const newPreferences = {
      ...preferences,
      [key]: value,
    };
    savePreferences(newPreferences);
  };

  const saveUserData = async () => {
    try {
      const updatedUser = {
        ...user,
        name: editForm.name,
        email: editForm.email,
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const logout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'user']);
              navigation.replace('Login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      'Esta acción eliminará todas tus tareas, horarios y configuraciones. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data except user session
              await AsyncStorage.multiRemove(['tasks', 'schedule', 'courses', 'preferences']);
              Alert.alert('Éxito', 'Todos los datos han sido eliminados');
              // Reload preferences to defaults
              setPreferences({
                notifications: true,
                darkMode: false,
                reminderTime: 30,
                autoSync: true,
                weekStartsOn: 'monday',
              });
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'No se pudieron eliminar los datos');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>Configuración</Title>

        {/* User Profile Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Perfil</Text>
              <Button
                mode="text"
                onPress={() => {
                  if (isEditing) {
                    saveUserData();
                  } else {
                    setIsEditing(true);
                  }
                }}
                compact
              >
                {isEditing ? 'Guardar' : 'Editar'}
              </Button>
            </View>

            {user && (
              <>
                <View style={styles.profileItem}>
                  <Icon name="person" size={24} color="#666" style={styles.profileIcon} />
                  {isEditing ? (
                    <TextInput
                      value={editForm.name}
                      onChangeText={(text) => setEditForm({...editForm, name: text})}
                      style={styles.profileInput}
                      mode="outlined"
                      dense
                    />
                  ) : (
                    <Text style={styles.profileText}>{user.name || 'Sin nombre'}</Text>
                  )}
                </View>

                <View style={styles.profileItem}>
                  <Icon name="email" size={24} color="#666" style={styles.profileIcon} />
                  {isEditing ? (
                    <TextInput
                      value={editForm.email}
                      onChangeText={(text) => setEditForm({...editForm, email: text})}
                      style={styles.profileInput}
                      mode="outlined"
                      keyboardType="email-address"
                      dense
                    />
                  ) : (
                    <Text style={styles.profileText}>{user.email}</Text>
                  )}
                </View>

                {isEditing && (
                  <Button
                    mode="text"
                    onPress={() => setIsEditing(false)}
                    style={styles.cancelButton}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Notifications Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            
            <List.Item
              title="Activar notificaciones"
              description="Recibir recordatorios de tareas y clases"
              left={(props) => <List.Icon {...props} icon="notifications" />}
              right={() => (
                <Switch
                  value={preferences.notifications}
                  onValueChange={(value) => updatePreference('notifications', value)}
                />
              )}
            />

            <List.Item
              title="Tiempo de recordatorio"
              description={`${preferences.reminderTime} minutos antes`}
              left={(props) => <List.Icon {...props} icon="schedule" />}
              onPress={() => {
                Alert.alert(
                  'Tiempo de recordatorio',
                  'Minutos antes del evento para recibir notificación',
                  [
                    { text: '15 min', onPress: () => updatePreference('reminderTime', 15) },
                    { text: '30 min', onPress: () => updatePreference('reminderTime', 30) },
                    { text: '60 min', onPress: () => updatePreference('reminderTime', 60) },
                    { text: 'Cancelar', style: 'cancel' },
                  ]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* App Settings Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Aplicación</Text>
            
            <List.Item
              title="Tema oscuro"
              description="Activar modo oscuro"
              left={(props) => <List.Icon {...props} icon="dark-mode" />}
              right={() => (
                <Switch
                  value={preferences.darkMode}
                  onValueChange={(value) => updatePreference('darkMode', value)}
                />
              )}
            />

            <List.Item
              title="Sincronización automática"
              description="Sincronizar datos automáticamente"
              left={(props) => <List.Icon {...props} icon="sync" />}
              right={() => (
                <Switch
                  value={preferences.autoSync}
                  onValueChange={(value) => updatePreference('autoSync', value)}
                />
              )}
            />

            <List.Item
              title="Inicio de semana"
              description={preferences.weekStartsOn === 'monday' ? 'Lunes' : 'Domingo'}
              left={(props) => <List.Icon {...props} icon="calendar-today" />}
              onPress={() => {
                Alert.alert(
                  'Inicio de semana',
                  '¿Qué día debe iniciar la semana?',
                  [
                    { 
                      text: 'Lunes', 
                      onPress: () => updatePreference('weekStartsOn', 'monday') 
                    },
                    { 
                      text: 'Domingo', 
                      onPress: () => updatePreference('weekStartsOn', 'sunday') 
                    },
                    { text: 'Cancelar', style: 'cancel' },
                  ]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Data Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Datos</Text>
            
            <List.Item
              title="Exportar datos"
              description="Descargar backup de tus datos"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={() => {
                Alert.alert('Función no disponible', 'Esta función estará disponible en una futura actualización');
              }}
            />

            <List.Item
              title="Eliminar todos los datos"
              description="Borrar tareas, horarios y configuraciones"
              left={(props) => <List.Icon {...props} icon="delete-forever" />}
              onPress={clearAllData}
            />
          </Card.Content>
        </Card>

        {/* About Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Acerca de</Text>
            
            <List.Item
              title="MyPlanU"
              description="Versión 1.0.0"
              left={(props) => <List.Icon {...props} icon="info" />}
            />

            <List.Item
              title="Desarrollado por"
              description="Equipo Fluxboard"
              left={(props) => <List.Icon {...props} icon="code" />}
            />

            <List.Item
              title="Soporte"
              description="Contactar al equipo de desarrollo"
              left={(props) => <List.Icon {...props} icon="help" />}
              onPress={() => {
                Alert.alert(
                  'Soporte',
                  'Para soporte técnico, contacta al equipo Fluxboard',
                  [{ text: 'OK' }]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={logout}
              icon="logout"
              style={styles.logoutButton}
              textColor="#f44336"
            >
              Cerrar Sesión
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileIcon: {
    marginRight: 15,
    width: 24,
  },
  profileText: {
    fontSize: 16,
    flex: 1,
  },
  profileInput: {
    flex: 1,
    height: 40,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  logoutButton: {
    borderColor: '#f44336',
  },
});

export default SettingsScreen;