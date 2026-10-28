/** Reversible delete for customer, car, service, and service-media records.
 * All database state transitions are atomic on the existing SQLite connection.
 * Media files remain on disk until the relevant Trash entry is purged.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getDb, getActiveDbPath } from './db';
import { ensureNoBackupInProgress } from './dataBackup';
import { resolveManagedMediaFile } from './managedMediaPath';
import type Database from 'better-sqlite3';

export type TrashKind = 'customer' | 'car' | 'service' | 'photo';
type TableName = 'Customers'|'Cars'|'Services'|'Parts'|'ServiceMedia'|'PhoneNumbers'|'Emails';
type Row = Record<string, unknown>;
type Snapshot = { rows: Partial<Record<TableName,Row[]>>; links?: { cars:{id:number;customerId:number}[]; services:{id:number;customerId:number}[] } };
export type TrashItem = {trashId:number;entityType:TrashKind;label:string;deletedAt:string;count:number};
const INSERT_ORDER: TableName[] = ['Customers','Cars','Services','PhoneNumbers','Emails','Parts','ServiceMedia'];
const PK: Record<TableName,string> = {Customers:'customerId',Cars:'carId',Services:'serviceId',Parts:'partId',ServiceMedia:'mediaId',PhoneNumbers:'phoneNumberId',Emails:'emailId'};
const TABLES = new Set<string>(INSERT_ORDER);

function idsValid(ids:number[]):void {
  if(!Array.isArray(ids)||ids.length===0||ids.length>500||new Set(ids).size!==ids.length||ids.some(id=>!Number.isSafeInteger(id)||id<=0))
    throw new Error('Invalid record selection.');
}
function rows(db:Database.Database,table:TableName,field:string,ids:number[]):Row[]{
  if(!ids.length)return [];
  if(!TABLES.has(table)||!Object.values(PK).includes(field)&&!['customerId','carId','serviceId'].includes(field))throw new Error('Invalid database column.');
  return db.prepare(`SELECT * FROM ${table} WHERE ${field} IN (${ids.map(()=>'?').join(',')})`).all(...ids) as Row[];
}
function idList(items:Row[],pk:string):number[]{return items.map(x=>Number(x[pk]));}
function combine(a:number[],b:number[]):number[]{return [...new Set([...a,...b])];}
function collectServices(db:Database.Database,s:Snapshot,serviceIds:number[]):void{
  const services=rows(db,'Services','serviceId',serviceIds);
  const ids=idList(services,'serviceId');
  s.rows.Services=services;
  s.rows.Parts=rows(db,'Parts','serviceId',ids);
  s.rows.ServiceMedia=rows(db,'ServiceMedia','serviceId',ids);
}
function addTrash(db:Database.Database,kind:TrashKind,label:string,snapshot:Snapshot):void{
  db.prepare('INSERT INTO TrashItems (entityType,label,snapshot) VALUES (?,?,?)').run(kind,label.slice(0,220),JSON.stringify(snapshot));
}
function assertPresent(actual:Row[],ids:number[]):void{
  if(actual.length!==ids.length)throw new Error('One or more selected records no longer exist. No records were deleted.');
}
function deleteByIds(db:Database.Database,table:TableName,pk:string,ids:number[]):void {
  if(!ids.length)return;
  db.prepare(`DELETE FROM ${table} WHERE ${pk} IN (${ids.map(()=>'?').join(',')})`).run(...ids);
}
/** Replaces destructive IPC deletes; snapshots and delete happen in ONE transaction. */
export function moveToTrash(kind:TrashKind,selection:number[],deleteRelated=false):void {
  ensureNoBackupInProgress();
  idsValid(selection);
  const db=getDb();
  db.transaction(()=>{
    const snapshot:Snapshot={rows:{}};
    let label='';
    if(kind==='customer'){
      const customers=rows(db,'Customers','customerId',selection);
      assertPresent(customers,selection);
      snapshot.rows.Customers=customers;
      snapshot.rows.PhoneNumbers=rows(db,'PhoneNumbers','customerId',selection);
      snapshot.rows.Emails=rows(db,'Emails','customerId',selection);
      const ownedCars=rows(db,'Cars','customerId',selection);
      const directServices=rows(db,'Services','customerId',selection);
      const linkedServices=rows(db,'Services','carId',idList(ownedCars,'carId'));
      if(deleteRelated){
        snapshot.rows.Cars=ownedCars;
        collectServices(db,snapshot,combine(idList(directServices,'serviceId'),idList(linkedServices,'serviceId')));
      }else{
        snapshot.links={cars:ownedCars.map(car=>({id:Number(car.carId),customerId:Number(car.customerId)})),services:directServices.map(service=>({id:Number(service.serviceId),customerId:Number(service.customerId)}))};
      }
      label=customers.length===1?String(customers[0].firstName??'Customer')+' '+String(customers[0].lastName??''): `${customers.length} customers · ${customers.slice(0,3).map(c=>String(c.firstName||'')+' '+String(c.lastName||'')).join(', ')}`;
      if(deleteRelated){
        deleteByIds(db,'Services','serviceId',idList(snapshot.rows.Services||[],'serviceId'));
        deleteByIds(db,'Cars','carId',idList(ownedCars,'carId'));
      }
      // ON DELETE SET NULL retains existing Cars/Services when deleteRelated=false.
      // ON DELETE CASCADE removes dependent Phones/Emails.
      deleteByIds(db,'Customers','customerId',selection);
    }else if(kind==='car'){
      const cars=rows(db,'Cars','carId',selection);
      assertPresent(cars,selection);
      snapshot.rows.Cars=cars;
      const associated=rows(db,'Services','carId',selection);
      // The schema requires Services.carId and cascades on car deletion. Always snapshot
      // dependent services, parts and media even when the old UI option is unchecked.
      // Nothing is permanently destroyed: the whole group is restored together.
      collectServices(db,snapshot,idList(associated,'serviceId'));
      label=cars.length===1?String(cars[0].plateNumber??'Vehicle'):`${cars.length} vehicles · ${cars.slice(0,3).map(c=>String(c.plateNumber||'—')).join(', ')}`;
      deleteByIds(db,'Cars','carId',selection);
    }else if(kind==='service'){
      const services=rows(db,'Services','serviceId',selection);
      assertPresent(services,selection);
      collectServices(db,snapshot,selection);
      const plateRows=db.prepare(`SELECT s.serviceId,c.plateNumber,cu.firstName,cu.lastName FROM Services s
        LEFT JOIN Cars c ON c.carId=s.carId LEFT JOIN Customers cu ON cu.customerId=s.customerId
        WHERE s.serviceId IN (${selection.map(()=>'?').join(',')})`).all(...selection) as {serviceId:number;plateNumber:string|null;firstName:string|null;lastName:string|null}[];
      label=plateRows.length===1?`Service · ${plateRows[0].plateNumber||'—'}${plateRows[0].firstName?' · '+plateRows[0].firstName+' '+(plateRows[0].lastName||''):''}`:`${selection.length} services · ${plateRows.slice(0,3).map(r=>r.plateNumber||'—').join(', ')}`;
      deleteByIds(db,'Services','serviceId',selection);
    }else{
      const media=rows(db,'ServiceMedia','mediaId',selection);
      assertPresent(media,selection);
      snapshot.rows.ServiceMedia=media;
      label=media.length===1?String(media[0].originalName??'Photo'):`${media.length} photos`;
      // Physical files intentionally stay on disk, even for independent photo deletes.
      deleteByIds(db,'ServiceMedia','mediaId',selection);
    }
    addTrash(db,kind,label.trim(),snapshot);
  })();
}
export function listTrash():TrashItem[]{
  return getDb().prepare(`SELECT trashId, entityType, label, deletedAt,
     1 AS count FROM TrashItems ORDER BY trashId DESC LIMIT 1000`).all() as TrashItem[];
}
function readTrash(db:Database.Database,id:number):{snapshot:Snapshot;entityType:TrashKind}{
  if(!Number.isSafeInteger(id)||id<=0)throw new Error('Invalid trash item ID.');
  const row=db.prepare('SELECT snapshot,entityType FROM TrashItems WHERE trashId=?').get(id) as {snapshot:string;entityType:TrashKind}|undefined;
  if(!row)throw new Error('Trash entry not found.');
  const snapshot=JSON.parse(row.snapshot) as Snapshot;
  if(!snapshot||typeof snapshot!=='object'||!snapshot.rows)throw new Error('Damaged trash snapshot.');
  return {snapshot,entityType:row.entityType};
}
function fileForRelative(relative:string):string {
  const dbPath=getActiveDbPath();
  if(!dbPath) throw new Error('Database not opened.');
  return resolveManagedMediaFile(path.join(path.dirname(dbPath), 'media'), relative);
}
export function restoreTrash(id:number):void {
  ensureNoBackupInProgress();
  const db=getDb();
  db.transaction(()=>{
    const {snapshot}=readTrash(db,id);
    const allRows=snapshot.rows;
    // Fail closed: never overwrite an active record with the same primary key.
    for(const table of INSERT_ORDER){
      const records=allRows[table]||[];
      for(const row of records){
        if(!row||typeof row!=='object')throw new Error('Damaged trash snapshot.');
        const key=row[PK[table]];
        if(!Number.isSafeInteger(key)||Number(key)<=0)throw new Error('Damaged row identifier.');
        if(db.prepare(`SELECT 1 FROM ${table} WHERE ${PK[table]}=?`).get(key))
          throw new Error(`Restore blocked: existing ${table} record has the same ID. Nothing changed.`);
        if(table==='ServiceMedia' && !fs.existsSync(fileForRelative(String(row.relativePath))))
          throw new Error('Restore blocked: a photo file is missing. Nothing changed.');
      }
    }
    for(const table of INSERT_ORDER){
      for(const row of allRows[table]||[]){
        const cols=Object.keys(row);
        if(cols.length===0||cols.some(c=>!/^\w+$/.test(c)))throw new Error('Unsafe snapshot column.');
        db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`).run(...cols.map(c=>row[c]));
      }
    }
    // For customer deletions without related-record deletion, relink only
    // records still unassigned; never overwrite a new owner selection.
    if(snapshot.links){
      for(const link of snapshot.links.cars){
        const current=db.prepare('SELECT customerId FROM Cars WHERE carId=?').get(link.id) as {customerId:number|null}|undefined;
        if(!current)throw new Error('Restore blocked: previously linked vehicle no longer exists. Nothing changed.');
        if(current.customerId!==null)throw new Error('Restore blocked: vehicle has a new customer.');
        db.prepare('UPDATE Cars SET customerId=? WHERE carId=?').run(link.customerId,link.id);
      }
      for(const link of snapshot.links.services){
        const current=db.prepare('SELECT customerId FROM Services WHERE serviceId=?').get(link.id) as {customerId:number|null}|undefined;
        if(!current)throw new Error('Restore blocked: previously linked service no longer exists. Nothing changed.');
        if(current.customerId!==null)throw new Error('Restore blocked: service has a new customer.');
        db.prepare('UPDATE Services SET customerId=? WHERE serviceId=?').run(link.customerId,link.id);
      }
    }
    db.prepare('DELETE FROM TrashItems WHERE trashId=?').run(id);
    const problems=db.pragma('foreign_key_check') as unknown[];
    if(problems.length)throw new Error('Restore blocked: foreign key consistency check failed.');
  })();
}
/** A persistent, transactional outbox keeps media cleanup retryable after I/O failures
 * or an application crash between SQLite commit and unlink.
 * Files still referenced by live media or any other trash snapshot are never removed.
 */
function retainedMediaPaths(db:Database.Database):Set<string>{
  const retained=new Set<string>();
  for(const row of db.prepare('SELECT relativePath FROM ServiceMedia').all() as {relativePath:string}[])
    retained.add(row.relativePath);
  for(const row of db.prepare('SELECT snapshot FROM TrashItems').all() as {snapshot:string}[]){
    const snapshot=JSON.parse(row.snapshot) as Snapshot;
    for(const media of snapshot.rows.ServiceMedia||[])retained.add(String(media.relativePath));
  }
  return retained;
}
function queueCleanup(db:Database.Database,referenced:Set<string>):void{
  const retained=retainedMediaPaths(db);
  const insert=db.prepare('INSERT OR IGNORE INTO PendingMediaDeletes (relativePath) VALUES (?)');
  for(const relative of referenced){
    if(!retained.has(relative)){
      // Reject malformed paths BEFORE deleting the source TrashItems entry.
      fileForRelative(relative);
      insert.run(relative);
    }
  }
}
/** Safe to call on startup and after purge; retryable failures remain in SQLite.
 * Do not call concurrently with a backup/restore operation. */
export function retryPendingMediaDeletes():{deleted:number;pending:number}{
  ensureNoBackupInProgress();
  const db=getDb();
  const pending=db.prepare('SELECT relativePath FROM PendingMediaDeletes').all() as {relativePath:string}[];
  let deleted=0;
  for(const {relativePath} of pending){
    try{
      // Protect a re-used path, even when it was reintroduced after purge.
      if(retainedMediaPaths(db).has(relativePath)){
        db.prepare('DELETE FROM PendingMediaDeletes WHERE relativePath=?').run(relativePath);
        continue;
      }
      fs.rmSync(fileForRelative(relativePath),{force:true});
      db.prepare('DELETE FROM PendingMediaDeletes WHERE relativePath=?').run(relativePath);
      deleted++;
    }catch(error){
      const message=error instanceof Error?error.message:String(error);
      db.prepare(`UPDATE PendingMediaDeletes SET attempts=attempts+1,
        lastAttemptAt=CURRENT_TIMESTAMP,lastError=? WHERE relativePath=?`).run(message.slice(0,400),relativePath);
      console.error('Deferred media cleanup will retry:',relativePath,message);
    }
  }
  return {deleted,pending:(db.prepare('SELECT COUNT(*) AS n FROM PendingMediaDeletes').get() as {n:number}).n};
}
export function purgeTrash(id:number):void{
  ensureNoBackupInProgress();
  const db=getDb();
  db.transaction(()=>{
    const {snapshot}=readTrash(db,id);
    const referenced=new Set((snapshot.rows.ServiceMedia||[]).map(row=>String(row.relativePath)));
    db.prepare('DELETE FROM TrashItems WHERE trashId=?').run(id);
    queueCleanup(db,referenced);
  })();
  retryPendingMediaDeletes();
}

/** A selected restore succeeds as one SQLite unit or leaves every entry untouched. */
export function restoreTrashBatch(ids:number[]):void {
  ensureNoBackupInProgress();
  idsValid(ids);
  const db=getDb();
  db.transaction(()=>{
    // Restore parents first when separate entries were selected together.
    const priority:Record<TrashKind,number>={customer:0,car:1,service:2,photo:3};
    const ordered=ids.map(id=>({id,kind:readTrash(db,id).entityType})).sort((a,b)=>priority[a.kind]-priority[b.kind]);
    for(const item of ordered)restoreTrash(item.id);
  })();
}
/** Remove all selected snapshots in one DB transaction; media is cleaned only after commit.
 * Disk unlink failures are logged and may leave orphan files, never broken active references.
 */
export function purgeTrashBatch(ids:number[]):void {
  ensureNoBackupInProgress();
  idsValid(ids);
  const db=getDb();
  db.transaction(()=>{
    const referenced=new Set<string>();
    for(const id of ids){
      const {snapshot}=readTrash(db,id);
      for(const row of snapshot.rows.ServiceMedia||[])referenced.add(String(row.relativePath));
    }
    const placeholders=ids.map(()=>'?').join(',');
    db.prepare(`DELETE FROM TrashItems WHERE trashId IN (${placeholders})`).run(...ids);
    queueCleanup(db,referenced);
  })();
  retryPendingMediaDeletes();
}
