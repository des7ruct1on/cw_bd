import os
import subprocess
from typing import Dict

class BackupService:
    def __init__(self, config: Dict):
        self.__POSTGRES_USER = 'admin'
        self.__POSTGRES_PASSWORD = 'admin'
        self.__POSTGRES_CONTAINER = 'db'
        self.__DATABASE_NAME = 'ultragedy'
        self.__BACKUP_DIR = './backups'

    def __create_backup_dir(self):
        os.makedirs(self.__BACKUP_DIR, exist_ok=True)
    
    def __get_backup_path(self, backup_name: str, extension_needed: bool = False):
        return f"{self.__BACKUP_DIR}/{backup_name}" + extension_needed * '.sql'
    
    def __get_create_command(self, backup_path: str):
        os.environ['PGPASSWORD'] = self.__POSTGRES_PASSWORD
        return [
            "pg_dump",
            "-h", self.__POSTGRES_CONTAINER,
            "-U", self.__POSTGRES_USER,
            "-F", "c", "-f", backup_path,
            self.__DATABASE_NAME
        ]
    
    def __get_restore_command(self, backup_path: str):
        os.environ['PGPASSWORD'] = self.__POSTGRES_PASSWORD
        return [
            "pg_restore",
            "--clean",
            "-h", self.__POSTGRES_CONTAINER,
            "-U", self.__POSTGRES_USER,
            "-d", self.__DATABASE_NAME,
            "-F", "c", backup_path
        ]
    
    def create_backup(self, backup_name: str):
        try:
            self.__create_backup_dir()
            backup_path = self.__get_backup_path(backup_name, True)
            if os.path.exists(backup_path):
                raise ValueError("Backup with this name already exists.")
            command = self.__get_create_command(backup_path)
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError:
            raise RuntimeError("An unexpected error occurred.")
    
    def delete_backup(self, backup_name: str):
        backup_path = self.__get_backup_path(backup_name)
        if not os.path.exists(backup_path):
            raise FileNotFoundError(f"Backup file {backup_name} does not exist.")
        os.remove(backup_path)
    
    def restore_backup(self, backup_name: str):
        try:
            backup_path = self.__get_backup_path(backup_name)
            if not os.path.exists(backup_path):
                raise FileNotFoundError(f"Backup file {backup_name} does not exist.")
            command = self.__get_restore_command(backup_path)
            subprocess.run(command, check=True)
        except FileNotFoundError as e:
            raise e
        except subprocess.CalledProcessError:
            raise RuntimeError("An error occurred while restoring the backup.")
    
    def get_all_backups(self):
        self.__create_backup_dir()

        backups = os.listdir(self.__BACKUP_DIR)
        backups = [file for file in backups if file.endswith(".sql")]

        return backups
