import React from "react"
import "./Monitor.css"

const Monitor = (props) => {
    return (<div className="Monitor-container">
                <div> {props.timestamp}</div>
                <div> {props.message}</div> 
            </div>)
}

export default Monitor;