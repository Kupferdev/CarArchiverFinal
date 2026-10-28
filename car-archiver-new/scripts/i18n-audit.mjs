/** Strict check for translation-key parity and interpolation tokens.
 * Also reports user-visible Turkish literals that still need an i18n refactor.
 * Runs without npm install if the global TypeScript compiler is available.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
let ts;
try{ts=require('typescript')}catch{
  try{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}catch{
    console.error('Install TypeScript before running this audit.');process.exit(2);
  }
}
const root=process.cwd();
function parse(file){return ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS)}
function findObject(node,name,src){let found;function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(src)===name)found=n.initializer;ts.forEachChild(n,visit)}visit(node);return found}
function properties(o){const res={};if(!o||!ts.isObjectLiteralExpression(o))return res;for(const p of o.properties){if(ts.isPropertyAssignment(p)){const key=p.name.getText().replace(/^['"]|['"]$/g,'');const x=p.initializer;res[key]=ts.isStringLiteral(x)||ts.isNoSubstitutionTemplateLiteral(x)?x.text:x.getText()}}return res}
function array(name,file){const src=parse(file),decl=findObject(src,name,src);const result={};if(!decl||!ts.isArrayLiteralExpression(decl))throw Error(`${name} not found`);for(const e of decl.elements){const obj=properties(e);result[obj.languageCode]=obj}return result}
function locales(name,file){const src=parse(file),obj=findObject(src,name,src);if(!obj||!ts.isObjectLiteralExpression(obj))throw Error(`${name} not found`);const result={};for(const p of obj.properties){if(ts.isPropertyAssignment(p)){const code=p.name.getText(src).replace(/^['"]|['"]$/g,'');result[code]=properties(p.initializer)}}return result}
const dir=path.join(root,'src/i18n');
const dashboard=array('DashboardInfoTexts',path.join(dir,'dashboardTexts.ts'));
const packs=[dashboard,locales('ExtendedDashboardTexts',path.join(dir,'extendedDashboardTexts.ts')),locales('CustomerTexts',path.join(dir,'customerTexts.ts')),locales('DialogTexts',path.join(dir,'dialogTexts.ts')),locales('CommonTexts',path.join(dir,'commonTexts.ts')),locales('SettingsTexts',path.join(dir,'settingsTexts.ts')),locales('DetailTexts',path.join(dir,'detailTexts.ts')),locales('PrintTexts',path.join(dir,'printTexts.ts')),locales('FeatureTexts',path.join(dir,'featureTexts.ts')),locales('V34Texts',path.join(dir,'v34Texts.ts')),locales('V35Texts',path.join(dir,'v35Texts.ts'))];
const codes=Object.keys(dashboard), merged={};for(const c of codes)merged[c]=Object.assign({},...packs.map(p=>p[c]||{}));
const source=merged.en;const keys=Object.keys(source).filter(k=>!['id','languageCode'].includes(k));
let missing=0,mismatch=0;
for(const c of codes){const absent=keys.filter(k=>!(k in merged[c]));missing+=absent.length;const invalid=keys.filter(k=>{if(!(k in merged[c]))return false;const vars=s=>[...s.matchAll(/{{\s*([\w.-]+)\s*}}/g)].map(m=>m[1]).sort().join(',');return vars(source[k])!==vars(merged[c][k])});mismatch+=invalid.length;console.log(`${c.padEnd(2)} ${String(keys.length-absent.length).padStart(3)}/${keys.length} keys, missing ${absent.length}, interpolation errors ${invalid.length}`);if(absent.length)console.log('  missing:',absent.slice(0,15).join(', '));if(invalid.length)console.log('  interpolation:',invalid.slice(0,15).join(', '));}
const offenders=[];const unboundKeys=new Set();let inspected=0;function scan(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){scan(p);continue}if(!e.name.endsWith('.tsx')&&!e.name.endsWith('.ts'))continue;inspected++;const raw=fs.readFileSync(p,'utf8');for(const match of raw.matchAll(/\bt\(\s*['\"]([^'\"]+)['\"]/g)){if(!Object.prototype.hasOwnProperty.call(source,match[1]))unboundKeys.add(match[1]);}const src=parse(p);function visit(n){if(ts.isJsxText(n)&&/[çğıöşüÇĞİÖŞÜ]/.test(n.text.trim())){const st=n.getStart(src),pos=src.getLineAndCharacterOfPosition(st);offenders.push(`${path.relative(root,p)}:${pos.line+1}: ${n.text.trim().replace(/\s+/g,' ').slice(0,80)}`)}else if(ts.isJsxAttribute(n)&&n.initializer&&ts.isStringLiteral(n.initializer)&&/[çğıöşüÇĞİÖŞÜ]/.test(n.initializer.text)){const st=n.getStart(src),pos=src.getLineAndCharacterOfPosition(st);offenders.push(`${path.relative(root,p)}:${pos.line+1}: ${n.name.text}=${n.initializer.text.slice(0,72)}`)}ts.forEachChild(n,visit)}visit(src)}}scan(path.join(root,'src'));
console.log(`\nMissing localized keys: ${missing}; interpolation mismatches: ${mismatch}`);
console.log(`Missing keys referenced by t(): ${unboundKeys.size}`);if(unboundKeys.size)console.log([...unboundKeys].sort().join(', '));
console.log(`Remaining literal Turkish JSX text/attribute occurrences: ${offenders.length} across ${inspected} source files`);
console.log(offenders.slice(0,65).join('\n'));
if(process.argv.includes('--strict')&&(missing||mismatch||unboundKeys.size))process.exitCode=1;
if(process.argv.includes('--strict-literals')&&offenders.length)process.exitCode=1;
