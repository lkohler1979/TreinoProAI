module.exports = {
  apps: [
    {
      name: "treino-api",
      cwd: "/var/www/treino/backend",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "treino-frontend",
      cwd: "/var/www/treino/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
