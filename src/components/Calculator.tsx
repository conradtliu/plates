import React from 'react';
import {
    Box,
    Button,
    Checkbox,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Slider,
    TextField,
    Typography
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { StyledAvatar } from './StyledAvatar';
import { isCurrency } from '../HelperMethods';
import Receipt from './Receipt';
import { Bill, Plate, Expense } from '../types/';
import * as Messages from '../Messages';

interface props{
};

const Calculator: React.FC<props> = ({}): JSX.Element => {
    const [bill, setBill] = React.useState<Bill>({subtotal: 0, tax: 0, items: []});
    const [subtotal, setSubtotal] = React.useState<string>('');
    const [tax, setTax] = React.useState<string>('');
    const [tip, setTip] = React.useState<number>(0);
    const [plates, setPlates] = React.useState<Plate[]>([]);
    const [total, setTotal] = React.useState<number>(0);

    const [remainder, setRemainder] = React.useState<number>(0);
    const [item, setItem] = React.useState<string>('');
    const [split, setSplit] = React.useState<string>('');
    const [splitPlates, setSplitPlates] = React.useState<number[]>([]);

    const [revealTotal, setRevealTotal] = React.useState<boolean>(false);
    const [revealSplit, setRevealSplit] = React.useState<boolean>(false);
    const [openList, setOpenList] = React.useState<boolean>(false);
    const [openSplit, setOpenSplit] = React.useState<boolean>(false);
    const [showReceipt, setShowReceipt] = React.useState<boolean>(false);

    //Errors
    const [subtotalError, setSubtotalError] = React.useState<string>('');
    const [taxError, setTaxError] = React.useState<string>('');
    const [itemError, setItemError] = React.useState<string>('');

    const peopleInput = (group: number) => {
        if (plates.length < group){
            for(let i = plates.length; i < group; i++){
                setPlates(
                    [...plates, 
                        {
                            id: i,
                            total: 0,
                            items: [],
                        }
                    ])
            }
        }
        else if (plates.length > 2){
            setPlates(plates.slice(0, group))
        }
    };

    const calculateTotal = () => {
        return (Math.round((bill.subtotal * (1 + tip/100) + bill.tax) * 100) / 100);
    };

    const calculatePerson = (index: number) => {
        if(split === 'Evenly') {
            const cost = ((total / plates.length ).toFixed(2))
            return cost;
        }
        else{
            return bill.subtotal === 0 ? Number('0').toFixed(2) :
            ((plates[index].total + plates[index].total/bill.subtotal * (bill.tax + (tip/100) * bill.subtotal )).toFixed(2));
        }
    };

    const splitEvenly = () => {
        setPlates(plates.map(plate => {plate.total = Number((total / plates.length).toFixed(2)); return plate}))
    };

    const validateItem = () => {
        if (isCurrency(item)){
            Number(item) > remainder ? 
                setItemError('Item costs more than remainder of bill!') :
                setItemError('');
            return true;
        }
        else{
            setItemError("Invalid Entry, Please Adjust");
            return false;
        }
    };

    const validateBill = () => {
        var issues = 0;
        const validBill : Bill = bill
        if (isCurrency(subtotal)){
            setSubtotalError('');
            validBill.subtotal = Number(subtotal);
            setSubtotal(Number(subtotal).toFixed(2));
        }
        else{
            setSubtotalError('Invalid Entry, Please Adjust');
            issues += 1;
        }
        if (isCurrency(tax)){
            setTaxError('');
            validBill.tax = Number(tax);
            setTax(Number(tax).toFixed(2));
        }
        else{
            if(tax === ''){
                validBill.tax = 0;
                setTax('0.00');
                setTaxError('');
            }
            else{
                setTaxError('Invalid Entry, Please Adjust');
                issues += 1;    
            }
        }
        if (issues == 0){
            setBill(validBill);
        }
        return issues === 0;
    };

    const addToBill = (index: number) => {
        if(validateItem()){
            var cost = Number(item);
            if (remainder >= cost) {
                var id = plates.findIndex(plate => plate.id === index);
                var itemId = (bill.items.length + 1).toString();
                plates[id].total += cost;
                plates[id].items?.push({
                    id: itemId,
                    cost: cost
                });
                setBill({
                    ...bill,
                    items: [
                        ...bill.items,
                        {
                            id: itemId,
                            cost: cost
                        }
                    ]
                });
                setRemainder(Math.round((remainder - cost)*100)/100);
                setItem('');    
            }
        }
    };

    const shareItem = () => {
        if(validateItem()){
            var cost = Number(item);
            if(cost > remainder || cost <= 0){
                return;
            }
            const split = splitPlates.length === 0 ? Number((cost / plates.length).toFixed(2)) : Number((cost / splitPlates.length).toFixed(2));
            const itemId = (bill.items.length + 1).toString();

            if(splitPlates.length === 0){
                plates.forEach(plate => {
                    plate.total += split;
                    plate.items.push({
                        id: itemId,
                        cost: split
                    })
                });
            }
            else{
                plates.forEach((plate) => {
                    if (splitPlates.includes(Number(plate.id))){
                        plate.total += split;
                        plate.items.push({
                            id: itemId,
                            cost: split
                        })
                    }
                });
            }
            setBill({
                ...bill,
                items: [
                    ...bill.items,
                    {
                        id: itemId,
                        cost: cost
                    }
                ]
            });
            setPlates([...plates]);
            setRemainder(Math.round((remainder - cost)*100)/100);
            setSplitPlates([]);
            setItem('');
            handleCloseSplit();
        }
    };

    const addToPlates = (value: number) => {
        if (splitPlates.includes(value)){
            setSplitPlates(splitPlates.filter(split => split !== value));
        }
        else{
            setSplitPlates([...splitPlates, value]);
        }
    }

    const deleteItem = (item: Expense) => {
        var newPlates: Plate[] = [];
        plates.map(p => {
            if (p.items.findIndex(i => i.id === item.id) > -1){
                p.items = p.items.filter(items => items.id !== item.id);
                p.total -= item.cost;
            }
            newPlates.push(p);
        });
        setRemainder(remainder + bill.items.find(i => item.id === i.id)!.cost);
        setPlates(newPlates);
    };

    const clearPlates = () => {
        var temp : Plate[] = [];
        plates.map((plate) => {
            plate.total = 0;
            plate.items = [];
            temp.push(plate);
        });
        setPlates(temp);
        setRemainder(bill.subtotal);
    };

    const onChangeCost = React.useCallback((e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        switch (field) {
            case 'sub':
                setSubtotal(e.currentTarget.value);
                break;
            case 'tax':
                setTax(e.currentTarget.value);
                break;
            case 'tip':
                if(!isNaN(Number(e.currentTarget))){
                    setTip(Number(e.currentTarget.value))
                }
                break;
            case 'item':
                setItem(e.currentTarget.value);
                break;
            default:
                break;
        }
    }, []);

    const onChangeTip = (_: Event, newValue: number | number[]) => {
        setTip(Number(newValue));
    };

    const splitBillType = (option: string) => {
        switch(option){
            case 'Evenly':
                setSplit('Evenly');
                splitEvenly();
                setRemainder(0);
                setShowReceipt(true);
                break;
            case 'Itemize':
                setSplit('Itemize');
                clearPlates();
                setRemainder(bill.subtotal);
                break;
            default:
                break;
        }
        setRevealTotal(true);
    };

    const onClickNext = () => {
        if(validateBill()){
            setTotal(calculateTotal());
            setRevealSplit(true);
        }
    };

    const handleOpenSplit = () => {
        if(validateItem()){
            setItem(Number(item).toFixed(2));
            setOpenSplit(true);
        }
    };

    const handleCloseSplit = () => {
        setOpenSplit(false);
    };

    const handleCloseReceipt = () => {
        setShowReceipt(false);
    }

    const resetAll = () => {
        setBill({subtotal:0, tax: 0, items: []});
        setPlates([{id: 0,total: 0, items: []}, { id:1, total:0, items: []}]);

        setSubtotal('');
        setTax('');
        setTip(0);
        setSplit('');
        setTotal(0);
        setRemainder(0);
        setItem('');
        setSplitPlates([]);

        setRevealTotal(false);
        setRevealSplit(false);
        setOpenList(false);
        setOpenSplit(false);
        setShowReceipt(false);
    };

    React.useEffect(() => {
        if(bill.subtotal > 0 && remainder === 0){
            setShowReceipt(true);
        }
    }, [remainder]);

    React.useEffect(() => {
        setBill({...bill, plates: plates});
    }, [plates])

    React.useEffect(() => {
        setBill({...bill, tip: tip});
        setTotal(calculateTotal());
    },[tip]);

    React.useEffect(() => {
        setRemainder(bill.subtotal);
        setItem('');
        setItemError('');
    }, [bill.subtotal]);

    React.useEffect(()=> {
        clearPlates();
    }, [bill.subtotal, bill.tax]);

    React.useEffect(() => {
        setPlates([{id: 0,total: 0, items: []}, { id:1, total:0, items: []}])
    },[]);

    return(
        <div className='calculator center'>
            <Box sx={{ width: '100%', alignItems: 'center', justifyContent: 'center'}}>
            
            <div className='PeopleCount'>
                <InputLabel>How Many Plates?</InputLabel>
                <Button onClick={() => peopleInput(plates.length + 1)}>+</Button>
                <span>{plates.length}</span>
                <Button onClick={() => peopleInput(plates.length - 1)}>-</Button>
            </div>

            <div className='subTotal'>
                <TextField
                    variant='standard'
                    label='Subtotal'
                    placeholder='0.00'
                    value={subtotal}
                    onChange={(e) => onChangeCost(e, 'sub')}
                    InputProps={{
                        startAdornment:(<InputAdornment position="start">$</InputAdornment>)
                    }}
                    error={subtotalError !== ''}
                    helperText={subtotalError}
                />
            </div>

            <div className='tax'>
                <TextField
                    variant='standard'
                    label='Tax'
                    placeholder='0.00'
                    value={tax}
                    onChange={(e) => onChangeCost(e, 'tax')}
                    InputProps={{
                        startAdornment:(<InputAdornment position="start">$</InputAdornment>)
                            }}
                    error={taxError !== ''}
                    helperText={taxError}
                />
            </div>

            <div>
                <Box sx={{width: '100%', justifyContent: 'center'}}>
            <InputLabel>Tip:</InputLabel>
                <Grid container spacing={2}  alignItems='center' className='tip'>
                    <Grid item/>
                    <Grid item xs>
                    <Slider
                        sx={{width: '50%', justifyContent: 'center', justifySelf: 'center'}}
                        min={0}
                        max={100}
                        value={tip}
                        onChange={onChangeTip}
                        valueLabelDisplay='auto'
                        valueLabelFormat={(number) => `${number}%`}
                    />
                    </Grid>
                    <Grid item>
                    {/* <Input
                        value={tip}
                        onChange={(e) => onChangeCost(e,'tip')}
                        inputProps= {{
                            step: 5,
                            min: 0,
                            max: 100,
                            type: 'number'
                        }}
                        endAdornment={<InputAdornment position='end'>%</InputAdornment>}
                    /> */}
                    </Grid>
                </Grid>
                </Box>
            </div>

            <Grid container spacing={2} direction='row' justifyContent='center'>
                <Grid item>
                    <Button variant="contained" onClick={onClickNext}>Next</Button>
                </Grid>
                <Grid item>
                    <Button variant='outlined' size='large' onClick={() => resetAll()}>Reset All</Button>
                </Grid>
            </Grid>

            {revealSplit &&
            <>
                <Divider/>
                
                <div>
                    <Typography variant='h3'>Split Bill</Typography>
                    <br></br>
                    {//split === '' && 
                        <Grid container spacing={2} direction='row' justifyContent='center'>
                            <Grid item>
                                <Button variant='contained' onClick={() => splitBillType('Evenly')}>Split Evenly</Button>
                            </Grid>
                            <Grid item>
                                <Button variant='contained' onClick={() => splitBillType('Itemize')}>Split By Item</Button>
                            </Grid>
                        </Grid>
                    }
                    <br></br>
                    {split === 'Itemize' && <div>
                        <span>Remainder: ${remainder.toFixed(2)}</span>
                        <br></br>
                        <br></br>
                        <TextField
                            variant='standard'
                            label='Item Cost'
                            placeholder='0.00'
                            value={item}
                            onChange={(e) => onChangeCost(e, 'item')}
                            InputProps={{
                                startAdornment:(<InputAdornment position="start">$</InputAdornment>)
                            }}
                            error={itemError !== ''}
                            helperText={itemError}
                            disabled={remainder === 0}
                        />
                        {Number(item) > 0 && <Button variant='contained' onClick={handleOpenSplit}>Share Item</Button>}
                    </div>}
                </div>
            </>
            }

            {revealTotal && 
            <>
                <Divider/>

                <div>
                    <List>
                        {        
                        plates.map((plate, index) => {
                            return <List>
                                    <ListItem
                                        key={index}
                                    >
                                        <ListItemAvatar
                                            onClick={() => setOpenList(!openList)}

                                        ><StyledAvatar>P{index+1}</StyledAvatar></ListItemAvatar>
                                        <ListItemText>${calculatePerson(index)}</ListItemText>
                                        {split ==='Itemize' && 
                                            <Button
                                                disabled = {Number(item) > remainder || Number(item) === 0 || remainder < 0}
                                                variant='contained' 
                                                onClick={ () => {addToBill(index)} }>
                                                Add
                                            </Button>
                                        }
                                    </ListItem>
                                    {split === 'Itemize' && 
                                    <Collapse in={openList} unmountOnExit>
                                        {plate.items?.map((item, itemIndex) => {
                                            return <ListItem
                                                key={item.id}
                                                secondaryAction={
                                                    <IconButton onClick={() => deleteItem(item)}>
                                                        <DeleteOutlinedIcon/>
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText inset
                                                    primary={`Item ${item.id}`}
                                                    secondary={`$${item.cost.toFixed(2)}`}
                                                />
                                            </ListItem>
                                    })}
                                    </Collapse>
                                    }
                                </List>
                            })    
                        }
                    </List>
                    <div style={{justifyContent: 'start', alignItems: 'start'}}>
                        <Button variant='contained' onClick={() => {clearPlates(); setBill({...bill, items: []})}}>Clear Plates</Button>
                    </div>
                </div>
                {/* <div>
                    <label>Grand Total</label>
                    <span>${total.toFixed(2)}</span>
                </div> */}

                <Dialog 
                    open={openSplit} 
                    sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                    maxWidth="sm" 
                    onClose={handleCloseSplit}
                >
                    <DialogTitle>Split Item</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {Messages.shareItem}
                        </DialogContentText>
                        <Divider/>
                        <br/>
                        <DialogContentText sx={{fontWeight:'bold'}}>Item Cost:${item}</DialogContentText>
                        <Box sx={{padding: '0%'}}>
                            <List>
                                {plates.map(plate => {
                                    return <ListItem
                                            key={plate.id}
                                            disablePadding
                                        >
                                            <ListItemButton role={undefined} onClick={()=>{addToPlates(Number(plate.id))}}>
                                                <ListItemIcon>
                                                    <Checkbox
                                                        checked={splitPlates.findIndex(p => p === Number(plate.id)) > -1}
                                                    />
                                                </ListItemIcon>
                                                Plate {Number(plate.id) + 1}
                                            </ListItemButton>
                                        </ListItem>
                                })}
                            </List>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseSplit}>Cancel</Button>
                        <Button onClick={() => {shareItem()}}>Share</Button>
                    </DialogActions>
                </Dialog>
            </>
            }

            <br></br>

            </Box>

            <Receipt
                open={showReceipt}
                bill={bill}
                handleClose={handleCloseReceipt}
                reset={resetAll}
            />
        </div>
    )
}

export default Calculator;