import React from "react";
import { Backdrop, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, Slider, Stack, Typography } from "@mui/material";
import {Bill} from '../types';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import { calculateIndividualBill } from "../HelperMethods";

interface props{
    open: boolean,
    bill: Bill,
    reset() : void,
    handleClose() : void,
    adjustTip(_: Event, newValue: number | number[]): void
}

function Receipt(props: React.PropsWithChildren<props>){
    const { open, handleClose, bill, reset, adjustTip } = props;

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
                                    <Typography>${calculateIndividualBill(plate.total, bill.tax, bill.tip!, bill.subtotal)}</Typography>
                                </Stack>
                        })}
                        <br/>
                        <Divider/>
                        <br/>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography>Tax: ${bill.tax.toFixed(2)}</Typography>
                            <Typography>Tip: ({bill.tip}%): ${(Number(bill.tip) * bill.subtotal/100).toFixed(2)}</Typography>
                            <Typography>Subtotal: ${bill.subtotal.toFixed(2)}</Typography>
                        </Stack>
                        <Divider/>
                        <br/>
                        <Stack direction='row' justifyContent='space-between'>
                            <Slider
                                sx={{width: '50%', justifyContent: 'center', justifySelf: 'center'}}
                                min={0}
                                max={100}
                                value={bill.tip}
                                onChange={adjustTip}
                                valueLabelDisplay='auto'
                                valueLabelFormat={(number) => `${number}%`}
                                marks={[{value: 0, label: 'Tip'}]}
                            />
                        <Typography fontWeight='bold' textAlign='end'>Total: ${(bill.subtotal + bill.tax + Number(bill.tip) * bill.subtotal / 100).toFixed(2)}</Typography>
                        </Stack>
                    </>
                </DialogContent>
                <DialogActions sx={{justifyContent: 'space-between'}}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={reset}>Start Over</Button>
                </DialogActions>
            </Dialog>
        </Backdrop>
    )
}

export default Receipt;