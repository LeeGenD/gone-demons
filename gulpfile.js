var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./_gulp_tasks', { recurse: true });