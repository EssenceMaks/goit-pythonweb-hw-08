import psycopg2

DB_NAME = 'contacts_db'
DB_USER = 'postgres'
DB_PASSWORD = '303010'
DB_HOST = 'localhost'

conn = psycopg2.connect(dbname='postgres', user=DB_USER, password=DB_PASSWORD, host=DB_HOST)
conn.autocommit = True
cur = conn.cursor()

try:
    cur.execute(f"CREATE DATABASE {DB_NAME}")
    print(f"Database '{DB_NAME}' created successfully!")
except psycopg2.errors.DuplicateDatabase:
    print(f"Database '{DB_NAME}' already exists.")
finally:
    cur.close()
    conn.close()
