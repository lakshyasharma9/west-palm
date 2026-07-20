module.exports = {
  apps: [
    {
      name: 'wpcs-backend',
      script: './Backend/server.js',
      cwd: '/home/ubuntu/west-palm',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      error_file: '/home/ubuntu/logs/backend-error.log',
      out_file: '/home/ubuntu/logs/backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'wpcs-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/home/ubuntu/west-palm/Frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      error_file: '/home/ubuntu/logs/frontend-error.log',
      out_file: '/home/ubuntu/logs/frontend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'wpcs-admin',
      script: 'node-server.mjs',
      cwd: '/home/ubuntu/west-palm/wpcs-admin-panel',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      error_file: '/home/ubuntu/logs/admin-error.log',
      out_file: '/home/ubuntu/logs/admin-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
