from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import sqlite3
import threading
import time
from datetime import datetime, timedelta
import random

def check_unavailable_desks(start_time):
    # Convert start_time to datetime

    
    start_time = datetime.strptime(start_time, "%H")
    unavailable_desks = []

    print(start_time)

    for i in range(1, 100):
        if not is_desk_available(start_time, start_time, i):
            unavailable_desks.append(i)

    return unavailable_desks

# Function to delete expired desk data
def delete_expired_desk_data():
    while True:
        try:
            # Connect to the SQLite database
            connection = sqlite3.connect('db.sqlite3')
            cursor = connection.cursor()

            # Get the current time
            current_time = datetime.now()

            # SQL query to delete rows where end_time is less than the current time
            query = '''
                DELETE FROM desk_data WHERE end_time < ?
            '''

            # Execute the query with the current time
            cursor.execute(query, (current_time,))

            # Commit the changes
            connection.commit()

            # Close the connection
            connection.close()
        except Exception as e:
            print(f"Error deleting expired desk data: {e}")

        # Wait for 10 seconds before checking again
        time.sleep(10)

# Start the background thread
#thread = threading.Thread(target=delete_expired_desk_data)
#thread.daemon = True
#thread.start()




def generate_custom_times():
    times = []
    start_time = datetime.strptime("00:00", "%H:%M")
    for i in range(24 * 6):  # 24 hours * 6 steps per hour (10-minute increments)
        times.append(start_time.strftime("%H.%M"))
        start_time += timedelta(minutes=10)
    return times

def check_unavailable_times(desk_index):
    unavailable_times = []
    times = generate_custom_times()
    for time in times:
        if not is_desk_available(time,time, desk_index):
            unavailable_times.append(time)
    unavailable_times = ["16.10","16.20","16.30","16.40","16.50","17.10"]
    return unavailable_times

def update_desk_data(data):
    """
    Updates the desk_data table with the provided data.

    Args:
        data (dict): JSON payload from the request.

    Returns:
        dict: Response data with the updated information.
    """
    try:
        # Connect to the SQLite database
        connection = sqlite3.connect('db.sqlite3')
        cursor = connection.cursor()

        # SQL query to update the desk_data table
        query = '''
            INSERT INTO desk_data (studentID, start_time, end_time, desk_index)
            VALUES (?, ?, ?, ?)
        '''

        # Execute the query with parameter substitution
        cursor.execute(query, (132,data['startTime'], data['endTime'], data['selectedTable']))
        # SQL query to select all elements from the desk_data table
        select_query = '''
            SELECT * FROM desk_data
        '''

        # Execute the select query
        cursor.execute(select_query)
        rows = cursor.fetchall()

        # Print all elements in the desk_data table
        for row in rows:
            print(row)
        # Commit the changes
        connection.commit()

        # Close the connection
        connection.close()

        return {
            'message': 'Data updated successfully',
            'data': data
        }, 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return {
            'error': 'An error occurred while updating the data'
        }, 500

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            'error': 'An unexpected error occurred'
        }, 500



def is_desk_available(start_time, end_time, desk_index):
    """
    Checks if a desk is available based on the given start and end times.

    Args:
        start_time (str): Start time of the reservation in 'YYYY-MM-DD HH:MM:SS' format.
        end_time (str): End time of the reservation in 'YYYY-MM-DD HH:MM:SS' format.

    Returns:
        bool: True if the desk is available, False otherwise.
    """
    try:
        # Connect to the SQLite database
        connection = sqlite3.connect('db.sqlite3')
        cursor = connection.cursor()

        # SQL query to check for overlapping reservations

        #TODO the condition should be updated
        query = '''
            SELECT EXISTS (
                SELECT 1 FROM desk_data 
                WHERE ((start_time < ? AND end_time > ?) 
                   OR (start_time < ? AND end_time > ?)
                   OR (start_time >= ? AND end_time <= ?)) AND desk_index = ?
            );
        '''
        
        # Execute the query with parameter substitution
        cursor.execute(query, (end_time, start_time, start_time, end_time, start_time, end_time, desk_index))
        
        result = cursor.fetchone()
        
        # Close the connection
        connection.close()

        # If the query returns 1, it means there's an overlap (desk not available)
        return not bool(result[0])

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return False

    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

@csrf_exempt
def handle_request(request):
    """
    Handles POST requests for desk reservation data.

    """
    if request.method == 'POST':
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
            print(data)
            
            if data['type'] == 'table_reservation':
                print(data)
                random_number = random.randint(1, 100)
                print(f"Generated random number: {random_number}")
                if is_desk_available(data['startTime'], data['endTime'], data['selectedTable']):
                    response_data, status_code = update_desk_data(data)
                    return JsonResponse(response_data, status=status_code)
                else:
                    response_data, status_code = {'error': 'Desk not available'}, 400
                    return JsonResponse(response_data, status=status_code)
            elif data['type'] == 'filter_selection':
                response_data, status_code = check_unavailable_desks(data['filterTime']), 200
                return JsonResponse(response_data, status=status_code)
            elif data['type'] == 'check_table_by_index':
                response_data, status_code = check_unavailable_times(data['selectedTable']), 200
                return JsonResponse({"array": response_data}, status=status_code)
            else:
                response_data, status_code = {'error': 'Invalid request type'}, 400
            

        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        
        except Exception as e:
            # Generic error handling
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    elif request.method == 'GET':
        
        return JsonResponse({'array': [5,7,9,13]}, status=200)
    else:
        return JsonResponse({'error': 'Only POST and GET requests are allowed'}, status=405)
    


