import React from "react";
import { Backdrop, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, Stack, Typography } from "@mui/material";
import {Bill} from '../types';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

interface props{
    open: boolean,
    handleClose() : void,
    bill: Bill,
    reset() : void
}

function Receipt(props: React.PropsWithChildren<props>){
    const { open, handleClose, bill, reset } = props;

    const dateTime = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    return(
        <Backdrop
            sx={{bgcolor: 'primary.main', opacity: '20%'}}
            open={open}
        >
            <Dialog 
                open={open}
                sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 880 }}}
                >
                <DialogTitle>
                    <Stack alignItems='center'>
                        <ReceiptRoundedIcon/>
                        <Typography variant='h5' gutterBottom> Final Breakdown </Typography>
                    </Stack>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography sx={{opacity: '50%' }}>{dateTime}</Typography>
                        <Typography sx={{opacity: '50%' }}>{time}</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <>
                        {bill.plates?.map(plate => {
                            return <Stack direction='row' justifyContent='space-between'>
                                    <Typography>Person {Number(plate.id)+1}</Typography>
                                    <Typography>${plate.total.toFixed(2)}</Typography>
                                </Stack>
                        })}
                        <br/>
                        <Divider/>
                        <br/>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography>Tax: ${bill.tax.toFixed(2)}</Typography>
                            <Typography>Tip: ${(Number(bill.tip) * bill.subtotal/100).toFixed(2)}</Typography>
                            <Typography fontWeight='bold'>Total: ${(bill.subtotal + bill.tax + Number(bill.tip) * bill.subtotal / 100).toFixed(2)}</Typography>
                        </Stack>
                    </>
                </DialogContent>
                <DialogActions>
                    {/* <Button onClick={handleClose}>Cancel</Button> */}
                    <Button onClick={reset}>Start Over</Button>
                </DialogActions>
            </Dialog>
        </Backdrop>
    )
}

export default Receipt;