import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingrese email y contraseña');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await authService.login(email, password);
      } else {
        result = await authService.register(email, password);
      }

      if (result.success) {
        await AsyncStorage.setItem('token', result.token);
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        navigation.replace('Main');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80' }}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>MyPlanU</Title>
              <Title style={styles.subtitle}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Title>
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />
              
              <Button
                mode="contained"
                onPress={handleAuth}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Button>
              
              <Button
                mode="text"
                onPress={() => setIsLogin(!isLogin)}
                disabled={loading}
                style={styles.switchButton}
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 30,
    color: '#333',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
    marginBottom: 10,
  },
  switchButton: {
    marginTop: 10,
  },
});

export default LoginScreen;