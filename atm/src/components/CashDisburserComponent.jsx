import React from "react";
import "./CashDisburserComponent.css"

const CardDisburser = (props) => {
    const onClick = () => {
        props.cashDisburser.disburseFinished = true;
    }

    return (<div className="CashDisburser">
        <button className="Cash" onClick={onClick}></button>
    </div>)
}

export default CardDisburser; 
