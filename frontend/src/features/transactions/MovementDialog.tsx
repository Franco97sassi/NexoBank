import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import type { Account } from '../accounts/accountTypes';
import type { OperationData, OperationType } from './transactionTypes';
interface Props { accounts:Account[]; loading:boolean; onClose:()=>void; onSubmit:(accountId:string, type:OperationType, data:OperationData)=>void; open:boolean }
export function MovementDialog({accounts,loading,onClose,onSubmit,open}:Props) {
 const [accountId,setAccountId]=useState(''); const [type,setType]=useState<OperationType>('deposits');
 const [amount,setAmount]=useState(''); const [description,setDescription]=useState('');
 useEffect(()=>{if(open){setAccountId(accounts[0]?.id ?? '');setType('deposits');setAmount('');setDescription('')}},[open,accounts]);
 const valid=Boolean(accountId)&&Number(amount)>0&&(type!=='adjustments'||description.trim().length>=3);
 return <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
  <DialogTitle>Registrar movimiento</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
   <TextField label="Cuenta" onChange={e=>setAccountId(e.target.value)} select value={accountId}>{accounts.filter(a=>a.status==='ACTIVE').map(a=><MenuItem key={a.id} value={a.id}>{a.alias} · {a.currency} {a.balance.toFixed(2)}</MenuItem>)}</TextField>
   <TextField label="Operación" onChange={e=>setType(e.target.value as OperationType)} select value={type}><MenuItem value="deposits">Depósito</MenuItem><MenuItem value="withdrawals">Extracción</MenuItem><MenuItem value="adjustments">Ajuste positivo</MenuItem></TextField>
   <TextField inputProps={{min:'0.01',step:'0.01'}} label="Importe" onChange={e=>setAmount(e.target.value)} type="number" value={amount}/>
   <TextField label="Descripción" onChange={e=>setDescription(e.target.value)} required={type==='adjustments'} value={description}/>
  </Stack></DialogContent><DialogActions><Button onClick={onClose}>Cancelar</Button><Button disabled={!valid||loading} onClick={()=>onSubmit(accountId,type,{amount:Number(amount),description})} variant="contained">Registrar</Button></DialogActions>
 </Dialog>;
}
