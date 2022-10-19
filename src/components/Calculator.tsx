import React from 'react';
import {
    Avatar,
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
import { Plate } from '../types/Plate';
import { Expense } from '../types/Expense';
import { StyledAvatar } from './StyledAvatar';
import { isCurrency } from '../HelperMethods';
import { CheckBox } from '@mui/icons-material';

interface props{

};

type Bill = {
    subtotal: number,
    tax: number,
    items: Expense[]
}

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

    //Errors
    const [subtotalError, setSubtotalError] = React.useState<string>('');
    const [taxError, setTaxError] = React.useState<string>('');
    const [tipError, setTipError] = React.useState<string>('');
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
            return ((total / plates.length ).toFixed(2));
        }
        else{
            return bill.subtotal === 0 ? Number('0').toFixed(2) :
            ((plates[index].total + plates[index].total/bill.subtotal * (bill.tax + (tip/100) * bill.subtotal )).toFixed(2));
        }
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
                setRemainder(remainder - cost);
                setItem('');    
            }
        }
    };

    const shareItem = (plateIndexes?: number[]) => {
        if(validateItem()){
            var cost = Number(item);
            if(cost > remainder || cost <= 0){
                return;
            }
            if(splitPlates.length === 0){
                var split = Number((cost / plates.length).toFixed(2));
                var itemId = (bill.items.length + 1).toString();
                plates.forEach(plate => {
                    plate.total += split;
                    plate.items.push({
                        id: itemId,
                        cost: split
                    })
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
                setPlates([...plates]);
                setRemainder(remainder - cost);
            }
            else{
                var split = Number((cost / splitPlates.length).toFixed(2));
                var itemId = (bill.items.length + 1).toString();
                plates.forEach((plate) => {
                    if (splitPlates.includes(Number(plate.id))){
                        plate.total += split;
                        plate.items.push({
                            id: itemId,
                            cost: split
                        })
                    }
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
                setPlates([...plates]);
                setRemainder(remainder - cost);
            }
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
        // setBill({
        //     ...bill,
        //     items: [
        //         ...bill.items.filter(i => i.id !== item.id)
        //     ]
        // });
        setRemainder(remainder + item.cost);
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
                break;
            case 'Itemize':
                setSplit('Itemize');
                setRemainder(bill.subtotal);
                break;
            default:
                break;
        }
        setRevealTotal(true);
    };

    const onClickNext = () => {
        if(validateBill()){
            debugger;
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

    const resetAll = () => {
        setSubtotal('');
        setTax('');
        setTip(0);
        setBill({subtotal:0, tax: 0, items: []});
        setPlates([{id: 0,total: 0, items: []}, { id:1, total:0, items: []}]);
        setSplit('');
        setRevealSplit(false);
        setRevealTotal(false);
    };

    React.useEffect(() => {
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
                    />
                    </Grid>
                    <Grid item>
                    <Input
                        value={tip}
                        onChange={(e) => onChangeCost(e,'tip')}
                        inputProps= {{
                            step: 5,
                            min: 0,
                            max: 100,
                            type: 'number'
                        }}
                        endAdornment={<InputAdornment position='end'>%</InputAdornment>}
                    />
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
                </div>

                <div>
                    <label>Grand Total</label>
                    <span>${total.toFixed(2)}</span>
                </div>

                <Dialog 
                    open={openSplit} 
                    sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                    maxWidth="sm" 
                    onClose={handleCloseSplit}
                >
                    <DialogTitle>Split Item</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Select the plates to split this item across. If none are selected, the item will be split across everyone.
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
                        <Button onClick={() => {shareItem()}}>Split</Button>
                    </DialogActions>
                </Dialog>
            </>
            }

            <br></br>

            </Box>

        </div>
    )
}

export default Calculator;