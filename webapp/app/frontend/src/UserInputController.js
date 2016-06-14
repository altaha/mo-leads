import Immutable from 'immutable'
import React from 'react'

const vis = require('vis')
const uuid = require('uuid')


class UserInputController extends React.Component {
    static propTypes = {
        onUpdateQueryWord: React.PropTypes.func.isRequired
    }

    state = {
        queryKeywordValue: ''
    }

    render() {
        return (
            <div className="user-input-container">
                <input
                    id="query_keyword_input"
                    onChange={this.onChangeQueryKeyword}
                    placeholder="Pizza"
                />
                <button
                    onClick={this.onSubmitQueryKeyword}
                >
                    Submit
                </button>
            </div>
        )
    }

    onChangeQueryKeyword = (event) => {
        this.setState({
            queryKeywordValue: event.target.value
        })
    }

    onSubmitQueryKeyword = () => {
        console.log(this.state.queryKeywordValue)
        this.props.onUpdateQueryWord(this.state.queryKeywordValue)
    }
}

export default UserInputController
