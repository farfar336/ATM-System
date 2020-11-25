import React, { useState } from "react"
import KeypadComponent  from "./KeypadComponent";
import MonitorComponent from "./MonitorComponent";
import CardScannerComponent from "./CardScannerComponent";
import ATMProcessor from "./ATMProcessor";
import Clock from "./Clock";
import CashBank from "./CashBank";
import CashDisburser from "./CashDisburser";
import Keypad from "./Keypad";
import AccountDatabase from "./AccountDatabase";
import CardScanner from "./CardScanner";
import Monitor from "./Monitor";

import "./ATM.css"

const cardScanner = new CardScanner();
const accountDatabase = new AccountDatabase();
const clock = new Clock();
const cashBank = new CashBank(300);
const cashDisburser = new CashDisburser();
const monitor = new Monitor();
const keypad = new Keypad();
const atmProcessor = new ATMProcessor(accountDatabase, cardScanner, keypad, cashBank, cashDisburser, monitor, clock, () => {});

const ATM = () => {
    const [message, setMessage] = useState("");
    const [timestamp, setTimestamp] = useState(""); 
    
    const render = () => {
        setMessage(monitor.message);
        setTimestamp(monitor.timestamp);
    }

    atmProcessor.render = render;

    return (<div className="ATM">
        <div className="Monitor">
            <MonitorComponent message={message} timestamp={timestamp}/>
        </div>
        <div className="Panel">
            <KeypadComponent keypad={keypad}/>
            <CardScannerComponent cardScanner={cardScanner}/>
        </div>
    </div>)
}

export default ATM