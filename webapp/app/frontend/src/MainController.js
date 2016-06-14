import Immutable from 'immutable'
import React from 'react'

import PaymentsWordCloud from './PaymentsWordCloud'
import UserInputController from './UserInputController'

const REST_API = {
    PAYMENTS_FOR_KEYWORD: (keyword) => `/api/payments/${keyword}`
}


class MainController extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            hasQueryWord: false,
            queryWord: '',
            queryWordPayments: new Immutable.List(),
            hasExpandedKeywords: false,
            expandedKeyWords: new Immutable.List(),
            queryWordGraph: new Immutable.Map(),
            expandedKeyWordsGraph: new Immutable.Map()
        }
    }

    render() {
        return (
            <div>
                <h1>Mo Leads App</h1>
                <UserInputController
                    onUpdateQueryWord={this.onUpdateQueryWord}
                />
                <PaymentsWordCloud
                    payments={this.state.queryWordPayments}
                />
            </div>
        )
    }

    onUpdateQueryWord = (queryWord) => {
        const hasQueryWord = queryWord === ''
        this.setState({
            hasQueryWord,
            queryWord
        }, this.fetchQueryWordPayments)
    }

    fetchQueryWordPayments = () => {
        fetch(
            REST_API.PAYMENTS_FOR_KEYWORD(this.state.queryWord)
        ).then((response) => {
            return response.json()
        }).then((paymentsJson) => {
            const payments = paymentsJson.payments.map(
                (payment) => payment._source
            )
            this.setState({
                queryWordPayments: Immutable.fromJS(payments)
            })
        }).catch((ex) => {
            console.error('fetch failed', ex)
        })
    }
}

export default MainController
