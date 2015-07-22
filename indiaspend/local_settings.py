
DEBUG = True

# Make these unique, and don't share it with anybody.
SECRET_KEY = "8043ab5c-68b7-4629-9201-0c2223b1e8f89e9fefec-6615-4ba6-b03a-34c95e55a477b2d3f34b-229d-4520-84ba-55bf3248663e"
NEVERCACHE_KEY = "067e4cdc-4f33-44a8-a568-44ad37e173248777b3f7-b355-467b-909f-e66a31a10f22f8e99e61-6596-41a0-93ba-a0ae84751b7c"

DATABASES = {
    "default": {
        # Ends with "postgresql_psycopg2", "mysql", "sqlite3" or "oracle".
        "ENGINE": "django_mongodb_engine",  #"django.db.backends.sqlite3",
        # DB name or path to database file if using sqlite3.
        "NAME": "indiaspend",
        # Not used with sqlite3.
        "USER": "",
        # Not used with sqlite3.
        "PASSWORD": "",
        # Set to empty string for localhost. Not used with sqlite3.
        "HOST": "",
        # Set to empty string for default. Not used with sqlite3.
        "PORT": "",
    }
}
