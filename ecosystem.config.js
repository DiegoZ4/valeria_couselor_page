module.exports = {
  apps: [
    {
      name: 'valeria-counselor',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      cwd: '/sites/valeria/valeria_couselor_page',
      interpreter: '/root/.nvm/versions/node/v22.1.0/bin/node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      }
    }
  ]
};
