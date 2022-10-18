import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Collapse,
    Divider,
    Grid,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
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

interface props{

};

const Calculator: React.FC<props> = ({}): JSX.Element => {
    const [subtotal, setSubtotal] = React.useState<number>(0);
    const [tax, setTax] = React.useState<number>(0);
    const [tip, setTip] = React.useState<number>(0);
    const [plates, setPlates] = React.useState<Plate[]>([]);
    const [total, setTotal] = React.useState<number>(0);

    const [remainder, setRemainder] = React.useState<number>(0);
    const [item, setItem] = React.useState<string>('');
    const [split, setSplit] = React.useState<string>('');

    const [revealTotal, setRevealTotal] = React.useState<boolean>(false);
    const [revealSplit, setRevealSplit] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState<boolean>();

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
        return (Math.round((subtotal * (1 + tip/100) + tax) * 100) / 100);
    };

    const calculatePerson = (index: number) => {
        if(split === 'Evenly') {
            return ((total / plates.length ).toFixed(2));
        }
        else{
            return subtotal === 0 ? Number('0').toFixed(2) :
            ((plates[index].total + plates[index].total/subtotal * (tax + (tip/100) * subtotal )).toFixed(2));
        }
    };

    const validate = (field: string) => {
        switch(field){
            case 'item':
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
        }
    }

    const addToBill = (index: number) => {
        if(validate('item')){
            var cost = Number(item);
            if (remainder >= cost) {
                var id = plates.findIndex(plate => plate.id === index);
                plates[id].total += cost;
                plates[id].items?.push({
                    id: (Math.random() * 100).toString(),
                    cost: cost
                })
                setRemainder(remainder - cost);
                setItem('');    
            }
        }
    };

    const shareItem = (plateIndexes?: number[]) => {
        if(validate('item')){
            var cost = Number(item);
            if(cost > remainder || cost <= 0){
                return;
            }
            if(!plateIndexes){
                var split = Number((cost / plates.length).toFixed(2));
                var splitId = (Math.random() * 100).toString();
                plates.forEach(plate => {
                    plate.total += split;
                    plate.items.push({
                        id: splitId,
                        cost: split
                    })
                });
                setPlates([...plates]);
                setRemainder(remainder - cost);
            }
            setItem('');
        }
    };

    const deleteItem = (plate: Plate, item: Expense) => {
        plate.items = plate.items.filter(items => items.id !== item.id);
        plate.total -= item.cost;
        plates.splice(plates.findIndex(oldplates => oldplates.id === plate.id), 1, plate)
        setRemainder(remainder + item.cost);
        setPlates(plates);
    };

    const clearPlates = () => {
        var temp : Plate[] = [];
        plates.map((plate) => {
            plate.total = 0;
            plate.items = [];
            temp.push(plate);
        });
        setPlates(temp);
        setRemainder(subtotal);
    };

    const onChangeCost = React.useCallback((e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        if (!isNaN(Number(e.currentTarget.value))){
            switch(field){
                case 'sub':
                    setSubtotal(Number(Number(e.currentTarget.value).toFixed(2)));
                    break;
                case 'tax':
                    setTax(Number(e.currentTarget.value));
                    break;
                case 'tip':
                    setTip(Number(e.currentTarget.value));
                    break;
                // case 'item':
                //     setItem(Number(e.currentTarget.value));
                //     break;
            }
        }
        switch (field) {
            // case 'sub':
            //     setSubtotal(e.currentTarget.value);
            //     break;
            // case 'tax':
            //     setTax(e.currentTarget.value);
            //     break;
            // case 'tip':
            //     if(!isNaN(Number(e.currentTarget))){
            //         setTip(Number(e.currentTarget.value))
            //     }
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
                setRemainder(subtotal);
                break;
            default:
                break;
        }
        setRevealTotal(true);
    };

    const onClickNext = () => {
        if (tip === 0 && tax === 0 && subtotal === 0){

        }
        else{
            setTotal(calculateTotal());
            setRevealSplit(true);
        }
    };

    const resetAll = () => {
        setSubtotal(0);
        setTax(0);
        setTip(0);
        setPlates([{id: 0,total: 0, items: []}, { id:1, total:0, items: []}]);
        setSplit('');
        setRevealSplit(false);
        setRevealTotal(false);
    };

    React.useEffect(() => {
        setTotal(calculateTotal());
    },[tip]);

    React.useEffect(() => {
        setRemainder(subtotal);
        setItem('');
        setItemError('');
    }, [subtotal]);

    React.useEffect(()=> {
        clearPlates();
    }, [subtotal, tax]);

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
                        <>
                            <Button variant='contained' onClick={() => splitBillType('Evenly')}>Split Evenly</Button>
                            <Button variant='contained' onClick={() => splitBillType('Itemize')}>Split By Item</Button>
                        </>
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
                        />
                        {Number(item) > 0 && <Button variant='contained' onClick={() => {shareItem()}}>Share Item</Button>}
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
                                            onClick={() => setOpen(!open)}

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
                                    <Collapse in={open} unmountOnExit>
                                        {plate.items?.map((item, itemIndex) => {
                                            return <ListItem
                                                key={item.id}
                                                secondaryAction={
                                                    <IconButton onClick={() => deleteItem(plate, item)}>
                                                        <DeleteOutlinedIcon/>
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText inset
                                                    primary={`Item ${itemIndex + 1}`}
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
            </>
            }

            <br></br>

            </Box>

        </div>
    )
}

export default Calculator;