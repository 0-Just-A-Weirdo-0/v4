import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import wisp from "wisp-server-node";
import request from '@cypress/request';
import chalk from 'chalk';
import packageJson from './package.json' assert { type: 'json' };

const __dirname = path.resolve();
const server = http.createServer();
const app = express(server);
const version = packageJson.version;
const discord = 'https://discord.gg/unblocking';

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, './static/index.html'));
});
app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, './static/loader.html'));
});
app.get('/apps', (req, res) => {
  res.sendFile(path.join(__dirname, './static/apps.html'));
});
app.get('/gms', (req, res) => {
  res.sendFile(path.join(__dirname, './static/gms.html'));
});
app.get('/lessons', (req, res) => {
  res.sendFile(path.join(__dirname, './static/agloader.html'));
});
app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, './static/info.html'));
});
app.get('/edu', (req, res) => {
  res.sendFile(path.join(__dirname, './static/loading.html'));
});
app.get('/worker.js', (req, res) => {
  request('https://cdn.surfdoge.pro/worker.js', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.setHeader('Content-Type', 'text/javascript');
      res.send(body);
    } else {
      res.status(500).send('Error fetching worker script');
    }
  });
});

app.use((req, res) => {
  res.statusCode = 404;
  res.sendFile(path.join(__dirname, './static/404.html'));
});

server.on("request", (req, res) => {
  app(req, res);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else socket.end();
});

server.on('listening', () => {
  console.log(chalk.bgBlue.white.bold(`  Welcome to Doge V4, user!  `) + '\n');
  console.log(chalk.cyan('-----------------------------------------------'));
  console.log(chalk.green('  🌟 Status: ') + chalk.bold('Active'));
  console.log(chalk.green('  🌍 Port: ') + chalk.bold(chalk.yellow(server.address().port)));
  console.log(chalk.green('  🕒 Time: ') + chalk.bold(new Date().toLocaleTimeString()));
  console.log(chalk.cyan('-----------------------------------------------'));
  console.log(chalk.magenta('📦 Version: ') + chalk.bold(version));
  console.log(chalk.magenta('🔗 URL: ') + chalk.underline('http://localhost:' + server.address().port));
  console.log(chalk.cyan('-----------------------------------------------'));
  console.log(chalk.blue('💬 Discord: ') + chalk.underline(discord));
  console.log(chalk.cyan('-----------------------------------------------'));
});

function shutdown(signal) {
  console.log(chalk.bgRed.white.bold(`  Shutting Down (Signal: ${signal})  `) + '\n');
  console.log(chalk.red('-----------------------------------------------'));
  console.log(chalk.yellow('  🛑 Status: ') + chalk.bold('Shutting Down'));
  console.log(chalk.yellow('  🕒 Time: ') + chalk.bold(new Date().toLocaleTimeString()));
  console.log(chalk.red('-----------------------------------------------'));
  console.log(chalk.blue('  Performing graceful exit...'));
  server.close(() => {
    console.log(chalk.blue('  Doge has been closed.'));
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.listen({
  port: 8001,
});
