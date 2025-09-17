#!/usr/bin/env python3
"""
Demo data generator for MyPlanU
Populates the database with sample data for testing
"""

import sqlite3
from datetime import datetime, timedelta
import random

def generate_demo_data():
    """Generate demo data for testing"""
    db_path = "myplanu.db"
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Clear existing data
        tables = ['tasks', 'schedules', 'courses', 'users']
        for table in tables:
            cursor.execute(f"DELETE FROM {table}")
        
        # Create demo user
        cursor.execute("""
            INSERT INTO users (email, name, hashed_password, is_active)
            VALUES (?, ?, ?, ?)
        """, ("demo@myplanu.com", "Usuario Demo", "hashed_demo_password", True))
        
        user_id = cursor.lastrowid
        print(f"✅ Created demo user with ID: {user_id}")
        
        # Create demo courses
        courses = [
            ("Matemáticas I", "MAT101", "Cálculo diferencial e integral", 4, "#f44336"),
            ("Física I", "FIS101", "Mecánica clásica", 4, "#2196f3"),
            ("Historia Universal", "HIS101", "Historia desde la antigüedad", 3, "#4caf50"),
            ("Literatura Española", "LIT101", "Literatura del Siglo de Oro", 3, "#ff9800"),
            ("Química General", "QUI101", "Principios básicos de química", 4, "#9c27b0"),
            ("Inglés I", "ENG101", "Inglés básico", 2, "#607d8b"),
        ]
        
        course_ids = []
        for course_data in courses:
            cursor.execute("""
                INSERT INTO courses (name, code, description, credits, color, owner_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (*course_data, user_id))
            course_ids.append(cursor.lastrowid)
        
        print(f"✅ Created {len(courses)} demo courses")
        
        # Create demo tasks
        tasks = [
            ("Estudiar para examen de matemáticas", "Repasar capítulos 1-5 del libro", "high", 
             datetime.now() + timedelta(days=2), course_ids[0]),
            ("Entregar ensayo de historia", "5 páginas sobre la Revolución Industrial", "medium",
             datetime.now() + timedelta(days=5), course_ids[2]),
            ("Leer capítulo 3 de literatura", "Don Quijote de la Mancha", "low",
             datetime.now() + timedelta(days=1), course_ids[3]),
            ("Práctica de laboratorio", "Experimento de caída libre", "high",
             datetime.now() + timedelta(days=3), course_ids[1]),
            ("Tarea de química", "Problemas del capítulo 2", "medium",
             datetime.now() + timedelta(days=4), course_ids[4]),
            ("Presentación en inglés", "Preparar presentación de 5 minutos", "medium",
             datetime.now() + timedelta(days=6), course_ids[5]),
            ("Examen final de física", "Estudiar todos los temas vistos", "high",
             datetime.now() + timedelta(days=14), course_ids[1]),
        ]
        
        for task_data in tasks:
            completed = random.choice([True, False]) if random.random() > 0.7 else False
            cursor.execute("""
                INSERT INTO tasks (title, description, priority, due_date, owner_id, course_id, completed)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (*task_data, user_id, completed))
        
        print(f"✅ Created {len(tasks)} demo tasks")
        
        # Create demo schedule
        schedules = [
            # Monday
            (1, "08:00", "10:00", "Aula 201", course_ids[0]),  # Matemáticas
            (1, "10:30", "12:00", "Aula 105", course_ids[2]),  # Historia
            (1, "14:00", "16:00", "Lab A", course_ids[1]),     # Física (lab)
            
            # Tuesday  
            (2, "09:00", "11:00", "Lab A", course_ids[1]),     # Física
            (2, "11:30", "13:00", "Aula 301", course_ids[3]),  # Literatura
            
            # Wednesday
            (3, "08:30", "10:00", "Aula 301", course_ids[3]),  # Literatura
            (3, "10:30", "12:00", "Aula 201", course_ids[0]),  # Matemáticas
            (3, "14:00", "16:00", "Lab B", course_ids[4]),     # Química (lab)
            
            # Thursday
            (4, "08:00", "09:30", "Aula 102", course_ids[5]),  # Inglés
            (4, "10:00", "12:00", "Lab B", course_ids[4]),     # Química
            (4, "14:00", "15:30", "Aula 105", course_ids[2]),  # Historia
            
            # Friday
            (5, "08:00", "09:30", "Aula 102", course_ids[5]),  # Inglés
            (5, "10:00", "12:00", "Aula 201", course_ids[0]),  # Matemáticas
        ]
        
        for schedule_data in schedules:
            cursor.execute("""
                INSERT INTO schedules (day_of_week, start_time, end_time, location, course_id, owner_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (*schedule_data, user_id))
        
        print(f"✅ Created {len(schedules)} demo schedule entries")
        
        # Create demo reminders
        reminders = [
            ("Examen de matemáticas mañana", "No olvides repasar las fórmulas", 
             datetime.now() + timedelta(days=1, hours=18), "task"),
            ("Clase de física en 1 hora", "Laboratorio A", 
             datetime.now() + timedelta(hours=1), "schedule"),
        ]
        
        for reminder_data in reminders:
            cursor.execute("""
                INSERT INTO reminders (title, message, remind_at, reminder_type, owner_id)
                VALUES (?, ?, ?, ?, ?)
            """, (*reminder_data, user_id))
        
        print(f"✅ Created {len(reminders)} demo reminders")
        
        conn.commit()
        print("\n🎉 Demo data generated successfully!")
        print("\nDemo account credentials:")
        print("Email: demo@myplanu.com")
        print("Password: demo123")
        
        # Show statistics
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE owner_id = ?", (user_id,))
        task_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM schedules WHERE owner_id = ?", (user_id,))
        schedule_count = cursor.fetchone()[0]
        
        print(f"\nGenerated data:")
        print(f"- {len(courses)} courses")
        print(f"- {task_count} tasks")
        print(f"- {schedule_count} schedule entries")
        print(f"- {len(reminders)} reminders")
        
    except Exception as e:
        print(f"❌ Error generating demo data: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("MyPlanU Demo Data Generator")
    print("=" * 30)
    generate_demo_data()