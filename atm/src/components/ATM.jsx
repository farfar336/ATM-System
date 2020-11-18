import React, { useState } from "react"
import KeypadComponent  from "./KeypadComponent";
import MonitorComponent from "./MonitorComponent";
import LeftKeyPanel from "./LeftKeyPanel";
import RightKeyPanel from "./RightKeyPanel";
import CardScannerComponent from "./CardScannerComponent";
import CashDisburserComponent from "./CashDisburserComponent";
import Processor from "./Processor";
import Clock from "./Clock";
import CashBank from "./CashBank";
import CashDisburser from "./CashDisburser";
import Keypad from "./Keypad";
import Database from "./Database";
import CardScanner from "./CardScanner";
import Monitor from "./Monitor";

import "./ATM.css"

const cardScanner = new CardScanner();
const database = new Database();
const clock = new Clock();
const cashBank = new CashBank(20);
const cashDisburser = new CashDisburser();
const monitor = new Monitor();
const keypad = new Keypad();
const processor = new Processor(database, cardScanner, keypad, cashBank, cashDisburser, monitor, clock, () => {});

const ATM = () => {
    const [message, setMessage] = useState("");
    const [timestamp, setTimestamp] = useState(""); 
    
    const render = () => {
        setMessage(monitor.message);
        setTimestamp(monitor.timestamp);
    }

    processor.render = render;

    return (<div className="ATM">
        <div className="Monitor">
            <MonitorComponent message={message}/>
        </div>
        <div className="Panel">
            <KeypadComponent keypad={keypad}/>
            <CardScannerComponent cardScanner={cardScanner}/>
            <CashDisburserComponent cashDisburser={cashDisburser}/>
        </div>
    </div>)
}

export default ATM