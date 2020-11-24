import React, { useState } from "react";
import "./CardScannerComponent.css"

const CardScanner = (props) => {
    const [status, setStatus] = useState(props.cardScanner.status);    
    const [card, setCard] = useState(true);    

    const onClick = () => {
        if (!props.cardScanner.status) {
            if (card) {
                props.cardScanner.accountNumber = "0123-4567-8987-6543";
            } else {
                props.cardScanner.accountNumber = "0123-4567-8987-6544";
            }
            props.cardScanner.status = 1;
            setStatus(props.cardScanner.status);
        } 
    }

    const switchCard = () => {
        if (!props.cardScanner.status) {
            setCard(!card)
    
        }
    }
    
    return (<div className="CardScanner">
        <button className="CardSlot" onClick={onClick}></button>
        <div className={props.cardScanner.status ? "Card" : "Card-invisible"} />
        <br/>
        <br/>
        <button onClick={switchCard}>{card ? "Card 1" : "Card 2"}</button>
    </div>)
}

export default CardScanner; 
