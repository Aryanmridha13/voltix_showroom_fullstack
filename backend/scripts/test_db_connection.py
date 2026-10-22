"""
Database Connectivity Verification Script
Safely tests connection to MySQL without exposing credentials.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path)

DB_NAME = os.getenv('DB_NAME', 'ev_showroom_db')
DB_USER = os.getenv('DB_USER', 'ev_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = int(os.getenv('DB_PORT', 3306))

print("=" * 60)
print("EV SHOWROOM DATABASE CONNECTIVITY TEST")
print("=" * 60)
print(f"Target Database : {DB_NAME}")
print(f"Target User     : {DB_USER}")
print(f"Target Host     : {DB_HOST}:{DB_PORT}")
print(f"Password Set    : {'YES (Hidden)' if DB_PASSWORD else 'NO (Empty)'}")
print("-" * 60)

try:
    import MySQLdb

    connection = MySQLdb.connect(
        host=DB_HOST,
        user=DB_USER,
        passwd=DB_PASSWORD,
        db=DB_NAME,
        port=DB_PORT,
        charset='utf8mb4'
    )
    cursor = connection.cursor()
    cursor.execute("SELECT VERSION(), DATABASE(), CURRENT_USER();")
    version, current_db, current_user = cursor.fetchone()

    print("[SUCCESS] Connected successfully to MySQL!")
    print(f"MySQL Version   : {version}")
    print(f"Active Database : {current_db}")
    print(f"Connected As    : {current_user}")
    print("=" * 60)
    connection.close()
    sys.exit(0)

except ImportError:
    print("[ERROR] mysqlclient (MySQLdb) is not installed in the active environment.")
    print("Run: pip install mysqlclient")
    sys.exit(1)

except MySQLdb.OperationalError as e:
    error_code, error_msg = e.args
    print(f"[FAILED] MySQL Operational Error ({error_code}): {error_msg}")
    if error_code == 1045:
        print("-> Cause: Access denied. Check your DB_USER and DB_PASSWORD in backend/.env.")
    elif error_code == 1049:
        print("-> Cause: Database 'ev_showroom_db' does not exist yet. Run setup_database.sql first.")
    elif error_code == 2003:
        print("-> Cause: Cannot connect to MySQL server. Verify that the MySQL service is running.")
    print("=" * 60)
    sys.exit(2)

except Exception as ex:
    print(f"[FAILED] Unexpected Error: {type(ex).__name__} - {ex}")
    print("=" * 60)
    sys.exit(3)
