import { useState } from 'react';
import { Add, FilterAlt } from '@mui/icons-material';
import { Alert, Box, Button, MenuItem, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAccounts } from '../features/accounts/accountsApi';
import { MovementDialog } from '../features/transactions/MovementDialog';
import { createOperation, getTransactions } from '../features/transactions/transactionsApi';
import type { OperationData, OperationType, TransactionQuery, TransactionType } from '../features/transactions/transactionTypes';
const labels:Record<TransactionType,string>={DEPOSIT:'Depósito',WITHDRAWAL:'Extracción',ADJUSTMENT:'Ajuste',TRANSFER_IN:'Transferencia recibida',TRANSFER_OUT:'Transferencia enviada'};
const errorMessage=(e:unknown)=>axios.isAxiosError<{message?:string}>(e)?e.response?.data?.message??'No se pudo completar la operación.':'No se pudo completar la operación.';
export function TransactionsPage(){
 const client=useQueryClient(); const [open,setOpen]=useState(false); const [message,setMessage]=useState('');
 const [filters,setFilters]=useState({accountId:'',type:'' as ''|TransactionType,from:'',to:''});
 const [query,setQuery]=useState<TransactionQuery>({...filters,page:0,size:10,sortBy:'createdAt',direction:'DESC'});
 const accounts=useQuery({queryKey:['accounts','movement-options'],queryFn:()=>getAccounts({search:'',page:0,size:100,sortBy:'alias',direction:'ASC'})});
 const movements=useQuery({queryKey:['transactions',query],queryFn:()=>getTransactions(query)});
 const create=useMutation({mutationFn:({accountId,type,data}:{accountId:string;type:OperationType;data:OperationData})=>createOperation(accountId,type,data),onSuccess:async()=>{setOpen(false);setMessage('Movimiento registrado.');await Promise.all([client.invalidateQueries({queryKey:['transactions']}),client.invalidateQueries({queryKey:['accounts']})])}});
 const sort=(field:TransactionQuery['sortBy'])=>setQuery(q=>({...q,page:0,sortBy:field,direction:q.sortBy===field&&q.direction==='ASC'?'DESC':'ASC'}));
 const heading=(field:TransactionQuery['sortBy'],label:string)=><TableSortLabel active={query.sortBy===field} direction={query.direction.toLowerCase() as 'asc'|'desc'} onClick={()=>sort(field)}>{label}</TableSortLabel>;
 return <Stack spacing={3}><Box><Typography component="h1" variant="h4">Movimientos</Typography><Typography color="text.secondary">Depósitos, extracciones, ajustes e historial bancario.</Typography></Box>
 <Paper sx={{p:2}}><Stack direction={{xs:'column',md:'row'}} spacing={2}>
  <TextField label="Cuenta" onChange={e=>setFilters(f=>({...f,accountId:e.target.value}))} select size="small" sx={{minWidth:220}} value={filters.accountId}><MenuItem value="">Todas</MenuItem>{accounts.data?.content.map(a=><MenuItem key={a.id} value={a.id}>{a.alias}</MenuItem>)}</TextField>
  <TextField label="Tipo" onChange={e=>setFilters(f=>({...f,type:e.target.value as ''|TransactionType}))} select size="small" sx={{minWidth:180}} value={filters.type}><MenuItem value="">Todos</MenuItem>{Object.entries(labels).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</TextField>
  <TextField InputLabelProps={{shrink:true}} label="Desde" onChange={e=>setFilters(f=>({...f,from:e.target.value}))} size="small" type="date" value={filters.from}/><TextField InputLabelProps={{shrink:true}} label="Hasta" onChange={e=>setFilters(f=>({...f,to:e.target.value}))} size="small" type="date" value={filters.to}/>
  <Button onClick={()=>setQuery(q=>({...q,...filters,page:0}))} startIcon={<FilterAlt/>} variant="outlined">Filtrar</Button><Button onClick={()=>{create.reset();setOpen(true)}} startIcon={<Add/>} variant="contained">Nuevo</Button>
 </Stack></Paper>
 {(movements.isError||create.isError)&&<Alert severity="error">{errorMessage(movements.error??create.error)}</Alert>}
 <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>{heading('createdAt','Fecha')}</TableCell><TableCell>Cuenta</TableCell><TableCell>{heading('type','Tipo')}</TableCell><TableCell>Descripción</TableCell><TableCell align="right">{heading('amount','Importe')}</TableCell><TableCell align="right">{heading('balanceAfter','Saldo posterior')}</TableCell></TableRow></TableHead><TableBody>
 {movements.isLoading&&<TableRow><TableCell colSpan={6}>Cargando movimientos…</TableCell></TableRow>}{movements.data?.content.map(m=><TableRow hover key={m.id}><TableCell>{new Intl.DateTimeFormat('es-AR',{dateStyle:'short',timeStyle:'short'}).format(new Date(m.createdAt))}</TableCell><TableCell>{m.accountAlias}</TableCell><TableCell>{labels[m.type]}</TableCell><TableCell>{m.description}</TableCell><TableCell align="right" sx={{color:m.type==='WITHDRAWAL'||m.type==='TRANSFER_OUT'?'error.main':'success.main'}}>{m.type==='WITHDRAWAL'||m.type==='TRANSFER_OUT'?'-':'+'}{m.amount.toFixed(2)}</TableCell><TableCell align="right">{m.balanceAfter.toFixed(2)}</TableCell></TableRow>)}
 {!movements.isLoading&&movements.data?.content.length===0&&<TableRow><TableCell align="center" colSpan={6}>No se encontraron movimientos.</TableCell></TableRow>}</TableBody></Table><TablePagination component="div" count={movements.data?.totalElements??0} page={query.page} rowsPerPage={query.size} rowsPerPageOptions={[5,10,25,50]} onPageChange={(_,page)=>setQuery(q=>({...q,page}))} onRowsPerPageChange={e=>setQuery(q=>({...q,page:0,size:Number(e.target.value)}))}/></TableContainer>
 <MovementDialog accounts={accounts.data?.content??[]} loading={create.isPending} onClose={()=>setOpen(false)} onSubmit={(accountId,type,data)=>create.mutate({accountId,type,data})} open={open}/><Snackbar autoHideDuration={3500} message={message} onClose={()=>setMessage('')} open={Boolean(message)}/></Stack>
}
