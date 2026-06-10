import sqlite3

def get_db_connection():
    """Establishes an instant local pipeline to our embedded database file."""
    conn = sqlite3.connect("project.db")
    # This setting enables column-name lookup support for our queries
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    """Builds the local tracking tables inside project.db."""
    print("🚀 Initializing local embedded database asset...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("🧹 Dropping old table definitions...")
    cursor.execute("DROP TABLE IF EXISTS transactions;")
    
    print("🏗️ Designing local 'transactions' auditing data table...")
    create_table_query = """
    CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        location TEXT,
        merchant_category TEXT,
        device_type TEXT,
        risk_score REAL NOT NULL,
        is_anomaly INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """
    cursor.execute(create_table_query)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("✨ Success: Local SQLite database engine is armed and ready!")

if __name__ == "__main__":
    initialize_database()