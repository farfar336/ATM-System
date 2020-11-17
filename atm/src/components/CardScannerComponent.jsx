import React, { useState } from "react";
import "./CardScannerComponent.css"

const CardScanner = (props) => {
    const [inserted, setInserted] = useState(props.cardScanner.inserted);    

    const onClick = () => {
        if (!props.cardScanner.inserted && props.cardScanner.taken) {
            props.cardScanner.inserted = true;
            props.cardScanner.accountNumber = "0123-4567-8987-6543";
            props.cardScanner.read = true;
            props.cardScanner.taken = false;
            console.log(props.cardScanner)
            setInserted(props.cardScanner.inserted);
        } else if (!props.cardScanner.taken && !props.cardScanner.inserted) {
            props.cardScanner.taken = true;        
            setInserted(props.cardScanner.inserted);
        }
    }
    
    return (<div className="CardScanner">
        <button className="CardSlot" onClick={onClick}></button>
        <div className={props.cardScanner.inserted || !props.cardScanner.taken ? "Card" : "Card-invisible"} />
    </div>)
}

export default CardScanner; 
