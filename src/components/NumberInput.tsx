import { InputAdornment, TextField } from "@mui/material"

interface NumberInputProps{
    label: string
    value: number | string
    onChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void
    error: boolean
    helperText: string
    disabled?: boolean
}

export const NumberInput: React.FunctionComponent<NumberInputProps> = (props): JSX.Element => {
    return (
        <TextField
        {...props}
        variant='standard'
        placeholder='0.00'
        InputProps={{
            startAdornment:(<InputAdornment position="start">$</InputAdornment>),
        }}
        inputProps={{
            inputMode: 'decimal',
        }}
        autoComplete='off'
    />

    )
}