import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

import MainController from './MainController'


export class App extends React.Component {
    render() {
        return (
            <div className='app-container'>
                <MainController />
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector("#myApp"))
