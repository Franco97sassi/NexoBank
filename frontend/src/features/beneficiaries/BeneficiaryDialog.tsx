import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import type { Customer } from '../customers/customerTypes';
import type { Beneficiary, BeneficiaryFormData } from './beneficiaryTypes';
interface Props { customers:Customer[]; editing:Beneficiary|null; loading:boolean; open:boolean; onClose:()=>void; onSubmit:(data:BeneficiaryFormData)=>void }
export function BeneficiaryDialog({customers,editing,loading,open,onClose,onSubmit}:Props){
 const [data,setData]=useState<BeneficiaryFormData>({customerId:'',displayName:'',cbu:'',alias:'',bankName:''});
 useEffect(()=>{if(open)setData(editing?{customerId:editing.customerId,displayName:editing.displayName,cbu:editing.cbu,alias:editing.alias??'',bankName:editing.bankName??''}:{customerId:customers[0]?.id??'',displayName:'',cbu:'',alias:'',bankName:''})},[open,editing,customers]);
 const set=(field:keyof BeneficiaryFormData)=>(e:React.ChangeEvent<HTMLInputElement>)=>setData(v=>({...v,[field]:e.target.value}));
 const valid=Boolean(data.customerId)&&data.displayName.trim().length>0&&/^\d{22}$/.test(data.cbu)&&(!data.alias||/^[A-Za-z0-9.-]{6,30}$/.test(data.alias));
 return <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}><DialogTitle>{editing?'Editar destinatario':'Nuevo destinatario'}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
  <TextField disabled={Boolean(editing)} label="Cliente" onChange={set('customerId')} select value={data.customerId}>{customers.map(c=><MenuItem key={c.id} value={c.id}>{c.lastName}, {c.firstName}</MenuItem>)}</TextField>
  <TextField label="Nombre para mostrar" inputProps={{maxLength:120}} onChange={set('displayName')} required value={data.displayName}/>
  <TextField helperText="22 dígitos" inputProps={{maxLength:22,inputMode:'numeric'}} label="CBU" onChange={set('cbu')} required value={data.cbu}/>
  <TextField helperText="Entre 6 y 30 caracteres: letras, números, puntos o guiones" label="Alias" onChange={set('alias')} value={data.alias}/>
  <TextField label="Banco" inputProps={{maxLength:120}} onChange={set('bankName')} value={data.bankName}/>
 </Stack></DialogContent><DialogActions><Button onClick={onClose}>Cancelar</Button><Button disabled={!valid||loading} onClick={()=>onSubmit(data)} variant="contained">Guardar</Button></DialogActions></Dialog>;
}
