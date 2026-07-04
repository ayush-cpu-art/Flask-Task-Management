import pymysql


def get_connection():

    return pymysql.connect(

        host="localhost",
        user="root",
        password="root123",   # Change if you used another password
        database="task_management",

        cursorclass=pymysql.cursors.DictCursor

    )