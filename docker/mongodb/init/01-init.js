// MongoDB initialization script
db = db.getSiblingDB('debridge');

// Create user for the application
db.createUser({
  user: 'debridge_user',
  pwd: 'debridge_password',
  roles: [
    {
      role: 'readWrite',
      db: 'debridge'
    }
  ]
});

print('MongoDB initialization completed');
