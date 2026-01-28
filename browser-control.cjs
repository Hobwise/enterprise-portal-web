'use strict';

const path = require('path');
const CDPConnection = require('./lib/cdp.cjs');
const SessionManager = require('./lib/sessions.cjs');

/**
 * Browser Control - CDP-based browser automation tool
 * Main entry point with command routing and lazy loading
 */

// Command registry with lazy loading
const COMMANDS = {
  // Screenshots & Visual
  'screenshot': () => require('./cmds/screenshot.cjs'),
  'snap': () => require('./cmds/snap.cjs'),
  'sweep': () => require('./cmds/sweep.cjs'),
  'ai-sweep': () => require('./cmds/ai-sweep.cjs'),

  // Evaluation
  'eval': () => require('./cmds/eval.cjs'),

  // Navigation
  'navigate': () => require('./cmds/navigate.cjs'),
  'refresh': () => require('./cmds/navigate.cjs'),

  // UI Controls
  'ctl': () => require('./cmds/ctl.cjs'),

  // DOM Inspection
  'discover': () => require('./cmds/discover.cjs'),
  'inspect': () => require('./cmds/inspect.cjs'),
  'chain': () => require('./cmds/chain.cjs'),
  'align': () => require('./cmds/align.cjs'),
  'measure': () => require('./cmds/measure.cjs'),
  'snapshot': () => require('./cmds/snapshot.cjs'),
  'diff': () => require('./cmds/diff.cjs'),

  // Mouse & Input
  'mouse': () => require('./cmds/mouse.cjs'),
  'el': () => require('./cmds/el.cjs'),

  // Recording
  'record': () => require('./cmds/record.cjs'),

  // Debugging
  'logs': () => require('./cmds/logs.cjs'),
  'timeline': () => require('./cmds/timeline.cjs'),
  'perf': () => require('./cmds/perf.cjs'),

  // Session & Tabs
  'session': () => require('./cmds/session.cjs'),
  'tab': () => require('./cmds/tab.cjs'),

  // Browser Management
  'browser': () => require('./cmds/browser.cjs'),
};

/**
 * Parse command line arguments
 */
function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    session: null,
    port: 9222,
    json: true,
    help: false
  };
  const positionals = [];

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--session' || arg === '-s') {
      options.session = args[++i];
    } else if (arg === '--port' || arg === '-p') {
      options.port = parseInt(args[++i], 10);
    } else if (arg === '--no-json') {
      options.json = false;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--')) {
      // Unknown option, skip
    } else {
      positionals.push(arg);
    }
    i++;
  }

  return { options, positionals };
}

/**
 * Output result as JSON
 */
function output(data, json = true) {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    if (data.success) {
      console.log(data.data || 'OK');
    } else {
      console.error('Error:', data.error?.message || 'Unknown error');
    }
  }
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Browser Control Tool - CDP-based browser automation

Usage: ./b <command> [args...]

Commands:
  browser launch|close          Browser management
  session init|list|info|eval   Session management
  tab list|switch|new|close     Tab management
  navigate <url>                Navigate to URL
  refresh                       Reload page
  screenshot [selector|full]    Capture screenshot
  snap [name]                   Quick timestamped screenshot
  sweep [breakpoints]           Screenshot across breakpoints
  ai-sweep                      AI-assisted visual analysis
  eval <expression>             Execute JavaScript
  ctl list|button|select|slider|batch  UI control manipulation
  discover <selector|text>      Find elements
  inspect <selector>            Get element details
  chain <query>                 Chain element queries
  snapshot                      Take DOM snapshot
  diff                          Compare DOM states
  align <sel1> <sel2>           Check alignment
  measure <sel1> <sel2>         Measure distance
  mouse click|move <x> <y>      Mouse operations
  el click|realclick|clicktext|center  Element interactions
  record start|stop|gif         Screen recording
  logs start|show               Console log capture
  timeline start                Performance timeline
  perf                          Performance metrics

Options:
  --session, -s <id>    Specify session ID
  --port, -p <port>     Chrome debugging port (default: 9222)
  --no-json             Output plain text instead of JSON
  --help, -h            Show this help message

Environment:
  BROWSER_SESSION_ID    Session ID override
  CDP_PORT              Chrome debugging port
`);
}

/**
 * Main entry point
 */
async function main() {
  const { options, positionals } = parseArgs(process.argv);

  // Handle help
  if (options.help || positionals.length === 0) {
    printHelp();
    process.exit(0);
  }

  // Get port from env if set
  const port = process.env.CDP_PORT ? parseInt(process.env.CDP_PORT, 10) : options.port;

  // Initialize connections
  const cdp = new CDPConnection(port);
  const sessions = new SessionManager();

  // Extract command and args
  const [command, ...cmdArgs] = positionals;

  // Check if command exists
  const loader = COMMANDS[command];
  if (!loader) {
    output({
      success: false,
      command,
      error: {
        code: 'UNKNOWN_COMMAND',
        message: `Unknown command: ${command}`,
        suggestions: [
          'Run "./b --help" to see available commands',
          `Did you mean: ${findSimilarCommand(command)}?`
        ].filter(Boolean)
      }
    }, options.json);
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    // Load and execute command
    const module = loader();
    const handler = typeof module === 'function' ? module : module.execute;

    const result = await handler({
      cdp,
      sessions,
      args: cmdArgs,
      options,
      command
    });

    const duration = Date.now() - startTime;

    output({
      success: true,
      command,
      timestamp: new Date().toISOString(),
      sessionId: options.session,
      data: result.data || result,
      meta: {
        duration,
        ...result.meta
      }
    }, options.json);

    // Log successful execution
    sessions.log(`${command} ${cmdArgs.join(' ')} -> OK (${duration}ms)`);

  } catch (err) {
    const duration = Date.now() - startTime;

    output({
      success: false,
      command,
      timestamp: new Date().toISOString(),
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        stack: process.env.DEBUG ? err.stack : undefined
      },
      meta: { duration }
    }, options.json);

    // Log error
    sessions.log(`${command} ${cmdArgs.join(' ')} -> ERROR: ${err.message}`);

    process.exit(1);

  } finally {
    await cdp.close();
  }
}

/**
 * Find similar command for suggestions
 */
function findSimilarCommand(input) {
  const commands = Object.keys(COMMANDS);
  const lower = input.toLowerCase();

  // Exact prefix match
  const prefixMatch = commands.find(c => c.startsWith(lower));
  if (prefixMatch) return prefixMatch;

  // Levenshtein distance for typos
  let best = null;
  let bestDist = Infinity;

  for (const cmd of commands) {
    const dist = levenshtein(lower, cmd);
    if (dist < bestDist && dist <= 3) {
      bestDist = dist;
      best = cmd;
    }
  }

  return best;
}

/**
 * Simple Levenshtein distance
 */
function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Run
main().catch(err => {
  console.error(JSON.stringify({
    success: false,
    error: {
      code: 'FATAL',
      message: err.message
    }
  }, null, 2));
  process.exit(1);
});
