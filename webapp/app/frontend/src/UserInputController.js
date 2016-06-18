import Immutable from 'immutable'
import React from 'react'
const vis = require('vis')
const uuid = require('uuid')

import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import DatePicker from 'material-ui/DatePicker'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'


class UserInputController extends React.Component {
    static propTypes = {
        onUpdateQueryWord: React.PropTypes.func.isRequired
    }

    state = {
        currentDate: new Date(),
        expanded: false,
        queryKeywordValue: '',
        queryStartDate: '',
        queryEndDate: ''
    }

    render() {
        return (
            <Card
                expanded={this.state.expanded}
                onExpandChange={this.handleExpandChange}
            >
                <CardHeader
                    actAsExpander={true}
                    showExpandableButton={true}
                    title="How can I help you today?"
                />
                <CardText>
                    <TextField
                        hintText="Pizza"
                        floatingLabelText="Enter search keyword"
                        onChange={this.onChangeQueryKeyword}
                    />
                    <RaisedButton
                        label="Submit"
                        onClick={this.onSubmitQueryKeyword}
                        primary={true}
                    />
                    <br/>
                    <Toggle
                        label="Set date range"
                        labelPosition="right"
                        onToggle={this.handleExpandChange}
                        toggled={this.state.expanded}
                    />
                </CardText>
                <CardText
                    expandable={true}
                    style={{paddingTop: 0}}
                >
                    <DatePicker
                        autoOk={true}
                        disableYearSelection={false}
                        floatingLabelText="Start date"
                        maxDate={this.state.currentDate}
                        mode="landscape"
                        onChange={this.onChangeStartDate}
                    />
                    <DatePicker
                        autoOk={true}
                        disableYearSelection={false}
                        floatingLabelText="End Date"
                        maxDate={this.state.currentDate}
                        mode="landscape"
                        onChange={this.onChangeEndDate}
                    />
                </CardText>
            </Card>
        )
    }

    handleExpandChange = () => {
        this.setState({expanded: !this.state.expanded})
    }

    onChangeQueryKeyword = (event) => {
        this.setState({
            queryKeywordValue: event.target.value
        })
    }

    onSubmitQueryKeyword = () => {
        this.props.onUpdateQueryWord(
            this.state.queryKeywordValue,
            this.state.queryStartDate,
            this.state.queryEndDate
        )
    }

    onChangeStartDate = (event, date) => {
        this.setState({
            queryStartDate: date.toISOString()
        })
    }

    onChangeEndDate = (event, date) => {
        this.setState({
            queryEndDate: date.toISOString()
        })
    }
}

export default UserInputController
