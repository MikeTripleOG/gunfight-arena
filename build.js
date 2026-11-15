const fs = require('fs');
let three = fs.readFileSync(__dirname + '/three.min.js', 'utf8');
three = three.replace(/^console\.warn\([^\n]*?\),/, 'void 0,');
const game = fs.readFileSync(__dirname + '/src/game.js', 'utf8');
let html = fs.readFileSync(__dirname + '/src/template.html', 'utf8');
if (/<\/script/i.test(three + game)) throw new Error('script tag in source');
html = html.replace('<!--THREE-->', () => '<script>/* three.js r159 (MIT) */\n' + three + '\n</script>');
html = html.replace('/*GAME*/', () => game);
fs.writeFileSync(__dirname + '/index.html', html);
// syntax check every inline script
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((s, i) => fs.writeFileSync(`/tmp/gfa_script${i}.js`, s));
console.log('built', html.length, 'bytes,', scripts.length, 'scripts');
