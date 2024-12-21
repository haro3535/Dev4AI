import sqlite3
import os

# Get the absolute path to the database file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'myproject', 'db.sqlite3')

# Connect to SQLite database
connection = sqlite3.connect(db_path)  # Use absolute path
cursor = connection.cursor()

# SQL query to create the desk_data table
create_table_query = '''

CREATE TABLE desk_data (
    desk_index INTEGER NOT NULL PRIMARY KEY,
    studentID INTEGER DEFAULT NULL,
    isEmpty BOOLEAN NOT NULL,
    start_time DATETIME DEFAULT NULL,
    end_time DATETIME DEFAULT NULL
);
'''

drop_table_query = '''DROP TABLE IF EXISTS desk_data;'''

# Execute the query
cursor.execute(drop_table_query)
cursor.execute(create_table_query)

for i in range(1, 101):
    cursor.execute(f"INSERT INTO desk_data (desk_index, isEmpty, start_time, end_time) VALUES ({i}, 1, null, null);")

# Commit changes and close the connection
connection.commit()
connection.close()

print("Table 'desk_data' created successfully.")
