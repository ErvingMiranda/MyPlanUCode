#!/usr/bin/env python3
"""
Database setup and testing script for MyPlanU
Creates SQLite database and tests basic operations
"""

import sqlite3
import os
from datetime import datetime, time

def create_database():
    """Create the MyPlanU database with all tables"""
    db_path = "myplanu.db"
    
    # Remove existing database
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Removed existing database")
    
    # Connect to database (creates file)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Read and execute schema
        with open('../database/init.sql', 'r') as f:
            schema = f.read()
        
        # Execute each statement
        for statement in schema.split(';'):
            if statement.strip():
                cursor.execute(statement)
        
        conn.commit()
        print("✅ Database created successfully")
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"✅ Created {len(tables)} tables: {[table[0] for table in tables]}")
        
        # Test basic operations
        test_data_operations(cursor)
        conn.commit()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
    finally:
        conn.close()

def test_data_operations(cursor):
    """Test basic CRUD operations"""
    try:
        # Create test user
        cursor.execute("""
            INSERT INTO users (email, name, hashed_password)
            VALUES (?, ?, ?)
        """, ("test@myplanu.com", "Test User", "hashed_password_here"))
        
        user_id = cursor.lastrowid
        print(f"✅ Created test user with ID: {user_id}")
        
        # Create test course
        cursor.execute("""
            INSERT INTO courses (name, code, owner_id)
            VALUES (?, ?, ?)
        """, ("Matemáticas I", "MAT101", user_id))
        
        course_id = cursor.lastrowid
        print(f"✅ Created test course with ID: {course_id}")
        
        # Create test task
        cursor.execute("""
            INSERT INTO tasks (title, description, priority, owner_id, course_id)
            VALUES (?, ?, ?, ?, ?)
        """, ("Estudiar para examen", "Repasar capítulos 1-3", "high", user_id, course_id))
        
        task_id = cursor.lastrowid
        print(f"✅ Created test task with ID: {task_id}")
        
        # Create test schedule
        cursor.execute("""
            INSERT INTO schedules (day_of_week, start_time, end_time, location, owner_id, course_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (1, "08:00", "10:00", "Aula 201", user_id, course_id))
        
        schedule_id = cursor.lastrowid
        print(f"✅ Created test schedule with ID: {schedule_id}")
        
        # Query data
        cursor.execute("""
            SELECT u.name, c.name, t.title, t.priority
            FROM users u
            JOIN courses c ON c.owner_id = u.id
            JOIN tasks t ON t.course_id = c.id
            WHERE u.id = ?
        """, (user_id,))
        
        result = cursor.fetchone()
        if result:
            print(f"✅ Data query successful: {result}")
        
        print("✅ All database operations completed successfully")
        
    except Exception as e:
        print(f"❌ Error in data operations: {e}")

if __name__ == "__main__":
    print("MyPlanU Database Setup")
    print("=" * 25)
    create_database()
    print("\nDatabase setup completed!")
    print("You can now run the backend server with: python main.py")