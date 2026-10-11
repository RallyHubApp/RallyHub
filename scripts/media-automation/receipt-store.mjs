import {mkdir,open,readFile,rename,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const idKey=(approvalId,sha256)=>createHash('sha256').update(JSON.stringify([approvalId,sha256])).digest('hex');
export class FileReceiptStore{
 constructor(directory){if(!directory)throw Error('Receipt directory required');this.directory=directory;}
 async init(){await mkdir(this.directory,{recursive:true,mode:0o700});}
 async find({approvalId,sha256}){await this.init();try{return JSON.parse(await readFile(join(this.directory,idKey(approvalId,sha256)+'.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
 async save(receipt){await this.init();const path=join(this.directory,idKey(receipt.approvalId,receipt.sha256)+'.json');const tmp=path+'.'+process.pid+'.tmp';const h=await open(tmp,'wx',0o600);try{await h.writeFile(JSON.stringify(receipt,null,2));await h.sync();}finally{await h.close();}await rename(tmp,path);}
 async withLock({approvalId,sha256},action){await this.init();const lock=join(this.directory,idKey(approvalId,sha256)+'.lock');let h;try{h=await open(lock,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw Error('Approval transfer already in progress');throw e;}
 try{return await action();}finally{await h.close();await rm(lock,{force:true});}}
}
