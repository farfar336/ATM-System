import React, { useState } from "react";
import "./CardScannerComponent.css"

const CardScanner = (props) => {
    const [status, setStatus] = useState(props.cardScanner.status);    
    const [card, setCard] = useState(true);    

    const onClick = () => {
        if (!props.cardScanner.cardInserted) {
            if (card) {
                props.cardScanner.accountNumber = "0123-4567-8987-6543";
            } else {
                props.cardScanner.accountNumber = "0123-4567-8987-6544";
            }
            props.cardScanner.cardInserted = true;
            setStatus(props.cardScanner.cardInserted);
        } 
    }

    const switchCard = () => {
        if (!props.cardScanner.cardInserted) {
            setCard(!card)
        }
    }
    
    return (<div className="CardScanner">
        <button className="CardSlot" onClick={onClick}></button>
        <div className={props.cardScanner.cardInserted ? "Card" : "Card-invisible"} />
        <br/>
        <br/>
        <button onClick={switchCard}>{card ? "Card 1" : "Card 2"}</button>
    </div>)
}

export default CardScanner; 
