import React, { useState } from "react";
import "./CardScannerComponent.css"

const CardScanner = (props) => {
    const [inserted, setInserted] = useState(props.cardScanner.inserted);    

    const onClick = () => {
        if (!props.cardScanner.inserted) {
            props.cardScanner.inserted = true;
            props.cardScanner.accountNumber = "0123-4567-8987-6543";
            props.cardScanner.read = true;
        } 
        setInserted(props.cardScanner.inserted);
    }
    
    return (<div className="CardScanner">
        <button className="CardSlot" onClick={onClick}></button>
        <div className={props.cardScanner.inserted ? "Card" : "Card-invisible"} />
    </div>)
}

export default CardScanner; 
