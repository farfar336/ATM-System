import React from "react";
import "./CardScannerComponent.css"

const CardScanner = (props) => {
    const onClick = () => {
        if (!props.cardScanner.inserted) {
            props.cardScanner.inserted = true;
            props.cardScanner.accountNumber = "0123-4567-8987-6543";
            props.cardScanner.read = true;
        }
    }
    
    return (<div className="CardScanner">
        <button className="Card" onClick={onClick}></button>
    </div>)
}

export default CardScanner; 
