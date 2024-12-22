import sqlite3
import os

# Get the absolute path to the database file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'myproject', 'db.sqlite3')

# Connect to SQLite database
connection = sqlite3.connect(db_path)  # Use absolute path
cursor = connection.cursor()

# Drop the table if it exists
cursor.execute('''DROP TABLE IF EXISTS desk_data;''')

# Create the desk_data table
cursor.execute('''
    CREATE TABLE desk_data (
        desk_index INTEGER NOT NULL PRIMARY KEY,
        studentID INTEGER DEFAULT NULL,
        start_time DATETIME DEFAULT NULL,
        end_time DATETIME DEFAULT NULL
    );
''')

# Insert 100 rows into desk_data
insert_query = '''
    INSERT INTO desk_data (desk_index, start_time, end_time) 
    VALUES (?, ?, ?);
'''

# Insert values into the table
for i in range(1, 101):
    cursor.execute(insert_query, (i, None, None))

# Commit changes and close the connection
connection.commit()
connection.close()

print("Table 'desk_data' created and populated successfully.")
