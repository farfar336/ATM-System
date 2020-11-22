import React from "react"
import "./Monitor.css"

const Monitor = (props) => {
    const lines = props.message.split("\n")

    return (<div className="Monitor-container">
                <div> {props.timestamp}</div>
                { lines.map((line) => {
                    return <div>{line}</div>
                }) } 
            </div>)
}

export default Monitor;