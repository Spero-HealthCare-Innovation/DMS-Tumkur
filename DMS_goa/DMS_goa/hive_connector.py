from pyhive import hive


def get_hive_connection():
    conn = hive.Connection(
        host='210.212.165.124',  
        port=10000,              
        username='admin',       
        database='reports'
        # database='processed_dms'
        # database = 'raw_dms'      
    )
    return conn


def hive_connecter_execution(query):
    conn = get_hive_connection()
    cursor = conn.cursor()
    cursor.execute(query)
    columns = [col[0].split('.')[-1] for col in cursor.description]
    result = [dict(zip(columns, row)) for row in cursor.fetchall()]
    

    cursor.close()
    conn.close()
    return result

