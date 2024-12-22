from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import sqlite3
import threading
import time
from datetime import datetime, timedelta

def check_unavailable_desks(start_time):
    unavailable_desks = []

    for i in range(1, 100):
        if not is_desk_available(start_time, start_time):
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
thread = threading.Thread(target=delete_expired_desk_data)
thread.daemon = True
thread.start()


#TODO: add deletion of the data
def delete_desk_data(data):
    """
    Deletes the desk_data table with the provided data.

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
            DELETE FROM desk_data WHERE studentID = ? AND desk_index = ?
        '''

        # Execute the query with parameter substitution
        cursor.execute(query, (data['studentID'], data['desk_index']))

        # Commit the changes
        connection.commit()

        # Close the connection
        connection.close()

        return {
            'message': 'Data deleted successfully',
            'data': data
        }, 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return {
            'error': 'An error occurred while deleting the data'
        }, 500

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            'error': 'An unexpected error occurred'
        }, 500

def generate_hourly_times():
    times = []
    start_time = datetime.strptime("00:00", "%H:%M")
    for hour in range(24):
        times.append(start_time + timedelta(hours=hour))
    return times

def check_unavailable_times(desk_index):
    unavailable_times = []
    times = generate_hourly_times()
    for time in times:
        if not is_desk_available(time, time):
            unavailable_times.append(time)
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
            INSERT INTO desk_data (studentID, isEmpty, start_time, end_time, desk_index)
        '''

        # Execute the query with parameter substitution
        cursor.execute(query, (data['studentID'], data['isEmpty'], data['start_time'], data['end_time'], data['desk_index']))

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



def is_desk_available(start_time, end_time):
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
                WHERE (start_time < ? AND end_time > ?) 
                   OR (start_time < ? AND end_time > ?)
                   OR (start_time >= ? AND end_time <= ?)
            );
        '''
        
        # Execute the query with parameter substitution
        cursor.execute(query, (end_time, start_time, start_time, end_time, start_time, end_time))
        
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
def handle_post_request(request):
    """
    Handles POST requests for desk reservation data.

    """
    if request.method == 'POST':
        return JsonResponse({'message': 'Only POST requests are allowed'}, status=200)
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
            
            if data['type'] == 'table_reservation':
                if is_desk_available(data['start_time'], data['end_time'], data['desk_index']):
                    response_data, status_code = update_desk_data(data)
                    return JsonResponse(response_data, status=status_code)
                else:
                    response_data, status_code = {'error': 'Desk not available'}, 400
                    return JsonResponse(response_data, status=status_code)
            elif data['type'] == 'filter_selection':
                response_data, status_code = check_unavailable_desks(data['start_time']), 200
                return JsonResponse(response_data, status=status_code)
            elif data['type'] == '':
                response_data, status_code = check_unavailable_times(data['desk_index']), 200
                return JsonResponse(response_data, status=status_code)
            else:
                response_data, status_code = {'error': 'Invalid request type'}, 400
            

        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        
        except Exception as e:
            # Generic error handling
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)


