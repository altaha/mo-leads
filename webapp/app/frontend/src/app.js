import 'babel-polyfill'
import Promise from 'bluebird'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react'
import ReactDOM from 'react-dom'

import MainController from './MainController'

injectTapEventPlugin()
window.Promise = Promise

const containerStyle = {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 600
}

export class App extends React.Component {
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()} >
                <div style={containerStyle} >
                    <MainController />
                </div>
            </MuiThemeProvider>
        )
    }
}

ReactDOM.render(<App/>, document.querySelector("#myApp"))
