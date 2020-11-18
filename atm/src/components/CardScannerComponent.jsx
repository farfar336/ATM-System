import React, { useState } from "react";
import "./CardScannerComponent.css"

const CardScanner = (props) => {
    const [status, setStatus] = useState(props.cardScanner.status);    

    const onClick = () => {
        if (props.cardScanner.status === 0) {
            props.cardScanner.accountNumber = "0123-4567-8987-6543";
            props.cardScanner.status = 1;
            setStatus(props.cardScanner.status);
        } else if (props.cardScanner.status === 2) {
            props.cardScanner.status = 0; 
            setStatus(props.cardScanner.status);
        }
    }
    
    return (<div className="CardScanner">
        <button className="CardSlot" onClick={onClick}></button>
        <div className={props.cardScanner.status !== 0 ? "Card" : "Card-invisible"} />
    </div>)
}

export default CardScanner; 
