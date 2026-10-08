// dist/servidor.cjs
// Bridge for CommonJS execution
import('../server.js').catch(err => {
  console.error('Failed to load server.js:', err);
  process.exit(1);
});
