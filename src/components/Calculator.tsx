import React from 'react';
import {
    Box,
    Button,
    Divider,
    Grid,
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

interface props{

};

const Calculator: React.FC<props> = ({}): JSX.Element => {
    const [subtotal, setSubtotal] = React.useState<number>(0);
    const [tax, setTax] = React.useState<number>(0);
    const [tip, setTip] = React.useState<number>(0);
    const [plates, setPlates] = React.useState<number[]>([]);
    const [total, setTotal] = React.useState<number>(0);

    const [remainder, setRemainder] = React.useState<number>(0);
    const [item, setItem] = React.useState<number>(0);
    const [split, setSplit] = React.useState<string>('');

    const [revealTotal, setRevealTotal] = React.useState<boolean>(false);
    const [revealSplit, setRevealSplit] = React.useState<boolean>(false);

    const peopleInput = (group: number) => {
        if (plates.length < group){
            for(let i = plates.length; i < group; i++){
                setPlates([...plates, 0])
            }
        }
        else if (plates.length > 2){
            setPlates(plates.slice(0, group))
        }
    };

    const calculateTotal = () => {
        return (Math.round((subtotal * (1 + tip/100) + tax) * 100) / 100);
    };

    const calculatePerson = (plate: number) => {
        if(split === 'Evenly') {
            return ((total / plates.length ).toFixed(2));
        }
        else{
            return subtotal === 0 ? Number('0').toFixed(2) :
            ((plate + plate/subtotal * (tax + (tip/100) * subtotal )).toFixed(2));
        }
    };

    const splitBillType = (option: string) => {
        switch(option){
            case 'Evenly':
                setSplit('Evenly');
                setRevealTotal(true);
                break;
            case 'Itemize':
                setSplit('Itemize');
                setRemainder(subtotal);
                setRevealTotal(true);
                break;
            default:
                break;
        }
    }

    const addToBill = (index: number) => {
        if (remainder >= item) {
            plates[index] += item;
            setRemainder(remainder - item);
            setItem(0);    
        }
    };

    const onChangeCost = React.useCallback((e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        if (!isNaN(Number(e.currentTarget.value))){
            switch(field){
                case 'sub':
                    setSubtotal(Number(e.currentTarget.value));
                    break;
                case 'tax':
                    setTax(Number(e.currentTarget.value));
                    break;
                case 'tip':
                    setTip(Number(e.currentTarget.value));
                    break;
                case 'item':
                    setItem(Number(e.currentTarget.value));
                    break;
            }
            if(['sub','tax'].includes(field)){
                //clearPlates();
            }
        }
    }, []);

    const onChangeTip = (_: Event, newValue: number | number[]) => {
        setTip(Number(newValue));
    };

    const resetAll = () => {
        setSubtotal(0);
        setTax(0);
        setTip(0);
        setPlates([0,0]);
        setRevealSplit(false);
        setRevealTotal(false);
    };

    React.useEffect(() => {
        setTotal(calculateTotal());
    },[subtotal, tax, tip]);

    React.useEffect(() => {
        setRemainder(subtotal);
    }, [subtotal])

    React.useEffect(() => {
        setPlates([0,0]);
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
                <InputLabel htmlFor='standard-adornment-subtotal'>Subtotal</InputLabel>
                <Input
                    id='standard-adornment-subtotal'
                    value={subtotal}
                    onChange={(e) => onChangeCost(e, 'sub')}
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                />
            </div>

            <div className='tax'>
            <InputLabel htmlFor='standard-adornment-subtotal'>Tax</InputLabel>
                <Input
                    value={tax}
                    onChange={(e) => onChangeCost(e, 'tax')}
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                />
            </div>

            <div>
                <Box sx={{width: '100%', justifyContent: 'center'}}>
            <InputLabel>Tip:</InputLabel>
                <Grid container spacing={2}  alignItems='center' className='tip'>
                    <Grid item xs>
                    <Slider
                        min={0}
                        max={50}
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
                            max: 50,
                            type: 'number'
                        }}
                    />
                    </Grid>
                </Grid>
                </Box>
            </div>

            <Grid container spacing={2} direction='row' justifyContent='center'>
                <Grid item>
                    <Button variant="contained" onClick={() => {setRevealSplit(true)}}>Next</Button>
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
                            value={item}
                            onChange={(e) => onChangeCost(e, 'item')}
                            InputProps={{
                                startAdornment:(<InputAdornment position="start">$</InputAdornment>)
                            }}
                            error={item > remainder}
                            helperText={item > remainder? 'Item costs more than remainder of bill!' : ''}
                        />
                        {item > 0 &&  item <= remainder && <Button variant='contained' onClick={() => {}}>Share Item</Button>}
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
                            return <ListItem
                                    key={index}
                                    >
                                    <ListItemAvatar>Person {index+1}</ListItemAvatar>
                                    <ListItemText>${calculatePerson(plate)}</ListItemText>
                                    {split ==='Itemize' && 
                                        <Button
                                            disabled = {item > remainder || item === 0 || remainder < 0}
                                            variant='contained' 
                                            onClick={ () => {addToBill(index)} }>
                                            Add
                                        </Button>
                                    }
                                </ListItem>
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