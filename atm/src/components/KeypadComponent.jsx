import React from "react";
import "./KeypadComponent.css"

const Keypad = (props) => {
    const generateOnClick = (value) => {
        return () => {
            props.keypad.keyPressed = value;
        }
    }

    return (<div className="Keypad">
        <div className="KeypadRow">
            <button className="KeypadButton" onClick={generateOnClick(1)}>1</button>
            <button className="KeypadButton" onClick={generateOnClick(2)}>2</button>
            <button className="KeypadButton" onClick={generateOnClick(3)}>3</button>
        </div>
        <div className="KeypadRow">
            <button className="KeypadButton" onClick={generateOnClick(4)}>4</button>
            <button className="KeypadButton" onClick={generateOnClick(5)}>5</button>
            <button className="KeypadButton" onClick={generateOnClick(6)}>6</button>
        </div>
        <div className="KeypadRow">
            <button className="KeypadButton" onClick={generateOnClick(7)}>7</button>
            <button className="KeypadButton" onClick={generateOnClick(8)}>8</button>
            <button className="KeypadButton" onClick={generateOnClick(9)}>9</button>
        </div>
        <div className="KeypadRow">
            <button className="KeypadButton" onClick={generateOnClick(11)}>X</button>
            <button className="KeypadButton" onClick={generateOnClick(0)}>0</button>
            <button className="KeypadButton" onClick={generateOnClick(10)}>🗸</button>
        </div>
    </div>)
}

export default Keypad
