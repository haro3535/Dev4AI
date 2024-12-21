from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import sqlite3


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

# Utility method to process data
def process_desk_data(data):
    """
    Processes desk reservation data from a POST request.

    Args:
        data (dict): JSON payload from the request.

    Returns:
        dict: Response data with processed information.
    """
    

    # Check if the desk is available
    if not is_desk_available(data.get['start_time'], data.get['end_time']):
        return {
            'error': 'Desk not available for the specified time period'
        }, 400
    

    
    # Update the desk data
    response_data, status_code = update_desk_data(data)
    
    return response_data, status_code


def handle_post_request(request):
    """
    Handles POST requests for desk reservation data.
    """
    if request.method == 'POST':
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body.decode('utf-8'))
            
            # Process the data using the utility method
            response_data, status_code = process_desk_data(data)
            return JsonResponse(response_data, status=status_code)
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        
        except Exception as e:
            # Generic error handling
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
