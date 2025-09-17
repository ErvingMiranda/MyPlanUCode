# MyPlanU - Aplicación de Gestión Académica

MyPlanU es una aplicación móvil desarrollada por el equipo Fluxboard para gestión académica y de tareas. Permite a estudiantes organizar sus cursos, planificar tareas, recibir recordatorios y personalizar sus preferencias de estudio.

## 🏗️ Arquitectura

La aplicación está organizada en una **arquitectura por capas**:

### 📱 **Frontend (Vistas)**
- **React Native** con Expo para desarrollo móvil multiplataforma
- Pantallas principales:
  - **Inicio**: Dashboard con resumen de tareas y horarios
  - **Login**: Autenticación de usuarios
  - **Tareas**: Gestión completa de tareas académicas
  - **Horario**: Visualización y edición del horario de clases
  - **Configuración**: Personalización de preferencias

### 🔧 **Backend (Servicios)**
- **Python** con FastAPI para la API REST
- Servicios implementados:
  - **Autenticación**: Login y registro de usuarios
  - **Gestión de Tareas**: CRUD completo de tareas
  - **Gestión de Horarios**: Programación de clases
  - **Recordatorios**: Sistema de notificaciones
  - **Sincronización**: Respaldo y sincronización de datos

### 💾 **Base de Datos (Modelos)**
- **SQLite** para almacenamiento local
- Entidades principales:
  - **Users**: Usuarios del sistema
  - **Courses**: Cursos/materias
  - **Tasks**: Tareas académicas
  - **Schedules**: Horarios de clases
  - **Reminders**: Recordatorios
  - **Sessions**: Sesiones de usuario

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- Python (v3.8 o superior)
- Expo CLI
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/ErvingMiranda/MyPlanUCode.git
cd MyPlanUCode
```

### 2. Configuración del Backend

```bash
# Ir al directorio del backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor
python main.py
```

El backend estará disponible en `http://localhost:8000`

### 3. Configuración del Frontend

```bash
# Ir al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar la aplicación
npm start
```

### 4. Inicialización de la Base de Datos

La base de datos SQLite se crea automáticamente al ejecutar el backend por primera vez. El archivo se encuentra en `backend/myplanu.db`.

## 📱 Uso de la Aplicación

### Cuenta Demo
Para pruebas rápidas, puedes usar:
- **Email**: `demo@myplanu.com`
- **Contraseña**: `demo123`

### Funcionalidades Principales

#### 🏠 **Dashboard (Inicio)**
- Vista general de tareas pendientes del día
- Próximas clases programadas
- Estadísticas de progreso
- Acceso rápido a funciones principales

#### 📝 **Gestión de Tareas**
- Crear, editar y eliminar tareas
- Establecer prioridades (Alta, Media, Baja)
- Fechas de entrega
- Filtros por estado (Pendientes, Completadas, etc.)
- Marcar como completadas

#### 📅 **Horario de Clases**
- Vista semanal del horario
- Agregar clases por día y hora
- Información de ubicación
- Vista del día actual destacada

#### ⚙️ **Configuración**
- Editar perfil de usuario
- Configurar notificaciones
- Ajustes de la aplicación
- Gestión de datos

## 🛠️ Desarrollo

### Estructura del Proyecto
```
MyPlanUCode/
├── frontend/           # Aplicación React Native
│   ├── src/
│   │   ├── screens/    # Pantallas de la app
│   │   ├── services/   # Servicios para API
│   │   ├── components/ # Componentes reutilizables
│   │   └── navigation/ # Configuración de navegación
│   ├── App.js         # Componente principal
│   └── package.json   # Dependencias frontend
├── backend/           # API Python FastAPI
│   ├── app/
│   │   ├── models/    # Modelos de base de datos
│   │   ├── schemas/   # Esquemas Pydantic
│   │   ├── routers/   # Rutas de la API
│   │   └── core/      # Configuración core
│   ├── main.py       # Punto de entrada
│   └── requirements.txt # Dependencias backend
├── database/         # Scripts de base de datos
└── docs/            # Documentación
```

### API Endpoints

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

#### Tareas
- `GET /tasks` - Obtener tareas
- `POST /tasks` - Crear tarea
- `PUT /tasks/{id}` - Actualizar tarea
- `DELETE /tasks/{id}` - Eliminar tarea
- `GET /tasks/stats` - Estadísticas de tareas

#### Horarios
- `GET /schedule/weekly` - Horario semanal
- `POST /schedule/classes` - Crear clase
- `PUT /schedule/classes/{id}` - Actualizar clase
- `DELETE /schedule/classes/{id}` - Eliminar clase

### Modo Offline

La aplicación incluye funcionalidad offline utilizando AsyncStorage para:
- Almacenamiento local de tareas
- Cache de horarios
- Preferencias de usuario
- Datos de autenticación

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 👥 Equipo Fluxboard

Desarrollado con ❤️ por el equipo Fluxboard para el hackathon.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**¿Necesitas ayuda?** Abre un issue o contacta al equipo de desarrollo.
