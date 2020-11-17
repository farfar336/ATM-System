import React from "react";
import "./KeypadComponent.css"

const Keypad = (props) => {
    return (<div className="Keypad">
        <div className="KeypadRow">
            <button className="KeypadButton">1</button>
            <button className="KeypadButton">2</button>
            <button className="KeypadButton">3</button>
        </div>
        <div className="KeypadRow">
            <button className="KeypadButton">4</button>
            <button className="KeypadButton">5</button>
            <button className="KeypadButton">6</button>
        </div>
        <div className="KeypadRow">
            <button className="KeypadButton">7</button>
            <button className="KeypadButton">8</button>
            <button className="KeypadButton">9</button>
        </div>
        <div className="KeypadRow">
            <button className="KeypadButton">X</button>
            <button className="KeypadButton">0</button>
            <button className="KeypadButton">🗸</button>
        </div>
    </div>)
}

export default Keypad
