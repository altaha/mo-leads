import Immutable from 'immutable'
import React from 'react'

const vis = require('vis')
const uuid = require('uuid')


class UserInputController extends React.Component {
    static propTypes = {
        onUpdateQueryWord: React.PropTypes.func.isRequired
    }

    state = {
        queryKeywordValue: '',
        queryStartDate: '',
        queryEndDate: ''
    }

    render() {
        return (
            <div className="user-input-container">
                <div>
                    <input
                        onChange={this.onChangeQueryKeyword}
                        placeholder="Pizza"
                    />
                    <button
                        onClick={this.onSubmitQueryKeyword}
                    >
                        Submit
                    </button>
                </div>
                <br/>
                <div>
                    <input
                        onChange={this.onChangeStartDate}
                    />
                    <input
                        onChange={this.onChangeEndDate}
                    />
                </div>
            </div>
        )
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

    onChangeStartDate = (event) => {
        this.setState({
            queryStartDate: this.getDateISOString(event.target.value)
        })
    }

    onChangeEndDate = (event) => {
        this.setState({
            queryEndDate: this.getDateISOString(event.target.value)
        })
    }

    getDateISOString(dateInput) {
        const date = new Date(dateInput)
        if (isNaN(date.getTime())) {
            return ''
        }
        return date.toISOString()
    }
}

export default UserInputController
