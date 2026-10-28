/** End-to-end trash integration test against disposable SQLite and media files. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'.tmp-trash-integration');
try{
 const Sqlite=require('better-sqlite3');new Sqlite(':memory:').close();
}catch(error){
 if(/NODE_MODULE_VERSION|compiled against a different Node\.js version/.test(String(error.message))&&!process.env.DB_TEST_IN_ELECTRON){
  const child=spawnSync(require('electron'),[fileURLToPath(import.meta.url)],{stdio:'inherit',env:{...process.env,ELECTRON_RUN_AS_NODE:'1',DB_TEST_IN_ELECTRON:'1'}});
  process.exit(child.status??1);
 }
 throw error;
}
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
try{
 const {build}=await import('esbuild');
 const out=path.join(dir,'trash-test.mjs');
 await build({stdin:{contents:`
  export {CreateDefaultDb,getDb,closeDb} from './src/main/data/db.ts';
  export {initDrizzle,closeDrizzle} from './src/main/data/drizzle/drizzleDb.ts';
  export {runDatabaseMigrations} from './src/main/data/migrations/migrationRunner.ts';
  export {moveToTrash,listTrash,restoreTrash,purgeTrash,restoreTrashBatch,purgeTrashBatch,retryPendingMediaDeletes} from './src/main/data/trash.ts';
 `,resolveDir:root,loader:'ts'},outfile:out,bundle:true,platform:'node',format:'esm',target:'node18',packages:'external',logLevel:'error'});
 const api=await import(pathToFileURL(out).href);
 try{
  api.CreateDefaultDb(path.join(dir,'data_carArchiver.sqlite'));
  api.initDrizzle();
  await api.runDatabaseMigrations();
  const db=api.getDb();
  assert.equal(db.pragma('foreign_keys',{simple:true}),1);
  const count=t=>db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
  const customer=id=>db.prepare('INSERT INTO Customers (customerId,firstName,lastName) VALUES (?,?,?)').run(id,`Customer${id}`,'Demo');
  const car=(id,cid)=>db.prepare('INSERT INTO Cars (carId,customerId,plateNumber) VALUES (?,?,?)').run(id,cid,`34 TEST ${id}`);
  const service=(id,cid,vid)=>db.prepare('INSERT INTO Services (serviceId,customerId,carId,hasDamageOnReceive) VALUES (?,?,?,0)').run(id,cid,vid);
  const part=(id,vid,sid)=>db.prepare("INSERT INTO Parts (partId,carId,serviceId,partName,quantity,unitPriceKurus) VALUES (?,?,?,'Filter',2,1250)").run(id,vid,sid);
  const photo=(id,sid)=>{
   const relative=`services/${sid}/${randomUUID()}.jpg`;
   const file=path.join(dir,'media',...relative.split('/'));
   fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from([0xff,0xd8,0xff,0x01]));
   db.prepare("INSERT INTO ServiceMedia (mediaId,serviceId,relativePath,originalName,mimeType,bytes) VALUES (?,?,?,'photo.jpg','image/jpeg',4)").run(id,sid,relative);
   return {relative,file};
  };
  const last=()=>api.listTrash()[0].trashId;
  // Standalone photo: keep physical bytes, restore metadata, then permanently purge file.
  customer(1001);car(1001,1001);service(1001,1001,1001);part(1001,1001,1001);
  const p1=photo(1001,1001);
  api.moveToTrash('photo',[1001]);
  assert.equal(count('ServiceMedia'),0);assert.equal(fs.existsSync(p1.file),true);
  api.restoreTrash(last());assert.equal(count('ServiceMedia'),1);
  api.moveToTrash('photo',[1001]);api.purgeTrash(last());
  assert.equal(fs.existsSync(p1.file),false);assert.equal(count('TrashItems'),0);
  // Service cascade: parts, metadata, physical bytes all restored atomically.
  const p2=photo(1002,1001);
  api.moveToTrash('service',[1001]);
  assert.equal(count('Services'),0);assert.equal(count('Parts'),0);assert.equal(count('ServiceMedia'),0);
  assert.equal(fs.existsSync(p2.file),true);
  api.restoreTrash(last());
  assert.equal(count('Services'),1);assert.equal(count('Parts'),1);assert.equal(count('ServiceMedia'),1);
  // Car deletion automatically snapshots services even when old UI flag is false.
  api.moveToTrash('car',[1001],false);
  assert.equal(count('Cars'),0);assert.equal(count('Services'),0);
  api.restoreTrash(last());assert.equal(count('Cars'),1);assert.equal(count('Services'),1);
  // Customer without related: cars/services remain, FK set null and restored.
  db.prepare("INSERT INTO Emails (customerId,customerEmail) VALUES (?,'test@sample.invalid')").run(1001);
  db.prepare("INSERT INTO PhoneNumbers (customerId,countryCode,phoneNumber) VALUES (?,'+90','5551234')").run(1001);
  api.moveToTrash('customer',[1001],false);
  assert.equal(count('Customers'),0);assert.equal(db.prepare('SELECT customerId FROM Cars WHERE carId=1001').get().customerId,null);
  api.restoreTrash(last());
  assert.equal(count('Customers'),1);assert.equal(db.prepare('SELECT customerId FROM Cars WHERE carId=1001').get().customerId,1001);
  assert.equal(db.prepare('SELECT customerId FROM Services WHERE serviceId=1001').get().customerId,1001);
  assert.equal(count('Emails'),1);assert.equal(count('PhoneNumbers'),1);
  // Missing linked vehicle blocks customer restoration without partial writes.
  customer(2001);car(2001,2001);
  api.moveToTrash('customer',[2001],false);
  db.prepare('DELETE FROM Cars WHERE carId=2001').run();
  assert.throws(()=>api.restoreTrash(last()),/previously linked vehicle no longer exists/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Customers WHERE customerId=2001').get().n,0);
  assert.equal(count('TrashItems'),1);
  car(2001,null);
  api.restoreTrash(last());
  assert.equal(db.prepare('SELECT customerId FROM Cars WHERE carId=2001').get().customerId,2001);
  // Cleanup the independent 2001 fixture before asserting entire-table counts for customer 1001.
  db.prepare('DELETE FROM Cars WHERE carId=?').run(2001);
  db.prepare('DELETE FROM Customers WHERE customerId=?').run(2001);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Customers WHERE customerId=2001').get().n,0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Cars WHERE carId=2001').get().n,0);
  // Customer related true: delete entire graph and recover all IDs/files.
  api.moveToTrash('customer',[1001],true);
  for(const t of ['Customers','Cars','Services','Parts','ServiceMedia','Emails','PhoneNumbers'])assert.equal(count(t),0,`failed delete ${t}`);
  assert.equal(fs.existsSync(p2.file),true);
  api.restoreTrash(last());
  for(const t of ['Customers','Cars','Services','Parts','ServiceMedia','Emails','PhoneNumbers'])assert.equal(count(t),1,`failed restore ${t}`);
  // Late failure must roll back deletion AND trash creation.
  db.exec("CREATE TRIGGER deny_service_delete BEFORE DELETE ON Services BEGIN SELECT RAISE(ABORT,'TEST ROLLBACK'); END;");
  assert.throws(()=>api.moveToTrash('car',[1001],true),/TEST ROLLBACK/);
  assert.equal(count('Cars'),1);assert.equal(count('Services'),1);assert.equal(count('TrashItems'),0);
  db.exec('DROP TRIGGER deny_service_delete');
  // Restore must not overwrite conflicting IDs.
  api.moveToTrash('service',[1001]);
  service(1001,1001,1001);
  assert.throws(()=>api.restoreTrash(last()),/same ID/);
  assert.equal(count('TrashItems'),1);assert.equal(count('Services'),1);
  db.prepare('DELETE FROM Services WHERE serviceId=1001').run();
  api.restoreTrash(last());assert.equal(count('Services'),1);
  // Batch atomicity: one conflicting entry rolls back earlier successful restores.
  customer(3001);customer(3002);
  api.moveToTrash('customer',[3001]);const firstBatch=last();
  api.moveToTrash('customer',[3002]);const secondBatch=last();
  customer(3002); // Force collision on second restore.
  assert.throws(()=>api.restoreTrashBatch([firstBatch,secondBatch]),/same ID/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Customers WHERE customerId=3001').get().n,0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM TrashItems WHERE trashId IN (?,?)').get(firstBatch,secondBatch).n,2);
  db.prepare('DELETE FROM Customers WHERE customerId=3002').run();
  api.restoreTrashBatch([firstBatch,secondBatch]);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM Customers WHERE customerId IN (3001,3002)').get().n,2);
  api.moveToTrash('customer',[3001]);const purgeA=last();
  api.moveToTrash('customer',[3002]);const purgeB=last();
  assert.throws(()=>api.purgeTrashBatch([purgeA,999999]),/not found/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM TrashItems WHERE trashId IN (?,?)').get(purgeA,purgeB).n,2);
  api.purgeTrashBatch([purgeA,purgeB]);
  assert.equal(count('TrashItems'),0);
  // Failed disk unlink must leave a durable retry job, without rolling back purge.
  const pendingPhoto=photo(7001,1001);
  api.moveToTrash('photo',[7001]);
  fs.rmSync(pendingPhoto.file);fs.mkdirSync(pendingPhoto.file); // rmSync(file) now fails with EISDIR
  api.purgeTrash(last());
  assert.equal(count('TrashItems'),0);
  assert.equal(count('PendingMediaDeletes'),1);
  const attempts=db.prepare('SELECT attempts FROM PendingMediaDeletes').get().attempts;
  assert.ok(attempts>=1);
  fs.rmdirSync(pendingPhoto.file);
  fs.writeFileSync(pendingPhoto.file,Buffer.from([1,2,3]));
  const retry=api.retryPendingMediaDeletes();
  assert.equal(retry.pending,0);assert.equal(fs.existsSync(pendingPhoto.file),false);
  assert.equal(db.pragma('foreign_key_check').length,0);
  console.log('Trash integration passed: photo restore/purge, service + parts + media, vehicle cascade, customer relink/cascade, rollback, ID conflict, deferred cleanup retry.');
 }finally{api.closeDrizzle();api.closeDb();}
}finally{fs.rmSync(dir,{recursive:true,force:true});}
